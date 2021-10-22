import artblocksABI from "../ethereum/abis/artblocks.json";
import { ethers, providers } from "ethers";
import chalk from "chalk";
import axios from "axios";
import { GwEI, GwEI_2_decimals, WEI_2_decimals } from "../utilities";

// import { GwEI } from "../utilities";

// type flashbotsGasData = {
//   blocks: flashbotsGasBlock[];
//   latest_block_number: Number;
// };

// type flashbotsGasBlock = {
//   block_number: Number;
//   miner_reward: String;
//   miner: String;
//   coinbase_transfers: String;
//   gas_used: Number;
//   gas_price: String;
//   transactions: flashbotsGasTransaction[];
// };

type flashbotsTransactionsGroup = {
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

  const flashbotsStageApi = "https://protection-staging.flashbots.net/v1/rpc";

  provider.on("block", async () => {
    const flashbotsGasAPIurl = "https://blocks.flashbots.net/v1/transactions";
    const flashbotsAPIresponse = await axios.get(flashbotsGasAPIurl);
    const flashbotsGasData: flashbotsTransactionsGroup =
      flashbotsAPIresponse.data;

    const stageApiRecommendation = await axios.post(flashbotsStageApi, {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_gasFees",
      params: [],
    });

    console.log("## RPC reccomendations ## \n");
    console.log(
      `Low: ${
        ethers.BigNumber.from(
          stageApiRecommendation.data.result.low.maxPriorityFeePerGas
        )
          .div(GwEI_2_decimals)
          .toNumber() / 100
      }`
    );
    console.log(
      `Med: ${
        ethers.BigNumber.from(
          stageApiRecommendation.data.result.med.maxPriorityFeePerGas
        )
          .div(GwEI_2_decimals)
          .toNumber() / 100
      }`
    );
    console.log(
      `High: ${
        ethers.BigNumber.from(
          stageApiRecommendation.data.result.high.maxPriorityFeePerGas
        )
          .div(GwEI_2_decimals)
          .toNumber() / 100
      }`
    );
    console.log(
      `Default: ${
        ethers.BigNumber.from(
          stageApiRecommendation.data.result.default.maxPriorityFeePerGas
        )
          .div(GwEI_2_decimals)
          .toNumber() / 100
      } \n`
    );

    console.log("## Manual calcs ## \n");
    // console.log(flashbotsAPIresponse);
    let meanGasPrice = GwEI;
    const sliceSize = 10;
    for (let transaction of flashbotsGasData.transactions.slice(0, sliceSize)) {
      meanGasPrice = meanGasPrice.add(
        ethers.BigNumber.from(transaction.gas_price)
      );
      console.log(
        `gas price: ${
          ethers.BigNumber.from(transaction.gas_price)
            .div(GwEI_2_decimals)
            .toNumber() / 100
        }`
      );
    }

    console.log(
      `Mean gas price: ${
        meanGasPrice.div(GwEI_2_decimals).toNumber() / 100 / sliceSize
      }`
    );

    //getting gas estimation data
    // const flashbotsGasAPIurl = "https://blocks.flashbots.net/v1/blocks";
    // const flashbotsAPIresponse = await axios.get(flashbotsGasAPIurl);
    // const flashbotsGasData: flashbotsGasData = flashbotsAPIresponse.data;

    // if (flashbotsGasData === undefined) {
    //   console.warn("Could not get flashbots gas data from blocks API");
    // }
    // const maxPriorFeeLastBlock = ethers.BigNumber.from(
    //   flashbotsGasData["blocks"][0]["transactions"][0]["gas_price"]
    // ).div(GwEI);

    // console.log(
    //   `flashbots max priority fee: ${maxPriorFeeLastBlock.toString()}`
    // );

    const recommendedGasPrice = await provider.getFeeData();
    console.log(
      `Recommended values maxPriorityFee: ${recommendedGasPrice.maxPriorityFeePerGas
        ?.div(GwEI)
        .toString()}\nbase fee : ${recommendedGasPrice.gasPrice
        ?.div(GwEI)
        .toString()} \n`
    );

    // get amount minted .. show % still to go etc
    // function to call: projectTokenInfo
    const tokenInfo = await abContract.projectTokenInfo(projectId);
    // console.log(await tokenInfo);
    console.log(new Date());
    console.log(
      chalk.blueBright(
        `Tokens Minted : ${tokenInfo.invocations.toNumber()} \n Supply: ${tokenInfo.maxInvocations.toNumber()} \n% Minted: ${
          (tokenInfo.invocations.toNumber() /
            tokenInfo.maxInvocations.toNumber()) *
          100
        }%`
      )
    );

    console.log(
      chalk.cyanBright(
        `Price NOW is: ${
          tokenInfo.pricePerTokenInWei.div(WEI_2_decimals) / 100
        } ETH.`
      )
    );
  });

  //sending bundle
};
