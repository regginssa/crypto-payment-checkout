import type { Chain } from "viem";

export type CryptoSymbol = "ETH" | "BNB" | "SOL" | "USDT" | "USDC" | "BABYU";

export interface CryptoConfigItem {
  name: string;
  symbol: string;
  icon: string;
  chain: "evm" | "solana";
  chainId?: number;
  decimals: number;
  address: string | null;
}

export const CRYPTO_CONFIG: Record<CryptoSymbol, CryptoConfigItem> = {
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    icon: "/ethereum.png",
    chain: "evm",
    chainId: 1,
    decimals: 18,
    address: null,
  },
  BNB: {
    name: "Binance Coin",
    symbol: "BNB",
    icon: "/binance-coin.png",
    chain: "evm",
    chainId: 56,
    decimals: 18,
    address: null,
  },
  SOL: {
    name: "Solana",
    symbol: "SOL",
    icon: "/solana.png",
    chain: "solana",
    decimals: 9,
    address: null,
  },
  USDT: {
    name: "Tether USD",
    symbol: "USDT",
    icon: "/usdt.png",
    chain: "evm",
    chainId: 1,
    decimals: 6,
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    icon: "/usdc.png",
    chain: "evm",
    chainId: 1,
    decimals: 6,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  BABYU: {
    name: "BABYU",
    symbol: "BABYU",
    icon: "/babyu.png",
    chain: "solana",
    decimals: 9,
    address: "YOUR_BABYU_TOKEN_ADDRESS",
  },
};

// Generate payment address (in production, this would come from your backend)
export const generatePaymentAddress = (
  crypto: CryptoSymbol,
  amount: number,
  chain: any
) => {
  // In a real app, this would generate a unique payment address from your backend
  // For now, return a placeholder
  if (chain === "evm") {
    return "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"; // Placeholder
  } else if (chain === "solana") {
    return "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"; // Placeholder
  }
  return "";
};

// Generate payment link/URI
export const generatePaymentURI = (
  crypto: CryptoSymbol,
  amount: number,
  address: string
) => {
  const config = CRYPTO_CONFIG[crypto];

  if (config.chain === "evm") {
    return `ethereum:${address}?value=${
      amount * Math.pow(10, config.decimals)
    }`;
  }

  if (config.chain === "solana") {
    const lamports = amount * Math.pow(10, config.decimals);
    return `solana:${address}?amount=${lamports}${
      config.address ? `&spl-token=${config.address}` : ""
    }`;
  }

  return "";
};
