import { useGetMoodStats, useGetEntryStats } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { MOOD_LABELS } from "@/lib/mood-utils";
import { format, parseISO } from "date-fns";
import { Activity, PenTool, Flame, CalendarDays } from "lucide-react";

export default function Insights() {
  const { data: moodStats, isLoading: isLoadingMoods, isError: isErrorMoods } = useGetMoodStats();
  const { data: entryStats, isLoading: isLoadingEntries, isError: isErrorEntries } = useGetEntryStats();

  if (isLoadingMoods || isLoadingEntries) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Gathering your insights...</div>;
  }

  if (isErrorMoods || isErrorEntries) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-2">Insights</h1>
          <p className="text-muted-foreground">Understanding your patterns and growth over time.</p>
        </header>
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-card-border">
          <p className="text-lg font-medium text-foreground mb-2">Couldn't load insights</p>
          <p className="text-muted-foreground text-sm">Something went wrong. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!moodStats || !entryStats) return null;

  // Prepare chart data
  const trendData = [...moodStats.recentTrend].reverse().map(day => ({
    date: format(parseISO(day.date), "MMM d"),
    rawDate: day.date,
    moodValue: { awful: 1, bad: 2, okay: 3, good: 4, great: 5 }[day.mood] || 0,
    moodStr: day.mood,
  }));

  const breakdownData = Object.entries(moodStats.moodBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([mood, count]) => ({
      name: MOOD_LABELS[mood as keyof typeof MOOD_LABELS],
      value: count,
      colorHex: getHexFromTailwind(mood),
    }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-2">Insights</h1>
        <p className="text-muted-foreground">Understanding your patterns and growth over time.</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<PenTool className="w-5 h-5" />} 
          label="Total Entries" 
          value={entryStats.totalEntries} 
          subtext={`${entryStats.thisMonthCount} this month`} 
        />
        <StatCard 
          icon={<Flame className="w-5 h-5 text-orange-500" />} 
          label="Current Streak" 
          value={`${entryStats.currentStreak} days`} 
          subtext={`Longest: ${entryStats.longestStreak}`} 
        />
        <StatCard 
          icon={<Activity className="w-5 h-5 text-blue-500" />} 
          label="Average Mood" 
          value={moodStats.averageMoodScore.toFixed(1)} 
          subtext="/ 5.0 score" 
        />
        <StatCard 
          icon={<CalendarDays className="w-5 h-5 text-green-500" />} 
          label="Mood Logs" 
          value={moodStats.totalLogs} 
          subtext="Total check-ins" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 7-Day Trend Chart */}
        <Card className="bg-card shadow-sm border-card-border">
          <CardHeader>
            <h2 className="text-xl font-serif">Recent Mood Trend</h2>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 5]} 
                      ticks={[1, 2, 3, 4, 5]} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg text-sm">
                              <p className="font-medium mb-1">{data.date}</p>
                              <p className="capitalize text-muted-foreground">Mood: {data.moodStr}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="moodValue" radius={[6, 6, 6, 6]} barSize={30}>
                      {trendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getHexFromTailwind(entry.moodStr)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Not enough data yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breakdown Chart */}
        <Card className="bg-card shadow-sm border-card-border">
          <CardHeader>
            <h2 className="text-xl font-serif">Overall Mood Distribution</h2>
          </CardHeader>
          <CardContent>
            {breakdownData.length > 0 ? (
              <div className="h-[300px] w-full">
                <div className="h-full" role="img" aria-label="Overall mood distribution chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      tabIndex={-1}
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.colorHex}
                          aria-label={`${entry.name}: ${entry.value}`}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="sr-only">
                  {breakdownData.map((entry) => (
                    <li key={entry.name}>{entry.name}: {entry.value}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No logs to break down yet.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: string | number, subtext: string }) {
  return (
    <Card className="bg-card border-card-border shadow-sm">
      <CardContent className="p-4 sm:p-6 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
        <p className="text-2xl font-serif text-foreground mb-1">{value}</p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );
}

// Map logical moods to actual hex colors for Recharts
function getHexFromTailwind(mood: string): string {
  const map: Record<string, string> = {
    awful: '#d86b6b',
    bad: '#e59a72',
    okay: '#e2c076',
    good: '#8fa88c',
    great: '#5f806d',
  };
  return map[mood] || '#ccc';
}
