import { Listener } from "./listener";
import { Poller } from "./poller";
import minimist from "minimist";
import { Logger } from "./logger";
import { Miner } from "./miner";

const argv = minimist(process.argv.slice(2));
const PORT = argv["port"] ?? 5555;
const HOST = argv["host"] ?? "127.0.0.1";

const listener = new Listener(HOST, PORT);
listener.listen();

const poller = new Poller(PORT);
poller.startPolling();

const miner = new Miner();
miner.startMining();

const logger = Logger.getInstance();
logger.startLogging();