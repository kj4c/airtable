import { sql } from "drizzle-orm";
import { index, pgTable, primaryKey, unique } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const users = pgTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({ mode: "date", withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const accounts = pgTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const sessions = pgTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const verificationTokens = pgTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// ------------------ AIRTABLE CLONE TABLES ------------------

export const bases = pgTable("base", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.varchar({ length: 255 }).notNull(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .references(() => users.id),
}));

export const tables = pgTable("table", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.varchar({ length: 255 }).notNull(),
  baseId: d
    .uuid()
    .notNull()
    .references(() => bases.id),
}), (t) => [
  index("table_base_id_idx").on(t.baseId),
]);

export const views = pgTable("view", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.varchar({ length: 255 }).notNull(),
  tableId: d
    .uuid()
    .notNull()
    .references(() => tables.id),
  createdAt: d.timestamp().defaultNow().notNull(),
}), (t) => [
  index("view_table_id_idx").on(t.tableId),
]);

export const viewFilters = pgTable("view_filter", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  viewId: d
    .uuid()
    .notNull()
    .references(() => views.id),
  columnId: d
    .uuid()
    .notNull()
    .references(() => columns.id),
  operator: d.varchar({ length: 50 }).notNull(),
  value: d.text(),
  filter_order: d.integer().notNull().default(0),
}), (t) => [
  index("filter_view_id_idx").on(t.viewId),
]);

export const viewSorts = pgTable("view_sort", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  viewId: d
    .uuid()
    .notNull()
    .references(() => views.id),
  columnId: d
    .uuid()
    .notNull()
    .references(() => columns.id),
  direction: d.varchar({ length: 4 }).notNull(),
  sort_order: d.integer().notNull().default(0),
}), (t) => [
  index("sort_view_id_idx").on(t.viewId),
]);

export const viewHiddenColumns = pgTable("view_hidden_column", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  viewId: d
    .uuid()
    .notNull()
    .references(() => views.id),
  columnId: d
    .uuid()
    .notNull()
    .references(() => columns.id),
}), (t) => [
  index("hiddencol_view_id_idx").on(t.viewId),
]);

export const columns = pgTable("column", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.varchar({ length: 255 }).notNull(),
  type: d.varchar({ length: 20 }).notNull(), // "text" | "number"
  tableId: d
    .uuid()
    .notNull()
    .references(() => tables.id),
  order: d.integer().notNull().default(0),
}), (t) => [
  index("column_table_id_idx").on(t.tableId), 
]);

export const rows = pgTable("row", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  tableId: d
    .uuid()
    .notNull()
    .references(() => tables.id),
  order: d.integer().notNull().default(0),
}), (t) => [
  index("row_table_id_idx").on(t.tableId),
]);

export const cells = pgTable(
  "cell",
  (d) => {
    return {
      id: d.uuid("id").primaryKey().defaultRandom(),
      value: d.text("value"),
      rowId: d
        .uuid("rowId")
        .notNull()
        .references(() => rows.id),
      columnId: d
        .uuid("columnId")
        .notNull()
        .references(() => columns.id),
    };
  },
  (t) => [
    unique().on(t.rowId, t.columnId),
    index("cell_row_idx").on(t.rowId),
    index("cell_column_idx").on(t.columnId),
  ],
);
