import { BillManager } from "@/components/bills/BillManager";

export default function BillsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Bill Management</h1>
        <p className="text-muted-foreground">
          Track your recurring bills, mark them as paid, and never miss a due date.
        </p>
      </div>
      <BillManager />
    </div>
  );
}
