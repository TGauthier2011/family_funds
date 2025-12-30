import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Reports</h1>
        <p className="text-muted-foreground">Generate detailed financial reports.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section is under construction. Soon, you'll be able to generate detailed reports on your spending, budgeting, and financial goal progress to get a clearer picture of your financial health.</p>
        </CardContent>
      </Card>
    </div>
  );
}
