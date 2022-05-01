import { Database } from "./database";
import { Listener } from "./listener";
import { Poller } from "./poller";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));
const PORT = argv["port"] ?? 5555;

const database = new Database();

const listener = new Listener(database, PORT);
listener.listen();

const poller = new Poller(database, PORT);
poller.startPolling();