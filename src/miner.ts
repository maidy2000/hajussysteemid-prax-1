import { createHash } from "crypto";
import { BlockchainService } from "./blockchain.service";
import { Database } from "./database";
import { Logger } from "./logger";
import { Block, Transaction } from "./models";

export class Miner {
  private database = Database.getInstance();
  private logger = Logger.getInstance();
  private bsService = BlockchainService.getInstance();

  private lastFinished = true;

  constructor(private OWNER: string) {}

  startMining() {
    setInterval(() => {
      if (this.database.getTransactions().length === 0) {
        this.lastFinished = true;
        this.logger.mining = false;
        return;
      }

      if (!this.lastFinished) {
        return;
      }

      this.mine();
    }, 20);
  }

  private mine() {
    this.logger.mining = true;

    const transactions = [
      this.createFirstTransactionOfBlock(),
      ...this.database.getTransactions().splice(0, 5),
    ];

    const lastHash = this.database.getBlocks().at(-1).hash;
    const joinedSignatures = transactions.map((t) => t.signature).join();

    let bestNonce = "";
    let bestCount = 0;
    let bestHash = "";

    let hashes = 0;

    while (true) {
      this.lastFinished = false;
      const nonce = this.randomString(32);

      bestHash = createHash("sha512")
        .update(lastHash + joinedSignatures + nonce)
        .digest("hex");
      const zeroesCount = this.countZeroes(bestHash);

      if (zeroesCount > bestCount) {
        bestNonce = nonce;
        bestCount = zeroesCount;
      }

      hashes += 1;
      if (hashes > 1e5 || bestCount >= 6) {
        this.lastFinished = true;
        break;
      }
    }

    if (bestCount < 6) {
      return;
    }

    this.logger.mining = false;
    const block = this.createBlock(transactions, bestNonce, bestHash);
    this.bsService.handleNewBlock(block);
  }

  private countZeroes(hash) {
    let count = 0;
    for (var i = 0; i < hash.length; i++) {
      let ch = hash.charAt(i);
      if (ch !== "0") {
        break;
      }

      count++;
    }
    return count;
  }

  private randomString(length) {
    var text = "";
    var possible = "0123456789abcdef";
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private createBlock(
    transactions: Transaction[],
    nonce: string,
    hash: string
  ): Block {
    const lastBlock = this.database.getLastBlock();
    return {
      number: lastBlock.number + 1,
      previousHash: lastBlock.hash,
      transactions: transactions,
      nonce: nonce,
      hash: hash,
    };
  }

  private createFirstTransactionOfBlock(): Transaction {
    return {
      from: null,
      to: this.OWNER,
      sum: 0.1,
      timestamp: new Date().toISOString(),
      signature: this.OWNER + this.randomString(4), // todo: signature
    };
  }
}
