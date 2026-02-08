"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";

type HouseholdRole = "owner" | "member";

export type HouseholdSummary = {
  id: string;
  name: string;
  role: HouseholdRole;
};

type HouseholdsContextValue = {
  households: HouseholdSummary[];
  activeHouseholdId: string | null;
  setActiveHousehold: (householdId: string | null) => void;
  createHousehold: (name: string) => Promise<void>;
  createInvite: (householdId: string) => Promise<string>;
  joinHousehold: (code: string) => Promise<void>;
  leaveHousehold: (householdId: string) => Promise<void>;
  userId: string | null;
};

const HouseholdsContext = createContext<HouseholdsContextValue | undefined>(undefined);

const getActiveKey = (userId: string) => `family_funds_active_household_${userId}`;

export function HouseholdsProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [households, setHouseholds] = useState<HouseholdSummary[]>([]);
  const [activeHouseholdId, setActiveHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setHouseholds([]);
      setActiveHouseholdId(null);
      return;
    }

    const activeKey = getActiveKey(userId);
    const stored = window.localStorage.getItem(activeKey);
    setActiveHouseholdId(stored || null);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const userHouseholdsRef = collection(db, "users", userId, "households");
    const unsubscribe = onSnapshot(
      userHouseholdsRef,
      (snapshot) => {
        const nextHouseholds = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as { name?: string; role?: HouseholdRole };
          return {
            id: docSnap.id,
            name: data.name || "Household",
            role: data.role || "member",
          };
        });
        setHouseholds(nextHouseholds);

        setActiveHouseholdId((current) => {
          if (!current) return current;
          const stillExists = nextHouseholds.some((household) => household.id === current);
          return stillExists ? current : null;
        });
      },
      (error) => {
        console.warn("Failed to load households from Firestore.", error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const setActiveHousehold = useCallback(
    (householdId: string | null) => {
      if (userId) {
        const activeKey = getActiveKey(userId);
        if (householdId) {
          window.localStorage.setItem(activeKey, householdId);
        } else {
          window.localStorage.removeItem(activeKey);
        }
      }
      setActiveHouseholdId(householdId);
    },
    [userId]
  );

  const createHousehold = useCallback(
    async (name: string) => {
      if (!userId) {
        throw new Error("You must be signed in to create a household.");
      }
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error("Please enter a household name.");
      }

      const householdRef = doc(collection(db, "households"));
      await setDoc(householdRef, {
        name: trimmedName,
        createdBy: userId,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "households", householdRef.id, "members", userId), {
        role: "owner",
        email: auth.currentUser?.email ?? null,
        displayName: auth.currentUser?.displayName ?? null,
        joinedAt: serverTimestamp(),
      });

      await setDoc(doc(db, "users", userId, "households", householdRef.id), {
        name: trimmedName,
        role: "owner",
        joinedAt: serverTimestamp(),
      });

      setActiveHousehold(householdRef.id);
    },
    [userId, setActiveHousehold]
  );

  const createInvite = useCallback(
    async (householdId: string) => {
      if (!userId) {
        throw new Error("You must be signed in to invite members.");
      }
      const membership = households.find((item) => item.id === householdId);
      if (!membership) {
        throw new Error("You don't have access to this household.");
      }

      const inviteRef = doc(collection(db, "householdInvites"));
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000));

      await setDoc(inviteRef, {
        householdId,
        createdBy: userId,
        createdAt: serverTimestamp(),
        expiresAt,
      });

      return inviteRef.id;
    },
    [userId, households]
  );

  const joinHousehold = useCallback(
    async (code: string) => {
      if (!userId) {
        throw new Error("You must be signed in to join a household.");
      }
      const trimmed = code.trim();
      if (!trimmed) {
        throw new Error("Please enter a household code.");
      }

      const inviteDoc = await getDoc(doc(db, "householdInvites", trimmed));
      let householdId = trimmed;
      let householdName = "Household";

      if (inviteDoc.exists()) {
        const inviteData = inviteDoc.data() as { householdId?: string; expiresAt?: Timestamp };
        const expiresAt = inviteData.expiresAt?.toMillis() ?? 0;
        if (!inviteData.householdId || (expiresAt && expiresAt < Date.now())) {
          await deleteDoc(inviteDoc.ref);
          throw new Error("This invite has expired. Ask for a new one.");
        }
        householdId = inviteData.householdId;
      }

      const householdDoc = await getDoc(doc(db, "households", householdId));
      if (!householdDoc.exists()) {
        throw new Error("Household not found. Check the code and try again.");
      }

      householdName = (householdDoc.data()?.name as string) || "Household";

      await setDoc(
        doc(db, "households", householdId, "members", userId),
        {
          role: "member",
          email: auth.currentUser?.email ?? null,
          displayName: auth.currentUser?.displayName ?? null,
          joinedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "users", userId, "households", householdId),
        {
          name: householdName,
          role: "member",
          joinedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (inviteDoc.exists()) {
        await deleteDoc(inviteDoc.ref);
      }

      setActiveHousehold(householdId);
    },
    [userId, setActiveHousehold]
  );

  const leaveHousehold = useCallback(
    async (householdId: string) => {
      if (!userId) {
        throw new Error("You must be signed in to leave a household.");
      }

      const household = households.find((item) => item.id === householdId);
      if (household?.role === "owner") {
        throw new Error("Owners can't leave their own household.");
      }

      await deleteDoc(doc(db, "households", householdId, "members", userId));
      await deleteDoc(doc(db, "users", userId, "households", householdId));

      if (activeHouseholdId === householdId) {
        setActiveHousehold(null);
      }
    },
    [userId, households, activeHouseholdId, setActiveHousehold]
  );

  const value = useMemo(
    () => ({
      households,
      activeHouseholdId,
      setActiveHousehold,
      createHousehold,
      createInvite,
      joinHousehold,
      leaveHousehold,
      userId,
    }),
    [
      households,
      activeHouseholdId,
      setActiveHousehold,
      createHousehold,
      createInvite,
      joinHousehold,
      leaveHousehold,
      userId,
    ]
  );

  return <HouseholdsContext.Provider value={value}>{children}</HouseholdsContext.Provider>;
}

export function useHouseholds() {
  const context = useContext(HouseholdsContext);
  if (!context) {
    throw new Error("useHouseholds must be used within a HouseholdsProvider");
  }
  return context;
}
