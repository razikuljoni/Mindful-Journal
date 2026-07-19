import { Router, type IRouter } from "express";
import { eq, desc, count, and, gte, lte, sql } from "drizzle-orm";
import { db, journalEntriesTable, writingPromptsTable } from "@workspace/db";
import {
  CreateEntryBody,
  UpdateEntryBody,
  UpdateEntryParams,
  GetEntryParams,
  DeleteEntryParams,
  ListEntriesQueryParams,
  GetEntryResponse,
  UpdateEntryResponse,
  GetEntryStatsResponse,
  ListEntriesResponse,
  CreateEntryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Helper to join prompt text onto entries
async function getEntriesWithPrompts(filters: Parameters<typeof db.select>[0] extends undefined ? Record<string, never> : never, limit: number, offset: number, month?: string) {
  let query = db
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
    .orderBy(desc(journalEntriesTable.date));

  if (month) {
    // month is YYYY-MM
    const start = `${month}-01`;
    // Last day of month
    const [year, mon] = month.split("-").map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    const end = `${month}-${String(lastDay).padStart(2, "0")}`;
    // @ts-ignore drizzle typing
    query = query.where(and(gte(journalEntriesTable.date, start), lte(journalEntriesTable.date, end)));
  }

  // @ts-ignore drizzle typing
  return query.limit(limit).offset(offset);
}

router.get("/entries", async (req, res): Promise<void> => {
  const parsed = ListEntriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { limit = 20, offset = 0, month } = parsed.data;

  const entries = await db
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
    .where(
      month
        ? and(
            gte(journalEntriesTable.date, `${month}-01`),
            lte(journalEntriesTable.date, `${month}-${String(new Date(Number(month.split("-")[0]), Number(month.split("-")[1]), 0).getDate()).padStart(2, "0")}`)
          )
        : undefined
    )
    .orderBy(desc(journalEntriesTable.date))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db.select({ total: count() }).from(journalEntriesTable).where(
    month
      ? and(
          gte(journalEntriesTable.date, `${month}-01`),
          lte(journalEntriesTable.date, `${month}-${String(new Date(Number(month.split("-")[0]), Number(month.split("-")[1]), 0).getDate()).padStart(2, "0")}`)
        )
      : undefined
  );

  res.json(ListEntriesResponse.parse({
    entries: entries.map(e => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
    total: totalRow.total,
  }));
});

router.post("/entries", async (req, res): Promise<void> => {
  const parsed = CreateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const { content, date = today, promptId, moodRating } = parsed.data;

  const [entry] = await db
    .insert(journalEntriesTable)
    .values({ content, date, promptId: promptId ?? null, moodRating: moodRating ?? null })
    .returning();

  let promptText: string | null = null;
  if (entry.promptId) {
    const [prompt] = await db.select().from(writingPromptsTable).where(eq(writingPromptsTable.id, entry.promptId));
    promptText = prompt?.text ?? null;
  }

  res.status(201).json(CreateEntryResponse.parse({
    ...entry,
    promptText,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));
});

router.get("/entries/stats", async (_req, res): Promise<void> => {
  const allEntries = await db
    .select({ date: journalEntriesTable.date })
    .from(journalEntriesTable)
    .orderBy(desc(journalEntriesTable.date));

  const totalEntries = allEntries.length;

  // Calculate streaks
  const dates = [...new Set(allEntries.map(e => e.date))].sort().reverse();
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;

  const today = new Date().toISOString().split("T")[0];
  let expected = today;

  for (const date of dates) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0];
      if (streak > longestStreak) longestStreak = streak;
    } else if (date < expected) {
      if (currentStreak === 0) {
        currentStreak = streak;
      }
      streak = 1;
      const d = new Date(date);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split("T")[0];
    }
  }
  if (currentStreak === 0) currentStreak = streak;
  if (streak > longestStreak) longestStreak = streak;

  // This week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // This month
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const thisWeekCount = dates.filter(d => d >= weekStartStr).length;
  const thisMonthCount = dates.filter(d => d >= monthStart).length;

  res.json(GetEntryStatsResponse.parse({
    totalEntries,
    currentStreak,
    longestStreak,
    thisWeekCount,
    thisMonthCount,
  }));
});

router.get("/entries/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetEntryParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [entry] = await db
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
    .where(eq(journalEntriesTable.id, params.data.id));

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  res.json(GetEntryResponse.parse({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));
});

router.patch("/entries/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateEntryParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [entry] = await db
    .update(journalEntriesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(journalEntriesTable.id, params.data.id))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  let promptText: string | null = null;
  if (entry.promptId) {
    const [prompt] = await db.select().from(writingPromptsTable).where(eq(writingPromptsTable.id, entry.promptId));
    promptText = prompt?.text ?? null;
  }

  res.json(UpdateEntryResponse.parse({
    ...entry,
    promptText,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));
});

router.delete("/entries/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteEntryParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(journalEntriesTable)
    .where(eq(journalEntriesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
