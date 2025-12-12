import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, bsc } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

// Wagmi config for EVM chains
// Note: Get your WalletConnect Project ID from https://cloud.walletconnect.com
// For development, you can use a placeholder, but production requires a valid project ID
const config = getDefaultConfig({
  appName: "Crypto Payment Checkout",
  projectId:
    process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ||
    "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [mainnet, bsc],
  ssr: true,
});

const queryClient = new QueryClient();

// Solana wallet adapters
const network = WalletAdapterNetwork.Mainnet;
const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

export const WalletProviders = ({ children }) => {
  const endpoint = React.useMemo(() => clusterApiUrl(network), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
