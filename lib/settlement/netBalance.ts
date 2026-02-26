/**
 * Minimum-transaction debt-settlement algorithm.
 *
 * Given a list of "A paid X for B, C, D" records, computes the minimal set
 * of direct payments that clears all debts — often reducing N payments to
 * far fewer.
 *
 * Algorithm: greedy creditor–debtor matching.
 *   1. Compute net balance per person.
 *   2. Split into creditors (balance > 0) and debtors (balance < 0).
 *   3. Match largest creditor with largest debtor; settle min(|c|, |d|).
 *   4. Repeat until all balances are zero.
 */

export interface NetPayment {
  from: string;   // name of the payer
  to: string;     // name of the recipient
  amount: string; // XLM with 7 decimal places
  fromWallet?: string;
  toWallet?: string;
}

export interface RawDebt {
  from: string;       // who owes
  to: string;         // who is owed
  amount: number;
  fromWallet?: string;
  toWallet?: string;
}

/**
 * Calculates the minimal list of payments to settle all debts.
 */
export function computeNetPayments(debts: RawDebt[]): NetPayment[] {
  // Step 1: aggregate net balance per person
  const balance = new Map<string, number>();
  const wallets = new Map<string, string>();

  debts.forEach(({ from, to, amount, fromWallet, toWallet }) => {
    balance.set(from, (balance.get(from) ?? 0) - amount);
    balance.set(to,   (balance.get(to)   ?? 0) + amount);
    if (fromWallet) wallets.set(from, fromWallet);
    if (toWallet)   wallets.set(to,   toWallet);
  });

  // Step 2: separate creditors and debtors
  const creditors: Array<{ name: string; balance: number }> = [];
  const debtors:   Array<{ name: string; balance: number }> = [];

  balance.forEach((bal, name) => {
    const rounded = Math.round(bal * 1e7) / 1e7; // 7-decimal precision
    if (rounded > 0.0000001)  creditors.push({ name, balance:  rounded });
    if (rounded < -0.0000001) debtors.push({   name, balance: -rounded });
  });

  // Sort descending so we always match largest pairs
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort(  (a, b) => b.balance - a.balance);

  const result: NetPayment[] = [];

  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor   = debtors[di];

    const settle = Math.min(creditor.balance, debtor.balance);
    const rounded = Math.round(settle * 1e7) / 1e7;

    if (rounded > 0.0000001) {
      result.push({
        from:       debtor.name,
        to:         creditor.name,
        amount:     rounded.toFixed(7),
        fromWallet: wallets.get(debtor.name),
        toWallet:   wallets.get(creditor.name),
      });
    }

    creditor.balance -= settle;
    debtor.balance   -= settle;

    if (creditor.balance < 0.0000001) ci++;
    if (debtor.balance   < 0.0000001) di++;
  }

  return result;
}
