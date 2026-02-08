"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Bill, BillStatus } from "@/lib/types";
import { mockBills } from "@/lib/mock-data";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { useHouseholds } from "@/components/households/HouseholdsProvider";

type BillsContextValue = {
  bills: Bill[];
  addBill: (bill: Omit<Bill, "id" | "status">) => Promise<void>;
  importBills: (bills: Omit<Bill, "id" | "status">[]) => Promise<void>;
  toggleBillStatus: (billId: string) => Promise<void>;
};

const BillsContext = createContext<BillsContextValue | undefined>(undefined);

const STORAGE_KEY = "family_funds_bills";
const getMigrationKey = (userId: string) => `family_funds_bills_migrated_${userId}`;

const sanitizeBill = (bill: Bill): Bill => {
  const entries = Object.entries(bill).filter(([, value]) => {
    if (value === undefined) return false;
    if (typeof value === "number" && Number.isNaN(value)) return false;
    return true;
  });
  return Object.fromEntries(entries) as Bill;
};

const createBillId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function BillsProvider({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [userId, setUserId] = useState<string | null>(null);
  const { activeHouseholdId } = useHouseholds();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Bill[];
          if (Array.isArray(parsed)) {
            setBills(parsed);
          }
        }
      } catch (error) {
        console.warn("Failed to load bills from storage.", error);
      }
      return;
    }

    const billsCollection = activeHouseholdId
      ? collection(db, "households", activeHouseholdId, "bills")
      : collection(db, "users", userId, "bills");
    const unsubscribe = onSnapshot(
      billsCollection,
      (snapshot) => {
        const nextBills = snapshot.docs.map((docSnap) => docSnap.data() as Bill);
        setBills(nextBills);
      },
      (error) => {
        console.warn("Failed to load bills from Firestore.", error);
      }
    );

    return () => unsubscribe();
  }, [userId, activeHouseholdId]);

  useEffect(() => {
    if (userId) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
    } catch (error) {
      console.warn("Failed to save bills to storage.", error);
    }
  }, [bills, userId]);

  useEffect(() => {
    if (!userId) return;

    const migrationKey = getMigrationKey(userId);
    if (window.localStorage.getItem(migrationKey)) {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      window.localStorage.setItem(migrationKey, "true");
      return;
    }

    const migrate = async () => {
      try {
        const parsed = JSON.parse(stored) as Bill[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
          window.localStorage.setItem(migrationKey, "true");
          return;
        }

        const normalized = parsed.map((bill) => {
          const nextBill = {
            ...bill,
            id: bill.id || createBillId(),
            status: bill.status || "Upcoming",
          };
          return sanitizeBill(nextBill);
        });

        const batch = writeBatch(db);
        normalized.forEach((bill) => {
          batch.set(doc(db, "users", userId, "bills", bill.id), bill);
        });
        await batch.commit();

        window.localStorage.setItem(migrationKey, "true");
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Failed to migrate local bills to Firestore.", error);
      }
    };

    migrate();
  }, [userId]);

  const addBill = useCallback(
    async (bill: Omit<Bill, "id" | "status">) => {
      const newBill: Bill = { ...bill, id: createBillId(), status: "Upcoming" };
      const sanitized = sanitizeBill(newBill);

      if (!userId) {
        setBills((prev) => [sanitized, ...prev]);
        return;
      }

      try {
        const docRef = activeHouseholdId
          ? doc(db, "households", activeHouseholdId, "bills", newBill.id)
          : doc(db, "users", userId, "bills", newBill.id);
        await setDoc(docRef, sanitized);
      } catch (error) {
        console.warn("Failed to save bill to Firestore.", error);
      }
    },
    [userId, activeHouseholdId]
  );

  const importBills = useCallback(
    async (importedBills: Omit<Bill, "id" | "status">[]) => {
      const newBills: Bill[] = importedBills.map((bill) => {
        const nextBill = {
          ...bill,
          id: createBillId(),
          status: "Upcoming" as BillStatus,
        };
        return sanitizeBill(nextBill);
      });

      if (!userId) {
        setBills((prev) => [...prev, ...newBills]);
        return;
      }

      try {
        const batch = writeBatch(db);
        newBills.forEach((bill) => {
          const docRef = activeHouseholdId
            ? doc(db, "households", activeHouseholdId, "bills", bill.id)
            : doc(db, "users", userId, "bills", bill.id);
          batch.set(docRef, bill);
        });
        await batch.commit();
      } catch (error) {
        console.warn("Failed to import bills to Firestore.", error);
      }
    },
    [userId, activeHouseholdId]
  );

  const toggleBillStatus = useCallback(
    async (billId: string) => {
      const target = bills.find((bill) => bill.id === billId);
      if (!target) return;
      const nextStatus: BillStatus = target.status === "Paid" ? "Unpaid" : "Paid";
      const updatedBill = sanitizeBill({ ...target, status: nextStatus });

      if (!userId) {
        setBills((prev) =>
          prev.map((bill) => (bill.id === billId ? updatedBill : bill))
        );
        return;
      }

      try {
        const docRef = activeHouseholdId
          ? doc(db, "households", activeHouseholdId, "bills", billId)
          : doc(db, "users", userId, "bills", billId);
        await setDoc(docRef, updatedBill);
      } catch (error) {
        console.warn("Failed to update bill status in Firestore.", error);
      }
    },
    [bills, userId, activeHouseholdId]
  );

  const value = useMemo(
    () => ({
      bills,
      addBill,
      importBills,
      toggleBillStatus,
    }),
    [bills, addBill, importBills, toggleBillStatus]
  );

  return <BillsContext.Provider value={value}>{children}</BillsContext.Provider>;
}

export function useBills() {
  const context = useContext(BillsContext);
  if (!context) {
    throw new Error("useBills must be used within a BillsProvider");
  }
  return context;
}
