import { Database } from "./database";

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
    }, 100);
  }
}
