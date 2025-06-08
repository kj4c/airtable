// src/server/api/routers/base.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { columns, viewSorts } from "~/server/db/schema";
import { eq, asc } from "drizzle-orm";

export const sortRouter = createTRPCRouter({
  createSort: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
        columnId: z.string(),
        direction: z.enum(["asc", "desc"]),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { viewId, columnId, direction, order } = input;

      // Insert the new sort into the database
      const newSort = await db
        .insert(viewSorts)
        .values({
          viewId,
          columnId,
          direction,
          sort_order: order ?? 0,
        })
        .returning();

      return newSort[0];
    }),

  getSorts: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { viewId } = input;

      const sorts = await db
        .select({
          id: viewSorts.id,
          viewId: viewSorts.viewId,
          columnId: viewSorts.columnId,
          direction: viewSorts.direction,
          sort_order: viewSorts.sort_order,
          columnName: columns.name,
        })
        .from(viewSorts)
        .innerJoin(columns, eq(viewSorts.columnId, columns.id))
        .where(eq(viewSorts.viewId, viewId))
        .orderBy(asc(viewSorts.sort_order));

      return sorts;
    }),

  updateSort: protectedProcedure
    .input(
      z.object({
        sortId: z.string(),
        columnId: z.string().optional(),
        direction: z.enum(["asc", "desc"]).optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { sortId, ...updates } = input;

      await db.update(viewSorts).set(updates).where(eq(viewSorts.id, sortId));
      return { success: true };
    }),
});
