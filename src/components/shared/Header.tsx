"use client";

import Link from "next/link";
import {
  Menu,
  Wallet,
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Target,
  BarChart,
  BrainCircuit,
  Settings,
  ArrowRightLeft,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/expenses", icon: ArrowRightLeft, label: "Expenses" },
    { href: "/budgets", icon: PiggyBank, label: "Budgets" },
    { href: "/bills", icon: Receipt, label: "Bills" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/reports", icon: BarChart, label: "Reports" },
    { href: "/insights", icon: BrainCircuit, label: "AI Insights" },
];


export function Header() {
    const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Wallet className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg">Finance Flow</span>
                </Link>
            </div>
            <nav className="grid gap-2 p-4 text-lg font-medium">
              {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent/50",
                        pathname.startsWith(item.href) && "bg-accent/50 text-primary"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-0 w-full border-t p-4">
              <Link
                  href="/settings"
                  className={cn(
                      "flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent/50",
                      pathname === "/settings" && "bg-accent/50 text-primary"
                  )}
                  >
                  <Settings className="h-5 w-5" />
                  Settings
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex w-full items-center justify-end gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <Image src="https://picsum.photos/seed/user-avatar/40/40" alt="User avatar" width={40} height={40} data-ai-hint="user avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/settings" className="flex items-center"><Settings className="mr-2 h-4 w-4" />Settings</Link></DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/login" className="flex items-center"><LogOut className="mr-2 h-4 w-4" />Logout</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
