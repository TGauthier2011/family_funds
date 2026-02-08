"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Bill } from "@/lib/types";
import { normalizeRecurrence } from "@/lib/recurrence";

interface ImportBillsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onImport: (bills: Omit<Bill, "id" | "status">[]) => void;
}

interface ImportedRow {
  Payee?: string;
  "Due Date"?: string;
  "Recurrence Modifier"?: string;
  "Amount due each month"?: string | number;
  "Current balance"?: string | number;
  "Interest rate"?: string | number;
  Notes?: string;
  "Payment Method"?: string;
  // Also handle lowercase/snake_case variations
  payee?: string;
  dueDate?: string;
  "due date"?: string;
  recurrenceModifier?: string;
  "recurrence modifier"?: string;
  amount?: string | number;
  "amount due each month"?: string | number;
  currentBalance?: string | number;
  "current balance"?: string | number;
  interestRate?: string | number;
  "interest rate"?: string | number;
  notes?: string;
  category?: string;
  Category?: string;
  paymentMethod?: string;
  "payment method"?: string;
}

export function ImportBillsDialog({
  isOpen,
  setIsOpen,
  onImport,
}: ImportBillsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Omit<Bill, "id" | "status">[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeColumnName = (name: string): string => {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
  };

  const parseDate = (dateStr: string | undefined): string | null => {
    if (!dateStr) return null;
    
    const str = String(dateStr).trim();
    
    // Try Excel date serial number first (common in Excel exports)
    const isNumericSerial = typeof dateStr === "number" || /^\d+(\.\d+)?$/.test(str);
    const excelDate = isNumericSerial ? parseFloat(str) : NaN;
    if (!isNaN(excelDate) && excelDate > 0 && excelDate < 100000) {
      // Excel dates start from 1900-01-01
      const excelEpoch = new Date(1899, 11, 30);
      const parsedDate = new Date(excelEpoch.getTime() + excelDate * 86400000);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split("T")[0];
      }
    }
    
    // Try various date formats
    // Format: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }
    
    // Format: MM/DD/YYYY or DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
      const parts = str.split("/");
      // Try MM/DD/YYYY first (US format)
      const date1 = new Date(`${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`);
      if (!isNaN(date1.getTime())) {
        return date1.toISOString().split("T")[0];
      }
      // Try DD/MM/YYYY (European format)
      const date2 = new Date(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`);
      if (!isNaN(date2.getTime())) {
        return date2.toISOString().split("T")[0];
      }
    }
    
    // Try standard Date parsing
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
    
    return null;
  };

  const parseNumber = (value: string | number | undefined): number | undefined => {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "number") return value;
    const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
    return isNaN(parsed) ? undefined : parsed;
  };

  const mapRowToBill = (row: ImportedRow, index: number): Omit<Bill, "id" | "status"> | null => {
    // Normalize column names (handle various formats)
    const payee = row.Payee || row.payee || "";
    const dueDateStr = row["Due Date"] || row["due date"] || row.dueDate || "";
    const amountStr = row["Amount due each month"] || row["amount due each month"] || row.amount || "";
    const category = row.Category || row.category || "Other";
    const recurrenceRaw = row["Recurrence Modifier"] || row["recurrence modifier"] || row.recurrenceModifier || "";
    const balance = row["Current balance"] || row["current balance"] || row.currentBalance;
    const interest = row["Interest rate"] || row["interest rate"] || row.interestRate;
    const notes = row.Notes || row.notes || "";
    const paymentMethodRaw = row["Payment Method"] || row["payment method"] || row.paymentMethod || "";

    // Validate required fields
    if (!payee || !dueDateStr || !amountStr) {
      return null;
    }

    const dueDate = parseDate(dueDateStr);
    const amount = parseNumber(amountStr);

    if (!dueDate || amount === undefined) {
      return null;
    }

    // Normalize recurrence modifier
    const normalizedRecurrence = normalizeRecurrence(recurrenceRaw);
    const recurrenceModifier = normalizedRecurrence || (recurrenceRaw.trim() || undefined);

    // Normalize payment method (autopay, manual)
    const paymentMethod = paymentMethodRaw.trim().toLowerCase() || undefined;
    const normalizedPaymentMethod = paymentMethod === "autopay" || paymentMethod === "manual" 
      ? paymentMethod 
      : (paymentMethod || undefined);

    return {
      name: payee.trim(),
      amount,
      dueDate,
      category: category.trim() || "Other",
      recurrenceModifier,
      currentBalance: parseNumber(balance),
      interestRate: parseNumber(interest),
      notes: notes.trim() || undefined,
      paymentMethod: normalizedPaymentMethod,
    };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setPreview(null);
    setIsProcessing(true);

    try {
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      let rows: ImportedRow[] = [];

      if (fileExtension === "csv") {
        // Parse CSV
        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            rows = results.data as ImportedRow[];
            processRows(rows);
          },
          error: (error) => {
            setError(`Error parsing CSV: ${error.message}`);
            setIsProcessing(false);
          },
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        // Parse Excel
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        rows = XLSX.utils.sheet_to_json(worksheet) as ImportedRow[];
        processRows(rows);
      } else {
        setError("Unsupported file format. Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
        setIsProcessing(false);
      }
    } catch (err) {
      setError(`Error reading file: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsProcessing(false);
    }
  };

  const processRows = (rows: ImportedRow[]) => {
    const bills: Omit<Bill, "id" | "status">[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      const bill = mapRowToBill(row, index);
      if (bill) {
        bills.push(bill);
      } else {
        errors.push(`Row ${index + 2}: Missing required fields (Payee, Due Date, or Amount)`);
      }
    });

    if (bills.length === 0) {
      setError("No valid bills found in the file. Please check that your file has the required columns: Payee, Due Date, and Amount due each month.");
    } else if (errors.length > 0) {
      setError(`Imported ${bills.length} bills. ${errors.length} row(s) were skipped: ${errors.slice(0, 3).join("; ")}${errors.length > 3 ? "..." : ""}`);
    }

    setPreview(bills);
    setIsProcessing(false);
  };

  const handleImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview);
      setIsOpen(false);
      setFile(null);
      setPreview(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">Import Bills from Spreadsheet</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with your bills. Required columns: Payee, Due Date, Amount due each month.
            Optional columns: Recurrence Modifier (daily, weekly, biweekly, monthly, quarterly, yearly), Current balance, Interest rate, Notes, Category, Payment Method (autopay, manual).
            <a
              href="/bills-import-template.csv"
              download
              className="ml-1 text-primary hover:underline"
            >
              Download template
            </a>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Upload className="mr-2 h-4 w-4" />
                {file ? file.name : "Choose File"}
              </Button>
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="text-center py-4 text-muted-foreground">
              Processing file...
            </div>
          )}

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">
                  Found {preview.length} bill{preview.length !== 1 ? "s" : ""} to import
                </span>
              </div>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {preview.slice(0, 5).map((bill, index) => (
                    <div key={index} className="text-sm border-b pb-2 last:border-0">
                      <div className="font-medium">{bill.name}</div>
                      <div className="text-muted-foreground text-xs">
                        ${bill.amount.toFixed(2)} • Due: {bill.dueDate} • {bill.category}
                        {bill.recurrenceModifier && (
                          <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">
                            {bill.recurrenceModifier}
                          </span>
                        )}
                        {bill.paymentMethod && (
                          <span className="ml-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px]">
                            {bill.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {preview.length > 5 && (
                    <div className="text-xs text-muted-foreground pt-2">
                      ...and {preview.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Expected Format */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p className="font-medium">Expected column names:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li><strong>Payee</strong> (required) - Name of the bill/payee</li>
              <li><strong>Due Date</strong> (required) - Date in YYYY-MM-DD or Excel date format</li>
              <li><strong>Amount due each month</strong> (required) - Monthly payment amount</li>
              <li><strong>Recurrence Modifier</strong> (optional) - daily, weekly, biweekly, monthly, quarterly, or yearly</li>
              <li><strong>Current balance</strong> (optional) - Current balance if applicable</li>
              <li><strong>Interest rate</strong> (optional) - Interest rate percentage</li>
              <li><strong>Notes</strong> (optional) - Any additional notes</li>
              <li><strong>Category</strong> (optional) - Bill category</li>
              <li><strong>Payment Method</strong> (optional) - autopay or manual</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!preview || preview.length === 0 || isProcessing}
          >
            Import {preview ? `${preview.length} ` : ""}Bill{preview && preview.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

