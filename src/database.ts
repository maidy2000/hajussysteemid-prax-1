import { Block, Transaction } from "./models";

export class Database {

    private db = {
        addresses: [],
        blocks: [],
        transactionPool: []
    }

    constructor() {}

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

    addTransaction(transaction: Transaction) {
        this.db.transactionPool.push(transaction);
    }

    getTransactions(): Transaction[] {
        return [...this.db.transactionPool];
    }

    removeTransactions(transactions: Transaction[]) {
        // todo: not tested
        const signaturesToRemove = transactions.map(t => t.signature);
        this.db.transactionPool = this.db.transactionPool.filter(transaction => {
            !signaturesToRemove.includes(transaction.signature)
        })
    }
}