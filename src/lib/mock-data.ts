import type { Bill } from "@/lib/types";

export const mockBills: Bill[] = [
  { id: "1", name: "Mortgage/Rent", amount: 1800, dueDate: "2026-01-05", status: "Upcoming", category: "Housing" },
  { id: "2", name: "Electricity Bill", amount: 120, dueDate: "2026-01-10", status: "Upcoming", category: "Utilities" },
  { id: "3", name: "Netflix Subscription", amount: 15.49, dueDate: "2026-01-12", status: "Upcoming", category: "Entertainment" },
  { id: "4", name: "Car Payment", amount: 450, dueDate: "2026-01-15", status: "Paid", category: "Transport" },
  { id: "5", name: "Internet Bill", amount: 80, dueDate: "2026-01-20", status: "Upcoming", category: "Utilities" },
  { id: "6", name: "Water Bill", amount: 65, dueDate: "2026-01-22", status: "Upcoming", category: "Utilities" },
  { id: "7", name: "Credit Card", amount: 250, dueDate: "2026-01-28", status: "Upcoming", category: "Finance" },
  { id: "8", name: "Groceries", amount: 300, dueDate: "2026-02-01", status: "Upcoming", category: "Food" },
  { id: "9", name: "Phone Bill", amount: 100, dueDate: "2026-02-03", status: "Upcoming", category: "Utilities" },
];
