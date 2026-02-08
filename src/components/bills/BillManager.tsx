"use client";

import { useState, useMemo } from "react";
import type { Bill } from "@/lib/types";
import { getPaycheckPeriodForDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddBillDialog } from "./AddBillDialog";
import { ImportBillsDialog } from "./ImportBillsDialog";
import { BillTable } from "./BillTable";
import { useBills } from "./BillsProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHouseholds } from "@/components/households/HouseholdsProvider";

export function BillManager({ showTitle = false, isDashboard = false }) {
  const { bills, addBill, importBills, toggleBillStatus } = useBills();
  const { households, activeHouseholdId, setActiveHousehold } = useHouseholds();
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const currentPaycheckPeriod = useMemo(() => getPaycheckPeriodForDate(new Date()), []);

  const handleAddBill = (newBill: Omit<Bill, 'id' | 'status'>) => {
    addBill(newBill);
  };

  const handleImportBills = (importedBills: Omit<Bill, 'id' | 'status'>[]) => {
    importBills(importedBills);
  };

  const billsToShow = isDashboard ? bills.filter(b => b.status !== 'Paid').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5) : bills.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const scopeOptions = [{ id: "personal", name: "Personal" }, ...households.map((h) => ({ id: h.id, name: h.name }))];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">{isDashboard ? "Upcoming Bills" : "All Bills"}</CardTitle>
          <CardDescription>
            {isDashboard ? "Due soonest" : "Bills for the upcoming period."}
          </CardDescription>
        </div>
        {!isDashboard && (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={activeHouseholdId ?? "personal"}
              onValueChange={(value) => setActiveHousehold(value === "personal" ? null : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                {scopeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button onClick={() => setIsAddBillOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Bill
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <BillTable 
          bills={billsToShow}
          currentPaycheckPeriod={currentPaycheckPeriod}
          toggleBillStatus={toggleBillStatus}
        />
        {!isDashboard && (
          <>
            <AddBillDialog
              isOpen={isAddBillOpen}
              setIsOpen={setIsAddBillOpen}
              onAddBill={handleAddBill}
            />
            <ImportBillsDialog
              isOpen={isImportOpen}
              setIsOpen={setIsImportOpen}
              onImport={handleImportBills}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
