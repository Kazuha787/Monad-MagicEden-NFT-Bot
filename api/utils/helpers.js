import chalk from "chalk";

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTimeRemaining = (targetTimestamp) => {
  const totalSeconds = Math.max(
    0,
    targetTimestamp - Math.floor(Date.now() / 1000)
  );

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return {
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`,
  };
};

export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const log = {
  info: (message) => console.log(chalk.cyan(`> ${message}`)),
  success: (message) => console.log(chalk.green(`+ ${message}`)),
  error: (message) => console.log(chalk.red(`- ${message}`)),
  warning: (message) => console.log(chalk.yellow(`! ${message}`)),
  normal: (message) => console.log(`  ${message}`),
  dim: (message) => console.log(chalk.dim(`  ${message}`)),
};

export default {
  sleep,
  getTimeRemaining,
  formatNumber,
  log,
};
