import type { Expense, Member } from "./expense";

export interface Trip {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  /** IDs of expenses that belong to this trip */
  expenseIds: string[];
  createdAt: string;   // ISO 8601
  settled: boolean;
}

export type TripFormData = {
  name: string;
  description: string;
  members: Member[];
};
