// src/server/api/routers/base.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { bases, tables, viewFilters, viewSorts } from "~/server/db/schema";

export const filterRouter = createTRPCRouter({
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

      // insert the new filter into the database
      const newSort = await db
        .insert(viewSorts)
        .values({
          viewId,
          columnId,
          direction,
          order: order ?? 0,
        })
        .returning();

      return newSort[0];
    }),
});
