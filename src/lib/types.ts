export type BillStatus = "Paid" | "Unpaid" | "Upcoming";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string e.g., "2026-01-15"
  status: BillStatus;
  category: string;
}

export interface PaycheckPeriod {
  start: Date;
  end: Date;
}
