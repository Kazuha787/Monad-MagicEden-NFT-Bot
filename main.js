import inquirer from "inquirer";
import chalk from "chalk";
import { ethers } from "ethers";
import dotenv from "dotenv";
import { blockchain, nft, helpers } from "./api/index.js";
import { ENV } from "./config/env.chain.js";
import { ABI } from "./config/ABI.js";
import MONAD_TESTNET from "./config/chain.js";

dotenv.config(); // Load environment variables

let globalMintVariant = "twoParams"; 

// Load wallets from .env
const loadWallets = () => {
  const wallets = Object.keys(process.env)
    .filter((key) => key.startsWith("WALLET_"))
    .map((key) => process.env[key]);

  if (wallets.length === 0) {
    console.error("❌ No wallets found in .env file!");
    console.log("📌 Add wallets to .env file: WALLET_1=0xprivatekey1, WALLET_2=0xprivatekey2");
    process.exit(1);
  }

  return wallets;
};

const displayBanner = () => {
  console.log(chalk.cyan("🔹╔════════════════════════════════════════════════════╗🔹"));
  console.log(chalk.cyan("🔹║             🚀 MONAD MINT AUTO BOT 🚀              ║🔹"));
  console.log(chalk.cyan("🔹║     🤖 Automate your Monad Testnet Minting! 🤖     ║🔹"));
  console.log(chalk.cyan("🔹║    💬 Developed by: https://t.me/Offical_Im_kazuha ║🔹"));
  console.log(chalk.cyan("🔹║    🛠️ GitHub: https://github.com/Kazuha787         🛠️║🔹"));
  console.log(chalk.cyan("🔹╠════════════════════════════════════════════════════╣🔹"));
  console.log(chalk.cyan("🔹║                                                    ║🔹"));
  console.log(chalk.cyan("🔹║  ██╗  ██╗ █████╗ ███████╗██╗   ██╗██╗  ██╗ █████╗  ║🔹"));
  console.log(chalk.cyan("🔹║  ██║ ██╔╝██╔══██╗╚══███╔╝██║   ██║██║  ██║██╔══██╗ ║🔹"));
  console.log(chalk.cyan("🔹║  █████╔╝ ███████║  ███╔╝ ██║   ██║███████║███████║ ║🔹"));
  console.log(chalk.cyan("🔹║  ██╔═██╗ ██╔══██║ ███╔╝  ██║   ██║██╔══██║██╔══██║ ║🔹"));
  console.log(chalk.cyan("🔹║  ██║  ██╗██║  ██║███████╗╚██████╔╝██║  ██║██║  ██║ ║🔹"));
  console.log(chalk.cyan("🔹║  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ║🔹"));
  console.log(chalk.cyan("🔹║                                                    ║🔹"));
  console.log(chalk.cyan("🔹║               Developed by KAZUHA 💙               ║🔹"));
  console.log(chalk.cyan("🔹╚════════════════════════════════════════════════════╝🔹"));
};
const extractContractAddress = (input) => {
  const magicEdenPattern =
    /magiceden\.io\/.*?\/(?:monad(?:-testnet)?\/)?([a-fA-F0-9x]{42})/i;
  const meMatch = input.match(magicEdenPattern);

  if (meMatch && meMatch[1]) {
    return meMatch[1].toLowerCase();
  }

  if (ethers.utils.isAddress(input)) {
    return input.toLowerCase();
  }

  return null;
};

async function main() {
  displayBanner();

  const wallets = loadWallets();
  console.log(`✅ Loaded wallets: ${wallets.length}`);

  const provider = blockchain.createProvider(ENV.NETWORK);
  
  const mintOptions = await inquirer.prompt({
    type: "list",
    name: "mintOption",
    message: "🔥 Minting Mode:",
    choices: ["🚀 Instant Mint", "⏳ Scheduled Mint"],
    prefix: "❓",
  });

  const contractAddressInput = await inquirer.prompt({
    type: "input",
    name: "contractAddressOrLink",
    message: "🎨 NFT Contract Address or Magic Eden Link:",
    validate: (input) => {
      const address = extractContractAddress(input);
      return address ? true : "❌ Please enter a valid address or Magic Eden link";
    },
    prefix: "❓",
  });

  const contractAddress = extractContractAddress(contractAddressInput.contractAddressOrLink);
  helpers.log.info(`✅ Using contract address: ${contractAddress}`);

  const useContractPriceInput = await inquirer.prompt({
    type: "confirm",
    name: "useContractPrice",
    message: "💰 Get price from contract?",
    default: true,
    prefix: "❓",
  });

  let mintPrice;
  if (useContractPriceInput.useContractPrice) {
    try {
      const contractForConfig = blockchain.createContract(contractAddress, ABI, provider);
      const cfgResult = await nft.getConfigWithFallback(contractForConfig);
      if (cfgResult) {
        mintPrice = cfgResult.config.publicStage.price;
        globalMintVariant = cfgResult.variant;
      }
    } catch (err) {
      helpers.log.error("❌ Error retrieving price from contract");
    }
  } else {
    const { manualPrice } = await inquirer.prompt({
      type: "input",
      name: "manualPrice",
      message: "💰 Enter MINT_PRICE (enter 0 for free mint):",
      validate: (input) => !isNaN(input) && Number(input) >= 0,
      prefix: "❓",
    });

    mintPrice = ethers.utils.parseEther(manualPrice.toString());
  }

  const latestBlock = await provider.getBlock("latest");
  const baseFee = latestBlock.baseFeePerGas;
  const fee = baseFee.mul(125).div(100);
  const gasLimit = blockchain.getRandomGasLimit(ENV.DEFAULT_GAS_LIMIT_MIN, ENV.DEFAULT_GAS_LIMIT_MAX);

  helpers.log.info(`⛽ Using gasLimit: [${gasLimit}]  🛠️ Minting Method: [${globalMintVariant}]`);

  for (const walletPrivateKey of wallets) {
    console.log(`🚀 Minting with wallet: ${walletPrivateKey.slice(0, 6)}...${walletPrivateKey.slice(-4)}`);

    try {
      const result = await nft.executeMint(
        contractAddress,
        blockchain.createWallet(walletPrivateKey, provider),
        gasLimit,
        fee,
        globalMintVariant,
        mintPrice,
        MONAD_TESTNET.TX_EXPLORER
      );

      if (result && result.successVariant && result.successVariant !== globalMintVariant) {
        helpers.log.warning(`🔄 Updated mint method to: ${result.successVariant}`);
        globalMintVariant = result.successVariant;
      }
    } catch (err) {
      helpers.log.error(`❌ Execution error: ${err.message}`);
    }
  }

  helpers.log.success("✅🎉 Minting process completed for all wallets! 🚀🎨");
}

main().catch((err) => {
  helpers.log.error(`❌ Execution error: ${err.message}`);
  process.exit(1);
});
