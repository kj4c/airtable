// src/server/api/routers/base.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { cells, columns, rows } from "~/server/db/schema";
import { generateColumns, generateRows } from "./data";

export const tableRouter = createTRPCRouter({
    // mutation means to create data and not a query
    createColumn: protectedProcedure
    .input(
        z.object({
            name: z.string().min(1),
            type: z.enum(["text", "number"]),
            tableId: z.string(),
        })
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

        const newColumn = await db.insert(columns).values({
            name,
            type,
            tableId,
            order: nextOrder,
        }).returning();

        return newColumn[0];
    }),

    createRow: protectedProcedure
    .input(
        z.object({
            tableId: z.string(),
        })
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

        const newRow = await db.insert(rows).values({
            tableId: tableId,
            order: nextOrder
        }).returning();


        return newRow[0];
    }),

    insertCell: protectedProcedure
    .input(
        z.object({
            rowId: z.string(),
            columnId: z.string(),
            value: z.string(),
        })
    )
    .mutation(async ({ input }) => {
        const { rowId, columnId, value } = input;
        // values should match the schema of the table
        const newCell = await db.insert(cells).values({
            rowId,
            columnId,
            value,
        }).onConflictDoUpdate({
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
        })
    )
    .query(async ({ input }) => {
        const { tableId } = input;
        
        // convert to tanstack within here.
        const columnsData = await db.query.columns.findMany({
            where: (columns, { eq }) => eq(columns.tableId, tableId),
        });
        return columnsData;
    }),

    getTableData: protectedProcedure
    .input(
        z.object({
            tableId: z.string(),
            offset: z.number(),
            limit: z.number(),  
        })
    )
    .query(async ({ input, ctx }) => {
        const { tableId, offset, limit } = input;

        const rowsForTable = await db.query.rows.findMany({
            where: (rows, { eq }) => eq(rows.tableId, tableId),
            orderBy: (rows, { asc }) => asc(rows.order),
            limit: limit,
            offset: offset,
        });

        const columnsForTable = await db.query.columns.findMany({
            where: (c, { eq }) => eq(c.tableId, tableId),
        });

        const rowIds = rowsForTable.map((r) => r.id);
        const cellsForTable = rowIds.length
            ? await db.query.cells.findMany({
                // rowsId is a table of row ids find any cell within this row
                where: (c, { inArray }) => inArray(c.rowId, rowIds),
            })
            : [];

        const columnDefs = generateColumns(columnsForTable);
        const rowData = generateRows(rowsForTable, columnsForTable, cellsForTable);

        return {
            columns: columnDefs,
            data: rowData,
        };
    }),

    getCells: protectedProcedure
    .input(
        z.object({
            rowId: z.string(),
            columnId: z.string(),
        })
    )
    .query(async ({ input, ctx }) => {
        const { rowId, columnId } = input;
        // values should match the schema of the table
        const cell = await db.query.cells.findFirst({
            where: (cells, { eq }) => eq(cells.rowId, rowId) && eq(cells.columnId, columnId),
        });

        return cell;
    }),
});
