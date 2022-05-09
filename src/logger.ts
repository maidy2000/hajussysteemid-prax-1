import { Database } from "./database";
import logUpdate from "log-update";
export class Logger {

  constructor(private database: Database) {
  }

  startLogging() {
    setInterval(() => {
        const text = `
        Addresses - ${this.database.getAddresses()}
        Blocks - ${this.database.getBlocks().map(b => b.number)}
        Transactions - ${this.database.getTransactions().map(t => `${t.from}-${t.to}-${t.sum}`)}
        `

        logUpdate(text)
    }, 100);
  }
}
