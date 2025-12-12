import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import { CryptoDropdown } from "./components/molecules";
import { Container } from "./components/organisms";
import PaymentAmountInput from "./components/molecules/PaymentAmountInput";
import PaymentQRCode from "./components/molecules/PaymentQRCode";
import PaymentStatus from "./components/molecules/PaymentStatus";
import WalletConnectButton from "./components/molecules/WalletConnectButton";
import {
  CRYPTO_CONFIG,
  generatePaymentAddress,
  generatePaymentURI,
} from "./config/crypto";
import { useAccount, useWalletClient } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { processEVMPayment, processSolanaPayment } from "./utils/payment";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const cryptoOptions = [
  { key: "ETH", ...CRYPTO_CONFIG.ETH },
  { key: "BNB", ...CRYPTO_CONFIG.BNB },
  { key: "SOL", ...CRYPTO_CONFIG.SOL },
  { key: "USDT", ...CRYPTO_CONFIG.USDT },
  { key: "USDC", ...CRYPTO_CONFIG.USDC },
  { key: "BABYU", ...CRYPTO_CONFIG.BABYU },
];

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
  const [amount, setAmount] = useState("");
  const [paymentAddress, setPaymentAddress] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const { isConnected, address: evmAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const solanaWallet = useWallet();

  // Solana connection
  const solanaConnection = useMemo(
    () => new Connection("https://api.mainnet-beta.solana.com", "confirmed"),
    []
  );

  // Generate payment address and URI when amount changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const address = generatePaymentAddress(
        selectedCrypto.key,
        parseFloat(amount),
        selectedCrypto.chain
      );
      setPaymentAddress(address);
    } else {
      setPaymentAddress("");
      setPaymentStatus(null);
      setPaymentMessage("");
    }
  }, [amount, selectedCrypto]);

  const paymentURI = useMemo(() => {
    if (amount && paymentAddress) {
      return generatePaymentURI(
        selectedCrypto.key,
        parseFloat(amount),
        paymentAddress
      );
    }
    return "";
  }, [amount, paymentAddress, selectedCrypto]);

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError("");
    setIsProcessing(true);
    setPaymentStatus("processing");
    setPaymentMessage("Preparing transaction...");

    try {
      const isEVM = selectedCrypto.chain === "evm";
      const isSolana = selectedCrypto.chain === "solana";

      if (isEVM && (!isConnected || !walletClient)) {
        throw new Error("Please connect your EVM wallet first");
      }

      if (isSolana && !solanaWallet.connected) {
        throw new Error("Please connect your Solana wallet first");
      }

      let result;

      if (isEVM) {
        setPaymentMessage("Sending transaction...");
        // For EVM, we'd need to handle this properly with contract interactions
        // This is a simplified version
        setPaymentStatus("pending");
        setPaymentMessage(
          "Please use the QR code or send manually to the payment address"
        );
        setIsProcessing(false);
        return;
      } else if (isSolana) {
        setPaymentMessage("Sending transaction...");
        result = await processSolanaPayment(
          solanaWallet,
          selectedCrypto,
          parseFloat(amount),
          paymentAddress,
          solanaConnection
        );

        if (result.success) {
          setPaymentStatus("success");
          setPaymentMessage(
            `Transaction successful! Signature: ${result.signature.slice(
              0,
              8
            )}...`
          );
        } else {
          throw new Error(result.error || "Transaction failed");
        }
      }
    } catch (err) {
      setPaymentStatus("failed");
      setPaymentMessage(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoChange = (crypto) => {
    setSelectedCrypto(crypto);
    setPaymentStatus(null);
    setPaymentMessage("");
    setError("");
  };

  const isEVM = selectedCrypto?.chain === "evm";
  const isSolana = selectedCrypto?.chain === "solana";
  const isWalletConnected =
    (isEVM && isConnected) || (isSolana && solanaWallet.connected);

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-primary-dark"
          >
            Crypto Payment Checkout
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-primary-gray font-medium"
          >
            Secure and fast cryptocurrency payments
          </motion.p>
        </div>

        {/* Crypto Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <CryptoDropdown
            label="Select Cryptocurrency"
            options={cryptoOptions}
            selected={selectedCrypto}
            onSelect={handleCryptoChange}
          />
        </motion.div>

        {/* Amount Input */}
        <PaymentAmountInput
          amount={amount}
          setAmount={setAmount}
          selectedCrypto={selectedCrypto}
          error={error}
        />

        {/* Wallet Connect */}
        <WalletConnectButton selectedCrypto={selectedCrypto} />

        {/* QR Code and Payment Info */}
        <AnimatePresence>
          {amount && parseFloat(amount) > 0 && paymentAddress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <PaymentQRCode
                paymentURI={paymentURI}
                paymentAddress={paymentAddress}
                amount={amount}
                selectedCrypto={selectedCrypto}
              />

              {/* Payment Button (for Solana - direct payment) */}
              {isSolana && isWalletConnected && !isProcessing && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handlePayment}
                  className="w-full py-4 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-blue transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Pay with Wallet
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
              )}

              {/* Info for EVM chains */}
              {isEVM && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <p className="text-sm text-blue-800">
                    Scan the QR code or copy the address to send {amount}{" "}
                    {selectedCrypto.symbol} from your wallet.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Status */}
        <PaymentStatus status={paymentStatus} message={paymentMessage} />

        {/* Processing Indicator */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 text-primary"
            >
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span className="font-medium">Processing...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {!amount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-primary-gray space-y-2"
          >
            <p>Enter an amount to generate a payment QR code</p>
            <p className="text-xs">
              Support for ETH, BNB, SOL, USDT, USDC, and BABYU
            </p>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
}

export default App;
