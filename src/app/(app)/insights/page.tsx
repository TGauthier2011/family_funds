import { InsightsGenerator } from "@/components/insights/InsightsGenerator";

export default function InsightsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl">AI-Powered Insights</h1>
        <p className="text-muted-foreground max-w-2xl">
          Let our AI analyze your spending patterns and provide personalized recommendations to help you save money and reach your financial goals faster.
        </p>
      </div>
      <InsightsGenerator />
    </div>
  );
}
