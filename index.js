import { Low, JSONFile } from "lowdb";
import { createHash } from "crypto";
import * as http from "http";
import axios from "axios";

const HOST = process.env.HOST ? process.env.HOST : "0.0.0.0";
const PORT = process.argv.length >= 3 ? parseInt(process.argv[2]) : 5555;
const REQUEST_TIMEOUT_MILLIS = 2000;
const POLLING_INTERVAL_MILLIS = 1000;

const adapter = new JSONFile("database.json");
const db = new Low(adapter);

const poller = async () => {
  await db.read();
  for (const address of db.data.addresses) {
    await axios
      .get("http://" + address + "/addresses", { timeout: REQUEST_TIMEOUT_MILLIS, headers: { "port": PORT } })
      .then((res) => {
        res.data.forEach((newAddress) => registerAddress(newAddress));
      }).catch(() => {});

    if (db.data.blocks.length === 0) {
      await axios
          .get("http://" + address + "/blocks", { timeout: REQUEST_TIMEOUT_MILLIS, headers: { "port": PORT }  })
          .then((res) => {
            res.data.forEach((block) => getBlockFromAddress(block, address));
          }).catch(() => {});
    } else {
      await axios
          .get("http://" + address + "/blocks/" + db.data.blocks[db.data.blocks.length - 1]["id"], { timeout: REQUEST_TIMEOUT_MILLIS, headers: { "port": PORT }  })
          .then((res) => {
            res.data.forEach((block) => getBlockFromAddress(block, address));
          }).catch(() => {});
    }

  }
};

const requestListener = async (req, res) => {
  const splitUrl = req.url.split("/");
  // res.setHeader("port", PORT);

  if (splitUrl.length < 2 || !["blocks", "addresses", "getData", "block", "inv"].includes(splitUrl[1])) {
    res.writeHead(404, "Not Found");
    res.end();
    return;
  }

  if (req.method !== "GET" && req.method !== "POST") {
    res.writeHead(405, "Method Not Allowed");
    res.end();
    return;
  }

  await db.read();

  if (req.method === "POST") {
    let data = "";
    req.on("data", chunk => {data += chunk.toString()});
    req.on("end", () => {
      data = JSON.parse(data);

      if (!validData(data)) {
        res.writeHead(406);
        res.end(JSON.stringify({"error": "Invalid block or transaction data"}));
        return;
      }

      if (splitUrl[1] === "block") {
        disperseData(req, res, db.data.blocks, "block", data);
      } else if (splitUrl[1] === "inv") {
        disperseData(req, res, db.data.transactions, "inv", data);
      }
    })
    return;
  } else if (req.method === "GET") {
    if (splitUrl[1] === "blocks") {
      if (splitUrl.length === 3) {
        const target = splitUrl[2];
        let correctBlocks = [];
        let found = false;
        for (let i = 0; i < db.data.blocks.length; i++) {
          if (found) {
            correctBlocks.push(db.data.blocks[i]);
          } else if (db.data.blocks[i]["id"] === target) {
            found = true;
          }
        }
        res.writeHead(200);
        res.end(JSON.stringify(correctBlocks.map(x => x["id"])));
        registerAddress(`${req.socket.remoteAddress}:${req.headers["port"]}`);
        return;
      }
      res.writeHead(200);
      res.end(JSON.stringify(db.data.blocks.map((x) => x["id"])));
      registerAddress(`${req.socket.remoteAddress}:${req.headers["port"]}`);
      return;
    }

    if (splitUrl[1] === "addresses") {
      res.writeHead(200);
      res.end(JSON.stringify(db.data.addresses));
      registerAddress(`${req.socket.remoteAddress}:${req.headers["port"]}`);
      return;
    }

    if (splitUrl[1] === "getData") {
      if (splitUrl.length === 3) {
        const target = splitUrl[2];
        for (let i = 0; i < db.data.blocks.length; i++) {
          if (db.data.blocks[i]["id"] === target) {
            res.writeHead(200);
            res.end(JSON.stringify(db.data.blocks[i]));
            await registerAddress(`${req.socket.remoteAddress}:${req.headers["port"]}`);
            return;
          }
        }
        res.writeHead(406);
        res.end(JSON.stringify({"error": "No block with id " + target}));
        return;
      }
      res.writeHead(406);
      res.end(JSON.stringify({"error": "Unable to parse request"}));
      return;
    }
  }
  res.writeHead(500);
  res.end();
};

function validData(data) {
  return data["id"] === createHash("sha256").update(data["content"]).digest("hex");
}

function registerAddress(address) {
  db.read();

  if (db.data.addresses.includes(address)) {
    return;
  }

  db.data.addresses.push(address);
  db.write();
}

async function getBlockFromAddress(id, address) {
  if (db.data.blocks.map(x => x["id"]).includes(id)) {
    return;
  }
  await axios.get("http://" + address + "/getData/" + id, { timeout: REQUEST_TIMEOUT_MILLIS })
      .then((res) => {
        writeBlock(res["content"]);
      })
      .catch(() => {
        // ignore errors
      });
}

function disperseData(req, res, container, urlEnd, data) {
  if (!container.map(x => x["id"]).includes(data["id"])) {
    writeData(container, data["content"]);
    res.writeHead(200);
    res.end("1");
    registerAddress(`${req.socket.remoteAddress}:${req.headers["port"]}`);
    db.data.addresses.forEach(async (address) => {
      axios.post(
          "http://" + address + "/" + urlEnd,
          {id: data["id"], content: data["content"]},
          { timeout: REQUEST_TIMEOUT_MILLIS, headers: { "port": PORT }  }
      ).catch(() => {
        // ignore errors
      });
    });
  } else {
    res.writeHead(406);
    res.end(JSON.stringify({"error": urlEnd + " already exists"}))
    registerAddress(`${req.socket.remoteAddress}:${req.headers["port"]}`);
  }
}

function writeData(container, content) {
  db.read();
  var hash = createHash("sha256").update(content).digest("hex");

  // don't allow duplicates
  if (container.some((block) => block.id === hash)) {
    return;
  }

  container.push({ id: hash, content: content });
  db.write();
}

await db.read();

const server = http.createServer(requestListener);
server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

setInterval(poller, POLLING_INTERVAL_MILLIS);
