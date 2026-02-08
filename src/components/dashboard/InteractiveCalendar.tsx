"use client";

import React, { useState, useMemo, useCallback } from "react";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Bill, CalendarEvent } from "@/lib/types";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { normalizeRecurrence, generateRecurringDatesForMonth } from "@/lib/recurrence";
import { DollarSign, Receipt, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBills } from "@/components/bills/BillsProvider";
import { useHouseholds } from "@/components/households/HouseholdsProvider";

export function InteractiveCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { bills } = useBills();
  const { households, activeHouseholdId, setActiveHousehold } = useHouseholds();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  // Convert bills to calendar events, including recurring occurrences
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    bills.forEach(bill => {
      const baseDate = parseISO(bill.dueDate);
      const recurrence = normalizeRecurrence(bill.recurrenceModifier);
      
      // Generate all occurrences for the current month
      const occurrences = generateRecurringDatesForMonth(baseDate, recurrence, currentMonth);
      
      occurrences.forEach((occurrenceDate, index) => {
        events.push({
          id: `${bill.id}-${index}`,
          type: "bill" as const,
          title: bill.name,
          amount: bill.amount,
          date: format(occurrenceDate, "yyyy-MM-dd"),
          category: bill.category,
          status: bill.status,
        });
      });
    });

    return events;
  }, [bills, currentMonth]);

  // Get events for a specific date - memoized to prevent recreation
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return calendarEvents.filter(event => 
      isSameDay(parseISO(event.date), date)
    );
  }, [calendarEvents]);

  // Convert calendar events to format expected by CustomCalendar
  const calendarEventsForDisplay = useMemo(() => {
    return calendarEvents.map(event => ({
      date: event.date,
      status: event.status,
    }));
  }, [calendarEvents]);

  // Calculate totals for the month
  const monthTotals = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthEvents = calendarEvents.filter(event => {
      const eventDate = parseISO(event.date);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });

    const totalBills = monthEvents
      .filter(e => e.type === "bill")
      .reduce((sum, e) => sum + e.amount, 0);
    
    const paidBills = monthEvents
      .filter(e => e.type === "bill" && e.status === "Paid")
      .reduce((sum, e) => sum + e.amount, 0);

    const upcomingBills = monthEvents
      .filter(e => e.type === "bill" && e.status === "Upcoming")
      .reduce((sum, e) => sum + e.amount, 0);

    return { totalBills, paidBills, upcomingBills, eventCount: monthEvents.length };
  }, [currentMonth, calendarEvents]);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (getEventsForDate(date).length > 0) {
      setIsEventDialogOpen(true);
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500";
      case "Unpaid":
        return "bg-red-500";
      case "Upcoming":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthTotals.totalBills.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {monthTotals.eventCount} events this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${monthTotals.paidBills.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Completed payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${monthTotals.upcomingBills.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Pending payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthTotals.eventCount}</div>
            <p className="text-xs text-muted-foreground">
              Total events this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Financial Calendar</CardTitle>
                <CardDescription>
                  Click on a date to view or add events
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={activeHouseholdId ?? "personal"}
                  onValueChange={(value) => setActiveHousehold(value === "personal" ? null : value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    {households.map((household) => (
                      <SelectItem key={household.id} value={household.id}>
                        {household.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    handleMonthChange(today);
                    setSelectedDate(today);
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <CustomCalendar
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                events={calendarEventsForDisplay}
                className="rounded-md border"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Paid</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Upcoming</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span>Unpaid</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length > 0
                ? `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? "s" : ""}`
                : "No events scheduled"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                      {event.status && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            event.status === "Paid" && "bg-green-50 text-green-700",
                            event.status === "Unpaid" && "bg-red-50 text-red-700",
                            event.status === "Upcoming" && "bg-yellow-50 text-yellow-700"
                          )}
                        >
                          {event.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${event.amount.toFixed(2)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No events on this date</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsEventDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Event Details"}
            </DialogTitle>
            <DialogDescription>
              View and manage events for this date
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{event.title}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{event.category}</Badge>
                      {event.status && (
                        <Badge
                          variant="outline"
                          className={cn(
                            event.status === "Paid" && "bg-green-50 text-green-700",
                            event.status === "Unpaid" && "bg-red-50 text-red-700",
                            event.status === "Upcoming" && "bg-yellow-50 text-yellow-700"
                          )}
                        >
                          {event.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Due: {format(parseISO(event.date), "MMMM d, yyyy")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${event.amount.toFixed(2)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No events on this date</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

