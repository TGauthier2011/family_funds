import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BudgetsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Budgeting</h1>
        <p className="text-muted-foreground">Set and manage your monthly budgets.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section is under construction. Soon, you'll be able to set monthly budgets for different spending categories and track your progress in real-time.</p>
        </CardContent>
      </Card>
    </div>
  );
}
