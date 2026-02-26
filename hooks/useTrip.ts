"use client";

/**
 * Thin consumer hook — mirrors the pattern of useExpense().
 * Import this everywhere outside of context files.
 *
 * Usage:
 *   const { trips, addTrip, deleteTrip, getTrip, settleTrip } = useTrip();
 */
export { useTripContext as useTrip } from "@/context/TripContext";
