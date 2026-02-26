/**
 * Build an unsigned Stellar payment transaction (XDR).
 * The returned XDR must be signed by Freighter before submission.
 */
import {
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
  Networks,
} from "@stellar/stellar-sdk";
import { server } from "./client";
import {
  NETWORK_PASSPHRASE,
  TX_BASE_FEE,
  MEMO_MAX_BYTES,
  MEMO_PREFIX,
} from "@/lib/utils/constants";

export interface BuildTxParams {
  sourcePublicKey: string;
  destinationPublicKey: string;
  /** XLM amount as a string with up to 7 decimal places e.g. "300.0000000" */
  amount: string;
  /** Human-readable memo e.g. "Dinner – Aman" — truncated to 28 bytes */
  memoText?: string;
}

export interface BuildTxResult {
  xdr: string;
  memo: string;
}

/** Encode a string as UTF-8 and trim to maxBytes without splitting chars */
function trimToMemoBytes(text: string, maxBytes: number = MEMO_MAX_BYTES): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  if (bytes.length <= maxBytes) return text;
  // Binary-search the longest prefix that fits
  let lo = 0, hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (encoder.encode(text.slice(0, mid)).length <= maxBytes) lo = mid;
    else hi = mid - 1;
  }
  return text.slice(0, lo);
}

export async function buildPaymentTransaction({
  sourcePublicKey,
  destinationPublicKey,
  amount,
  memoText,
}: BuildTxParams): Promise<BuildTxResult> {
  // Load source account for sequence number
  const account = await server.loadAccount(sourcePublicKey);

  // Build memo — enforce Stellar's 28-byte limit
  const rawMemo = memoText
    ? `${MEMO_PREFIX}|${memoText}`
    : MEMO_PREFIX;
  const safeMemo = trimToMemoBytes(rawMemo);

  const tx = new TransactionBuilder(account, {
    fee: String(TX_BASE_FEE),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: destinationPublicKey,
        asset: Asset.native(), // XLM
        amount,
      })
    )
    .addMemo(Memo.text(safeMemo))
    .setTimeout(30)
    .build();

  return { xdr: tx.toXDR(), memo: safeMemo };
}
