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

  private database = Database.getInstance();

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

    const alreadyInPool = this.database
      .getTransactions()
      .some((t) => t.signature === transaction.signature);

    if (alreadyInPool) {
      return;
    }

    if (!this.isTransactionValid(transaction)) {
      return;
    }

    this.database.addTransaction(transaction);
    this.disperseTransaction(body);
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

  private disperseTransaction(transaction: Transaction) {
    this.database.getAddresses().forEach((address) => {
      axios.post(`http://${address}/transactions`, transaction);
    });
  }

  private isBlockValid(block: Block): boolean {
    // todo: verify hash
    return block.transactions.every((t) => this.isTransactionValid(t));
  }

  private isTransactionValid(transactionToVerify: Transaction): boolean {
    // todo: should also verify signature
    const sender = transactionToVerify.from;
    let balance = 0;

    const blocks = this.database.getBlocks();
    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks[bi];

      for (let ti = 0; ti < block.transactions.length; ti++) {
        const transaction = block.transactions[ti];

        if (transaction.signature === transactionToVerify.signature) {
          return false;
        }

        if (transaction.to === sender) {
          balance += transaction.sum;
        }

        if (transaction.from === sender) {
          balance -= transaction.sum;
        }
      }
    }

    return balance >= transactionToVerify.sum;
  }
}
