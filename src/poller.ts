import axios from "axios";
import { Database } from "./database";

export class Poller {
  constructor(private database: Database, private PORT: number) {
    axios.defaults.timeout = 1000;
  }

  startPolling() {
    setInterval(() => this.pollForAddresses(), 5000);
  }

  pollForAddresses() {
    this.database
      .getAddresses()
      .forEach((address) =>
        this.fetchAddressesFrom(address).then((results) =>
          this.saveAddresses(results)
        )
      );
  }

  pollForBlocks() {
    this.database
      .getAddresses()
      .forEach((address) =>
        this.fetchBlocksFrom(address).then((results) =>
          this.saveBlocks(results)
        )
      );
  }

  private async fetchAddressesFrom(address: string): Promise<string[]> {
    const response = await axios.get(`http://${address}/nodes`, {
      headers: { port: this.PORT },
    })
    .catch(() => {
        console.log("Invalid request");
    });
    if (response) {
      return response.data;
    }
  }

  private async fetchBlocksFrom(address: string): Promise<string[]> {
    const response = await axios.get(`http://${address}/blocks`);
    return response.data;
  }

  private saveAddresses(addresses: string[]) {
    if (!addresses) {
      return;
    }

    const oldAdresses = this.database.getAddresses();
    addresses
      .filter((address) => !oldAdresses.includes(address))
      .forEach((address) => this.database.addAddress(address));
  }

  private saveBlocks(blocks: string[]) {
    if (!blocks) {
      return;
    }

    const oldBlocks = this.database.getBlocks();
    blocks
      .filter((block) => !oldBlocks.includes(block))
      .forEach((block) => this.database.addBlock(block));
  }
}
