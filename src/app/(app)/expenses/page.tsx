import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpensesPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Expense Tracking</h1>
        <p className="text-muted-foreground">Log and categorize your daily spending.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section is under construction. Soon, you'll be able to track all your family's expenses here, helping you understand where your money goes each month.</p>
        </CardContent>
      </Card>
    </div>
  );
}
