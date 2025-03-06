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

export const getCollectionInfo = async (address, provider) => {
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

export const executeMint = async (
  contractAddress,
  wallet,
  gasLimit,
  fee,
  mintVariant,
  mintPrice,
  explorerUrl
) => {
  const contractWithWallet = createContract(contractAddress, ABI, wallet);
  log.info("Wallet is minting 1 NFT(s)");

  try {
    let tx;
    try {
      if (mintVariant === "fourParams") {
        tx = await contractWithWallet[
          "mintPublic(address,uint256,uint256,bytes)"
        ](wallet.address, 0, 1, "0x", {
          gasLimit,
          maxFeePerGas: fee,
          maxPriorityFeePerGas: fee,
          value: mintPrice,
        });
      } else {
        tx = await contractWithWallet["mintPublic(address,uint256)"](
          wallet.address,
          1,
          {
            gasLimit,
            maxFeePerGas: fee,
            maxPriorityFeePerGas: fee,
            value: mintPrice,
          }
        );
      }
    } catch (err) {
      if (
        err.code === ethers.errors.CALL_EXCEPTION ||
        err.message.includes("CALL_EXCEPTION")
      ) {
        log.warning("CALL_EXCEPTION error, retrying with alternate variant");
        const alternateVariant =
          mintVariant === "twoParams" ? "fourParams" : "twoParams";

        if (alternateVariant === "fourParams") {
          tx = await contractWithWallet[
            "mintPublic(address,uint256,uint256,bytes)"
          ](wallet.address, 0, 1, "0x", {
            gasLimit,
            maxFeePerGas: fee,
            maxPriorityFeePerGas: fee,
            value: mintPrice,
          });
        } else {
          tx = await contractWithWallet["mintPublic(address,uint256)"](
            wallet.address,
            1,
            {
              gasLimit,
              maxFeePerGas: fee,
              maxPriorityFeePerGas: fee,
              value: mintPrice,
            }
          );
        }

        return { tx, successVariant: alternateVariant };
      } else {
        throw err;
      }
    }

    log.success(
      `Mint transaction sent! [${tx.hash.substring(0, 6)}...${tx.hash.substring(
        tx.hash.length - 4
      )}]`
    );
    log.dim(explorerUrl + tx.hash);

    const receipt = await tx.wait();
    log.success(`Transaction confirmed in Block [${receipt.blockNumber}]`);

    return { tx, successVariant: mintVariant };
  } catch (err) {
    if (
      err.code === ethers.errors.CALL_EXCEPTION ||
      err.message.includes("CALL_EXCEPTION")
    ) {
      log.error("CALL_EXCEPTION error");
    } else if (err.message.includes("INSUFFICIENT_FUNDS")) {
      log.error("Insufficient funds");
    } else {
      log.error(`Error: ${err.message.substring(0, 50)}`);
    }
    return { error: err.message };
  }
};

export default {
  getConfigWithFallback,
  getCollectionInfo,
  executeMint,
};
