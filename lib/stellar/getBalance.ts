import { server } from "./client";

/**
 * Fetch the native XLM balance for `publicKey` from Horizon.
 * Returns a 7-decimal string (e.g. "125.3000000") or "0" if not found.
 */
export async function getXLMBalance(publicKey: string): Promise<string> {
  const account = await server.loadAccount(publicKey);
  const native = account.balances.find((b) => b.asset_type === "native");
  return native?.balance ?? "0";
}
