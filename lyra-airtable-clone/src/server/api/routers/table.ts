// src/server/api/routers/base.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  cells,
  columns,
  rows,
  viewFilters,
  viewHiddenColumns,
  views,
  viewSorts,
} from "~/server/db/schema";
import { generateColumns, generateRows } from "./data";
import { faker } from "@faker-js/faker";
import { and, desc, eq, gt, or } from "drizzle-orm";
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

  createView: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        tableId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, tableId } = input;

      // create a new view in the database
      const newView = await db
        .insert(views)
        .values({
          name,
          tableId,
        })
        .returning();

      return newView[0];
    }),

  // get all views
  getViews: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { tableId } = input;

      const viewData = await db.query.views.findMany({
        where: (views, { eq }) => eq(views.tableId, tableId),
        orderBy: (views, { asc }) => asc(views.createdAt),
      });

      return viewData;
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

      const [filters, sorts, hiddenColumns, columnsForTable] =
        await Promise.all([
          db.query.viewFilters.findMany({
            where: eq(viewFilters.viewId, viewId),
          }),
          db.query.viewSorts.findMany({ where: eq(viewSorts.viewId, viewId) }),
          db.query.viewHiddenColumns.findMany({
            where: eq(viewHiddenColumns.viewId, viewId),
          }),
          db.query.columns.findMany({ where: eq(columns.tableId, tableId) }),
        ]);

      const visibleColumns = columnsForTable.filter(
        (col) => !hiddenColumns.find((h) => h.columnId === col.id),
      );
      const visibleColumnIds = visibleColumns.map((col) => col.id);

      const filterConditions =
        filters.length > 0
          ? filters.map((f) =>
              and(
                eq(cells.columnId, f.columnId),
                buildOperatorCondition(cells.value, f.operator, f.value),
              ),
            )
          : [];

      // Build base where conditions
      const baseConditions = [
        eq(rows.tableId, tableId),
        ...(cursor ? [gt(rows.order, cursor)] : []),
      ];

      // build sort conditions
      const sortConditions =
        sorts.length > 0
          ? sorts
              // order it based on the order of the sorts
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              .map((s) => {
                const cellValueSql = sql`(
            SELECT ${cells.value} 
            FROM ${cells} 
            WHERE ${cells.rowId} = ${rows.id} 
              AND ${cells.columnId} = ${s.columnId}
            LIMIT 1
          )`;
                return s.direction === "asc"
                  ? asc(cellValueSql)
                  : desc(cellValueSql);
              })
          : [asc(rows.order)];

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
            ...baseConditions,
            ...(filterConditions.length > 0 ? [or(...filterConditions)] : []),
          ),
        )
        .orderBy(...sortConditions)
        .limit(limit);

      const rowIds = filteredRows.map((r) => r.id);
      const cellsForTable = rowIds.length
        ? await db.query.cells.findMany({
            // rowsId is a table of row ids find any cell within this row
            where: (c, { inArray, and }) =>
              and(
                inArray(c.rowId, rowIds),
                inArray(c.columnId, visibleColumnIds),
              ),
          })
        : [];

      const result = await db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(rows)
        .where(eq(rows.tableId, tableId));

      const columnDefs = generateColumns(visibleColumns);
      const rowData = generateRows(filteredRows, visibleColumns, cellsForTable);
      const lastRow = filteredRows[filteredRows.length - 1];
      const totalRowCount = result[0]?.count ?? 0;

      return {
        data: rowData,
        columns: columnDefs,
        nextCursor: lastRow?.order ?? null,
        meta: {
          totalRowCount,
        },
      };
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
