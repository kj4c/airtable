import {
  pgTable,
  uuid,
  text,
  varchar,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
});

// Bases table
export const bases = pgTable("bases", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id),
});

// Tables table
export const tables = pgTable("tables", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  baseId: uuid("base_id").notNull().references(() => bases.id),
});

// Columns table
export const columns = pgTable("columns", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: varchar("type", { length: 10 }).notNull(), // "text" or "number"
  tableId: uuid("table_id").notNull().references(() => tables.id),
});

// Rows table
export const rows = pgTable("rows", {
  id: uuid("id").primaryKey().defaultRandom(),
  tableId: uuid("table_id").notNull().references(() => tables.id),
});

// Cells table
export const cells = pgTable("cells", {
  id: uuid("id").primaryKey().defaultRandom(),
  value: text("value"), // All values stored as text, cast in app
  rowId: uuid("row_id").notNull().references(() => rows.id),
  columnId: uuid("column_id").notNull().references(() => columns.id),
});
