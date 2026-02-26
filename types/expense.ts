// ─── Split mode ───────────────────────────────────────────────────────────────

export type SplitMode = "equal" | "custom";

// ─── Member ───────────────────────────────────────────────────────────────────

export interface Member {
  id: string;               // uuid
  name: string;
  walletAddress?: string;   // Stellar G... address (optional — user may not know it yet)
  weight?: number;          // 1–100, used for custom split only
}

// ─── Single share ─────────────────────────────────────────────────────────────

export interface SplitShare {
  memberId: string;
  name: string;
  walletAddress?: string;
  amount: string;           // XLM with 7 decimal places e.g. "3.3333333"
  paid: boolean;
  txHash?: string;          // Stellar TX hash once paid
}

// ─── Expense ──────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;               // uuid
  title: string;
  description?: string;
  totalAmount: string;      // XLM as string e.g. "10.0000000"
  currency: "XLM";
  splitMode: SplitMode;
  paidByMemberId: string;   // the member who paid the bill upfront
  members: Member[];
  shares: SplitShare[];
  createdAt: string;        // ISO 8601
  settled: boolean;         // true when all shares are paid
}

// ─── Form data (subset used when creating) ────────────────────────────────────

export type ExpenseFormData = {
  title: string;
  description: string;
  totalAmount: string;
  splitMode: SplitMode;
  paidByMemberId: string;
  members: Member[];
};
