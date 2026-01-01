export type BillStatus = "Paid" | "Unpaid" | "Upcoming";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string e.g., "2026-01-15"
  status: BillStatus;
  category: string;
  recurrenceModifier?: string; // e.g., "Monthly", "Bi-weekly", "Weekly"
  currentBalance?: number;
  interestRate?: number;
  notes?: string;
  paymentMethod?: string; // e.g., "autopay", "manual"
}

export interface PaycheckPeriod {
  start: Date;
  end: Date;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO string e.g., "2026-01-15"
  category: string;
  description?: string;
}

export type CalendarEvent = {
  id: string;
  type: "bill" | "expense";
  title: string;
  amount: number;
  date: string;
  category: string;
  status?: BillStatus;
};