// Stellar Network
export const STELLAR_NETWORK =
  (process.env.NEXT_PUBLIC_STELLAR_NETWORK as "TESTNET" | "PUBLIC") ?? "TESTNET";

export const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

export const STELLAR_EXPLORER =
  process.env.NEXT_PUBLIC_STELLAR_EXPLORER ??
  "https://stellar.expert/explorer/testnet";

// "Test SDF Network ; September 2015" for testnet
export const NETWORK_PASSPHRASE =
  STELLAR_NETWORK === "PUBLIC"
    ? "Public Global Stellar Network ; September 2015"
    : "Test SDF Network ; September 2015";

// TX memo prefix
export const MEMO_PREFIX = "SettleX";

// Stellar base fee in stroops (0.00001 XLM = 100 stroops)
export const TX_BASE_FEE = 100;

// Memo max byte length enforced by Stellar protocol
export const MEMO_MAX_BYTES = 28;

// localStorage keys
export const LS_PUBLIC_KEY = "settlex:publicKey";
export const LS_EXPENSES   = "settlex:expenses";
export const LS_TRIPS      = "settlex:trips";

// App
export const APP_NAME    = process.env.NEXT_PUBLIC_APP_NAME    ?? "SettleX";
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";
