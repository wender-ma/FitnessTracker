import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'frente', 'perfil', 'costas', 'pose'
  weight: decimal("weight", { precision: 5, scale: 2 }),
  notes: text("notes"),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileData: text("file_data").notNull(), // Base64 encoded image data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
});

export const updatePhotoSchema = insertPhotoSchema.partial();

export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;
export type UpdatePhoto = z.infer<typeof updatePhotoSchema>;
