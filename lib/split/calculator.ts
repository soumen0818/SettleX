/**
 * Pure split-calculation functions.
 * All amounts returned as XLM strings with 7 decimal places
 * (Stellar's required precision).
 */
import type { Member, SplitShare } from "@/types/expense";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toXLM(n: number): string {
  return n.toFixed(7);
}

// ─── Equal split ──────────────────────────────────────────────────────────────

/**
 * Splits `totalXLM` equally among all members EXCEPT the payer.
 * Each person owes  totalXLM / memberCount  to the payer.
 *
 * Rounding note: the last person absorbs any rounding dust (< 1 stroop).
 */
export function calculateEqualSplit(
  totalXLM: number,
  members: Member[],
  paidByMemberId: string
): SplitShare[] {
  if (members.length === 0) return [];

  // Only the non-payers owe anything
  const nonPayers = members.filter((m) => m.id !== paidByMemberId);
  if (nonPayers.length === 0) return [];

  // Each person's fair share (including the payer who already paid)
  const perHead = totalXLM / members.length;
  const shares: SplitShare[] = [];

  nonPayers.forEach((m, i) => {
    const isLast = i === nonPayers.length - 1;
    const accumulated = shares.reduce((s, x) => s + parseFloat(x.amount), 0);

    // Last non-payer absorbs any floating-point dust.
    // Total non-payers must pay = perHead × nonPayers.length (not totalXLM,
    // because the payer keeps their own share). This fixes the 2-member bug
    // where the single non-payer was incorrectly assigned the full totalXLM.
    const amount = isLast
      ? perHead * nonPayers.length - accumulated
      : perHead;

    shares.push({
      memberId: m.id,
      name: m.name,
      walletAddress: m.walletAddress,
      amount: toXLM(Math.max(0, amount)),
      paid: false,
    });
  });

  return shares;
}

// ─── Custom / weighted split ──────────────────────────────────────────────────

/**
 * Splits `totalXLM` proportionally to each member's `weight`.
 * Members without a weight default to 1.
 * The payer is still tracked (their share is visible but marked as pre-paid).
 */
export function calculateCustomSplit(
  totalXLM: number,
  members: Member[],
  paidByMemberId: string
): SplitShare[] {
  if (members.length === 0) return [];

  const totalWeight = members.reduce((s, m) => s + (m.weight ?? 1), 0);
  const shares: SplitShare[] = [];

  members.forEach((m) => {
    if (m.id === paidByMemberId) return;

    const proportion = (m.weight ?? 1) / totalWeight;
    shares.push({
      memberId: m.id,
      name: m.name,
      walletAddress: m.walletAddress,
      amount: toXLM(totalXLM * proportion),
      paid: false,
    });
  });

  return shares;
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function calculateSplit(
  totalXLM: number,
  members: Member[],
  paidByMemberId: string,
  mode: "equal" | "custom"
): SplitShare[] {
  return mode === "custom"
    ? calculateCustomSplit(totalXLM, members, paidByMemberId)
    : calculateEqualSplit(totalXLM, members, paidByMemberId);
}

// ─── Validation helpers ───────────────────────────────────────────────────────

export function isValidXLMAmount(value: string): boolean {
  const n = parseFloat(value);
  return !isNaN(n) && n > 0 && n <= 100_000_000;
}

export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}
