"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getXLMBalance } from "@/lib/stellar/getBalance";

interface UseBalanceResult {
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  /** Manually re-fetch the balance (e.g. after a payment). */
  refresh: () => Promise<void>;
}

/**
 * Fetches and tracks the XLM balance for the given `publicKey`.
 * Automatically refetches if the key changes.
 */
export function useBalance(publicKey: string | null): UseBalanceResult {
  const [balance, setBalance]   = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const bal = await getXLMBalance(publicKey);
      setBalance(bal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch balance.";
      setError(msg);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchBalance();
    return () => abortRef.current?.abort();
  }, [fetchBalance]);

  return { balance, isLoading, error, refresh: fetchBalance };
}
