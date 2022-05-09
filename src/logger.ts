import { Database } from "./database";
import logUpdate from "log-update";
export class Logger {

  constructor(private database: Database) {
  }

  startLogging() {
    setInterval(() => {
        const text = `
        Addresses - ${this.database.getAddresses()}
        Blocks - ${this.database.getBlocks()}
        Transactions - ${this.database.getTransactions()}
        `

        logUpdate(text)
    }, 100);
  }
}
