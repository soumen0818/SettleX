/**
 * useExpense — convenience hook for expense state and actions.
 * Thin wrapper around useExpenseContext() following the same
 * pattern as useWallet().
 */
import { useExpenseContext } from "@/context/ExpenseContext";

export function useExpense() {
  return useExpenseContext();
}
