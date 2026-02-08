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
  personalBills: Bill[];
  householdBills: Bill[];
  addBill: (bill: Omit<Bill, "id" | "status">) => Promise<void>;
  importBills: (bills: Omit<Bill, "id" | "status">[]) => Promise<void>;
  updateBillStatus: (billId: string, status: BillStatus) => Promise<void>;
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
  const [personalBills, setPersonalBills] = useState<Bill[]>(mockBills);
  const [householdBills, setHouseholdBills] = useState<Bill[]>([]);
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
            setPersonalBills(parsed.map((bill) => ({ ...bill, scope: "personal" })));
          }
        }
      } catch (error) {
        console.warn("Failed to load bills from storage.", error);
      }
      setHouseholdBills([]);
      return;
    }

    const personalCollection = collection(db, "users", userId, "bills");
    const unsubscribePersonal = onSnapshot(
      personalCollection,
      (snapshot) => {
        const nextBills = snapshot.docs.map((docSnap) => ({
          ...(docSnap.data() as Bill),
          scope: "personal" as const,
        }));
        setPersonalBills(nextBills);
      },
      (error) => {
        console.warn("Failed to load personal bills from Firestore.", error);
      }
    );

    let unsubscribeHousehold = () => {};
    if (activeHouseholdId) {
      const householdCollection = collection(db, "households", activeHouseholdId, "bills");
      unsubscribeHousehold = onSnapshot(
        householdCollection,
        (snapshot) => {
          const nextBills = snapshot.docs.map((docSnap) => ({
            ...(docSnap.data() as Bill),
            scope: "household" as const,
          }));
          setHouseholdBills(nextBills);
        },
        (error) => {
          console.warn("Failed to load household bills from Firestore.", error);
        }
      );
    } else {
      setHouseholdBills([]);
    }

    return () => {
      unsubscribePersonal();
      unsubscribeHousehold();
    };
  }, [userId, activeHouseholdId]);

  useEffect(() => {
    if (userId) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(personalBills));
    } catch (error) {
      console.warn("Failed to save bills to storage.", error);
    }
  }, [personalBills, userId]);

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
            scope: "personal" as const,
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
      const targetScope = bill.scope ?? (activeHouseholdId ? "household" : "personal");
      const resolvedScope = targetScope === "household" && !activeHouseholdId ? "personal" : targetScope;
      const newBill: Bill = { ...bill, id: createBillId(), status: "Upcoming", scope: resolvedScope };
      const sanitized = sanitizeBill(newBill);

      if (!userId) {
        setPersonalBills((prev) => [sanitized, ...prev]);
        return;
      }

      try {
        const docRef = resolvedScope === "household" && activeHouseholdId
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
        const targetScope = bill.scope ?? (activeHouseholdId ? "household" : "personal");
        const resolvedScope = targetScope === "household" && !activeHouseholdId ? "personal" : targetScope;
        const nextBill = {
          ...bill,
          id: createBillId(),
          status: "Upcoming" as BillStatus,
          scope: resolvedScope,
        };
        return sanitizeBill(nextBill);
      });

      if (!userId) {
        setPersonalBills((prev) => [...prev, ...newBills]);
        return;
      }

      try {
        const batch = writeBatch(db);
        newBills.forEach((bill) => {
          const docRef = bill.scope === "household" && activeHouseholdId
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

  const updateBillStatus = useCallback(
    async (billId: string, status: BillStatus) => {
      const allBills = [...personalBills, ...householdBills];
      const target = allBills.find((bill) => bill.id === billId);
      if (!target) return;
      const updatedBill = sanitizeBill({ ...target, status });

      if (!userId) {
        setPersonalBills((prev) =>
          prev.map((bill) => (bill.id === billId ? updatedBill : bill))
        );
        return;
      }

      try {
        const docRef = updatedBill.scope === "household" && activeHouseholdId
          ? doc(db, "households", activeHouseholdId, "bills", billId)
          : doc(db, "users", userId, "bills", billId);
        await setDoc(docRef, updatedBill);
      } catch (error) {
        console.warn("Failed to update bill status in Firestore.", error);
      }
    },
    [personalBills, householdBills, userId, activeHouseholdId]
  );

  const value = useMemo(
    () => ({
      bills: [...personalBills, ...householdBills],
      personalBills,
      householdBills,
      addBill,
      importBills,
      updateBillStatus,
    }),
    [personalBills, householdBills, addBill, importBills, updateBillStatus]
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
