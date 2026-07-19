import { useGetDashboard, useCreateMood, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Flame, PenLine, Sparkles, BookHeart } from "lucide-react";
import { MOOD_EMOJIS, MOOD_LABELS, getMoodEmoji, getMoodColor } from "@/lib/mood-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();
  const createMood = useCreateMood();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}.
        </h1>
        <p className="text-muted-foreground text-lg">
          It's {format(new Date(), "EEEE, MMMM do")}. Take a deep breath.
        </p>
      </header>

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

        {/* Stats & Streak */}
        <div className="space-y-6 flex flex-col">
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

        {/* Recent Entries */}
        <Card className="lg:col-span-2 bg-card">
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
      </div>

    </motion.div>
  );
}
