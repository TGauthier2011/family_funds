"use client"

import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CustomCalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  month?: Date
  onMonthChange?: (date: Date) => void
  events?: Array<{
    date: string
    status?: "Paid" | "Unpaid" | "Upcoming" | "Late" | "Collections"
  }>
  className?: string
}

export function CustomCalendar({
  selected,
  onSelect,
  month: controlledMonth,
  onMonthChange,
  events = [],
  className,
}: CustomCalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(controlledMonth || new Date())
  const month = controlledMonth || internalMonth

  const handleMonthChange = (newMonth: Date) => {
    setInternalMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const goToPreviousMonth = () => {
    handleMonthChange(subMonths(month, 1))
  }

  const goToNextMonth = () => {
    handleMonthChange(addMonths(month, 1))
  }

  const goToToday = () => {
    handleMonthChange(new Date())
  }

  // Get all days to display (including days from previous/next month to fill the grid)
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday = 0
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return isSameDay(eventDate, date)
    })
  }

  // Get status color for event indicators
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500"
      case "Unpaid":
        return "bg-red-500"
      case "Late":
        return "bg-orange-500"
      case "Collections":
        return "bg-purple-500"
      case "Upcoming":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  const formatMonth = (date: Date) => {
    return format(date, "MMMM yyyy")
  }

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const isSelected = (date: Date) => {
    return selected ? isSameDay(date, selected) : false
  }

  return (
    <div className={cn("relative", className)}>
      {/* Month/Year Label */}
      <div className="px-3 mb-4">
        <div className="text-center">
          <div className="inline-block px-4 py-2 rounded-md bg-card border">
            <span className="text-lg font-semibold">
              {formatMonth(month)}
            </span>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 w-full px-3 mb-3 gap-0">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-muted-foreground text-[0.8rem] font-normal"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="px-3">
        <div className="grid grid-cols-7 w-full gap-0">
          {days.map((day, dayIdx) => {
            const dayEvents = getEventsForDate(day)
            const isCurrentMonth = isSameMonth(day, month)
            const isDayToday = isToday(day)
            const isDaySelected = isSelected(day)

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "h-10 relative flex items-center justify-center text-sm cursor-pointer transition-colors rounded-md hover:bg-accent",
                  !isCurrentMonth && "text-muted-foreground opacity-50",
                  isDayToday && "bg-green-500/20 border border-green-500/40",
                  isDaySelected && !isDayToday && "bg-primary text-primary-foreground"
                )}
                onClick={() => onSelect?.(day)}
              >
                <span className={cn(
                  "z-10 relative",
                  isDaySelected && !isDayToday && "text-primary-foreground"
                )}>
                  {format(day, "d")}
                </span>
                
                {/* Event Indicators */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 z-20 pointer-events-none">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          getStatusColor(event.status)
                        )}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

