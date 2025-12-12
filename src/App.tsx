import React, { useState, useEffect, useMemo } from "react";
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
  // If you exported types from your config, import them:
  // CryptoSymbol, CryptoConfigItem
} from "./config/crypto";
import { useAccount, useWalletClient } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { ArrowRightIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router-dom";
import decryptNodeAES from "./utils/decrypt";

/**
 * Local fallback types (remove these if you already export them from ./config/crypto)
 */
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

type CryptoOption = CryptoConfigItem & { key: CryptoSymbol };

/**
 * Build the dropdown options from CRYPTO_CONFIG
 * Ensure CRYPTO_CONFIG has the keys matching CryptoSymbol; otherwise adapt.
 */
const cryptoOptions: CryptoOption[] = [
  { key: "ETH", ...CRYPTO_CONFIG.ETH },
  { key: "BNB", ...CRYPTO_CONFIG.BNB },
  { key: "SOL", ...CRYPTO_CONFIG.SOL },
  { key: "USDT", ...CRYPTO_CONFIG.USDT },
  { key: "USDC", ...CRYPTO_CONFIG.USDC },
  { key: "BABYU", ...CRYPTO_CONFIG.BABYU },
];

/**
 * Minimal return type for the Solana processor helper.
 * In production this should be a fully implemented function that:
 * - builds Transaction
 * - requests wallet to sign/send
 * - confirms with connection
 */
type SolanaPaymentResult = {
  success: boolean;
  signature?: string;
  error?: string;
};

async function processSolanaPayment(
  solanaWallet: ReturnType<typeof useWallet>,
  selectedCrypto: CryptoOption,
  amount: number,
  paymentAddress: string,
  connection: Connection
): Promise<SolanaPaymentResult> {
  // Placeholder implementation:
  // - If the wallet adapter exposes `sendTransaction`, use that.
  // - Here we only demonstrate the typed interface and an early failure if wallet not ready.
  if (!solanaWallet || !solanaWallet.connected || !solanaWallet.publicKey) {
    return { success: false, error: "Solana wallet not connected" };
  }

  try {
    // TODO: build a proper Transaction with SystemProgram.transfer or
    // for SPL tokens prepare a Token transfer instruction.
    // Example (not implemented here):
    // const tx = new Transaction().add(
    //   SystemProgram.transfer({ fromPubkey: solanaWallet.publicKey, toPubkey: new PublicKey(paymentAddress), lamports })
    // );
    // const signedTx = await solanaWallet.signTransaction(tx);
    // const rawSig = await connection.sendRawTransaction(signedTx.serialize());
    // await connection.confirmTransaction(rawSig, "confirmed");

    // Return a mocked success for now to keep the UI flow functional.
    const mockedSignature =
      "5mockedSignatureForDemoOnly1111111111111111111111111";
    return { success: true, signature: mockedSignature };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(
    cryptoOptions[0]
  );
  const [amount, setAmount] = useState<string>("1");
  const [paymentAddress, setPaymentAddress] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "success" | "failed" | null
  >(null);
  const [paymentMessage, setPaymentMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [params] = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [txSignature, setTxSignature] = useState<string>("");

  // Wagmi (EVM)
  const { isConnected, address: evmAddress } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Solana wallet adapter
  const solanaWallet = useWallet();

  // Solana connection (memoized)
  const solanaConnection = useMemo(
    () => new Connection("https://api.mainnet-beta.solana.com", "confirmed"),
    []
  );

  const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;

  useEffect(() => {
    const token = params.get("token");
    const sessionId = params.get("sessionId");
    if (!token || !sessionId) return;

    console.log("Token:", token);
    console.log("Session ID:", sessionId);
    console.log("Encryption Key:", encryptionKey);

    try {
      const decrypted = decryptNodeAES(token, encryptionKey);
      console.log("Decrypted token:", decrypted);

      if (!decrypted) {
        throw new Error("Decryption returned empty string");
      }

      const parsed = JSON.parse(decrypted);
      console.log("Parsed JSON:", parsed);

      setSession({ ...parsed, sessionId });
    } catch (err) {
      console.error("Failed to parse session token:", err);
    }
  }, [params]);

  // Generate payment address whenever amount/selectedCrypto changes
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const addr = generatePaymentAddress(
        selectedCrypto.key,
        parseFloat(amount),
        selectedCrypto.chain
      );
      setPaymentAddress(addr);
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

  const handlePayment = async (): Promise<void> => {
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

      if (isEVM) {
        // EVM flow: in this simplified demo we do not create/send tx
        setPaymentMessage("Sending transaction...");
        setPaymentStatus("pending");
        setPaymentMessage(
          "Please use the QR code or send manually to the payment address"
        );
        setIsProcessing(false);
        return;
      } else if (isSolana) {
        setPaymentMessage("Sending transaction...");
        const result = await processSolanaPayment(
          solanaWallet,
          selectedCrypto,
          parseFloat(amount),
          paymentAddress,
          solanaConnection
        );

        if (result.success) {
          setPaymentStatus("success");
          setPaymentMessage(
            `Transaction successful! Signature: ${result.signature?.slice(
              0,
              8
            )}...`
          );
        } else {
          throw new Error(result.error || "Transaction failed");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setPaymentStatus("failed");
      setPaymentMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoChange = (crypto: CryptoOption): void => {
    setSelectedCrypto(crypto);
    setPaymentStatus(null);
    setPaymentMessage("");
    setError("");
  };

  const isEVM = selectedCrypto?.chain === "evm";
  const isSolana = selectedCrypto?.chain === "solana";
  const isWalletConnected =
    (isEVM && Boolean(isConnected)) ||
    (isSolana && Boolean(solanaWallet.connected));

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
            className="text-4xl lg:text-5xl font-bold text-[#0F172A]"
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
          disabled={isProcessing || true}
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
                  className="w-full py-4 px-6 bg-[#1B51EC] text-white rounded-lg font-semibold hover:bg-[#1B59EC] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
