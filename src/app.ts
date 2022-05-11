import { Listener } from "./listener";
import { Poller } from "./poller";
import minimist from "minimist";
import { Logger } from "./logger";
import { Miner } from "./miner";

const argv = minimist(process.argv.slice(2));
const PORT = argv["port"] ?? 5555;
const HOST = argv["host"] ?? "127.0.0.1";
const OWNER = argv["owner"];

(() => {
  if (!OWNER) {
    console.log("Node must have owner: --owner [example]");
    return;
  }

  const listener = new Listener(HOST, PORT);
  listener.listen();

  const poller = new Poller(HOST, PORT);
  poller.startPolling();

  const miner = new Miner(OWNER);
  miner.startMining();

  const logger = Logger.getInstance();
  logger.startLogging();
})();
