/**
 * Freighter wallet API wrapper (compatible with @stellar/freighter-api v6.x).
 *
 * All functions are async and throw a human-readable Error on failure
 * so callers can catch and display the message directly.
 */
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  signTransaction,
  getNetwork,
} from "@stellar/freighter-api";

// ─── Installation check ───────────────────────────────────────────────────────

/**
 * Returns true if the Freighter extension is installed in this browser.
 * Safe to call during SSR — returns false on the server.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const result = await isConnected();
    // v6: { isConnected: boolean, error?: FreighterApiError }
    if (result.error) return false;
    return result.isConnected ?? false;
  } catch {
    return false;
  }
}

// ─── Connect ──────────────────────────────────────────────────────────────────

/**
 * Request the user's Stellar public key from Freighter.
 *
 * Flow (v6 API):
 *  1. Check if site is already allowed → if yes, getAddress() works directly.
 *  2. If not allowed, call requestAccess() which opens the Freighter popup
 *     and returns the address on approval.
 */
export async function connectFreighter(): Promise<string> {
  // Step 1: check if site already has permission
  const allowed = await isAllowed();
  if (!allowed.error && allowed.isAllowed) {
    const addr = await getAddress();
    if (!addr.error && addr.address) return addr.address;
  }

  // Step 2: request access (opens the Freighter popup)
  const result = await requestAccess();

  if (result.error) {
    const msg = String(result.error);
    if (msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("denied")) {
      throw new Error("Connection rejected. Please approve the request in Freighter.");
    }
    throw new Error(msg);
  }

  if (!result.address) {
    throw new Error("Freighter did not return an address. Please try again.");
  }

  return result.address;
}

// ─── Sign ─────────────────────────────────────────────────────────────────────

/**
 * Sign an unsigned XDR string using the user's Freighter key.
 * Returns the signed XDR ready for Horizon submission.
 */
export async function signXDR(
  xdr: string,
  networkPassphrase: string
): Promise<string> {
  const result = await signTransaction(xdr, { networkPassphrase });

  if ("error" in result && result.error) {
    throw new Error(String(result.error));
  }

  const signed = (result as { signedTxXdr: string }).signedTxXdr;
  if (!signed) throw new Error("Freighter returned an empty signed transaction.");
  return signed;
}

// ─── Network ──────────────────────────────────────────────────────────────────

/**
 * Returns the network name active in Freighter ("TESTNET" | "PUBLIC" | etc.).
 */
export async function getFreighterNetwork(): Promise<string> {
  const result = await getNetwork();

  if ("error" in result && result.error) {
    throw new Error(String(result.error));
  }

  return (result as { network: string }).network ?? "TESTNET";
}
