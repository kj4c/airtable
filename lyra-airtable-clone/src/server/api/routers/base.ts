// src/server/api/routers/base.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { bases, tables } from "~/server/db/schema";

// each thing is an endpoint, protectprocedure means auth needed.
//ctx.session.user.id is given by user id
// db is the postgresql, uses drizzle
export const baseRouter = createTRPCRouter({
  // mutation means to create data and not a query
  createBase: protectedProcedure
    .input(
      // z is a typeguard u
      z.object({
        // min one character so non empty
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // values should match the schema of the table
      const newBase = await db
        .insert(bases)
        .values({
          name: input.name,
          userId,
        })
        .returning();

      return newBase[0];
    }),

  getBaseName: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { baseId } = input;
      // get the base name for the given baseId
      const base = await db.query.bases.findFirst({
        where: (bases, { eq }) => eq(bases.id, baseId),
        // only return the id and name columns
        columns: { id: true, name: true },
      });
      // if no base found, return null
      if (!base) {
        return null;
      }
      // return the base name
      return base.name;
    }),
    
  // retrieve all bases for the user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // basically a select statement and find within the table where the user id is the same as the logged in user
    return await db.query.bases.findMany({
      // where fuynction takes in the schema reference (which is bases) and { eq } is a helper function
      // then combine both to create a query
      where: (bases, { eq }) => eq(bases.userId, ctx.session.user.id),
    });
  }),

  getTables: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { baseId } = input;
      // get all tables for this base
      const tablesList = await db.query.tables.findMany({
        where: (tables, { eq }) => eq(tables.baseId, baseId),
        // only return the id and name columns
        columns: { id: true, name: true },
      });
      return tablesList;
    }),

  createTable: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const { baseId, name } = input;

      // create a new table in the database
      const newTable = await db
        .insert(tables)
        .values({
          baseId: baseId,
          name: name,
        })
        .returning();

      return newTable[0];
    }),
});
