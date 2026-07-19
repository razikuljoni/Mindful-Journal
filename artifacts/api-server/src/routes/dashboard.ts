import { Router, type IRouter } from "express";
import { eq, desc, count } from "drizzle-orm";
import { db, journalEntriesTable, moodLogsTable, writingPromptsTable } from "@workspace/db";
import { GetDashboardResponse } from "@workspace/api-zod";

const MOOD_SCORES: Record<string, number> = {
  awful: 1, bad: 2, okay: 3, good: 4, great: 5,
};

const router: IRouter = Router();

router.get("/dashboard", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  // Today's prompt (same logic as prompts route)
  const prompts = await db.select().from(writingPromptsTable);
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const todayPrompt = prompts.length > 0
    ? prompts[dayOfYear % prompts.length]
    : { id: 0, text: "What are you grateful for today?", category: "general" };

  // Recent entries (last 5 with prompt text)
  const recentEntries = await db
    .select({
      id: journalEntriesTable.id,
      date: journalEntriesTable.date,
      content: journalEntriesTable.content,
      promptId: journalEntriesTable.promptId,
      promptText: writingPromptsTable.text,
      moodRating: journalEntriesTable.moodRating,
      createdAt: journalEntriesTable.createdAt,
      updatedAt: journalEntriesTable.updatedAt,
    })
    .from(journalEntriesTable)
    .leftJoin(writingPromptsTable, eq(journalEntriesTable.promptId, writingPromptsTable.id))
    .orderBy(desc(journalEntriesTable.date))
    .limit(5);

  // Today's mood (latest for today)
  const [todayMoodRaw] = await db
    .select()
    .from(moodLogsTable)
    .where(eq(moodLogsTable.date, today))
    .orderBy(desc(moodLogsTable.createdAt))
    .limit(1);

  const todayMood = todayMoodRaw
    ? { ...todayMoodRaw, createdAt: todayMoodRaw.createdAt.toISOString() }
    : null;

  // Entry stats
  const allEntryDates = (await db.select({ date: journalEntriesTable.date }).from(journalEntriesTable).orderBy(desc(journalEntriesTable.date)));
  const totalEntries = allEntryDates.length;
  const uniqueDates = [...new Set(allEntryDates.map(e => e.date))].sort().reverse();

  let currentStreak = 0, longestStreak = 0, streak = 0;
  let expected = today;
  for (const date of uniqueDates) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0];
      if (streak > longestStreak) longestStreak = streak;
    } else if (date < expected) {
      if (currentStreak === 0) currentStreak = streak;
      streak = 1;
      const d = new Date(date);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0];
    }
  }
  if (currentStreak === 0) currentStreak = streak;
  if (streak > longestStreak) longestStreak = streak;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const thisWeekCount = uniqueDates.filter(d => d >= weekStartStr).length;
  const thisMonthCount = uniqueDates.filter(d => d >= monthStart).length;

  // Mood stats
  const allMoods = await db.select().from(moodLogsTable).orderBy(desc(moodLogsTable.date));
  const totalLogs = allMoods.length;
  const moodDates = [...new Set(allMoods.map(m => m.date))].sort().reverse();
  let moodStreak = 0;
  let moodExpected = today;
  for (const date of moodDates) {
    if (date === moodExpected) {
      moodStreak++;
      const d = new Date(moodExpected);
      d.setDate(d.getDate() - 1);
      moodExpected = d.toISOString().split("T")[0];
    } else break;
  }

  const breakdown = { awful: 0, bad: 0, okay: 0, good: 0, great: 0 };
  let totalScore = 0;
  for (const m of allMoods) {
    const mood = m.mood as keyof typeof breakdown;
    if (mood in breakdown) breakdown[mood]++;
    totalScore += MOOD_SCORES[mood] ?? 3;
  }
  const averageMoodScore = totalLogs > 0 ? Math.round((totalScore / totalLogs) * 10) / 10 : 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];
  const recentFiltered = allMoods.filter(m => m.date >= sevenDaysAgoStr);
  const recentByDate = new Map<string, typeof allMoods[0]>();
  for (const m of recentFiltered) {
    if (!recentByDate.has(m.date)) recentByDate.set(m.date, m);
  }
  const recentTrend = [...recentByDate.values()]
    .map(m => ({ date: m.date, mood: m.mood, note: m.note }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json(GetDashboardResponse.parse({
    todayPrompt,
    recentEntries: recentEntries.map(e => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
    todayMood,
    entryStats: { totalEntries, currentStreak, longestStreak, thisWeekCount, thisMonthCount },
    moodStats: {
      totalLogs,
      currentStreak: moodStreak,
      averageMoodScore,
      moodBreakdown: breakdown,
      recentTrend,
    },
  }));
});

export default router;
