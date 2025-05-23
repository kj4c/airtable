"use client";

import { generateColumns, generateRows } from "../../../server/api/routers/data";
import { useMemo } from "react";
import { DataTable } from "~/app/_components/table";

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

type Props = {
  tableId: string;
  columns: DBColumn[];
  rows: DBRow[];
  cells: DBCell[];
};

export function DataTableClient({ columns, rows, cells, tableId }: Props) {
  const columnDefs = useMemo(() => generateColumns(columns), [columns]); 
  const rowData = generateRows(rows, columns, cells);

  return <DataTable columns={columnDefs} data={rowData} tableId={tableId} />;
}
