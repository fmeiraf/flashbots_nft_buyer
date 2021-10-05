import artblocksABI from "../ethereum/abis/artblocks.json";
import { ethers, providers } from "ethers";
import chalk from "chalk";
import axios from "axios";
import { GwEI } from "../utilities";

type flashbotsGasData = {
  blocks: flashbotsGasBlock[];
  latest_block_number: Number;
};

type flashbotsGasBlock = {
  block_number: Number;
  miner_reward: String;
  miner: String;
  coinbase_transfers: String;
  gas_used: Number;
  gas_price: String;
  transactions: flashbotsGasTransaction[];
};

type flashbotsGasTransaction = {
  transaction_hash: String;
  bundle_type: String;
  tx_index: Number;
  bundle_index: Number;
  block_number: Number;
  eoa_address: String;
  to_address: String;
  gas_used: Number;
  gas_price: String;
  coinbase_transfer: String;
  total_miner_reward: String;
};

export const dutchExecutorAB = async (
  provider: providers.InfuraProvider,
  projectId: Number
) => {
  const abContract = new ethers.Contract(
    "0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270",
    artblocksABI,
    provider
  );

  provider.on("block", async (blocknumber) => {
    console.log(blocknumber);

    //getting gas estimation data
    const flashbotsGasAPIurl = "https://blocks.flashbots.net/v1/blocks";
    const flashbotsAPIresponse = await axios.get(flashbotsGasAPIurl);
    const flashbotsGasData: flashbotsGasData = flashbotsAPIresponse.data;

    if (flashbotsGasData === undefined) {
      console.warn("Could not get flashbots gas data");
    }
    const maxPriorFeeLastBlock = ethers.BigNumber.from(
      flashbotsGasData["blocks"][0]["transactions"][0]["gas_price"]
    ).div(GwEI);

    console.log(
      `flashbots max priority fee: ${maxPriorFeeLastBlock.toString()}`
    );

    const recommendedGasPrice = await provider.getFeeData();
    console.log(`Recommended values maxPriorityFee: ${recommendedGasPrice.maxPriorityFeePerGas
      ?.div(GwEI)
      .toString()} \n 
                base fee : ${recommendedGasPrice.gasPrice
                  ?.div(GwEI)
                  .toString()} \n`);

    //getting last token price
    const tokenPrice: ethers.BigNumber =
      await abContract.projectIdToPricePerTokenInWei(projectId);
    const tokenPriceEth =
      tokenPrice.div(ethers.BigNumber.from("10").pow(16)).toNumber() / 100;
    console.log(chalk.cyanBright(`Price NOW is: ${tokenPriceEth} ETH.`));
  });

  //sending bundle
};
