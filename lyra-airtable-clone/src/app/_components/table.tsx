"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { Button } from "../../components/ui/button";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Plus } from "lucide-react";
import { EditableCell } from "./editable-cell";
import type { RowData } from "types.tsx";

// define the type of the data, TData is a generic type
type DataTableProps = {
  columns: ColumnDef<RowData, string | number>[];
  data: RowData[];
  tableId: string;
};

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function DataTable({
  columns,
  data,
  tableId,
}: DataTableProps) {
  const [open, setOpen] = React.useState(false);
  const [columnName, setColumnName] = React.useState("");
  const [type, setType] = React.useState<"text" | "number">("text");
  const utils = api.useUtils();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const createColumn = api.table.createColumn.useMutation({
    onSuccess: async () => {
      await utils.table.getTableData.invalidate({
        tableId: tableId,
        offset: 0,
        limit: 100,
      });
    },
  });

  const createRow = api.table.createRow.useMutation({
    onSuccess: async () => {
      await utils.table.getTableData.invalidate({
        tableId: tableId,
        offset: 0,
        limit: 100,
      });
    },
  });

  return (
    <div className="box-border overflow-x-auto border">
      <table className="box-border min-w-max table-fixed border-separate border-spacing-0 divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            // get the columns
            <tr key={headerGroup.id}>
              <th></th>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="w-[150px] truncate border-1 px-4 py-2 text-left text-sm font-semibold text-black"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
              {/* Add column for the plus button */}
              <th className="flex w-[60px] items-center justify-center border-1 text-left text-sm font-semibold text-black">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="group flex cursor-pointer items-center justify-center hover:bg-white/10"
                    >
                      <Plus className="text-gray-500 transition-colors group-hover:text-black" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a new column</DialogTitle>
                      <DialogDescription>
                        Enter the name and the type of the new column below.
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      placeholder="Column name"
                      className="cursor-pointer"
                      onChange={(e) => {
                        setColumnName(e.target.value);
                      }}
                      value={columnName}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger className="group w-full cursor-pointer rounded-md border-1 px-3 py-2 text-left text-sm text-black transition-colors hover:bg-gray-100">
                        {capitalizeFirstLetter(type)}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setType("text")}>
                          Text
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setType("number")}>
                          Number
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      onClick={() => {
                        if (columnName.trim()) {
                          createColumn.mutate({
                            name: columnName,
                            type: type,
                            tableId: tableId,
                          });
                          setColumnName("");
                          setType("text");
                          setOpen(false);
                        }
                      }}
                      className="cursor-pointer text-white"
                    >
                      Create column
                    </Button>
                  </DialogContent>
                </Dialog>
              </th>
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {table.getRowModel().rows.map((row) => (
            // display the rows
            // put number
            <tr key={row.id}>
              <td className="border-box flex h-10 w-10 items-center justify-center border-1 text-sm text-gray-900">
                {row.index + 1}
              </td>
              {row.getVisibleCells().map((cell) => (
                <EditableCell key={cell.id} cell={cell} tableId={tableId} />
              ))}
            </tr>
          ))}
          <tr>
            <td colSpan={columns.length + 1} className="">
              <Button
                onClick={() => {
                  createRow.mutate({
                    tableId: tableId,
                  });
                }}
                size="icon"
                className="group flex w-10 cursor-pointer items-center justify-center rounded-none border-1 bg-white text-black hover:bg-gray-50"
              >
                <Plus className="text-gray-500 transition-colors" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
