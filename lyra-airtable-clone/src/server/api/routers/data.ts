// helper function to convert columns to TanStack Columns
import { type ColumnDef } from "@tanstack/react-table";
import type { ColumnMeta, RowData } from "types.tsx";

type DBColumn = {
  order: number;
  id: string;
  name: string;
  type: string;
  tableId: string;
};

type DBRow = {
  id: string;
};

type DBCell = {
  id: string;
  value: string | null;
  rowId: string;
  columnId: string;
};

type ColumnWithMeta = ColumnDef<RowData> & {
  meta: ColumnMeta;
};

export function generateColumns(columns: DBColumn[]): ColumnWithMeta[] {
  return columns
    .filter((col) => col.name !== "order") // filter out the order column
    .map((col) => ({
      // how to access the column data
      accessorKey: col.id,

      // what is displayed in the header
      header: col.name,
      meta: {
        type: col.type === "number" ? "number" : "string",
      },

      // type of the cell
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (col.type === "number") {
          const num = Number(value);
          return isNaN(num) ? "" : num;
        }
        return value ?? "";
      },
    }));
}

// need to cache, pass the useQuery data to the table
export function generateRows(rows: DBRow[], cells: DBCell[]): RowData[] {
  const cellMap = new Map<string, DBCell[]>();

  for (const cell of cells) {
    if (!cellMap.has(cell.rowId)) {
      cellMap.set(cell.rowId, []);
    }
    cellMap.get(cell.rowId)!.push(cell);
  }

  return rows.map((row) => {
    const rowData: RowData = {
      id: row.id,
    };

    const cellData = cellMap.get(row.id) ?? [];

    for (const cell of cellData) {
      rowData[cell.columnId] = cell.value ?? "";
    }

    return rowData;
  });
}
