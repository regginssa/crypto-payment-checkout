export const CRYPTO_CONFIG = {
  ETH: {
    name: "Ethereum",
    symbol: "ETH",
    icon: "/ethereum.png",
    chain: "evm",
    chainId: 1,
    decimals: 18,
    address: null, // Native token
  },
  BNB: {
    name: "Binance Coin",
    symbol: "BNB",
    icon: "/binance-coin.png",
    chain: "evm",
    chainId: 56,
    decimals: 18,
    address: null, // Native token
  },
  SOL: {
    name: "Solana",
    symbol: "SOL",
    icon: "/solana.png",
    chain: "solana",
    decimals: 9,
    address: null, // Native token
  },
  USDT: {
    name: "Tether USD",
    symbol: "USDT",
    icon: "/usdt.png",
    chain: "evm",
    chainId: 1,
    decimals: 6,
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT on Ethereum
  },
  USDC: {
    name: "USD Coin",
    symbol: "USDC",
    icon: "/usdc.png",
    chain: "evm",
    chainId: 1,
    decimals: 6,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum
  },
  BABYU: {
    name: "BABYU",
    symbol: "BABYU",
    icon: "/babyu.png",
    chain: "solana",
    decimals: 9,
    address: "YOUR_BABYU_TOKEN_ADDRESS", // Replace with actual BABYU token address
  },
};

// Generate payment address (in production, this would come from your backend)
export const generatePaymentAddress = (crypto, amount, chain) => {
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
export const generatePaymentURI = (crypto, amount, address) => {
  const config = CRYPTO_CONFIG[crypto];
  if (!config) return "";

  if (config.chain === "evm") {
    // Ethereum URI scheme: ethereum:address?value=amount
    return `ethereum:${address}?value=${
      amount * Math.pow(10, config.decimals)
    }`;
  } else if (config.chain === "solana") {
    // Solana Pay format
    const amountLamports = amount * Math.pow(10, config.decimals);
    return `solana:${address}?amount=${amountLamports}&spl-token=${
      config.address || ""
    }`;
  }
  return "";
};
