"use client";
import { api } from "~/trpc/react";
import { flexRender, type Cell } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import type { ColumnMeta, RowData } from "types.tsx";

type EditableCellProps<TData> = {
  cell: Cell<TData, unknown>;
  tableId: string;
  viewId: string;
};



export function EditableCell({
  cell,
  viewId,
}: EditableCellProps<RowData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const utils = api.useUtils();
  const insertCell = api.table.insertCell.useMutation({
    // Optimistic update
    onMutate: async (newCell) => {
      setIsEditing(false);

      await utils.table.getTableData.cancel();

      const previous = utils.table.getTableData.getInfiniteData({
        viewId,
        limit: 100,
      });


      utils.table.getTableData.setInfiniteData(
        { viewId, limit: 100 },
        (oldData) => {
          if (!oldData) return oldData;

          const updatedPages = oldData.pages.map((page) => {
            const updatedData = page.data.map((row) => {
              // Only update if we haven't updated this row yet and it matches
              if (row.id === newCell.rowId) {
                return { ...row, [newCell.columnId]: newCell.value };
              }
              return row;
            });

            return {
              ...page,
              data: updatedData,
            };
          });

          return {
            ...oldData,
            pages: updatedPages,
          };
        }
      );

      return { previous };
    },

    // Rollback on error
    onError: (_err, _newCell, context) => {
      if (context?.previous) {
        utils.table.getTableData.setInfiniteData(
          { viewId, limit: 100 },
          context.previous,
        );
      }
    },

    // Refetch only on success to ensure data consistency
    onSuccess: async () => {
      await utils.table.getTableData.invalidate();
    },
  });

  const currentValue = cell.getValue();
  const stringValue =
    typeof currentValue === "string"
      ? currentValue
      : currentValue?.toString() ?? "";
    
  const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
  const columnType = meta?.type ?? "string";

  useEffect(() => {
    if (isEditing) setEditValue(stringValue);
  }, [isEditing, stringValue]);

  const handleSave = () => {
    // Only save if value has actually changed
    if (editValue !== stringValue) {
      insertCell.mutate({
        rowId: cell.row.original.id,
        columnId: cell.column.id,
        value: editValue,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(stringValue);
  };

  return (
    <td
      className={`border-box h-10 w-[150px] cursor-pointer overflow-hidden border-r border-b px-1 py-2 text-sm text-gray-900 ${
        isEditing ? "rounded-[6px] border-3 border-blue-500 text-blue-500" : ""
      }`}
      style={{ minWidth: "150px", maxWidth: "150px" }}
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          className={`h-full w-full border-0 ring-0 outline-none focus:ring-0 ${isEditing ? "text-blue-500" : "text-gray-900"} `}
          value={editValue}
          type={columnType === "number" ? "number" : "text"}
          inputMode={columnType === "number" ? "numeric" : "text"}
          autoFocus
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
      ) : (
        <div className="w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      )}
    </td>
  );
}