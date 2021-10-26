import axios from "axios";
import { Wallet, Contract, providers, ContractInterface } from "ethers";

const flashbotsRpcUrl = "https://protection-staging.flashbots.net/v1/rpc"; // production link: https://protection.flashbots.net/v1/rpc

export class coreTransactionBuilder {
  //Address to the NFT contract to be minted
  contractAddress: string;

  //ethers contract instance
  contract: Contract;

  //ethers wallet for the bot executing the transactions
  wallet: Wallet;

  // jsonRpcProvider to broadcast transactions
  provider: providers.JsonRpcProvider;

  /**
   * Set up minting contract and wallet
   * @param {string} contractAddress of contract used for the minting
   * @param {string} contractABI json ABI of the contract
   * @param {string} providerUrl for broadcasting transacations and querying the chain
   * @param {string} privateKey of purchasing wallet
   */
  constructor(
    contractAddress: string,
    contractABI: ContractInterface,
    providerUrl: string,
    botPrivateKey: string
  ) {
    this.provider = new providers.JsonRpcProvider(providerUrl);
    this.wallet = new Wallet(botPrivateKey, this.provider);
    this.contract = new Contract(contractAddress, contractABI, this.provider);
  }

  async getGasReccomendations(gasPriority: string) {
    const xxxx = await axios.post(flashbotsRpcUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_gasFees",
      params: [],
    });
  }
}
