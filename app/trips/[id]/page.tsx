"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ReceiptText,
  Scale,
  Plus,
  Users,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { useTrip } from "@/hooks/useTrip";
import { useExpense } from "@/hooks/useExpense";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { WalletGuard } from "@/components/wallet/WalletGuard";
import { Modal } from "@/components/ui/Modal";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseList } from "@/components/trips/ExpenseList";
import { SettlementSummary } from "@/components/trips/SettlementSummary";
import { useWallet } from "@/hooks/useWallet";
import type { Member } from "@/types/expense";

type Tab = "expenses" | "settle";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const { getTrip, settleTrip, addExpenseToTrip } = useTrip();
  const { expenses, addExpense } = useExpense();
  const { publicKey } = useWallet();

  const [activeTab, setActiveTab] = useState<Tab>("expenses");
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const trip = getTrip(params.id);

  // Trip not found
  if (!trip) {
    return (
      <WalletGuard>
        <div className="min-h-screen bg-[#F6F6F6] flex flex-col items-center justify-center gap-4">
          <p className="text-[#888]">Trip not found.</p>
          <Link
            href="/trips"
            className="text-sm font-semibold text-[#0F0F14] underline"
          >
            Back to Trips
          </Link>
        </div>
      </WalletGuard>
    );
  }

  const tripExpenses = expenses.filter((e) => trip.expenseIds.includes(e.id));
  const totalXLM = tripExpenses.reduce(
    (sum, e) => sum + parseFloat(e.totalAmount),
    0
  );
  const paidShares = tripExpenses.flatMap((e) => e.shares).filter((s) => s.paid).length;
  const totalShares = tripExpenses.flatMap((e) => e.shares).length;

  return (
    <WalletGuard>
      <div className="min-h-screen bg-[#F6F6F6]">
        {/* Nav */}
        <nav className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#E5E5E5] bg-white/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href="/trips"
              className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#0F0F14] transition-colors"
            >
              <ArrowLeft size={14} />
              Trips
            </Link>
            <span className="text-[#E5E5E5]">/</span>
            <span className="text-sm font-bold text-[#0F0F14] max-w-[140px] truncate">
              {trip.name}
            </span>
          </div>
          <ConnectWalletButton />
        </nav>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Trip header */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 mb-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-lg font-black text-[#0F0F14]">{trip.name}</h1>
                  {trip.settled && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 bg-[#B9FF66]/30 text-[#2D6600] rounded-full">
                      <CheckCheck size={9} />
                      Settled
                    </span>
                  )}
                </div>
                {trip.description && (
                  <p className="text-sm text-[#888] mb-3">{trip.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-[#AAA]">
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {trip.members.length} members
                  </span>
                  <span className="flex items-center gap-1">
                    <ReceiptText size={11} />
                    {tripExpenses.length} expense{tripExpenses.length !== 1 ? "s" : ""}
                  </span>
                  {totalXLM > 0 && (
                    <span className="font-semibold text-[#555]">
                      {totalXLM.toFixed(4)} XLM total
                    </span>
                  )}
                  {totalShares > 0 && (
                    <span className="text-[#2D6600]">
                      {paidShares}/{totalShares} shares paid
                    </span>
                  )}
                </div>
              </div>

              {!trip.settled && (
                <button
                  onClick={() => settleTrip(trip.id)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B9FF66] text-[#0F0F14] text-xs font-bold hover:bg-[#a8ec55] transition-all"
                >
                  <CheckCheck size={12} />
                  Mark Settled
                </button>
              )}
            </div>

            {/* Members row */}
            <div className="mt-4 pt-4 border-t border-[#F5F5F5]">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#AAA] mb-2">
                Members
              </p>
              <div className="flex flex-wrap gap-2">
                {trip.members.map((m: Member) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F6F6F6] rounded-lg border border-[#EBEBEB]"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#0F0F14] flex items-center justify-center text-[9px] font-bold text-[#B9FF66]">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-[#555]">{m.name}</span>
                    {m.walletAddress && (
                      <a
                        href={`https://stellar.expert/explorer/testnet/account/${m.walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#CCC] hover:text-[#888]"
                      >
                        <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-[#EBEBEB] rounded-xl mb-5">
            {(["expenses", "settle"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-white text-[#0F0F14] shadow-sm"
                    : "text-[#888] hover:text-[#0F0F14]"
                }`}
              >
                {tab === "expenses" ? (
                  <>
                    <ReceiptText size={13} />
                    Expenses
                  </>
                ) : (
                  <>
                    <Scale size={13} />
                    Settle Up
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === "expenses" ? (
              <motion.div
                key="expenses"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-[#0F0F14]">
                    Expenses ({tripExpenses.length})
                  </h2>
                  <button
                    onClick={() => setShowExpenseForm(true)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#0F0F14] text-[#B9FF66] hover:bg-[#1A1A22] transition-all"
                  >
                    <Plus size={12} />
                    Add Expense
                  </button>
                </div>
                <ExpenseList
                  expenses={tripExpenses}
                  onSelect={() => {
                    // Future: navigate or expand
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="settle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <SettlementSummary trip={trip} expenses={tripExpenses} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Add Expense modal — pre-populates with trip members */}
      <Modal
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        title="Add Expense"
        description={`Add an expense to "${trip.name}"`}
        size="lg"
      >
        <ExpenseForm
          currentUserPublicKey={publicKey}
          defaultMembers={trip.members}
          onSuccess={(newExpenseId?: string) => {
            if (newExpenseId) addExpenseToTrip(trip.id, newExpenseId);
            setShowExpenseForm(false);
          }}
          onCancel={() => setShowExpenseForm(false)}
        />
      </Modal>
    </WalletGuard>
  );
}
