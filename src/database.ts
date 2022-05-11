import { Block, Transaction } from "./models";

export class Database {
  private static instance;

  private db = {
    addresses: [],
    blocks: [
      {
        number: 1,
        previousHash: null,
        nonce: null,
        hash: "esimene",
        transactions: [
          {
            from: null,
            // first transaction to user 1
            to: "-----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMeOo2bs79TZh+3Nqip9PeRXn7BnPdHpdVfAkReWEvkts84OxUnAex50nvnaF5F4Iza9vPxZKpq1bdS5sGhbC2kCAwEAAQ==-----END PUBLIC KEY-----",
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
    // todo: any
    this.db.blocks.push(block as any);
  }

  getBlocks(): Block[] {
    return [...this.db.blocks];
  }

  getLastBlock(): Block {
    return this.db.blocks.at(-1);
  }

  replaceBlocks(blocks: Block[]) {
    // todo: any
    this.db.blocks = blocks as any;
  }

  addTransaction(transaction: Transaction) {
    this.db.transactionPool.push(transaction);
  }

  getTransactions(): Transaction[] {
    return [...this.db.transactionPool];
  }

  removeTransactions(transactions: Transaction[]) {
    const signaturesToRemove = transactions.map((t) => t.signature);
    this.db.transactionPool = this.db.transactionPool.filter((transaction) => {
      !signaturesToRemove.includes(transaction.signature);
    });    
  }
}
