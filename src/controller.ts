import { BlockchainService } from "./blockchain.service";
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

  private database = Database.getInstance();
  private bsService = BlockchainService.getInstance();

  getBlocks({ req, res, body }) {
    return this.database.getBlocks();
  }

  postBlock({ req, res, body }) {
    const block: Block = body;
    this.bsService.handleNewBlock(block);
  }

  postTransaction({ req, res, body }) {
    const transaction: Transaction = body;
    this.bsService.handleNewTransaction(transaction);
  }

  postNodes({ req, res, body }) {
    // todo: validation?

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
}
