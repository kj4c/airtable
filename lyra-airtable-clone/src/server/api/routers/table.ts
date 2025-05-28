// src/server/api/routers/base.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { cells, columns, rows, viewFilters, viewHiddenColumns, viewSorts } from "~/server/db/schema";
import { generateColumns, generateRows } from "./data";
import { faker } from "@faker-js/faker";
import { and, eq, gt, or } from "drizzle-orm";
import { sql, asc } from "drizzle-orm";
import { buildOperatorCondition } from "./filter";

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
        viewId: z.string(),
        limit: z.number(),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { viewId, limit, cursor } = input;

      const view = await db.query.views.findFirst({
        where: (views, { eq }) => eq(views.id, viewId),
      });

      if (!view) {
        throw new Error("View not found");
      }

      const tableId = view.tableId;

      const [filters, sorts, hiddenColumns, columnsForTable] = await Promise.all([
        db.query.viewFilters.findMany({ where: eq(viewFilters.viewId, viewId) }),
        db.query.viewSorts.findMany({ where: eq(viewSorts.viewId, viewId) }),
        db.query.viewHiddenColumns.findMany({ where: eq(viewHiddenColumns.viewId, viewId) }),
        db.query.columns.findMany({ where: eq(columns.tableId, tableId) }),
      ]);

      const visibleColumns = columnsForTable.filter(
        (col) => !hiddenColumns.find((h) => h.columnId === col.id)
      );

      const visibleColumnIds = visibleColumns.map((col) => col.id);

      const filterConditions = filters.map((f) =>
        and(
          eq(cells.columnId, f.columnId),
          buildOperatorCondition(cells.value, f.operator, f.value)
        )
      );

      const filteredRows = await db
      .select({
        id: rows.id,
        order: rows.order,
        tableId: rows.tableId,
      })
      .from(rows)
      .leftJoin(cells, eq(cells.rowId, rows.id))
      .where(
        and(
          eq(rows.tableId, tableId),
          ...(cursor ? [gt(rows.order, cursor)] : []),
          ...(filterConditions.length > 0 ? [or(...filterConditions)] : [])
        )
      )
      .orderBy(asc(rows.order))
      .limit(limit);

      // build the where clause based on the filters
      const whereClauses = [
        eq(rows.tableId, tableId),
        cursor ? gt(rows.order, cursor) : undefined,
      ].filter(Boolean);

      const rowsForTable = await db.query.rows.findMany({
        where: and(...whereClauses),
        orderBy: (rows, { asc }) => asc(rows.order), // rows.order ensures pagination
        limit,
      });

      const rowIds = rowsForTable.map((r) => r.id);

      const cellsForTable = rowIds.length
        ? await db.query.cells.findMany({
            // rowsId is a table of row ids find any cell within this row
            where: (c, { inArray, and }) => 
              and(
                inArray(c.rowId, rowIds),
                inArray(c.columnId, visibleColumnIds),
              )
          })
        : [];

      const columnDefs = generateColumns(visibleColumns);
      const rowData = generateRows(filteredRows, visibleColumns, cellsForTable);
      const lastRow = filteredRows[filteredRows.length - 1];

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

  insert1kRows: protectedProcedure
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
      const totalRows = 1000;
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

      return { success: true, message: "Inserted 1k rows" };
    }),
});
