// src/server/api/routers/base.ts

import { eq, gt, ilike, isNull, lt, ne, not, SQL, Column } from "drizzle-orm";
import type { filterType } from "types";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { bases, tables, viewFilters } from "~/server/db/schema";


export function buildOperatorCondition(column: Column<any>, operator: string, value: string | null) {
  switch (operator) {
    case '=': return eq(column, value);
    case '!=': return ne(column, value);
    case '>': return gt(column, value);
    case '<': return lt(column, value);
    case 'contains': return ilike(column, `%${value}%`);
    case 'not_contains': return not(ilike(column, `%${value}%`));
    case 'is_empty': return isNull(column);
    case 'is_not_empty': return not(isNull(column));
    default: throw new Error(`Unknown operator: ${operator}`);
  }
}


export const filterRouter = createTRPCRouter({
    createFilter: protectedProcedure
        .input(
            z.object({
                viewId: z.string(),
                columnId: z.string(),
                operator: z.string(),
                value: z.string().optional(),
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
        }
    ),
});
