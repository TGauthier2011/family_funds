"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date | undefined>(
    props.month || new Date()
  );

  React.useEffect(() => {
    if (props.month) {
      setMonth(props.month);
    }
  }, [props.month]);

  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Custom month/year label above day headers */}
      <div className="px-3 mb-4">
        <div className="text-center">
          <div className="inline-block px-4 py-2 rounded-md bg-card border">
            <span className="text-lg font-semibold">
              {month ? formatMonth(month) : formatMonth(new Date())}
            </span>
          </div>
        </div>
      </div>
      
      {/* Wrapper to ensure header and calendar align */}
      <div className="px-3">
        {/* Custom static header using CSS Grid to match calendar rows */}
        <div className="grid grid-cols-7 w-full mb-3 gap-0" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-muted-foreground text-[0.8rem] font-normal"
              style={{ minWidth: 0, maxWidth: '100%' }}
            >
              {day}
            </div>
          ))}
        </div>
        
        <DayPicker
          showOutsideDays={showOutsideDays}
          className="p-0"
        month={month}
        onMonthChange={(newMonth) => {
          setMonth(newMonth);
          props.onMonthChange?.(newMonth);
        }}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "!hidden",
          caption_label: "!hidden",
          nav: "!hidden",
          nav_button: "!hidden",
          nav_button_previous: "!hidden",
          nav_button_next: "!hidden",
          table: "w-full border-collapse",
          head_row: "!hidden",
          head_cell: "!hidden",
          row: "grid grid-cols-7 w-full mt-3 gap-0",
          cell: "h-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-10 w-full p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-green-500/20 text-foreground border border-green-500/40",
          day_outside:
            "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ className, ...props }) => (
            <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
          ),
          IconRight: ({ className, ...props }) => (
            <ChevronRight className={cn("h-4 w-4", className)} {...props} />
          ),
        }}
        {...props}
        />
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
