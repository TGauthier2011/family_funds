"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { category: "Groceries", spent: 450 },
  { category: "Utilities", spent: 220 },
  { category: "Transport", spent: 150 },
  { category: "Dining", spent: 300 },
  { category: "Shopping", spent: 250 },
  { category: "Entertainment", spent: 180 },
];

const chartConfig = {
  spent: {
    label: "Spent",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function SpendingChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart accessibilityLayer data={chartData}>
        <XAxis
            dataKey="category"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
            interval={0}
        />
        <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `$${value}`}
        />
        <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar
            dataKey="spent"
            fill="var(--color-spent)"
            radius={8}
        />
        </BarChart>
    </ChartContainer>
  );
}
