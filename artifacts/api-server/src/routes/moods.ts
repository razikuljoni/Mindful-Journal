import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, moodLogsTable } from "@workspace/db";
import {
  CreateMoodBody,
  DeleteMoodParams,
  ListMoodsQueryParams,
  GetMoodCalendarQueryParams,
  ListMoodsResponse,
  CreateMoodResponse,
  GetMoodCalendarResponse,
  GetMoodStatsResponse,
} from "@workspace/api-zod";

const MOOD_SCORES: Record<string, number> = {
  awful: 1,
  bad: 2,
  okay: 3,
  good: 4,
  great: 5,
};

const router: IRouter = Router();

router.get("/moods", async (req, res): Promise<void> => {
  const parsed = ListMoodsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { limit = 30, offset = 0 } = parsed.data;

  const moods = await db
    .select()
    .from(moodLogsTable)
    .orderBy(desc(moodLogsTable.date))
    .limit(limit)
    .offset(offset);

  res.json(ListMoodsResponse.parse(moods.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }))));
});

router.post("/moods", async (req, res): Promise<void> => {
  const parsed = CreateMoodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const { mood, note, date = today } = parsed.data;

  const [moodLog] = await db
    .insert(moodLogsTable)
    .values({ mood, note: note ?? null, date })
    .returning();

  res.status(201).json(CreateMoodResponse.parse({
    ...moodLog,
    createdAt: moodLog.createdAt.toISOString(),
  }));
});

router.get("/moods/calendar", async (req, res): Promise<void> => {
  const parsed = GetMoodCalendarQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { month } = parsed.data;
  const [year, mon] = month.split("-").map(Number);
  const start = `${month}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const end = `${month}-${String(lastDay).padStart(2, "0")}`;

  const moods = await db
    .select()
    .from(moodLogsTable)
    .where(
      // date between start and end
      // Using raw SQL for string comparison
      eq(moodLogsTable.date, moodLogsTable.date) // placeholder, replaced below
    )
    .orderBy(desc(moodLogsTable.date));

  // Filter in JS since Drizzle's string BETWEEN is a bit verbose
  const filtered = (await db.select().from(moodLogsTable).orderBy(desc(moodLogsTable.date)))
    .filter(m => m.date >= start && m.date <= end);

  // Keep only the latest mood per day
  const byDate = new Map<string, typeof filtered[0]>();
  for (const m of filtered) {
    if (!byDate.has(m.date)) byDate.set(m.date, m);
  }

  const calendarDays = [...byDate.values()].map(m => ({
    date: m.date,
    mood: m.mood,
    note: m.note,
  }));

  res.json(GetMoodCalendarResponse.parse(calendarDays));
});

router.get("/moods/stats", async (_req, res): Promise<void> => {
  const allMoods = await db
    .select()
    .from(moodLogsTable)
    .orderBy(desc(moodLogsTable.date));

  const totalLogs = allMoods.length;

  // Streak calculation
  const dates = [...new Set(allMoods.map(m => m.date))].sort().reverse();
  let currentStreak = 0;
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let expected = today;

  for (const date of dates) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0];
    } else {
      break;
    }
  }
  currentStreak = streak;

  // Mood breakdown
  const breakdown = { awful: 0, bad: 0, okay: 0, good: 0, great: 0 };
  let totalScore = 0;
  for (const m of allMoods) {
    const mood = m.mood as keyof typeof breakdown;
    if (mood in breakdown) breakdown[mood]++;
    totalScore += MOOD_SCORES[mood] ?? 3;
  }
  const averageMoodScore = totalLogs > 0 ? Math.round((totalScore / totalLogs) * 10) / 10 : 0;

  // Recent 7-day trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  // Keep latest mood per day for recent 7 days
  const recentFiltered = allMoods.filter(m => m.date >= sevenDaysAgoStr);
  const recentByDate = new Map<string, typeof allMoods[0]>();
  for (const m of recentFiltered) {
    if (!recentByDate.has(m.date)) recentByDate.set(m.date, m);
  }
  const recentTrend = [...recentByDate.values()].map(m => ({
    date: m.date,
    mood: m.mood,
    note: m.note,
  })).sort((a, b) => a.date.localeCompare(b.date));

  res.json(GetMoodStatsResponse.parse({
    totalLogs,
    currentStreak,
    averageMoodScore,
    moodBreakdown: breakdown,
    recentTrend,
  }));
});

router.delete("/moods/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteMoodParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(moodLogsTable)
    .where(eq(moodLogsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Mood log not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
