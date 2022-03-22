import { Low, JSONFile } from "lowdb";
import { createHash } from 'crypto';
import * as http from "http";

const HOST = process.env.HOST ? process.env.HOST : "localhost";
const PORT = process.env.PORT ? process.env.PORT : 8080;
const IGNORED_ADDRESSES = ["127.0.0.1"];

const adapter = new JSONFile("database.json");
const db = new Low(adapter);

await db.read();

const requestListener = async (req, res) => {
  console.log(req.url);
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

  if (req.url === "/blocks") {
    res.end(JSON.stringify(db.data.blocks.map(x => x["id"])));
    res.writeHead(200);
    return;
  }

  if (req.url === "/addresses") {
    res.end(JSON.stringify(db.data.addresses));
    res.writeHead(200);
    await registerAddress(req.socket.remoteAddress);
    return;
  }

  res.writeHead(500);
  res.end();
};

const server = http.createServer(requestListener);
server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

async function registerAddress(address) {
  if (db.data.addresses.includes(address)) {
    return;
  }

  if (IGNORED_ADDRESSES.includes(address)) {
    return;
  }

  db.data.addresses.push(address);
  await db.write();
}

function writeBlock(content) {
  var hash = createHash('sha256').update(content).digest('hex');
  db.data.blocks.push({id: hash, content: content});
  db.write();
}

//writeBlock("My first block");
