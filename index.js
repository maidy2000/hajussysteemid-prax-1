import { Low, JSONFile } from "lowdb";
import { createHash } from "crypto";
import * as http from "http";
import axios from "axios";

const HOST = process.env.HOST ? process.env.HOST : "0.0.0.0";
const PORT = process.env.PORT ? process.env.PORT : 5555;
const REQUEST_TIMEOUT_MILLIS = 2000;
const POLLING_INTERVAL_MILLIS = 10000;

const adapter = new JSONFile("database.json");
const db = new Low(adapter);

const poller = async () => {
  await db.read();
  db.data.addresses.forEach(async (address) => {
    await axios
      .get("http://" + address + "/addresses", { timeout: REQUEST_TIMEOUT_MILLIS })
      .then((res) => {
        res.data.forEach((newAddress) => registerAddress(newAddress));
      })
      .catch(() => {
        // ignore errors
      });

    await axios
      .get("http://" + address + "/blocks/" + db.data.blocks[db.data.blocks.length - 1], { timeout: REQUEST_TIMEOUT_MILLIS })
      .then((res) => {
        res.data.forEach((block) => getBlockFromAddress(block, address));
      })
      .catch(() => {
        // ignore errors
      });
  });
};

const requestListener = async (req, res) => {
  const splitUrl = req.url.split("/");
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
    req.on("data", chunk => { data += chunk.toString() });
    req.on("end", () => {
      data = JSON.parse(data);
      if (splitUrl[1] === "block") {
        if (!db.data.blocks.map(x => x["id"]).includes(data["id"])) {
          writeBlock(data["content"]);
          res.end("1");
          res.writeHead(200);
          registerAddress(`${req.socket.remoteAddress}:${PORT}`);
          db.data.addresses.forEach(async (address) => {
            await axios.post(
                "http://" + address + "/block",
                {id: data["id"], content: data["content"]},
                { timeout: REQUEST_TIMEOUT_MILLIS }
            ).catch(() => {
              // ignore errors
            });
          });
        } else {
          res.end(JSON.stringify({"error": "Block already exists"}))
          res.writeHead(406);
          registerAddress(`${req.socket.remoteAddress}:${PORT}`);
        }
      } else if (splitUrl[1] === "inv") {
        if (!db.data.transactions.map(x => x["id"]).includes(data["id"])) {
          writeTransaction(data["content"]);
          res.end("1");
          res.writeHead(200);
          registerAddress(`${req.socket.remoteAddress}:${PORT}`);
          db.data.addresses.forEach(async (address) => {
            await axios.post(
                "http://" + address + "/inv",
                {id: data["id"], content: data["content"]},
                { timeout: REQUEST_TIMEOUT_MILLIS }
            ).catch(() => {
              // ignore errors
            });
          });
        } else {
          res.end(JSON.stringify({"error": "Transaction already exists"}))
          res.writeHead(406);
          registerAddress(`${req.socket.remoteAddress}:${PORT}`);
        }
      }
    })
    return;
  }

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
      res.end(JSON.stringify(correctBlocks.map(x => x["id"])));
      res.writeHead(200);
      await registerAddress(`${req.socket.remoteAddress}:${PORT}`);
      return;
    }
    res.end(JSON.stringify(db.data.blocks.map((x) => x["id"])));
    res.writeHead(200);
    await registerAddress(`${req.socket.remoteAddress}:${PORT}`);
    return;
  }

  if (splitUrl[1] === "addresses") {
    res.end(JSON.stringify(db.data.addresses));
    res.writeHead(200);
    await registerAddress(`${req.socket.remoteAddress}:${PORT}`);
    return;
  }

  if (splitUrl[1] === "getData") {
    if (splitUrl.length === 3) {
      const target = splitUrl[2];
      for (let i = 0; i < db.data.blocks.length; i++) {
        if (db.data.blocks[i]["id"] === target) {
          res.end(JSON.stringify(db.data.blocks[i]));
          res.writeHead(200);
          await registerAddress(`${req.socket.remoteAddress}:${PORT}`);
          return;
        }
      }
      // RETURN NO BLOCK
    }
    // RETURN INVALID REQUEST
  }

  res.writeHead(500);
  res.end();
};

async function registerAddress(address) {
  db.read();

  if (db.data.addresses.includes(address)) {
    return;
  }

  db.data.addresses.push(address);
  await db.write();
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

function writeBlock(content) {
  db.read();

  var hash = createHash("sha256").update(content).digest("hex");

  // don't allow duplicates
  if (db.data.blocks.some((block) => block.id === hash)) {
    return;
  }

  db.data.blocks.push({ id: hash, content: content });
  db.write();
}

function writeTransaction(content) {
  db.read();

  var hash = createHash("sha256").update(content).digest("hex");

  // don't allow duplicates
  if (db.data.transactions.some((block) => block.id === hash)) {
    return;
  }

  db.data.transactions.push({ id: hash, content: content });
  db.write();
}

await db.read();

const server = http.createServer(requestListener);
server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

setInterval(poller, POLLING_INTERVAL_MILLIS);

console.log(createHash("sha256").update("Test 2 transaction").digest("hex"));
