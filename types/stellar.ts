/**
 * TypeScript types for Stellar transaction results and Horizon API responses.
 */

/** Result returned after successfully submitting a transaction to Horizon */
export interface StellarSubmitResult {
  hash: string;
  ledger: number;
  successful: boolean;
}

/** Horizon operation result codes (subset of most common ones) */
export type OperationResultCode =
  | "op_success"
  | "op_malformed"
  | "op_underfunded"
  | "op_no_destination"
  | "op_no_trust"
  | "op_line_full"
  | "op_not_authorized"
  | "op_insufficient_balance"
  | string; // allow other codes

/** Horizon transaction result codes */
export type TransactionResultCode =
  | "tx_success"
  | "tx_failed"
  | "tx_too_early"
  | "tx_too_late"
  | "tx_missing_operation"
  | "tx_bad_seq"
  | "tx_bad_auth"
  | "tx_insufficient_balance"
  | "tx_no_account"
  | "tx_insufficient_fee"
  | "tx_bad_auth_extra"
  | "tx_internal_error"
  | string;

/** Horizon error extras returned with a 400 response */
export interface HorizonResultCodes {
  transaction: TransactionResultCode;
  operations?: OperationResultCode[];
}

/** Shape of a Horizon error response body */
export interface HorizonErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  extras?: {
    result_codes: HorizonResultCodes;
    result_xdr?: string;
  };
}

/** XLM balance entry from Horizon account balances array */
export interface StellarBalance {
  asset_type: "native" | "credit_alphanum4" | "credit_alphanum12";
  balance: string;
  asset_code?: string;
  asset_issuer?: string;
}
