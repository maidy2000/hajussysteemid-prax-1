import { Block, Transaction } from "./models";

export class Database {
  private static instance;

  private db = {
    addresses: [],
    blocks: [
      {
        // todo: proper first block hash
        number: 1,
        previousHash: null,
        nonce: null,
        hash: "esimene",
        transactions: [
          {
            from: null,
            to: "Kristjan",
            sum: 1,
            timestamp: "2022-04-03T12:51:09Z",
            signature: "woah",
          },
        ],
      },
    ],
    transactionPool: [],
  };

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  addAddress(address: string) {
    this.db.addresses.push(address);
  }

  getAddresses(): string[] {
    return [...this.db.addresses];
  }

  addBlock(block: Block) {
    this.db.blocks.push(block);
  }

  getBlocks(): Block[] {
    return [...this.db.blocks];
  }

  getLastBlock(): Block {
    return this.db.blocks.at(-1);
  }

  addTransaction(transaction: Transaction) {
    this.db.transactionPool.push(transaction);
  }

  getTransactions(): Transaction[] {
    return [...this.db.transactionPool];
  }

  removeTransactions(transactions: Transaction[]) {
    // todo: not tested
    const signaturesToRemove = transactions.map((t) => t.signature);
    this.db.transactionPool = this.db.transactionPool.filter((transaction) => {
      !signaturesToRemove.includes(transaction.signature);
    });
  }
}
