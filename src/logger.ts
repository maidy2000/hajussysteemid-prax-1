import { Database } from "./database";
import logUpdate from "log-update";
export class Logger {

  private static instance;

  private database = Database.getInstance()

  mining = false;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  startLogging() {
    setInterval(() => {
        const text = `
        Addresses - ${this.database.getAddresses()}
        Blocks - ${this.database.getBlocks().map(b => b.number)}
        Transactions - ${this.database.getTransactions().map(t => `${t.from}->${t.to}=${t.sum}`)}
        Mining - ${this.mining}
        `

        logUpdate(text)
    }, 100);
  }
}
