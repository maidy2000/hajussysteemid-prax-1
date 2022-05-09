export class Transaction {
  from: string;
  to: string;
  sum: number;
  timestamp: string;
  signature: string;
}

export class Block {
  number: number;
  previousHash: string;
  nonce: string;
  hash: string;
  transactions: Transaction[];
}
