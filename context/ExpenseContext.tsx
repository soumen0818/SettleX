"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Expense } from "@/types/expense";
import { LS_EXPENSES } from "@/lib/utils/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  markSharePaid: (expenseId: string, memberId: string, txHash: string) => void;
  getExpense: (id: string) => Expense | undefined;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ExpenseContext = createContext<ExpenseContextType | null>(null);
ExpenseContext.displayName = "ExpenseContext";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LS_EXPENSES);
      if (raw) setExpenses(JSON.parse(raw) as Expense[]);
    } catch {
      // malformed data — start fresh
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist every time expenses change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;
    localStorage.setItem(LS_EXPENSES, JSON.stringify(expenses));
  }, [expenses, hydrated]);

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const addExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  }, []);

  const updateExpense = useCallback(
    (id: string, updates: Partial<Expense>) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
    },
    []
  );

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ── Mark a share as paid ───────────────────────────────────────────────────

  const markSharePaid = useCallback(
    (expenseId: string, memberId: string, txHash: string) => {
      setExpenses((prev) =>
        prev.map((e) => {
          if (e.id !== expenseId) return e;
          const shares = e.shares.map((s) =>
            s.memberId === memberId ? { ...s, paid: true, txHash } : s
          );
          const settled = shares.every((s) => s.paid);
          return { ...e, shares, settled };
        })
      );
    },
    []
  );

  // ── Look up single expense ─────────────────────────────────────────────────

  const getExpense = useCallback(
    (id: string) => expenses.find((e) => e.id === id),
    [expenses]
  );

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        markSharePaid,
        getExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useExpenseContext(): ExpenseContextType {
  const ctx = useContext(ExpenseContext);
  if (!ctx) {
    throw new Error("useExpenseContext must be used within <ExpenseProvider />");
  }
  return ctx;
}
