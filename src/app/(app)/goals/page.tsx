import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GoalsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Financial Goals</h1>
        <p className="text-muted-foreground">Define your financial goals and track your progress.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section is under construction. Soon, you'll be able to define your financial goals, like saving for a vacation or a down payment, and track your progress towards achieving them.</p>
        </CardContent>
      </Card>
    </div>
  );
}
