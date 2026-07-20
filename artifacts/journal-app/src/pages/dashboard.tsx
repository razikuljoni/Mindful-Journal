import { useGetDashboard, useCreateMood, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Flame, PenLine, Sparkles, BookHeart, Quote, Wind, ChevronRight } from "lucide-react";
import { MOOD_EMOJIS, MOOD_LABELS, getMoodEmoji, getMoodColor } from "@/lib/mood-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getTodayQuote } from "@/lib/quotes";
import { getTodayActivity, CATEGORY_COLORS } from "@/lib/activities";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Weekly check-in ──────────────────────────────────────────────────────────
function WeeklyCheckin() {
  const STORAGE_KEY = "luminary_checkin_week";
  const [visible, setVisible] = useState(false);
  const [answered, setAnswered] = useState<"better" | "same" | "harder" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const last = localStorage.getItem(STORAGE_KEY);
    if (last !== String(weekNum)) {
      // Show check-in after a 3-second delay
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }

    return undefined;
  }, []);

  const handleAnswer = (answer: "better" | "same" | "harder") => {
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    localStorage.setItem(STORAGE_KEY, String(weekNum));
    setAnswered(answer);
    setTimeout(() => setVisible(false), 1800);
    const messages = {
      better: "That's wonderful! Keep showing up for yourself. 🌱",
      same: "Progress isn't always linear — you're still here, and that matters. 💛",
      harder: "Thank you for your honesty. Be gentle with yourself today. 🤍",
    };
    toast({ title: "Thank you for checking in", description: messages[answer] });
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      className="relative"
    >
      <Card className="border-primary/30 bg-primary/5 shadow-sm overflow-hidden">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          ×
        </button>
        <CardContent className="pt-5 pb-5">
          {answered ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-2"
            >
              <p className="text-2xl mb-1">🙏</p>
              <p className="text-sm text-muted-foreground">Saved — see you next week.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Weekly Check-in</p>
                <p className="font-serif text-lg text-foreground">How are you feeling compared to last week?</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: "better", label: "🌱 Better", color: "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400" },
                  { key: "same", label: "〰️ About the same", color: "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400" },
                  { key: "harder", label: "🌊 Harder right now", color: "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400" },
                ] as const).map(({ key, label, color }) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className={cn("rounded-xl border font-medium text-sm", color)}
                    onClick={() => handleAnswer(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const createMood = useCreateMood();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const quote = getTodayQuote();
  const activity = getTodayActivity();

  const handleMoodSelect = (moodName: string) => {
    createMood.mutate(
      { data: { mood: moodName as any } },
      {
        onSuccess: (newMood) => {
          queryClient.setQueryData(getGetDashboardQueryKey(), (old: any) => {
            if (!old) return old;
            return { ...old, todayMood: newMood };
          });
          toast({
            title: "Mood logged",
            description: `You're feeling ${moodName} today.`,
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-muted rounded-2xl md:col-span-2" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Weekly check-in (appears after 3s delay, once per week) */}
      <WeeklyCheckin />

      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}.
        </h1>
        <p className="text-muted-foreground text-lg">
          It's {format(new Date(), "EEEE, MMMM do")}. Take a deep breath.
        </p>
      </header>

      {/* Top row: prompt + streak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Prompt */}
        <Card className="lg:col-span-2 border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-primary">
            <Sparkles className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardDescription className="flex items-center gap-2 text-primary font-medium">
              <PenLine className="w-4 h-4" /> Today's Prompt
            </CardDescription>
            <CardTitle className="text-2xl pt-2 leading-relaxed text-foreground">
              {dashboard.todayPrompt?.text || "What's on your mind today?"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="rounded-xl px-8 mt-2">
              <Link href="/write">Start writing</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Streak */}
        <div className="space-y-4 flex flex-col">
          <Card className="flex-1 bg-card">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
              <div className="p-4 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-full mb-4">
                <Flame className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl mb-1">{dashboard.entryStats.currentStreak} Days</h3>
              <p className="text-muted-foreground text-sm">Current journaling streak</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quote of the day */}
      <Card className="bg-card border-border/50 relative overflow-hidden">
        <div className="absolute top-3 left-4 text-muted-foreground/20">
          <Quote className="w-12 h-12" />
        </div>
        <CardContent className="py-6 pl-10">
          <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed italic">
            "{quote.text}"
          </p>
          <p className="text-muted-foreground text-sm mt-3 font-medium">— {quote.author}</p>
        </CardContent>
      </Card>

      {/* Middle row: mood + today's activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* How are you feeling */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-xl">How are you feeling?</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.todayMood ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-sm ${getMoodColor(dashboard.todayMood.mood)}`}>
                  {getMoodEmoji(dashboard.todayMood.mood)}
                </div>
                <p className="text-muted-foreground font-medium capitalize">
                  You felt {dashboard.todayMood.mood} today
                </p>
              </div>
            ) : (
              <div className="flex justify-between items-center py-2">
                {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    disabled={createMood.isPending}
                    className="flex flex-col items-center gap-2 p-2 hover:bg-accent rounded-xl transition-colors group disabled:opacity-50"
                    title={MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                      {emoji}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize font-medium">
                      {mood}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's mindful activity */}
        <Card className="lg:col-span-2 bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Today's Activity
                </CardDescription>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span>{activity.emoji}</span>
                  {activity.title}
                </CardTitle>
              </div>
              <Badge className={cn("text-xs", CATEGORY_COLORS[activity.category])}>
                {activity.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm leading-relaxed">{activity.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">⏱ {activity.duration}</span>
              <div className="flex gap-2">
                {activity.id === "box-breathing" || activity.id === "478-breath" ? (
                  <Button size="sm" asChild className="rounded-xl">
                    <Link href="/breathe">
                      <Wind className="w-3.5 h-3.5 mr-1.5" /> Guided session
                    </Link>
                  </Button>
                ) : (
                  <Button size="sm" asChild variant="outline" className="rounded-xl">
                    <Link href="/mindful">
                      View guide <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent entries */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Recent Reflections</CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/entries">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {dashboard.recentEntries.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recentEntries.map((entry) => (
                <Link key={entry.id} href={`/entries/${entry.id}`}>
                  <div className="p-4 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border group">
                    <div className="flex items-center gap-3 mb-2">
                      {entry.moodRating && (
                        <span className="text-lg" title={`Mood: ${entry.moodRating}/5`}>
                          {getMoodEmoji(Object.keys(MOOD_EMOJIS)[entry.moodRating - 1])}
                        </span>
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {format(new Date(entry.date), "MMMM do")}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto group-hover:text-foreground transition-colors">
                        {format(new Date(entry.date), "EEEE")}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 flex flex-col items-center text-muted-foreground">
              <BookHeart className="w-10 h-10 mb-3 opacity-20" />
              <p>Your story starts here.</p>
              <Button variant="link" asChild className="mt-2 text-primary">
                <Link href="/write">Write your first entry</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

    </motion.div>
  );
}
