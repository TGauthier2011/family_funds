import { InteractiveCalendar } from "@/components/dashboard/InteractiveCalendar";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">Financial Calendar</h1>
        <p className="text-muted-foreground">View and manage your bills and expenses on an interactive monthly calendar.</p>
      </div>

      <InteractiveCalendar />
    </div>
  );
}
