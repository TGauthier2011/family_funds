"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  BarChart,
  BrainCircuit,
  Settings,
  ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/expenses", icon: ArrowRightLeft, label: "Expenses" },
  { href: "/budgets", icon: PiggyBank, label: "Budgets" },
  { href: "/bills", icon: Receipt, label: "Bills" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/reports", icon: BarChart, label: "Reports" },
  { href: "/insights", icon: BrainCircuit, label: "AI Insights" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg">Finance Flow</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent/50",
              pathname.startsWith(item.href) && "bg-accent/50 text-primary"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t p-4">
         <Link
            href="/settings"
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent/50",
                pathname === "/settings" && "bg-accent/50 text-primary"
            )}
            >
            <Settings className="h-4 w-4" />
            Settings
        </Link>
      </div>
    </aside>
  );
}
