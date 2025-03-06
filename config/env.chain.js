import dotenv from "dotenv";
import { ethers } from "ethers";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ENV = {
  NETWORK: process.env.NETWORK || "monad-testnet",
  MAX_CONCURRENT_MINTS: parseInt(process.env.MAX_CONCURRENT_MINTS || "10"),
  DEFAULT_GAS_LIMIT_MIN: parseInt(
    process.env.DEFAULT_GAS_LIMIT_MIN || "180000"
  ),
  DEFAULT_GAS_LIMIT_MAX: parseInt(
    process.env.DEFAULT_GAS_LIMIT_MAX || "280000"
  ),
};

export const loadWallets = () => {
  try {
    const wallets = [];
    const walletKeys = Object.keys(process.env)
      .filter((key) => key.startsWith("PRIVATEKEY"))
      .sort((a, b) => {
        const numA = parseInt(a.split("_")[1]);
        const numB = parseInt(b.split("_")[1]);
        return numA - numB;
      });

    if (walletKeys.length > 0) {
      const privateKey = process.env[walletKeys[0]];
      if (privateKey && privateKey.startsWith("0x")) {
        try {
          const wallet = new ethers.Wallet(privateKey);
          wallets.push({
            id: 1,
            address: wallet.address,
            privateKey: privateKey,
          });
        } catch (err) {
          console.error(`Invalid private key`);
        }
      }
    }

    return wallets;
  } catch (error) {
    console.error("Error loading wallets:", error.message);
    return [];
  }
};
