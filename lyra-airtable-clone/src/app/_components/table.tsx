"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useMemo } from "react";
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
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Plus } from "lucide-react";
import { EditableCell } from "./editable-cell";
import type { RowData } from "types.tsx";
import { useVirtualizer } from "@tanstack/react-virtual";

// define the type of the data, TData is a generic type
type DataTableProps = {
  tableId: string;
  viewId: string;
};

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function DataTable({ tableId, viewId }: DataTableProps) {
  const [open, setOpen] = React.useState(false);
  const [columnName, setColumnName] = React.useState("");
  const [type, setType] = React.useState<"text" | "number">("text");
  const utils = api.useUtils();
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetching } =
    api.table.getTableData.useInfiniteQuery(
      {
        viewId,
        limit: 100,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    );

  const columns = data?.pages?.[0]?.columns ?? [];
  const flatData = useMemo(
    () => data?.pages?.flatMap((page) => page.data) ?? [],
    [data],
  );

  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  const rowVirtualizer = useVirtualizer({
    count: flatData.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40, // row height estimate
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.includes("Firefox")
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 10,
  });

  // Fetch more rows on scroll bottom
  const fetchMoreOnBottomReached = React.useCallback(
    async (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          await fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
  );

  useEffect(() => {
    const fetchData = async () => {
      await fetchMoreOnBottomReached(tableContainerRef.current);
    };

    void fetchData();
  }, [fetchMoreOnBottomReached]);

  const tableVersionKey = useMemo(
    () => `${viewId}-${flatData.map((r) => r.id).join("-")}`,
    [viewId, flatData],
  );

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  const createColumn = api.table.createColumn.useMutation({
    onSuccess: async () => {
      await utils.table.getTableData.invalidate({
        viewId: viewId,
        limit: 100,
      });
      await utils.table.getTableData.refetch({ viewId, limit: 100 });
    },
  });

  const createRow = api.table.createRow.useMutation({
    onSuccess: async () => {
      await utils.table.getTableData.invalidate({
        viewId: viewId,
        limit: 100,
      });
      await utils.table.getTableData.refetch({ viewId, limit: 100 });
    },
  });

  // fetch 1k rows
  const insert100kRows = api.table.insert1kRows.useMutation({
    onSuccess: async () => {
      await utils.table.getTableData.invalidate({ viewId, limit: 100 });
      await utils.table.getTableData.refetch({ viewId, limit: 100 });
    },
  });

  return (
    <div
      ref={tableContainerRef}
      className="relative h-full overflow-auto border"
      onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
    >
      {/* by putting in the key it forces a rerender when key changes which the key changes when new data comes in */}
      <table
        key={tableVersionKey}
        className="box-border w-max min-w-fit table-fixed border-separate border-spacing-0 divide-y divide-gray-200"
      >
        <thead className="sticky top-0 z-10 bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            // get the columns
            <tr key={headerGroup.id}>
              <th className="w-10 border-b-1 bg-gray-100"></th>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="w-[150px] border-r-1 border-b-1 border-l-0 bg-gray-100 px-4 py-2 text-left text-sm font-light text-black"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
              {/* Add column for the plus button */}
              <th className="flex w-[60px] items-center justify-center border-r-1 border-b-1 bg-gray-100 text-left text-sm font-semibold text-black">
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
        <tbody
          className="relative block divide-y divide-gray-100 bg-white"
          style={{ height: `${rowVirtualizer.getTotalSize() + 40}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            // display the rows
            // put number
            const row = table.getRowModel().rows[virtualRow.index];
            if (!row) return null; // handle case where row is not found

            return (
              <tr
                data-index={virtualRow.index}
                key={row.id}
                ref={(node) => rowVirtualizer.measureElement(node)}
                className="absolute flex w-full border-b"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <td className="flex h-10 max-w-[40px] min-w-[40px] items-center justify-center border-b-1 text-sm text-gray-900">
                  {row.index + 1}
                </td>
                {row.getVisibleCells().map((cell) => (
                  <EditableCell
                    key={cell.id}
                    cell={cell}
                    tableId={tableId}
                    viewId={viewId}
                  />
                ))}
              </tr>
            );
          })}
          <tr
            className="absolute flex w-[190px] border-r border-b"
            style={{
              transform: `translateY(${rowVirtualizer.getTotalSize()}px)`,
            }}
          >
            <td
              className="flex w-full items-center justify-start"
              colSpan={columns.length}
            >
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    createRow.mutate({
                      tableId: tableId,
                    });
                  }}
                  size="icon"
                  className="w-10 cursor-pointer items-center justify-center rounded-none bg-white text-black shadow-none hover:bg-gray-50"
                >
                  <Plus className="text-gray-500 transition-colors" />
                </Button>
                <Button
                  className="h-2 cursor-pointer border-1 bg-white text-black hover:bg-gray-50"
                  onClick={() => {
                    insert100kRows.mutate({
                      tableId: tableId,
                    });
                  }}
                >
                  Add 1k rows
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
