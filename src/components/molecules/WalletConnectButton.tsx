import { motion } from "framer-motion";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAccount } from "wagmi";

interface WalletConnectButtonProps {
  selectedCrypto: any;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  selectedCrypto,
}) => {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const solanaWallet = useWallet();

  const isEVM = selectedCrypto?.chain === "evm";
  const isSolana = selectedCrypto?.chain === "solana";
  const isConnectedToChain =
    (isEVM && isConnected) || (isSolana && solanaWallet.connected);

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
            className="w-full py-3 px-4 bg-[#1B51EC] text-white rounded-lg font-semibold hover:bg-[#1B59EC] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Connect EVM Wallet
          </button>
        ) : (
          <div className="w-full p-3 bg-primary-light rounded-lg border border-[#E2E8F0]">
            <p className="text-xs text-primary-gray mb-1">Connected Wallet</p>
            <p className="text-sm font-mono text-[#0F172A] truncate">
              {walletAddress}
            </p>
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
        <div className="flex justify-center">
          <WalletMultiButton className="bg-[#1B51EC] hover:bg-[#1B59EC] transition-all duration-300" />
        </div>
        {solanaWallet.connected && walletAddress && (
          <div className="w-full mt-3 p-3 bg-primary-light rounded-lg border border-[#E2E8F0]">
            <p className="text-xs text-primary-gray mb-1">Connected Wallet</p>
            <p className="text-sm font-mono text-[#0F172A] truncate">
              {walletAddress}
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  return null;
};

export default WalletConnectButton;
