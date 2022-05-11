import axios from "axios";
import { createHash } from "crypto";
import NodeRSA from "node-rsa";
import { Database } from "./database";
import { Block, Transaction } from "./models";

export class BlockchainService {
  private static instance;

  private database = Database.getInstance();
  private constructor() {}

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  handleNewTransaction(transaction: Transaction) {
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
    this.disperseTransaction(transaction);
  }

  handleNewBlocks(blocks: Block[]) {
    // todo: verification
    const lastOfNewBlocks = blocks.sort((a, b) => a.number - b.number).at(-1);
    const lastOfCurrentBlocks = this.database
      .getBlocks()
      .sort((a, b) => a.number - b.number)
      .at(-1);

    if (lastOfNewBlocks.number > lastOfCurrentBlocks.number) {
      this.database.replaceBlocks(blocks);
    }
  }

  handleNewBlock(block: Block) {
    if (!this.isBlockValid(block)) {
      return;
    }

    this.database.addBlock(block);
    this.database.removeTransactions(block.transactions);
    this.disperseBlock(block);
  }

  private isBlockValid(block: Block) {
    // Verify hash
    const lastBlock = this.database
      .getBlocks()
      .find((b) => b.number === block.number - 1);

    if (lastBlock.hash !== block.previousHash) {
      return false;
    }

    const joinedSignatures = block.transactions.map((t) => t.signature).join();
    const expectedHash = createHash("sha512")
      .update(lastBlock.hash + joinedSignatures + block.nonce)
      .digest("hex");

    if (expectedHash !== block.hash) {
      return false;
    }

    // Only allow null for first transaction
    for (let i = 1; i < block.transactions.length; i++) {
      const transaction = block.transactions[i];
      if (transaction.from === null) {
        return false;
      }
    }
    
    // Validate every transaction
    return block.transactions.every((t) => this.isTransactionValid(t));
  }

  private isTransactionValid(toVerify: Transaction): boolean {

    const sender = toVerify.from;

    if (sender === null) {
      return true;
    }

    const key = new NodeRSA(toVerify.from);

    const transactionBody = `${toVerify.from}${toVerify.to}${toVerify.sum}${toVerify.timestamp}`;
    const verifiedSignature = key.verify(
      transactionBody as any,
      toVerify.signature as any,
      "utf8",
      "base64"
    );

    if (!verifiedSignature) {
      return false;
    }

    if (toVerify.sum <= 0) {
      return false;
    }

    let balance = 0;

    const blocks = this.database.getBlocks();
    for (let bi = 0; bi < blocks.length; bi++) {
      const block = blocks[bi];

      for (let ti = 0; ti < block.transactions.length; ti++) {
        const transaction = block.transactions[ti];

        if (transaction.signature === toVerify.signature) {
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

    return balance >= toVerify.sum;
  }

  private disperseTransaction(transaction: Transaction) {
    this.database.getAddresses().forEach((address) => {
      axios.post(`http://${address}/transactions`, transaction);
    });
  }

  private disperseBlock(block: Block) {
    this.database.getAddresses().forEach((address) => {
      axios.post(`http://${address}/blocks`, block);
    });
  }
}
