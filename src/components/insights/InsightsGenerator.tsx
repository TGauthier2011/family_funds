"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { getSpendingInsights } from "@/ai/flows/spending-insights";
import { mockBills } from "@/lib/mock-data";

export function InsightsGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    try {
      // In a real app, this data would be fetched from the user's account
      const mockSpendingData = {
        transactions: [
            ...mockBills,
            { id: "10", name: "Groceries", amount: 120, dueDate: "2026-01-03", category: "Food" },
            { id: "11", name: "Gas", amount: 55, dueDate: "2026-01-08", category: "Transport" },
            { id: "12", name: "Movie Night", amount: 45, dueDate: "2026-01-11", category: "Entertainment" },
        ],
      };
      const mockFinancialGoals = {
        goals: [
            { name: "Vacation Fund", target: 10000, current: 7500 },
            { name: "Emergency Fund", target: 5000, current: 2000 },
        ]
      };

      const result = await getSpendingInsights({
        spendingData: JSON.stringify(mockSpendingData),
        financialGoals: JSON.stringify(mockFinancialGoals),
      });

      setInsights(result.insights);
    } catch (e) {
      console.error(e);
      setError("Failed to generate insights. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerate} disabled={isLoading} size="lg">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <BrainCircuit className="mr-2 h-4 w-4" />
        )}
        Generate My Insights
      </Button>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {insights && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary"/>
                <CardTitle className="font-headline">Your Financial Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap font-body text-sm leading-relaxed text-foreground/90">{insights}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
