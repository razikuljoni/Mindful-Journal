import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, breathingSessionsTable } from "@workspace/db";
import {
  CreateBreathingSessionBody,
  ListBreathingSessionsQueryParams,
  ListBreathingSessionsResponse,
  CreateBreathingSessionResponse,
  GetBreathingStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/breathing-sessions", async (req, res): Promise<void> => {
  const parsed = ListBreathingSessionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { limit = 20 } = parsed.data;
  const sessions = await db
    .select()
    .from(breathingSessionsTable)
    .orderBy(desc(breathingSessionsTable.createdAt))
    .limit(limit);

  res.json(
    ListBreathingSessionsResponse.parse(
      sessions.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))
    )
  );
});

router.post("/breathing-sessions", async (req, res): Promise<void> => {
  const parsed = CreateBreathingSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { technique, setsCompleted, durationSeconds } = parsed.data;

  const [session] = await db
    .insert(breathingSessionsTable)
    .values({ technique: technique as any, setsCompleted, durationSeconds })
    .returning();

  res.status(201).json(
    CreateBreathingSessionResponse.parse({
      ...session,
      createdAt: session.createdAt.toISOString(),
    })
  );
});

router.get("/breathing-sessions/stats", async (_req, res): Promise<void> => {
  const allSessions = await db
    .select()
    .from(breathingSessionsTable)
    .orderBy(desc(breathingSessionsTable.createdAt));

  const totalSessions = allSessions.length;
  const totalMinutes =
    Math.round(
      (allSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60) * 10
    ) / 10;

  // This week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];
  const thisWeekSessions = allSessions.filter(
    (s) => s.createdAt.toISOString().split("T")[0] >= weekAgoStr
  ).length;

  // Streak calculation (by day)
  const sessionDates = [
    ...new Set(
      allSessions.map((s) => s.createdAt.toISOString().split("T")[0])
    ),
  ].sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let expected = today;

  for (const date of [...sessionDates].reverse()) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0];
      if (streak > longestStreak) longestStreak = streak;
    } else {
      break;
    }
  }
  currentStreak = streak;

  // Also compute overall longest streak across all dates
  let tempStreak = 1;
  for (let i = 1; i < sessionDates.length; i++) {
    const prev = new Date(sessionDates[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (prev.toISOString().split("T")[0] === sessionDates[i]) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  // By technique
  const byTechnique = { box: 0, "478": 0, "deep-belly": 0, coherent: 0 };
  for (const s of allSessions) {
    const t = s.technique as keyof typeof byTechnique;
    if (t in byTechnique) byTechnique[t]++;
  }

  res.json(
    GetBreathingStatsResponse.parse({
      totalSessions,
      totalMinutes,
      thisWeekSessions,
      longestStreak,
      currentStreak,
      byTechnique,
    })
  );
});

export default router;
