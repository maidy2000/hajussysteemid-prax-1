import axios from "axios";
import { Database } from "./database";

export class Controller {

  readonly endpoints = [
    {
      route: "/blocks",
      method: "GET",
      fn: this.getBlocks,
    },
    {
      route: "/blocks",
      method: "POST",
      fn: this.postBlock,
    },
    {
      route: "/nodes",
      method: "GET",
      fn: this.getNodes,
    },
    {
      route: "/transactions",
      method: "POST",
      fn: this.postTransaction,
    },
    {
      route: "/nodes",
      method: "POST",
      fn: this.postNodes,
    },
  ];

  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  getBlocks({ req, res, body }) {
    return this.database.getBlocks();
  }

  postBlock({ req, res, body }) {
    // todo: validation?

    if (this.database.getBlocks().includes(body)) {
      return;
    }

    this.database.addBlock(body);
  }

  postTransaction({ req, res, body }) {
    // todo: validation?

    if (this.database.getTransactions().includes(body)) {
      return;
    }

    this.database.addTransaction(body);
    this.disperseTransaction(body)
  }

  postNodes({ req, res, body }) {
    // todo: validation?

    console.log("post nodes:", body);
    if (this.database.getAddresses().includes(body)) {
      return;
    }

    this.database.addAddress(body);
  }

  getNodes({ req, res, body }) {
    const address = `${req.socket.remoteAddress}:${req.headers["port"]}`;
    if (!this.database.getAddresses().includes(address)) {
      this.database.addAddress(address);
    }

    return this.database.getAddresses();
  }

  private disperseTransaction(transaction: string) {
    this.database.getAddresses().forEach(address => {
      axios.post(`http://${address}/transactions`, transaction)
    })
  }
}
