import axios from "axios";
import { BlockchainService } from "./blockchain";
import { Database } from "./database";
import { Block } from "./models";

export class Poller {
  private database = Database.getInstance();
  private bsService = BlockchainService.getInstance();

  constructor(private HOST: string, private PORT: number) {
    axios.defaults.timeout = 1000;
  }

  startPolling() {
    setInterval(() => this.pollForAddresses(), 5000);
    setInterval(() => this.pollForBlocks(), 5000);
  }

  pollForAddresses() {
    this.database.getAddresses().forEach((address) =>
      this.fetchAddressesFrom(address).then((results) => {
        const filteredResults = results.filter(a => a !== `${this.HOST}:${this.PORT}`);
        this.saveAddresses(filteredResults);
      })
    );
  }

  pollForBlocks() {
    this.database
      .getAddresses()
      .forEach((address) =>
        this.fetchBlocksFrom(address).then((results) =>
          this.bsService.handleNewBlocks(results)
        )
      );
  }

  private async fetchAddressesFrom(address: string): Promise<string[]> {
    const response = await axios
      .get(`http://${address}/nodes`, {
        headers: { port: this.PORT },
      })
      .catch(() => {});
    if (response) {
      return response.data;
    }
  }

  private async fetchBlocksFrom(address: string): Promise<Block[]> {
    const response = await axios.get(`http://${address}/blocks`).catch();
    if (response) {
      return response.data;
    }
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
}
