export class Database {

    private db = {
        addresses: [],
        blocks: [],
        transactions: []
    }

    constructor() {}

    addAddress(address: string) {        
        this.db.addresses.push(address);
    }
 
    getAddresses(): string[] {
        return [...this.db.addresses];
    }

    addBlock(block: string) {        
        this.db.blocks.push(block);
    }

    getBlocks(): string[] {
        return [...this.db.blocks];
    }

    addTransaction(transaction: string) {
        this.db.transactions.push(transaction);
    }

    getTransactions(): string[] {
        return [...this.db.transactions];
    }
}