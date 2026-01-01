"use client";

import { useState, useMemo } from "react";
import { mockBills } from "@/lib/mock-data";
import type { Bill, BillStatus } from "@/lib/types";
import { getPaycheckPeriodForDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddBillDialog } from "./AddBillDialog";
import { ImportBillsDialog } from "./ImportBillsDialog";
import { BillTable } from "./BillTable";

export function BillManager({ showTitle = false, isDashboard = false }) {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const currentPaycheckPeriod = useMemo(() => getPaycheckPeriodForDate(new Date()), []);

  const handleAddBill = (newBill: Omit<Bill, 'id' | 'status'>) => {
    setBills(prev => [{ ...newBill, id: String(prev.length + 1), status: 'Upcoming' }, ...prev]);
  };

  const handleImportBills = (importedBills: Omit<Bill, 'id' | 'status'>[]) => {
    const newBills = importedBills.map((bill, index) => ({
      ...bill,
      id: String(bills.length + index + 1),
      status: 'Upcoming' as BillStatus,
    }));
    setBills(prev => [...prev, ...newBills]);
  };

  const toggleBillStatus = (billId: string) => {
    setBills(bills.map(bill => 
      bill.id === billId ? { ...bill, status: bill.status === 'Paid' ? 'Unpaid' : 'Paid' } : bill
    ));
  };

  const billsToShow = isDashboard ? bills.filter(b => b.status !== 'Paid').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5) : bills.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

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
          <div className="flex gap-2">
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
