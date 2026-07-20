import { useListEntries } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MOOD_EMOJIS, MOOD_LABELS } from "@/lib/mood-utils";
import { BookX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalEntry } from "@workspace/api-client-react";

export default function Entries() {
  const { data, isLoading } = useListEntries({ limit: 100 });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-md mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-card rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const entries = data?.entries || [];

  // Group entries by month-year
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const monthYear = format(date, "MMMM yyyy");
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <header>
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-2">Your Journal</h1>
        <p className="text-muted-foreground">Every entry is a step on your journey.</p>
      </header>

      {entries.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center bg-card rounded-3xl border border-card-border">
          <div className="bg-primary/10 p-6 rounded-full mb-6 text-primary">
            <BookX className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-serif text-foreground mb-2">No entries yet</h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            A quiet space is waiting for your thoughts. Whenever you're ready.
          </p>
          <Button asChild>
            <Link href="/write">Write your first entry</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedEntries).map(([month, monthEntries]) => (
            <div key={month} className="space-y-4">
              <h3 className="text-lg font-serif text-muted-foreground border-b border-border/50 pb-2">
                {month}
              </h3>
              <div className="space-y-3">
                {monthEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/entries/${entry.id}`}>
                      <div className="p-5 md:p-6 bg-card hover:bg-accent/40 rounded-2xl border border-card-border hover:border-primary/30 transition-all duration-300 group flex flex-col md:flex-row gap-4 md:items-center">
                        
                        <div className="flex items-center gap-4 md:w-48 shrink-0">
                          <div className="flex flex-col text-center bg-background rounded-xl p-2 min-w-[3.5rem] border border-border/50">
                            <span className="text-xs text-muted-foreground uppercase font-medium">
                              {format(new Date(entry.date), "MMM")}
                            </span>
                            <span className="text-xl font-serif text-foreground">
                              {format(new Date(entry.date), "dd")}
                            </span>
                          </div>
                          {entry.moodRating && (
                            <div 
                              className="text-2xl w-10 h-10 flex items-center justify-center bg-background rounded-full border border-border/50 shadow-sm"
                              title={`Mood: ${MOOD_LABELS[Object.keys(MOOD_LABELS)[entry.moodRating - 1] as keyof typeof MOOD_LABELS]}`}
                            >
                              {MOOD_EMOJIS[Object.keys(MOOD_EMOJIS)[entry.moodRating - 1] as keyof typeof MOOD_EMOJIS]}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {entry.promptText && (
                            <p className="text-sm text-primary font-medium mb-1 truncate">
                              {entry.promptText}
                            </p>
                          )}
                          <p className="text-muted-foreground line-clamp-2 md:line-clamp-1 leading-relaxed">
                            {entry.content}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
