import axios from "axios";
import { Database } from "./database";
import { Block, Transaction } from "./models";

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
    const block: Block = body;

    if (!this.isBlockValid(block)) {
      return;
    }

    this.database.addBlock(block);
  }

  postTransaction({ req, res, body }) {
    const transaction: Transaction = body;

    if (!this.isTransactionValid(transaction)) {
      return;
    }

    this.database.addTransaction(transaction);
    this.disperseTransaction(body);
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

  private disperseTransaction(transaction: Transaction) {
    this.database.getAddresses().forEach((address) => {
      axios.post(`http://${address}/transactions`, transaction);
    });
  }

  private isBlockValid(block: Block): boolean {
    // todo: validate all transactions and check for duplicate blocks
    return true;
  }

  private isTransactionValid(transaction: Transaction): boolean {
    const alreadyPresent = this.database.getTransactions().some(t => t.signature === transaction.signature);
    if (alreadyPresent) {
      return false;
    }
    // todo: validate by going through all the blocks and summing up, also check for duplicates
    let count = 0;
    return true;
  }
}
