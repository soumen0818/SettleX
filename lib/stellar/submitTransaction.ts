/**
 * Submit a signed XDR transaction to Stellar Horizon.
 * Returns the transaction hash on success.
 */
import { TransactionBuilder } from "@stellar/stellar-sdk";
import { server } from "./client";
import { NETWORK_PASSPHRASE } from "@/lib/utils/constants";

export interface SubmitResult {
  hash: string;
  ledger: number;
  successful: boolean;
}

export async function submitSignedTransaction(
  signedXDR: string
): Promise<SubmitResult> {
  // Re-hydrate the Transaction object from signed XDR
  const tx = TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);

  const response = await server.submitTransaction(tx);

  return {
    hash: response.hash,
    ledger: response.ledger,
    successful: true,
  };
}
