import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { CheckCircleIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const PaymentQRCode = ({
  paymentURI,
  paymentAddress,
  amount,
  selectedCrypto,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm mx-auto bg-white p-6 rounded-2xl shadow-xl border border-primary-border"
    >
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-lg font-semibold text-primary-dark">Scan to Pay</h3>
        <div className="bg-white p-4 rounded-xl border-2 border-primary-border">
          <QRCodeSVG
            value={paymentURI || paymentAddress}
            size={200}
            level="H"
            includeMargin={false}
          />
        </div>
        <div className="w-full text-center space-y-2">
          <p className="text-sm text-primary-gray">Amount</p>
          <p className="text-2xl font-bold text-primary-dark">
            {amount} {selectedCrypto.symbol}
          </p>
        </div>
        <div className="w-full space-y-2">
          <p className="text-xs text-primary-gray">Payment Address</p>
          <div className="flex items-center gap-2 p-2 bg-primary-light rounded-lg">
            <p className="text-xs font-mono text-primary-dark flex-1 truncate">
              {paymentAddress}
            </p>
            <button
              onClick={copyToClipboard}
              className="p-1 hover:bg-primary-border rounded transition-colors"
            >
              {copied ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ClipboardIcon className="w-4 h-4 text-primary-gray" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentQRCode;
