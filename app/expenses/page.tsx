"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowLeft,
  ReceiptText,
  Trash2,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useExpense } from "@/hooks/useExpense";
import { usePayment } from "@/hooks/usePayment";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { WalletGuard } from "@/components/wallet/WalletGuard";
import { Modal } from "@/components/ui/Modal";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { SplitCalculator } from "@/components/expenses/SplitCalculator";
import { PaymentStatus } from "@/components/payment/PaymentStatus";
import type { Expense, SplitShare } from "@/types/expense";

// ─── Expense Card ─────────────────────────────────────────────────────────────

function ExpenseCard({
  expense,
  onDelete,
}: {
  expense: Expense;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [payingShareId, setPayingShareId] = useState<string | null>(null);
  const { payShare, paymentState, reset } = usePayment({ expenseId: expense.id });

  const handlePay = async (share: SplitShare) => {
    setPayingShareId(share.memberId);
    await payShare({ share, expenseTitle: expense.title });
    setPayingShareId(null);
  };
  const paidCount = expense.shares.filter((s) => s.paid).length;
  const total = parseFloat(expense.totalAmount);
  const payer = expense.members.find((m) => m.id === expense.paidByMemberId);
  const createdAt = new Date(expense.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden hover:border-[#D0D0D0] transition-all"
    >
      {/* Header row */}
      <button
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#0F0F14] flex items-center justify-center shrink-0">
            <ReceiptText size={15} className="text-[#B9FF66]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#0F0F14] truncate">
              {expense.title}
            </p>
            <p className="text-xs text-[#AAA]">
              {total.toFixed(4)} XLM &middot; {expense.members.length} members
              &middot; {createdAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {expense.settled ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#B9FF66]/30 text-[#2D6600] rounded-full">
              Settled
            </span>
          ) : (
            <span className="text-xs text-[#888]">
              {paidCount}/{expense.shares.length} paid
            </span>
          )}
          <ChevronRight
            size={14}
            className={`text-[#CCC] transition-transform duration-200 ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Progress bar */}
      {expense.shares.length > 0 && (
        <div className="h-0.5 w-full bg-[#F0F0F0]">
          <div
            className="h-full bg-[#B9FF66] transition-all duration-500"
            style={{
              width: `${(paidCount / expense.shares.length) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-3 pb-4 border-t border-[#F5F5F5]">
              {expense.description && (
                <p className="text-xs text-[#888] mb-3 leading-relaxed">
                  {expense.description}
                </p>
              )}

              <SplitCalculator
                shares={expense.shares}
                payerName={payer?.name ?? "Payer"}
                totalAmount={expense.totalAmount}
                expenseTitle={expense.title}
                onPay={handlePay}
                payingShareId={payingShareId ?? undefined}
              />

              {paymentState.status !== "idle" && (
                <div className="mt-3">
                  <PaymentStatus state={paymentState} onReset={reset} />
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F5F5]">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#CCC]">
                  Split: {expense.splitMode}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(expense.id);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#CCC] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#F0F0F0] flex items-center justify-center mb-5">
        <Inbox size={24} className="text-[#CCC]" />
      </div>
      <h3 className="text-base font-bold text-[#0F0F14] mb-1">
        No expenses yet
      </h3>
      <p className="text-sm text-[#AAA] mb-6 max-w-xs">
        Create your first expense and split the bill instantly using Stellar.
      </p>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F0F14] text-[#B9FF66] text-sm font-bold hover:bg-[#1A1A22] transition-all"
      >
        <Plus size={15} />
        New Expense
      </button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const { publicKey } = useWallet();
  const { expenses, deleteExpense } = useExpense();
  const [showForm, setShowForm] = useState(false);

  return (
    <WalletGuard>
      <div className="min-h-screen bg-[#F6F6F6]">
        {/* Nav */}
        <nav className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#E5E5E5] bg-white/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#0F0F14] transition-colors">
              <ArrowLeft size={14} />
              Dashboard
            </Link>
            <span className="text-[#E5E5E5]">/</span>
            <span className="text-sm font-bold text-[#0F0F14]">Expenses</span>
          </div>
          <ConnectWalletButton />
        </nav>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-black text-[#0F0F14]">Expenses</h1>
              <p className="text-sm text-[#888] mt-0.5">
                {expenses.length === 0
                  ? "No expenses yet"
                  : `${expenses.length} expense${expenses.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {expenses.length > 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F0F14] text-[#B9FF66] text-sm font-bold hover:bg-[#1A1A22] transition-all"
              >
                <Plus size={14} />
                New
              </button>
            )}
          </div>

          {/* Expense list or empty state */}
          {expenses.length === 0 ? (
            <EmptyState onNew={() => setShowForm(true)} />
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {expenses.map((expense: Expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onDelete={deleteExpense}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}


        </main>
      </div>

      {/* New Expense modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Expense"
        description="Split a bill and track who owes what."
        size="lg"
      >
        <ExpenseForm
          currentUserPublicKey={publicKey}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </WalletGuard>
  );
}
