import { providers } from "ethers";
// import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
// import { INFURA_KEY } from "./environVars";
import { dutchExecutorAB } from "./scripts/artblocks";

const CHAIN_ID = 1;
const provider = new providers.InfuraProvider(CHAIN_ID);

// const FLASHBOTS_ENDPOINT = "https://relay.flashbots.net";

// if (BOT_PRIVATE_KEY === undefined) {
//   console.error("Please provide BOT_PRIVATE_KEY env");
//   process.exit(1);
// }
// const wallet = new Wallet(BOT_PRIVATE_KEY, provider);

// const GWEI = ethers.BigNumber.from("10").pow(9);
// const ETHER = ethers.BigNumber.from("10").pow(18);

const main = async () => {
  // provider.on("block", async (blockNumber) => {
  //   console.log(blockNumber);
  // });

  await dutchExecutorAB(provider, 160);
};

main();
