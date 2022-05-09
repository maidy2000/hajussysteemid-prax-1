import { createHash } from "crypto";
import { Database } from "./database";
import { Block, Transaction } from "./models";

export class Miner {
  constructor(private database: Database) {}

  mine() {
    const transactions = this.database.getTransactions().splice(0, 5);

    const lastHash = this.database.getBlocks().at(-1).hash;
    const joinedSignatures = transactions.map((t) => t.signature).join();

    let bestNonce = "";
    let bestCount = 0;

    while (bestCount < 5) {
      const nonce = this.randomString(32);

      const result = createHash("sha512")
        .update(lastHash + joinedSignatures + nonce)
        .digest("hex");
      const zeroesCount = this.countZeroes(result);

      if (zeroesCount > bestCount) {
        console.log(zeroesCount, result, nonce);
        bestNonce = result;
        bestCount = zeroesCount;
      }
    }

    this.database.removeTransactions(transactions);
    const block = this.createBlock(transactions, bestNonce);
    this.saveAndPublishBlock(block);
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

  private createBlock(transactions: Transaction[], nonce: string): Block {
    return {} as Block
  }

  private saveAndPublishBlock(block: Block) {
    // todo:
  }
}
