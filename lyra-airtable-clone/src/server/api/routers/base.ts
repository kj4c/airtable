// src/server/api/routers/base.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { bases } from "~/server/db/schema";

export const baseRouter = createTRPCRouter({
    // mutation means to create data and not a query
  createBase: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const newBase = await db.insert(bases).values({
        name: input.name,
        userId,
      }).returning();

      return newBase[0];
    }),
});
