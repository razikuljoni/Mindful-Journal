import { Router, type IRouter } from "express";
import { db, writingPromptsTable } from "@workspace/db";
import {
  ListPromptsResponse,
  GetTodayPromptResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_TODAY_PROMPT = {
  id: 0,
  text: "What are you grateful for today?",
  category: "general",
};

router.get("/prompts", async (_req, res): Promise<void> => {
  const prompts = await db.select().from(writingPromptsTable).orderBy(writingPromptsTable.id);
  res.json(ListPromptsResponse.parse(prompts));
});

router.get("/prompts/today", async (_req, res): Promise<void> => {
  const prompts = await db.select().from(writingPromptsTable);
  if (prompts.length === 0) {
    res.json(GetTodayPromptResponse.parse(DEFAULT_TODAY_PROMPT));
    return;
  }
  // Deterministically pick a prompt based on the day of year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const prompt = prompts[dayOfYear % prompts.length];
  res.json(GetTodayPromptResponse.parse(prompt));
});

export default router;
