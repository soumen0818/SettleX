"use client";

import { useCallback, useState } from "react";
import { buildPaymentTransaction } from "@/lib/stellar/buildTransaction";
import { submitSignedTransaction } from "@/lib/stellar/submitTransaction";
import { signXDR } from "@/lib/freighter";
import { useWallet } from "@/hooks/useWallet";
import { useExpense } from "@/hooks/useExpense";
import { useToast } from "@/components/ui/Toast";
import { NETWORK_PASSPHRASE, STELLAR_EXPLORER } from "@/lib/utils/constants";
import type { SplitShare } from "@/types/expense";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentState =
  | { status: "idle" }
  | { status: "building" }
  | { status: "signing" }
  | { status: "submitting" }
  | { status: "success"; hash: string; ledger: number }
  | { status: "error"; message: string };

interface UsePaymentOpts {
  expenseId: string;
}

interface PayShareParams {
  share: SplitShare;
  expenseTitle: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePayment({ expenseId }: UsePaymentOpts) {
  const { publicKey } = useWallet();
  const { markSharePaid } = useExpense();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [paymentState, setPaymentState] = useState<PaymentState>({ status: "idle" });

  const reset = useCallback(() => setPaymentState({ status: "idle" }), []);

  /**
   * Full payment flow:
   *   1. Build unsigned XDR (includes memo with expense context)
   *   2. Prompt Freighter to sign
   *   3. Submit signed XDR to Stellar Horizon
   *   4. On success: mark share as paid in ExpenseContext + show toast
   */
  const payShare = useCallback(
    async ({ share, expenseTitle }: PayShareParams) => {
      if (!publicKey) {
        toastError("Wallet not connected", "Please connect your Freighter wallet first.");
        return;
      }

      if (!share.walletAddress) {
        toastError(
          "No wallet address",
          `${share.name} doesn't have a Stellar address. Add one to pay them.`
        );
        return;
      }

      try {
        // Step 1: Build transaction
        setPaymentState({ status: "building" });
        const memoText = `${expenseTitle}|${share.name}`.slice(0, 24); // safe for 28-byte limit with prefix
        const { xdr } = await buildPaymentTransaction({
          sourcePublicKey: publicKey,
          destinationPublicKey: share.walletAddress,
          amount: share.amount,
          memoText,
        });

        // Step 2: Sign with Freighter
        setPaymentState({ status: "signing" });
        toastInfo("Waiting for Freighter…", "Review and confirm the transaction.");
        const signedXDR = await signXDR(xdr, NETWORK_PASSPHRASE);

        // Step 3: Submit to Horizon
        setPaymentState({ status: "submitting" });
        const result = await submitSignedTransaction(signedXDR);

        // Step 4: Update local state
        markSharePaid(expenseId, share.memberId, result.hash);
        setPaymentState({ status: "success", hash: result.hash, ledger: result.ledger });
        toastSuccess(
          `Paid ${parseFloat(share.amount).toFixed(4)} XLM to ${share.name}`,
          `TX: ${result.hash.slice(0, 12)}…`
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Payment failed. Please try again.";

        // If user rejected in Freighter, show a softer message
        const isRejected =
          message.toLowerCase().includes("reject") ||
          message.toLowerCase().includes("denied") ||
          message.toLowerCase().includes("cancel");

        const displayMsg = isRejected
          ? "Transaction cancelled in Freighter."
          : message;

        setPaymentState({ status: "error", message: displayMsg });
        toastError("Payment failed", displayMsg);
      }
    },
    [publicKey, expenseId, markSharePaid, toastSuccess, toastError, toastInfo]
  );

  return {
    paymentState,
    payShare,
    reset,
    isIdle: paymentState.status === "idle",
    isLoading:
      paymentState.status === "building" ||
      paymentState.status === "signing" ||
      paymentState.status === "submitting",
    isSuccess: paymentState.status === "success",
    isError: paymentState.status === "error",
    txHash: paymentState.status === "success" ? paymentState.hash : null,
    explorerUrl:
      paymentState.status === "success"
        ? `${STELLAR_EXPLORER}/tx/${paymentState.hash}`
        : null,
  };
}
