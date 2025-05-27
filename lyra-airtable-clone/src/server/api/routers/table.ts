// src/server/api/routers/base.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { cells, columns, rows } from "~/server/db/schema";
import { generateColumns, generateRows } from "./data";
import { faker } from "@faker-js/faker";
import { eq, or } from "drizzle-orm";
import { sql } from "drizzle-orm";

async function getColumnsForTable(tableId: string) {
  return db.query.columns.findMany({
    where: (columns, { eq }) => eq(columns.tableId, tableId),
  });
}

export const tableRouter = createTRPCRouter({
  // mutation means to create data and not a query
  createColumn: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["text", "number"]),
        tableId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, type, tableId } = input;

      const existing = await db.query.columns.findMany({
        where: (columns, { eq }) => eq(columns.tableId, tableId),
        // only return the order column
        columns: { order: true },
      });

      const nextOrder =
        existing.length === 0
          ? 0
          : Math.max(...existing.map((c) => c.order ?? 0)) + 1;

      const newColumn = await db
        .insert(columns)
        .values({
          name,
          type,
          tableId,
          order: nextOrder,
        })
        .returning();

      return newColumn[0];
    }),

  createRow: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { tableId } = input;
      // values should match the schema of the table
      // get the max order for the table
      const existing = await db.query.rows.findMany({
        where: (r, { eq }) => eq(r.tableId, input.tableId),
        columns: { order: true },
      });

      const nextOrder =
        existing.length === 0
          ? 0
          : Math.max(...existing.map((r) => r.order ?? 0)) + 1;

      const newRow = await db
        .insert(rows)
        .values({
          tableId: tableId,
          order: nextOrder,
        })
        .returning();

      return newRow[0];
    }),

  insertCell: protectedProcedure
    .input(
      z.object({
        rowId: z.string(),
        columnId: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { rowId, columnId, value } = input;
      // values should match the schema of the table
      const newCell = await db
        .insert(cells)
        .values({
          rowId,
          columnId,
          value,
        })
        .onConflictDoUpdate({
          target: [cells.rowId, cells.columnId],
          set: { value },
        })
        .returning();

      return newCell[0];
    }),

  // returns all the columns for a table
  getColumns: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { tableId } = input;

      const columnsData = await getColumnsForTable(tableId);
      return columnsData;
    }),

  getTableData: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        limit: z.number(),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { tableId, limit, cursor } = input;

      const rowsForTable = await db.query.rows.findMany({
        where: (rows, { eq, gt }) =>
          cursor
            ? eq(rows.tableId, tableId) && gt(rows.order, cursor)
            : eq(rows.tableId, tableId),
        orderBy: (rows, { asc }) => asc(rows.order),
        limit,
      });

      const rowIds = rowsForTable.map((r) => r.id);

      const columnsForTable = await db.query.columns.findMany({
        where: (c, { eq }) => eq(c.tableId, tableId),
      });

      const cellsForTable = rowIds.length
        ? await db.query.cells.findMany({
            // rowsId is a table of row ids find any cell within this row
            where: (c, { inArray }) => inArray(c.rowId, rowIds),
          })
        : [];

      const columnDefs = generateColumns(columnsForTable);
      const rowData = generateRows(
        rowsForTable,
        columnsForTable,
        cellsForTable,
      );

      const lastRow = rowsForTable[rowsForTable.length - 1];

      const result = await db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(rows)
        .where(eq(rows.tableId, tableId));

      const totalRowCount = result[0]?.count ?? 0;

      return {
        data: rowData,
        columns: columnDefs,
        nextCursor: lastRow?.order ?? null,
        meta: {
          totalRowCount,
        }
      };
    }),

  getCells: protectedProcedure
    .input(
      z.object({
        rowId: z.string(),
        columnId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { rowId, columnId } = input;
      // values should match the schema of the table
      const cell = await db.query.cells.findFirst({
        where: (cells, { eq }) =>
          eq(cells.rowId, rowId) && eq(cells.columnId, columnId),
      });

      return cell;
    }),

  insert100kRows: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { tableId } = input;

      const columnsForTable = await getColumnsForTable(tableId);
      if (columnsForTable.length === 0) {
        throw new Error("No columns found for the table");
      }

      // get the existing rows to find the order.
      const existingRows = await db.query.rows.findMany({
        where: (r, { eq }) => eq(r.tableId, tableId),
        columns: { order: true },
      });

      let currentOrder =
        existingRows.length === 0
          ? 0
          : Math.max(...existingRows.map((r) => r.order ?? 0)) + 1;

      // need to batch the rows to avoid hitting the max query size
      const totalRows = 100000;
      const batchSize = 500;

      for (
        let batchStart = 0;
        batchStart < totalRows;
        batchStart += batchSize
      ) {
        // generate new rows
        const rowsToInsert = Array.from({ length: batchSize }, (_, i) => ({
          tableId,
          order: currentOrder + i,
        }));

        // insert the rows to get ids
        const insertedRows = await db
          .insert(rows)
          .values(rowsToInsert)
          .returning({ id: rows.id, order: rows.order });

        const cellsToInsert = [];

        for (const row of insertedRows) {
          for (const column of columnsForTable) {
            let value = "";

            if (column.type === "text") {
              value = faker.lorem.words(2);
            } else if (column.type === "number") {
              value = faker.number.int({ min: 0, max: 1000 }).toString();
            }

            cellsToInsert.push({
              rowId: row.id,
              columnId: column.id,
              value,
            });
          }
        }
        if (cellsToInsert.length > 0) {
          await db.insert(cells).values(cellsToInsert);
        }

        currentOrder += batchSize;
      }

      return { success: true, message: "Inserted 100k rows" };
    }),
});
