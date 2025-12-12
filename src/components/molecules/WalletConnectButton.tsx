import { motion } from "framer-motion";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAccount, useDisconnect } from "wagmi";
import "./styles.css";

interface WalletConnectButtonProps {
  selectedCrypto: any;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  selectedCrypto,
}) => {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect: disconnectEVM } = useDisconnect();
  const solanaWallet = useWallet();

  const isEVM = selectedCrypto?.chain === "evm";
  const isSolana = selectedCrypto?.chain === "solana";

  const getWalletAddress = () => {
    if (isEVM && isConnected) return address;
    if (isSolana && solanaWallet.connected)
      return solanaWallet.publicKey?.toString();
    return null;
  };

  const walletAddress = getWalletAddress();

  if (isEVM) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {!isConnected ? (
          <button
            onClick={openConnectModal}
            className="w-full py-3 px-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Connect EVM Wallet
          </button>
        ) : (
          <div className="w-full space-y-3">
            <div className="w-full p-3 bg-primary-light rounded-lg border border-[#E2E8F0]">
              <p className="text-xs text-primary-gray mb-1">Connected Wallet</p>
              <p className="text-sm font-mono text-[#0F172A] truncate">
                {walletAddress}
              </p>
            </div>
            <button
              onClick={() => disconnectEVM()}
              className="w-full py-2 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  if (isSolana) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="w-full flex items-center">
          <WalletMultiButton className="wallet-adapter-button" />
        </div>
        {solanaWallet.connected && walletAddress && (
          <div className="w-full mt-3 space-y-3">
            <div className="w-full p-3 bg-primary-light rounded-lg border border-[#E2E8F0]">
              <p className="text-xs text-primary-gray mb-1">Connected Wallet</p>
              <p className="text-sm font-mono text-[#0F172A] truncate">
                {walletAddress}
              </p>
            </div>
            <button
              onClick={() => solanaWallet.disconnect()}
              className="w-full py-2 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return null;
};

export default WalletConnectButton;
