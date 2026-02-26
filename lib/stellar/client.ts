import { Horizon } from "@stellar/stellar-sdk";
import { HORIZON_URL } from "@/lib/utils/constants";

/**
 * Singleton Horizon server instance.
 * Uses the URL from .env.local so testnet/mainnet switching
 * is a one-variable change.
 */
export const server = new Horizon.Server(HORIZON_URL, {
  allowHttp: HORIZON_URL.startsWith("http://"), // allow plain HTTP only in dev
});
