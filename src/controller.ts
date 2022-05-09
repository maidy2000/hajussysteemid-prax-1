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
      route: "/node",
      method: "POST",
      fn: this.postNode,
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

    // todo: disperse if new
  }

  postTransaction({ req, res, body }) {
    // todo: validation?

    if (this.database.getTransactions().includes(body)) {
      return;
    }

    this.database.addTransaction(body);

    // todo: disperse if new
  }

  postNode({ req, res, body }) {
    // todo: validation?

    console.log(body);
    if (this.database.getAddresses().includes(body)) {
      return;
    }

    this.database.addAddress(body);

    // todo: disperse if new
  }

  getNodes({ req, res, body }) {
    const address = `${req.socket.remoteAddress}:${req.headers["port"]}`;
    if (!this.database.getAddresses().includes(address)) {
      this.database.addAddress(address);
    }

    return this.database.getAddresses();
  }
}
