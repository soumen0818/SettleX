"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Trip } from "@/types/trip";
import { LS_TRIPS } from "@/lib/utils/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripContextType {
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addExpenseToTrip: (tripId: string, expenseId: string) => void;
  settleTrip: (id: string) => void;
  getTrip: (id: string) => Trip | undefined;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TripContext = createContext<TripContextType | null>(null);
TripContext.displayName = "TripContext";

// ─── Provider ────────────────────────────────────────────────────────────────

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LS_TRIPS);
      if (raw) setTrips(JSON.parse(raw) as Trip[]);
    } catch {
      // ignore malformed data
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on every update (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_TRIPS, JSON.stringify(trips));
  }, [trips, hydrated]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addTrip = useCallback((trip: Trip) => {
    setTrips((prev) => [trip, ...prev]);
  }, []);

  const updateTrip = useCallback((id: string, updates: Partial<Trip>) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addExpenseToTrip = useCallback((tripId: string, expenseId: string) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId && !t.expenseIds.includes(expenseId)
          ? { ...t, expenseIds: [...t.expenseIds, expenseId] }
          : t
      )
    );
  }, []);

  const settleTrip = useCallback((id: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, settled: true } : t))
    );
  }, []);

  const getTrip = useCallback(
    (id: string) => trips.find((t) => t.id === id),
    [trips]
  );

  return (
    <TripContext.Provider
      value={{
        trips,
        addTrip,
        updateTrip,
        deleteTrip,
        addExpenseToTrip,
        settleTrip,
        getTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

// ─── Raw context hook (internal use / testing) ────────────────────────────────

export function useTripContext(): TripContextType {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error("useTripContext must be used inside <TripProvider>");
  }
  return ctx;
}
