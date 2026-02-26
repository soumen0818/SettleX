"use client";

import { useWalletContext } from "@/context/WalletContext";

/**
 * Convenience hook — re-exports the wallet context for use in any component.
 *
 * @example
 * const { publicKey, balance, isConnected, connect, disconnect } = useWallet();
 */
export function useWallet() {
  return useWalletContext();
}
