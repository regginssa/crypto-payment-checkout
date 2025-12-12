import { motion } from "framer-motion";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

interface PaymentAmountInputProps {
  amount: any;
  disabled?: boolean;
  setAmount: (val: any) => void;
  selectedCrypto: any;
  error: any;
}

const PaymentAmountInput: React.FC<PaymentAmountInputProps> = ({
  amount,
  disabled,
  setAmount,
  selectedCrypto,
  error,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <label className="block font-medium text-[#0F172A] mb-2">
        Payment Amount
      </label>
      <div className="relative">
        <CurrencyDollarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-gray" />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.000000001"
          min="0"
          disabled={disabled}
          className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B51EC] transition-all duration-300 ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          } ${
            error
              ? "border-red-500 focus:ring-red-500"
              : disabled
              ? "border-gray-300 focus:ring-gray-300"
              : "border-[#E2E8F0] focus:border-primary"
          }`}
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <span className="text-primary-gray font-medium">
            {selectedCrypto.symbol}
          </span>
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default PaymentAmountInput;
