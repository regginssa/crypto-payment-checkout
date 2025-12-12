import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface CryptoDropdownProps {
  label: string;
  options: any[];
  selected: any;
  onSelect: (val: any) => void;
}

const CryptoDropdown: React.FC<CryptoDropdownProps> = ({
  label,
  options = [],
  selected,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="font-medium text-[#0F172A]">{label}</label>

      <button
        className={`mt-2 w-full flex flex-row items-center justify-between p-3 rounded-lg border ${
          isOpen ? "border-primary" : "border-[#E2E8F0]"
        } transition-all duration-300 hover:border-[#1B51EC] bg-white`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-row items-center gap-2">
          <img
            src={selected.icon}
            alt={selected.name}
            className="w-6 h-6"
            onError={(e: any) => {
              e.target.style.display = "none";
            }}
          />

          <span className="font-medium text-[#0F172A]">
            {selected.name.toUpperCase()}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDownIcon className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-white rounded-lg p-2 shadow-xl z-50 mt-2 max-h-64 overflow-y-auto border border-[#E2E8F0]"
          >
            {options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ x: 4 }}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className="w-full p-3 flex flex-row items-center gap-2 hover:bg-primary-light rounded transition-colors"
              >
                <img
                  src={option.icon}
                  alt={option.name}
                  className="w-6 h-6"
                  onError={(e: any) => {
                    e.target.style.display = "none";
                  }}
                />
                <span className="font-medium text-[#0F172A]">
                  {option.name.toUpperCase()}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CryptoDropdown;
