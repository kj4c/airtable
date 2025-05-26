// helper function to convert columns to TanStack Columns
import { type ColumnDef } from "@tanstack/react-table";
import type { RowData } from "types.tsx";

type DBColumn = {
  order: number;
  id: string;
  name: string;
  type: string;
  tableId: string;
};

type DBRow = {
  id: string;
  order: number;
  tableId: string;
};

type DBCell = {
  id: string;
  value: string | null;
  rowId: string;
  columnId: string;
};

export function generateColumns(columns: DBColumn[]): ColumnDef<RowData>[] {
  return columns
    .filter((col) => col.name !== "order") // filter out the order column
    .map((col) => ({
      // how to access the column data
      accessorKey: col.id,

      // what is displayed in the header
      header: col.name,

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
export function generateRows(
  rows: DBRow[],
  cols: DBColumn[],
  cells: DBCell[],
): RowData[] {
  return rows.map((row) => {
    const cellData = cells.filter((cell) => cell.rowId === row.id);

    // get the row id and then get the value for each column.
    const rowData: RowData = {
      id: row.id,
    };

    cellData.forEach((cell) => {
      const foundCol = cols.find((col) => col.id === cell.columnId);
      if (foundCol) {
        rowData[foundCol.id] = cell.value ?? "";
      }
    });

    return rowData;
  });
}
