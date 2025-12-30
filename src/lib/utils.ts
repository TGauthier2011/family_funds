import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PaycheckPeriod } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const PAYCHECK_START_DATE = new Date("2026-01-02T00:00:00Z");
const TWO_WEEKS_IN_MS = 14 * 24 * 60 * 60 * 1000;

export function getPaycheckPeriodForDate(date: Date): PaycheckPeriod {
  const timeDiff = date.getTime() - PAYCHECK_START_DATE.getTime();
  const periodIndex = Math.floor(timeDiff / TWO_WEEKS_IN_MS);

  const start = new Date(PAYCHECK_START_DATE.getTime() + periodIndex * TWO_WEEKS_IN_MS);
  const end = new Date(start.getTime() + TWO_WEEKS_IN_MS - 1);

  return { start, end };
}

export function isBillInCurrentPaycheckPeriod(billDueDate: string, currentPaycheckPeriod: PaycheckPeriod): boolean {
  try {
    const dueDate = new Date(billDueDate);
    // Add one day to dueDate to correctly handle timezone offsets
    dueDate.setDate(dueDate.getDate() + 1);
    return dueDate >= currentPaycheckPeriod.start && dueDate <= currentPaycheckPeriod.end;
  } catch (e) {
    return false;
  }
}
