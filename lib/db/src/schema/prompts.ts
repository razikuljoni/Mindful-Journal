import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const writingPromptsTable = pgTable("writing_prompts", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: text("category").notNull().default("general"),
});

export const insertWritingPromptSchema = createInsertSchema(writingPromptsTable).omit({ id: true });
export type InsertWritingPrompt = z.infer<typeof insertWritingPromptSchema>;
export type WritingPrompt = typeof writingPromptsTable.$inferSelect;
