import type { ColumnDef } from "@tanstack/react-table";

export type RowData = {
  id: string;
  [key: string]: string | number;
};

export type ColumnMeta = {
  type: "string" | "number";
};

export type filterType = {
  id: string;
  operator: string;
  viewId: string;
  columnId: string;
  value: string | null;
};
