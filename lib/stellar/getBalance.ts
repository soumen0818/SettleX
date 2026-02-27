import { HORIZON_URL } from "@/lib/utils/constants";

/**
 * Fetch the native XLM balance for `publicKey` from Horizon.
 * Returns a 7-decimal string (e.g. "125.3000000") or "0" if not found.
 *
 * Uses a direct fetch with cache: 'no-store' + a timestamp bust param so
 * the browser never serves a stale cached response after a payment.
 */
export async function getXLMBalance(publicKey: string): Promise<string> {
  // _ts busts any HTTP cache layer (CDN / browser)
  const url = `${HORIZON_URL}/accounts/${publicKey}?_ts=${Date.now()}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
  });

  if (!res.ok) {
    // Throw so callers can keep the previously known balance instead of
    // overwriting it with a misleading "0".
    throw new Error(`Horizon ${res.status}: failed to fetch balance for ${publicKey}`);
  }

  const data = await res.json() as {
    balances?: Array<{ asset_type: string; balance: string }>;
  };

  const native = data.balances?.find((b) => b.asset_type === "native");
  return native?.balance ?? "0";
}
