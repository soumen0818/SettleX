"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { connectFreighter, getFreighterNetwork, isFreighterInstalled } from "@/lib/freighter";
import { getXLMBalance } from "@/lib/stellar/getBalance";
import { LS_PUBLIC_KEY } from "@/lib/utils/constants";
import type { WalletContextType } from "@/types/wallet";
import { useToast } from "@/components/ui/Toast";

// ─── Context ──────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextType | null>(null);
WalletContext.displayName = "WalletContext";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [publicKey, setPublicKey]           = useState<string | null>(null);
  const [balance, setBalance]               = useState<string | null>(null);
  const [network, setNetwork]               = useState<string | null>(null);
  const [isConnecting, setIsConnecting]     = useState(false);
  const [isLoadingBalance, setLoadingBal]   = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  const isConnected = !!publicKey;
  const didMount    = useRef(false);
  const { error: toastError, success: toastSuccess, info: toastInfo } = useToast();

  // ── Internal helpers ────────────────────────────────────────────────────────

  const fetchBalance = useCallback(async (pk: string) => {
    setLoadingBal(true);
    try {
      const bal = await getXLMBalance(pk);
      setBalance(bal);
    } catch {
      // Non-fatal — balance display just won't show
      setBalance(null);
    } finally {
      setLoadingBal(false);
    }
  }, []);

  const hydrateNetwork = useCallback(async () => {
    try {
      const net = await getFreighterNetwork();
      setNetwork(net);
    } catch {
      setNetwork("TESTNET");
    }
  }, []);

  // ── Auto-reconnect from localStorage ───────────────────────────────────────

  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;

    const savedKey = typeof window !== "undefined"
      ? localStorage.getItem(LS_PUBLIC_KEY)
      : null;

    if (!savedKey) return;

    // Verify Freighter still has the same key before auto-restoring
    isFreighterInstalled().then((installed) => {
      if (!installed) {
        localStorage.removeItem(LS_PUBLIC_KEY);
        return;
      }
      // Restore silently — do not re-prompt the user
      setPublicKey(savedKey);
      fetchBalance(savedKey);
      hydrateNetwork();
    });
  }, [fetchBalance, hydrateNetwork]);

  // ── connect ─────────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const installed = await isFreighterInstalled();
      if (!installed) {
        throw new Error(
          "Freighter wallet not detected. Please install the Freighter browser extension."
        );
      }

      const pk  = await connectFreighter();
      const net = await getFreighterNetwork().catch(() => "TESTNET");

      setPublicKey(pk);
      setNetwork(net);
      localStorage.setItem(LS_PUBLIC_KEY, pk);
      toastSuccess("Wallet connected", `${pk.slice(0, 6)}…${pk.slice(-4)} on ${net === "PUBLIC" ? "Mainnet" : "Testnet"}`);

      // Fetch balance in parallel (non-blocking for UI)
      fetchBalance(pk);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet.";
      setError(msg);
      toastError("Connection failed", msg);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance]);

  // ── disconnect ──────────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setBalance(null);
    setNetwork(null);
    setError(null);
    toastInfo("Wallet disconnected");
    localStorage.removeItem(LS_PUBLIC_KEY);
  }, []);

  // ── refreshBalance ──────────────────────────────────────────────────────────

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    await fetchBalance(publicKey);
  }, [publicKey, fetchBalance]);

  // ── clearError ──────────────────────────────────────────────────────────────

  const clearError = useCallback(() => setError(null), []);

  // ── Context value ───────────────────────────────────────────────────────────

  const value: WalletContextType = {
    publicKey,
    balance,
    network,
    isConnected,
    isConnecting,
    isLoadingBalance,
    error,
    connect,
    disconnect,
    refreshBalance,
    clearError,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the global wallet state and actions.
 * Must be used inside <WalletProvider />.
 */
export function useWalletContext(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWalletContext must be used within <WalletProvider />");
  }
  return ctx;
}
