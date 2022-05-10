import axios from "axios";
import { createHash } from "crypto";
import { Database } from "./database";
import { Logger } from "./logger";
import { Block, Transaction } from "./models";

export class Miner {

  private database = Database.getInstance();
  private logger = Logger.getInstance();
  private mining = false;

  startMining() {
    setInterval(() => {
      if (this.mining) {
        return;
      }

      if (this.database.getTransactions().length === 0) {
        return;
      }

      this.mine();
    }, 100)
  }

  private mine() {    
    this.mining = true;
    this.logger.mining = true;

    const transactions = this.database.getTransactions().splice(0, 5);

    const lastHash = this.database.getBlocks().at(-1).hash;
    const joinedSignatures = transactions.map((t) => t.signature).join();

    let bestNonce = "";
    let bestCount = 0;
    let hash = "";

    // todo: this hijacks the whole node thread?
    while (bestCount < 6) {
      const nonce = this.randomString(32);

      hash = createHash("sha512")
        .update(lastHash + joinedSignatures + nonce)
        .digest("hex");
      const zeroesCount = this.countZeroes(hash);

      if (zeroesCount > bestCount) {
        bestNonce = nonce;
        bestCount = zeroesCount;
      }
    }

    this.database.removeTransactions(transactions);
    const block = this.createBlock(transactions, bestNonce, hash);
    this.saveAndPublishBlock(block);

    this.mining = false;
    this.logger.mining = false;
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

  private createBlock(transactions: Transaction[], nonce: string, hash: string): Block {
    const lastBlock = this.database.getLastBlock();
    return {
      number: lastBlock.number + 1,
      previousHash: lastBlock.hash,
      transactions: transactions,
      nonce: nonce,
      hash: hash
    };
  }

  private saveAndPublishBlock(block: Block) {
    this.database.addBlock(block);
    this.database.getAddresses().forEach((address) => {
      axios.post(`http://${address}/blocks`, block);
    })
  }
}
