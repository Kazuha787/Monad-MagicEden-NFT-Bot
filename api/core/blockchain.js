import { ethers } from "ethers";
import MONAD_TESTNET from "../../config/chain.js";

export const createProvider = (network = "monad-testnet") => {
  if (network === "monad-testnet") {
    return new ethers.providers.JsonRpcProvider(
      MONAD_TESTNET.RPC_URL,
      MONAD_TESTNET.CHAIN_ID
    );
  }

  throw new Error(`Unsupported network: ${network}`);
};

export const createWallet = (privateKey, provider) => {
  return new ethers.Wallet(privateKey, provider);
};

export const createContract = (address, abi, signerOrProvider) => {
  return new ethers.Contract(address, abi, signerOrProvider);
};

export const formatUnixTimestamp = (timestamp) => {
  const date = new Date(Number(timestamp) * 1000);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds} UTC`;
};

export const getRandomGasLimit = (min = 180000, max = 280000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getTransactionExplorerUrl = (
  txHash,
  network = "monad-testnet"
) => {
  if (network === "monad-testnet") {
    return `${MONAD_TESTNET.TX_EXPLORER}${txHash}`;
  }
  throw new Error(`Unsupported network: ${network}`);
};

export default {
  createProvider,
  createWallet,
  createContract,
  formatUnixTimestamp,
  getRandomGasLimit,
  getTransactionExplorerUrl,
};
