import { parseUnits } from "viem";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";
import { BigInt } from "big-integer";

// EVM Payment Handler
export const processEVMPayment = async (
  provider,
  selectedCrypto,
  amount,
  recipientAddress
) => {
  try {
    const config = selectedCrypto;
    const amountInWei = parseUnits(amount.toString(), config.decimals);

    if (config.address) {
      // ERC-20 token transfer
      // Note: This is a simplified example. In production, you'd use a token contract ABI
      // and call the transfer function properly
      throw new Error("ERC-20 token transfers require contract interaction");
    } else {
      // Native token transfer (ETH, BNB)
      const txHash = await provider.send("eth_sendTransaction", [
        {
          from: provider.selectedAddress,
          to: recipientAddress,
          value: `0x${amountInWei.toString(16)}`,
        },
      ]);
      return { success: true, txHash };
    }
  } catch (error) {
    console.error("EVM Payment Error:", error);
    return { success: false, error: error.message };
  }
};

// Solana Payment Handler
export const processSolanaPayment = async (
  wallet,
  selectedCrypto,
  amount,
  recipientAddress,
  connection
) => {
  try {
    const config = selectedCrypto;
    const amountInLamports = amount * Math.pow(10, config.decimals);
    const recipient = new PublicKey(recipientAddress);
    const fromPubkey = wallet.publicKey;

    let transaction;

    if (config.address && config.address !== "YOUR_BABYU_TOKEN_ADDRESS") {
      // SPL Token transfer (BABYU)
      const mintAddress = new PublicKey(config.address);
      const fromTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        fromPubkey
      );
      const toTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        recipient
      );

      transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromPubkey,
          BigInt(Math.floor(amountInLamports)),
          []
        )
      );
    } else {
      // SOL transfer
      transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubkey,
          toPubkey: recipient,
          lamports: amountInLamports,
        })
      );
    }

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, "confirmed");

    return { success: true, signature };
  } catch (error) {
    console.error("Solana Payment Error:", error);
    return { success: false, error: error.message };
  }
};

// Mock payment verification (in production, this would check blockchain)
export const verifyPayment = async (txHash, chain) => {
  // This is a placeholder. In production, you'd check the blockchain
  // For now, simulate a verification delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ verified: true, txHash });
    }, 3000);
  });
};
