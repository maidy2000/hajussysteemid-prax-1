import { Low, JSONFile } from "lowdb";
import { createHash } from "crypto";
import * as http from "http";
import axios from "axios";

const HOST = process.env.HOST ? process.env.HOST : "0.0.0.0";
const PORT = process.env.PORT ? process.env.PORT : 8080;

const adapter = new JSONFile("database.json");
const db = new Low(adapter);

const poller = async () => {
  await db.read();
  db.data.addresses.forEach(async (address) => {
    await axios
      .get("http://" + address + "/addresses", { timeout: 2000 })
      .then((res) => {
        res.data.forEach((newAddress) => registerAddress(newAddress));
      })
      .catch(() => {
        // ignore errors
      });

    await axios
      .get("http://" + address + "/blocks", { timeout: 2000 })
      .then((res) => {
        res.data.forEach((block) => writeBlock(block));
      })
      .catch(() => {
        // ignore errors
      });
  });
};

const requestListener = async (req, res) => {
  if (!["/blocks", "/addresses"].includes(req.url)) {
    res.writeHead(404, "Not Found");
    res.end();
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405, "Method Not Allowed");
    res.end();
    return;
  }

  await db.read();

  if (req.url === "/blocks") {
    res.end(JSON.stringify(db.data.blocks.map((x) => x["id"])));
    res.writeHead(200);
    return;
  }

  if (req.url === "/addresses") {
    res.end(JSON.stringify(db.data.addresses));
    res.writeHead(200);
    await registerAddress(
      `${req.socket.remoteAddress}:${req.socket.remotePort}`
    );
    return;
  }

  res.writeHead(500);
  res.end();
};

async function registerAddress(address) {
  db.read();

  address = address + ":5555";
  if (db.data.addresses.includes(address)) {
    return;
  }

  db.data.addresses.push(address);
  await db.write();
}

function writeBlock(content) {
  db.read();
  
  var hash = createHash("sha256").update(content).digest("hex");

  // don't allow duplicates
  if (db.data.blocks.some(block => block.id === hash)) {
    console.log(block.id, hash);
    return;
  }

  db.data.blocks.push({ id: hash, content: content });
  db.write();
}

await db.read();

const server = http.createServer(requestListener);
server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

setInterval(poller, 5000);