"use client";
import { api } from "~/trpc/react";
import { flexRender, type Cell, type ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";
import type { RowData } from "types.tsx";

type GetTableDataResult = {
  columns: ColumnDef<RowData>[]; // optional
  data: RowData[];
};

type EditableCellProps<TData> = {
  cell: Cell<TData, unknown>;
  tableId: string;
  viewId: string;
};

export function EditableCell({ cell, tableId, viewId }: EditableCellProps<RowData>) {
  const [isEditing, setIsEditing] = useState(false);
  const initialValue = cell.getValue();
  const [value, setValue] = useState<string>(
    typeof initialValue === "string"
      ? initialValue
      : (initialValue?.toString() ?? ""),
  );
  const utils = api.useUtils();
  const insertCell = api.table.insertCell.useMutation({
    // Optimistic update
    onMutate: async (newCell) => {
      setIsEditing(false);

      // Cancel any outgoing refetches to avoid race conditions
      await utils.table.getTableData.cancel();

      // Snapshot previous data
      const previous = utils.table.getTableData.getData({
        viewId,
        limit: 100,
      });

      console.log("Previous cache:", previous);

      // Optimistically update cache
      // setData updates cache
      // and the returned data immedidately will update since cache is updated
      utils.table.getTableData.setInfiniteData(
        { viewId, limit: 100 },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              return {
                ...page,
                data: page.data.map((row) => {
                  if (row.id !== newCell.rowId) return row;
                  return {
                    ...row,
                    [newCell.columnId]: newCell.value,
                  };
                }),
              };
            }),
          };
        }
      );


      return { previous };
    },

    // Rollback on error
    onError: (_err, _newCell, context) => {
      if (context?.previous) {
        utils.table.getTableData.setData(
          { viewId, limit: 100 },
          context.previous,
        );
      }
    },

    // Always refetch after success/fail
    onSettled: async () => {
      await utils.table.getTableData.invalidate({
        viewId,
        limit: 100,
      });
      await utils.table.getTableData.refetch({ viewId, limit: 100 });
    },
  });

  const handleSave = () => {
    setIsEditing(false);
    insertCell.mutate({
      rowId: cell.row.original.id,
      columnId: cell.column.id,
      value,
    });
  };

  return (
    <td
      className={`border-box h-10 w-[150px] overflow-hidden cursor-pointer border-r border-b px-1 py-2 text-sm text-gray-900 ${
        isEditing ? "rounded-[6px] border-3 border-blue-500 text-blue-500" : ""
      }`}
      style={{ minWidth: "150px", maxWidth: "150px" }}
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          className={`h-full w-full border-0 ring-0 outline-none focus:ring-0 ${isEditing ? "text-blue-500" : "text-gray-900"} `}
          value={value ?? ""}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setIsEditing(false);
              setValue(initialValue?.toString() ?? "");
            }
          }}
        />
      ) : (
        <div className="w-full truncate whitespace-nowrap overflow-hidden text-ellipsis">
          {/* {value} */}
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      )}
    </td>
  );
}
