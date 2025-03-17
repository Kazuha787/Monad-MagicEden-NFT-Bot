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
          console.error(`私钥无效`);
        }
      }
    }

    return wallets;
  } catch (error) {
    console.error("加载钱包时出错:", error.message);
    return [];
  }
};

export const validateEnv = () => {
  const requiredEnvVars = ['NETWORK', 'PRIVATEKEY'];
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
  }
  
  // 验证私钥格式
  if (!process.env.PRIVATEKEY?.startsWith('0x')) {
    throw new Error('私钥必须以 0x 开头');
  }
};

// Add validation call
validateEnv();
