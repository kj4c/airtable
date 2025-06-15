import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Plus, Search, SortAsc, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/trpc/react";
import { useEffect } from "react";
import { motion } from "framer-motion";

type Props = {
  tableId: string;
  viewId: string;
  searchQuery: string;
};

export default function SortDialog({ tableId, viewId, searchQuery }: Props) {
  const utils = api.useUtils();

  const fetchSorts = api.sorts.getSorts.useQuery(
    { viewId },
    {
      enabled: !!viewId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const createSort = api.sorts.createSort.useMutation({
    onSuccess: async () => {
      await utils.sorts.getSorts.invalidate({ viewId });
      await utils.sorts.getSorts.refetch({ viewId });
    },
  });

  const updateSort = api.sorts.updateSort.useMutation({
    onSuccess: async () => {
      await utils.sorts.getSorts.invalidate({ viewId });
      await utils.sorts.getSorts.refetch({ viewId });
    },
  });

  const deleteSort = api.sorts.deleteSort.useMutation({
    onSuccess: async () => {
      await utils.sorts.getSorts.invalidate({ viewId });
      await utils.sorts.getSorts.refetch({ viewId });
    },
  });

  const isSorting =
    createSort.isPending || updateSort.isPending || deleteSort.isPending;

  useEffect(() => {
    if (!isSorting) {
      void utils.table.getTableData.invalidate({
        viewId,
        limit: 500,
        searchQuery,
      });
    }
  }, [isSorting, utils, viewId, searchQuery]);

  const fetchColumns = api.table.getColumns.useQuery(
    {
      tableId,
      viewId,
    },
    {
      enabled: !!tableId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const hasSorts = fetchSorts.data && fetchSorts.data.length > 0;

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer" asChild>
        <button
          className={`flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100 ${
            hasSorts ? "bg-orange-100" : ""
          }`}
        >
          <SortAsc className="h-4 w-4" />
          <span>
            {hasSorts ? `Sorted by ${fetchSorts.data.length} fields` : "Sort"}
          </span>
          {isSorting && (
            <span className="ml-2 animate-pulse text-xs text-gray-400">
              Sorting...
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="relative w-90 p-4">
        {isSorting && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="text-sm text-gray-500">Applying sort...</div>
          </div>
        )}
        <motion.div
          layout
          animate={{ opacity: isSorting ? 0.4 : 1 }}
          transition={{ duration: 0.3 }}
          className={isSorting ? "pointer-events-none" : ""}
        >
          {hasSorts ? (
            <div className="flex flex-col space-y-2">
              {[...fetchSorts.data]
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .map((sort) => {
                  const column = fetchColumns.data?.find(
                    (col) => col.id === sort.columnId,
                  );
                  const isNumber = column?.type === "number";

                  return (
                    <div
                      key={sort.id}
                      className="flex w-full items-center justify-between space-x-1"
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex w-[60%] cursor-pointer items-center justify-between border-1 px-1 text-left text-sm hover:bg-gray-100">
                          {sort.columnName}
                          <span className="ml-2 text-gray-500">⏷</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {fetchColumns.data?.map((col) => (
                            <DropdownMenuItem
                              key={col.id}
                              onClick={() =>
                                updateSort.mutate({
                                  sortId: sort.id,
                                  columnId: col.id,
                                })
                              }
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              {col.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex w-[30%] cursor-pointer items-center justify-between border-1 px-1 text-center text-sm hover:bg-gray-100">
                          {sort.direction === "asc"
                            ? isNumber
                              ? "1 → 9"
                              : "A → Z"
                            : isNumber
                              ? "9 → 1"
                              : "Z → A"}
                          <span className="ml-2 text-gray-500">⏷</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              updateSort.mutate({
                                sortId: sort.id,
                                direction: "asc",
                              })
                            }
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            {isNumber ? "1 → 9" : "A → Z"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateSort.mutate({
                                sortId: sort.id,
                                direction: "desc",
                              })
                            }
                            className="cursor-pointer"
                          >
                            {isNumber ? "9 → 1" : "Z → A"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <button
                        onClick={() => {
                          deleteSort.mutate({ sortId: sort.id });
                        }}
                      >
                        <Trash2 className="h-[29.65px] w-8 cursor-pointer px-2 py-1 text-gray-600" />
                      </button>
                    </div>
                  );
                })}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex">
                    <Plus className="h-6 w-6 pr-2 text-gray-400" />
                    <button
                      className="cursor-pointer text-left text-xs text-gray-400"
                      disabled={isSorting}
                    >
                      Add another sort
                    </button>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="flex flex-col space-y-2">
                    {fetchColumns.data?.map((column) => (
                      <button
                        key={column.id}
                        onClick={() =>
                          createSort.mutate({
                            viewId,
                            columnId: column.id,
                            direction: "asc",
                            order: fetchSorts.data?.length ?? 0,
                          })
                        }
                        className="flex cursor-pointer items-center justify-between rounded px-2 py-1 hover:bg-gray-100"
                        disabled={isSorting}
                      >
                        <span>{column.name}</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row items-center justify-between border-b-1 pb-2">
                <span className="text-sm text-gray-600">Sort by ⓘ</span>
                <span className="text-xs font-extralight text-gray-500">
                  Copy from a view
                </span>
              </div>
              <div className="flex space-x-2">
                <Search className="h-5 pt-[2px] text-gray-400" />
                <input
                  className="text-sm text-gray-400 focus:outline-none"
                  placeholder="Find a field"
                />
              </div>
              <div className="mt-2 flex flex-col space-y-1">
                {fetchColumns.data?.map((column) => (
                  <button
                    key={column.id}
                    onClick={() =>
                      createSort.mutate({
                        viewId,
                        columnId: column.id,
                        direction: "asc",
                      })
                    }
                    className="flex cursor-pointer items-center justify-between rounded px-2 py-1 hover:bg-gray-100"
                    disabled={isSorting}
                  >
                    <span>{column.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
