// src/server/api/routers/base.ts

import { and, eq, gt, ilike, lt, ne, not, type SQL } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { columns, viewFilters, viewHiddenColumns } from "~/server/db/schema";

export function buildOperatorCondition(
  column: SQL,
  operator: string,
  value: string | null,
) {
  switch (operator) {
    case "=":
      return eq(column, value);
    case "!=":
      return ne(column, value);
    case ">":
      return gt(column, value);
    case "<":
      return lt(column, value);
    case "contains":
      return ilike(column, `%${value}%`);
    case "does not contain":
      return not(ilike(column, `%${value}%`));
    case "is":
      return eq(column, value);
    case "is empty":
      return eq(column, "");
    case "is not empty":
      return ne(column, "");
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

export const filterRouter = createTRPCRouter({
  createFilter: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
        columnId: z.string(),
        operator: z.string(),
        value: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { viewId, columnId, operator, value } = input;

      // insert the new filter into the database
      const newFilter = await db
        .insert(viewFilters)
        .values({
          viewId,
          columnId,
          operator,
          value: value ?? null,
        })
        .returning();

      return newFilter[0];
    }),

  getFilters: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { viewId } = input;

      const filters = await db
        .select({
          id: viewFilters.id,
          viewId: viewFilters.viewId,
          columnId: viewFilters.columnId,
          operator: viewFilters.operator,
          value: viewFilters.value,
          columnName: columns.name,
          columnType: columns.type,
        })
        .from(viewFilters)
        .innerJoin(columns, eq(viewFilters.columnId, columns.id))
        .where(eq(viewFilters.viewId, viewId));

      return filters;
    }),

  updateFilter: protectedProcedure
    .input(
      z.object({
        filterId: z.string(),
        columnId: z.string().optional(),
        operator: z.string().optional(),
        value: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { filterId, ...updates } = input;
      if (
        updates.operator === "is empty" ||
        updates.operator === "is not empty"
      ) {
        updates.value = null;
      }

      if (Object.keys(updates).length === 0) {
        console.log("No updates provided for filter, skipping update.");
        return;
      }

      await db
        .update(viewFilters)
        .set(updates)
        .where(eq(viewFilters.id, filterId));
    }),

  deleteFilter: protectedProcedure
    .input(
      z.object({
        filterId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { filterId } = input;

      await db.delete(viewFilters).where(eq(viewFilters.id, filterId));
    }),

  hideColumn: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
        columnId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { viewId, columnId } = input;

      await db.insert(viewHiddenColumns).values({
        viewId,
        columnId,
      });
    }),

  unhideColumn: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
        columnId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { viewId, columnId } = input;

      await db
        .delete(viewHiddenColumns)
        .where(
          and(
            eq(viewHiddenColumns.viewId, viewId),
            eq(viewHiddenColumns.columnId, columnId),
          ),
        );
    }),
});
