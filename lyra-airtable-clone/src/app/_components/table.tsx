"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { createPortal } from "react-dom";
import React, { useMemo, useCallback } from "react";
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
  searchQuery: string;
};

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function DataTable({ tableId, viewId, searchQuery }: DataTableProps) {
  const [open, setOpen] = React.useState(false);
  const [columnName, setColumnName] = React.useState("");
  const [type, setType] = React.useState<"text" | "number">("text");
  const utils = api.useUtils();
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { data: sorts = [] } = api.sorts.getSorts.useQuery({ viewId });

  const { data, fetchNextPage, hasNextPage, isFetching } =
    api.table.getTableData.useInfiniteQuery(
      {
        viewId,
        limit: 100,
        searchQuery,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    );

  // get all columns memoised
  const firstPageColumns = data?.pages?.[0]?.columns;

  const columns = useMemo(() => {
    return firstPageColumns ?? [];
  }, [firstPageColumns, viewId]);

  const flatData = useMemo(() => {
    const seenIds = new Set<string>();
    const deduplicatedData: RowData[] = [];

    for (const page of data?.pages ?? []) {
      for (const row of page.data) {
        if (!seenIds.has(row.id)) {
          seenIds.add(row.id);
          deduplicatedData.push(row);
        }
      }
    }

    return deduplicatedData;
  }, [data, viewId]);

  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  const tableResetKey = useMemo(() => {
    const sortKey = sorts.map((s) => `${s.columnId}:${s.direction}`).join("|");
    return `table-${viewId}-${sortKey}`;
  }, [viewId, sorts]);

  const rowVirtualizer = useVirtualizer({
    count: flatData.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    measureElement:
      typeof window !== "undefined" && navigator.userAgent.includes("Firefox")
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 10,
  });

  const fetchMoreOnBottomReached = useCallback(
    async (containerRefElement?: HTMLDivElement | null) => {
      if (!containerRefElement || !hasNextPage || isFetching) return;

      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (
          scrollHeight - scrollTop - clientHeight < (clientHeight * 2) &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          await fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
  );

  React.useEffect(() => {
    const fetchData = async () => {
      await fetchMoreOnBottomReached(tableContainerRef.current);
    };

    void fetchData();
  }, [fetchMoreOnBottomReached]);

  // invalidate the tables
  const createColumn = api.table.createColumn.useMutation({
    onSuccess: async () => {
      await utils.table.getTableData.invalidate({
        viewId: viewId,
        limit: 100,
        searchQuery,
      });
      await utils.table.getColumns.invalidate();
      await utils.table.getAllColumns.invalidate({
        tableId: tableId,
      });
    },
  });

  const createRow = api.table.createRow.useMutation({
    onSuccess: async () => {
      await utils.table.getTableData.invalidate({
        viewId: viewId,
        limit: 100,
        searchQuery,
      });
    },
  });

  const insert1kRows = api.table.insert1kRows.useMutation({
    onSuccess: async () => {
      await utils.table.getTableData.invalidate({
        viewId,
        limit: 100,
        searchQuery,
      });
    },
  });

  const handleCreateColumn = useCallback(async () => {
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
    await utils.table.getColumns.invalidate();
  }, [columnName, type, tableId, createColumn]);

  // Handle row creation
  const handleCreateRow = useCallback(() => {
    createRow.mutate({
      tableId: tableId,
    });
  }, [tableId, createRow]);

  // Handle bulk insert
  const handleInsert1kRows = useCallback(() => {
    insert1kRows.mutate({
      tableId: tableId,
    });
  }, [tableId, insert1kRows]);

  return (
    <div
      ref={tableContainerRef}
      className="relative h-full overflow-auto border"
      onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
    >
      <table
        /* forces table to rerender whenever sort is added or view is changed! */
        key={tableResetKey}
        className="box-border w-max min-w-fit table-fixed border-separate border-spacing-0 divide-y divide-gray-200 pb-32"
      >
        <thead className="sticky top-0 z-10 bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
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
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          await handleCreateColumn();
                        }
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
                      onClick={handleCreateColumn}
                      className="cursor-pointer text-white"
                      disabled={createColumn.isPending}
                    >
                      {createColumn.isPending ? "Creating..." : "Create column"}
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
            const row = table.getRowModel().rows[virtualRow.index];
            if (!row) return null;

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
                    searchQuery={searchQuery}
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
                  onClick={handleCreateRow}
                  size="icon"
                  className="w-10 cursor-pointer items-center justify-center rounded-none bg-white text-black shadow-none hover:bg-gray-50"
                  disabled={createRow.isPending}
                >
                  <Plus className="text-gray-500 transition-colors" />
                </Button>
                <Button
                  className="h-2 cursor-pointer border-1 bg-white text-black hover:bg-gray-50"
                  onClick={handleInsert1kRows}
                  disabled={insert1kRows.isPending}
                >
                  {insert1kRows.isPending ? "Adding..." : "Add 1k rows"}
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
