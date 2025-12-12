import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const PaymentStatus = ({ status, message }) => {
  const statusConfig = {
    pending: {
      icon: ClockIcon,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    processing: {
      icon: ArrowPathIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      animate: "animate-spin",
    },
    success: {
      icon: CheckCircleIcon,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    failed: {
      icon: XCircleIcon,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`w-full p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor}`}
        >
          <div className="flex items-center gap-3">
            <Icon
              className={`w-6 h-6 ${config.color} ${config.animate || ""}`}
            />
            <div className="flex-1">
              <p className="font-semibold text-primary-dark capitalize">
                {status}
              </p>
              {message && (
                <p className="text-sm text-primary-gray mt-1">{message}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentStatus;
