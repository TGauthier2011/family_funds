import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Bill } from "@/lib/types";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHouseholds } from "@/components/households/HouseholdsProvider";

interface AddBillDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddBill: (bill: Omit<Bill, 'id' | 'status'>) => void;
}

export function AddBillDialog({ isOpen, setIsOpen, onAddBill }: AddBillDialogProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [recurrenceModifier, setRecurrenceModifier] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const { activeHouseholdId } = useHouseholds();
  const [scope, setScope] = useState<"personal" | "household">(
    activeHouseholdId ? "household" : "personal"
  );

  useEffect(() => {
    if (!activeHouseholdId && scope === "household") {
      setScope("personal");
    }
  }, [activeHouseholdId, scope]);

  const handleSubmit = () => {
    if (name && amount && dueDate && category) {
      onAddBill({
        name,
        amount: parseFloat(amount),
        dueDate,
        category,
        scope,
        recurrenceModifier: recurrenceModifier || undefined,
        paymentMethod: paymentMethod || undefined,
      });
      setIsOpen(false);
      // Reset form
      setName("");
      setAmount("");
      setDueDate("");
      setCategory("");
      setRecurrenceModifier("");
      setPaymentMethod("");
      setScope(activeHouseholdId ? "household" : "personal");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add a New Bill</DialogTitle>
          <DialogDescription>
            Enter the details of your recurring bill below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g. Netflix" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Amount</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" placeholder="$15.49"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">Due Date</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
             <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scope" className="text-right">Scope</Label>
            <Select onValueChange={(value) => setScope(value as "personal" | "household")} value={scope}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="household" disabled={!activeHouseholdId}>
                  Household
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recurrence" className="text-right">Recurrence</Label>
             <Select onValueChange={setRecurrenceModifier} value={recurrenceModifier}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select recurrence (optional)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentMethod" className="text-right">Payment Method</Label>
             <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select payment method (optional)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="autopay">Autopay</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Bill</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
