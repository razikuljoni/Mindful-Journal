import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const breathingTechniqueEnum = ["box", "478", "deep-belly", "coherent"] as const;

export const breathingSessionsTable = pgTable("breathing_sessions", {
  id: serial("id").primaryKey(),
  technique: text("technique").notNull().$type<typeof breathingTechniqueEnum[number]>(),
  setsCompleted: integer("sets_completed").notNull().default(1),
  durationSeconds: integer("duration_seconds").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBreathingSessionSchema = createInsertSchema(breathingSessionsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertBreathingSession = z.infer<typeof insertBreathingSessionSchema>;
export type BreathingSession = typeof breathingSessionsTable.$inferSelect;
