import { pgTable, text, boolean, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  isPro: boolean("is_pro").default(false).notNull(),
  isProPlus: boolean("is_pro_plus").default(false).notNull(),
  proStartedAt: timestamp("pro_started_at"),
  proEndedAt: timestamp("pro_ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // Поля для защиты (Rate Limiting)
  failedAttempts: integer("failed_attempts").default(0),
  lockedUntil: timestamp("locked_until"),

  // Счетчик сбросов устройств
  deviceResetsCount: integer("device_resets_count").default(0).notNull(),
});

// 2. ТАБЛИЦА УСТРОЙСТВ
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  deviceId: text("device_id").unique().notNull(), // Уникальный ID устройства
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. ТАБЛИЦА КОДОВ АКТИВАЦИИ
export const activationCodes = pgTable("activation_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  email: text("email").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  usedByDeviceId: text("used_by_device_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  activatedAt: timestamp("activated_at"),
});

// 4. ТАБЛИЦА ЗАМЕТОК (ДЛЯ СИНХРОНИЗАЦИИ PRO ПОЛЬЗОВАТЕЛЕЙ)
export const notes = pgTable("notes", {
  id: text("id").primaryKey(), // Используем UUID с клиента
  userId: integer("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  summary: text("summary"),
  tags: text("tags"), // JSON array string
  reminderDate: timestamp("reminder_date"),
  isSecret: boolean("is_secret").default(false).notNull(),
  color: text("color").default('#2D2D3A').notNull(),
  categoryId: text("category_id").default('none').notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(), // Для soft-delete при синхронизации
});

// СВЯЗИ
export const usersRelations = relations(users, ({ many }) => ({
  devices: many(devices),
  notes: many(notes),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));
