import { useState, useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { useGetMoodCalendar, getGetMoodCalendarQueryKey } from "@workspace/api-client-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from "@/lib/mood-utils";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStr = format(currentDate, "yyyy-MM");
  const { data: calendarData, isLoading, isError } = useGetMoodCalendar({ month: monthStr }, {
    query: { queryKey: getGetMoodCalendarQueryKey({ month: monthStr }) }
  });

  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const moodMap = useMemo(() => {
    if (!calendarData) return {};
    return calendarData.reduce((acc, day) => {
      acc[day.date] = day;
      return acc;
    }, {} as Record<string, any>);
  }, [calendarData]);

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  // Determine starting weekday to offset the first grid item
  const startWeekday = startOfMonth(currentDate).getDay();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-2">Mood Calendar</h1>
          <p className="text-muted-foreground">Visualize your emotional landscape over time.</p>
        </div>

        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-2xl border border-card-border shadow-sm">
          <Button type="button" variant="ghost" size="icon" aria-label="Previous month" onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
          <div className="w-32 text-center font-serif text-lg font-medium">
            {format(currentDate, "MMMM yyyy")}
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Next month" onClick={handleNextMonth} disabled={isSameMonth(currentDate, new Date())}>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </header>

      {isError ? (
        <Card className="p-6 md:p-8 bg-card border-card-border shadow-sm">
          <div className="h-96 flex items-center justify-center text-center">
            <div>
              <p className="text-lg font-medium text-foreground mb-2">Couldn't load calendar</p>
              <p className="text-muted-foreground text-sm">Something went wrong. Please try again later.</p>
            </div>
          </div>
        </Card>
      ) : (
      <Card className="p-6 md:p-8 bg-card border-card-border shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/50"></div>
              <div className="w-3 h-3 rounded-full bg-primary/50" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 rounded-full bg-primary/50" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {/* Empty slots for start of month */}
            {Array.from({ length: startWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days */}
            {days.map(date => {
              const dateStr = format(date, "yyyy-MM-dd");
              const moodData = moodMap[dateStr];
              const isCurrentDay = isToday(date);
              
              return (
                <div 
                  key={dateStr}
                  className="aspect-square relative group"
                >
                  <div className={cn(
                    "w-full h-full rounded-2xl flex flex-col items-center justify-center p-1 md:p-2 transition-all duration-300 border-2 border-transparent",
                    moodData ? "bg-card text-foreground border-border" : "bg-muted/30 text-foreground",
                    isCurrentDay && !moodData && "border-primary/50",
                    isCurrentDay && moodData && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                    moodData && "shadow-sm"
                  )}>
                    <span className="text-xs md:text-sm font-medium mb-1">{format(date, "d")}</span>
                    {moodData && (
                      <span className="text-xl md:text-3xl" aria-label={MOOD_LABELS[moodData.mood as keyof typeof MOOD_LABELS]}>
                        {MOOD_EMOJIS[moodData.mood as keyof typeof MOOD_EMOJIS]}
                      </span>
                    )}
                  </div>
                  
                  {/* Tooltip for desktop */}
                  {moodData && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-popover text-popover-foreground border border-border shadow-lg rounded-xl text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none text-center">
                      <p className="font-semibold capitalize mb-1">{MOOD_LABELS[moodData.mood as keyof typeof MOOD_LABELS]}</p>
                      {moodData.note && <p className="text-muted-foreground max-w-[150px] truncate">{moodData.note}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 pt-4">
        {Object.entries(MOOD_LABELS).map(([moodKey, label]) => (
          <div key={moodKey} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded-full", MOOD_COLORS[moodKey as keyof typeof MOOD_COLORS])} />
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

    </motion.div>
  );
}
