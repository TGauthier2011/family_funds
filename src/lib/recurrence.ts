import { addDays, addWeeks, addMonths, addQuarters, addYears, startOfMonth, endOfMonth, isBefore } from "date-fns";

export type RecurrenceType = "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

/**
 * Normalizes recurrence modifier strings to standard types
 */
export function normalizeRecurrence(recurrence?: string): RecurrenceType | null {
  if (!recurrence) return null;
  
  const normalized = recurrence.trim().toLowerCase();
  
  if (normalized.includes("daily") || normalized === "day") return "daily";
  if (normalized.includes("weekly") || normalized === "week") return "weekly";
  if (normalized.includes("biweekly") || normalized.includes("bi-weekly") || normalized.includes("bi weekly") || normalized === "biweek") return "biweekly";
  if (normalized.includes("monthly") || normalized === "month") return "monthly";
  if (normalized.includes("quarterly") || normalized.includes("quarter")) return "quarterly";
  if (normalized.includes("yearly") || normalized.includes("annual") || normalized === "year") return "yearly";
  
  return null;
}

/**
 * Calculates the next occurrence date from a base date based on recurrence
 */
export function getNextOccurrence(baseDate: Date, recurrence: RecurrenceType): Date {
  switch (recurrence) {
    case "daily":
      return addDays(baseDate, 1);
    case "weekly":
      return addWeeks(baseDate, 1);
    case "biweekly":
      return addWeeks(baseDate, 2);
    case "monthly":
      return addMonths(baseDate, 1);
    case "quarterly":
      return addQuarters(baseDate, 1);
    case "yearly":
      return addYears(baseDate, 1);
  }
}

/**
 * Generates all occurrences of a recurring bill within a date range
 */
export function generateRecurringDates(
  baseDate: Date,
  recurrence: RecurrenceType | null,
  startDate: Date,
  endDate: Date
): Date[] {
  if (!recurrence) {
    // If no recurrence, just return the base date if it's in range
    if (baseDate >= startDate && baseDate <= endDate) {
      return [baseDate];
    }
    return [];
  }

  const occurrences: Date[] = [];
  let currentDate = new Date(baseDate);

  // If base date is before start date, fast-forward to first occurrence in range
  if (isBefore(currentDate, startDate)) {
    while (isBefore(currentDate, startDate)) {
      currentDate = getNextOccurrence(currentDate, recurrence);
    }
  }

  // Generate all occurrences within the range
  while (currentDate <= endDate) {
    if (currentDate >= startDate && currentDate <= endDate) {
      occurrences.push(new Date(currentDate));
    }
    currentDate = getNextOccurrence(currentDate, recurrence);
    
    // Safety limit to prevent infinite loops
    if (occurrences.length > 1000) break;
  }

  return occurrences;
}

/**
 * Generates all occurrences for a specific month
 */
export function generateRecurringDatesForMonth(
  baseDate: Date,
  recurrence: RecurrenceType | null,
  month: Date
): Date[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  return generateRecurringDates(baseDate, recurrence, monthStart, monthEnd);
}

