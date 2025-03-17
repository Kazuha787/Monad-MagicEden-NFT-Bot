import { ethers } from "ethers";
import chalk from "chalk";
import { ABI } from "../../config/ABI.js";
import { createContract } from "../core/blockchain.js";
import { log } from "../utils/helpers.js";

export const getConfigWithFallback = async (contract) => {
  let config;
  try {
    config = await contract.getConfig();
    return { config, variant: "twoParams" };
  } catch (err) {}

  let fallbackConfig;
  const fallbackIds = [0, 1, 2, 3];
  for (let id of fallbackIds) {
    try {
      fallbackConfig = await contract["getConfig(uint256)"](id);
      return { config: fallbackConfig, variant: "fourParams" };
    } catch (err) {}
  }

  if (fallbackConfig) {
    return { config: fallbackConfig, variant: "fourParams" };
  } else {
    throw new Error("Unable to retrieve configuration");
  }
};

const validateContractAddress = (address) => {
  if (!ethers.utils.isAddress(address)) {
    throw new Error("Invalid contract address format");
  }
};

export const getCollectionInfo = async (address, provider) => {
  validateContractAddress(address);
  try {
    const nameABI = ["function name() view returns (string)"];
    const symbolABI = ["function symbol() view returns (string)"];
    const nameContract = new ethers.Contract(address, nameABI, provider);
    const symbolContract = new ethers.Contract(address, symbolABI, provider);

    let name = "Unknown";
    let symbol = "Unknown";

    try {
      name = await nameContract.name();
    } catch (err) {}

    try {
      symbol = await symbolContract.symbol();
    } catch (err) {}

    return { name, symbol };
  } catch (error) {
    return { name: "Unknown", symbol: "Unknown" };
  }
};

const checkMintConditions = async (contract) => {
  try {
    const config = await contract.getConfig();
    const currentTime = Math.floor(Date.now() / 1000);

    // Check public minting stage
    const publicStage = config.publicStage;
    log.info("Public minting stage details:");
    log.info(`- Start Time: ${new Date(publicStage.startTime.toNumber() * 1000).toLocaleString()}`);
    log.info(`- End Time: ${new Date(publicStage.endTime.toNumber() * 1000).toLocaleString()}`);
    log.info(`- Mint Price: ${ethers.utils.formatEther(publicStage.price)} MON`);

    if (currentTime < publicStage.startTime.toNumber()) {
      throw new Error(`Public minting has not started yet. It will start at ${new Date(publicStage.startTime.toNumber() * 1000).toLocaleString()}`);
    }

    if (currentTime > publicStage.endTime.toNumber()) {
      throw new Error("Public minting has ended");
    }

    // Check total supply
    if (config.maxSupply) {
      const totalSupply = await contract.totalSupply().catch(() => null);
      if (totalSupply !== null) {
        log.info(`Supply: ${totalSupply}/${config.maxSupply}`);
        if (totalSupply.gte(config.maxSupply)) {
          throw new Error("Maximum supply reached");
        }
      }
    }

    // Check wallet limit
    if (config.walletLimit) {
      log.info(`Wallet limit: ${config.walletLimit} NFTs`);
    }

    return true;
  } catch (error) {
    log.error("Error checking mint conditions:", error.message);
    return false;
  }
};

export const executeMint = async (
  contractAddress,
  wallet,
  gasLimit,
  maxFeePerGas,
  mintVariant,
  mintPrice,
  explorerUrl,
  maxPriorityFeePerGas
) => {
  const contractWithWallet = createContract(contractAddress, ABI, wallet);
  log.info(`Wallet ${wallet.address} is minting 1 NFT (using ${mintVariant} method)`);

  try {
    let tx;
    const txOptions = {
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      value: mintPrice,
    };

    log.info(`Transaction parameters: Gas Limit=${gasLimit}, Max Fee=${ethers.utils.formatUnits(maxFeePerGas, "gwei")} gwei, Priority Fee=${ethers.utils.formatUnits(maxPriorityFeePerGas, "gwei")} gwei, Price=${ethers.utils.formatEther(mintPrice)} MON`);

    try {
      // First try the "fourParams" method
      if (mintVariant === "fourParams") {
        tx = await contractWithWallet[
          "mintPublic(address,uint256,uint256,bytes)"
        ](wallet.address, 0, 1, "0x", txOptions);
      } else {
        tx = await contractWithWallet["mintPublic(address,uint256)"](
          wallet.address,
          1,
          txOptions
        );
      }

      log.success(
        `Mint transaction sent! [${tx.hash.substring(0, 6)}...${tx.hash.substring(
          tx.hash.length - 4
        )}]`
      );
      log.dim(explorerUrl + tx.hash);

      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed, possibly due to contract conditions not being met");
      }

      log.success(`Transaction confirmed in block [${receipt.blockNumber}]`);
      log.info(`Actual Gas Used: ${receipt.gasUsed.toString()}`);

      return { tx, successVariant: mintVariant };
    } catch (err) {
      // If "fourParams" fails, try "twoParams"
      if (mintVariant === "fourParams" && err.code === ethers.errors.CALL_EXCEPTION) {
        log.warning("fourParams method failed, trying twoParams method");
        tx = await contractWithWallet["mintPublic(address,uint256)"](
          wallet.address,
          1,
          txOptions
        );
        return { tx, successVariant: "twoParams" };
      }
      throw err;
    }
  } catch (err) {
    if (err.code === ethers.errors.CALL_EXCEPTION) {
      log.error("Call exception error - Minting conditions might not be met");
      if (err.error && err.error.message) {
        log.error("Error details:", err.error.message);
      }
    } else if (err.message.includes("INSUFFICIENT_FUNDS")) {
      log.error("Insufficient balance");
    } else {
      log.error(`Error: ${err.message}`);
      if (err.error) {
        log.error("Detailed error:", err.error);
      }
    }
    return { error: err.message };
  }
};

export default {
  getConfigWithFallback,
  getCollectionInfo,
  executeMint,
};
