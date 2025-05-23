'use client';
import { api } from "~/trpc/react";
import { flexRender } from '@tanstack/react-table';
import React, { useState } from 'react';

type DBCell = {
    id: string;
    value: string | null;
    rowId: string;
    columnId: string;
};


export const EditableCell = ({ cell, tableId }: { cell: any; tableId: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(() => cell.getValue() ?? '');

  const utils = api.useUtils();
  const insertCell = api.table.insertCell.useMutation({
    // Optimistic update
    onMutate: async (newCell) => {
      setIsEditing(false);
      
      // Cancel any outgoing refetches to avoid race conditions
      await utils.table.getTableData.cancel();
      
      // Snapshot previous data
      const previous = utils.table.getTableData.getData({
        tableId,
        offset: 0,
        limit: 100,
      });
      console.log('Previous cache:', previous);

      // Optimistically update cache
      // setData updates cache
      // and the returned data immedidately will update since cache is updated
      utils.table.getTableData.setData(
        { tableId, offset: 0, limit: 100 },
        (oldData: any) => {
          if (!oldData) return oldData;

          const newData = oldData.data.map((row: any) => {
            if (row.id !== newCell.rowId) return row;
            return {
              ...row,
              [newCell.columnId]: newCell.value,
            };
          });


          return { ...oldData, data: newData };
        }
      );
      
      return { previous };
    },

    // Rollback on error
    onError: (_err, _newCell, context) => {
      if (context?.previous) {
        utils.table.getTableData.setData(
          { tableId, offset: 0, limit: 100 },
          context.previous
        );
      }
    },

    // Always refetch after success/fail
    onSettled: () => {
      utils.table.getTableData.invalidate({
        tableId,
        offset: 0,
        limit: 100,
      });
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
      className={`px-1 py-2 h-10 border-box border-1 text-sm text-gray-900 cursor-pointer w-[150px] truncate overflow-x-hidden
        ${isEditing ? 'border-blue-500 border-3 rounded-[6px] text-blue-500' : ''
      }`}
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          className={`w-full h-full border-0 outline-none ring-0 focus:ring-0
            ${isEditing ? "text-blue-500" : 'text-gray-900'}
            `}
          value={value ?? ''}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />
      ) : (
        <div className="max-w-full w-[150px]">
          {/* {value} */}
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      )}
    </td>
  );
}
