import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, isBillInCurrentPaycheckPeriod } from "@/lib/utils";
import type { Bill, PaycheckPeriod } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface BillTableProps {
  bills: Bill[];
  currentPaycheckPeriod: PaycheckPeriod;
  toggleBillStatus: (billId: string) => void;
}

export function BillTable({ bills, currentPaycheckPeriod, toggleBillStatus }: BillTableProps) {
  if (bills.length === 0) {
    return <p className="text-center text-muted-foreground p-4">No upcoming bills. Good job!</p>
  }
  return (
    <div className="w-full overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Bill</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[50px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.map((bill) => {
          const inCurrentPaycheck = isBillInCurrentPaycheckPeriod(bill.dueDate, currentPaycheckPeriod);
          return (
            <TableRow key={bill.id} className={cn(inCurrentPaycheck && "bg-accent/40", bill.status === 'Paid' && 'text-muted-foreground')}>
              <TableCell className="p-2">
                <Checkbox
                  checked={bill.status === 'Paid'}
                  onCheckedChange={() => toggleBillStatus(bill.id)}
                  aria-label={`Mark ${bill.name} as paid`}
                  className={cn(bill.status === 'Paid' && "border-muted-foreground data-[state=checked]:bg-muted-foreground data-[state=checked]:text-primary-foreground")}
                />
              </TableCell>
              <TableCell className={cn("font-medium", bill.status === 'Paid' && 'line-through')}>
                <div className="font-medium">{bill.name}</div>
                <div className="text-sm text-muted-foreground">{bill.category}</div>
              </TableCell>
              <TableCell className={cn(bill.status === 'Paid' && 'line-through')}>
                {new Date(bill.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {inCurrentPaycheck && <Badge variant="outline" className="ml-2 border-accent-foreground/50 bg-accent text-accent-foreground">Paycheck</Badge>}
              </TableCell>
              <TableCell className={cn("text-right font-mono", bill.status === 'Paid' && 'line-through')}>{formatCurrency(bill.amount)}</TableCell>
              <TableCell className="p-2 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions for {bill.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    </div>
  );
}
