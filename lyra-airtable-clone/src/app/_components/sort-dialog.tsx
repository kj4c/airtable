import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Plus, Search, SortAsc } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/trpc/react";

type Props = {
  tableId: string;
  viewId: string;
};
export default function SortDialog({ tableId, viewId }: Props) {
  const fetchSorts = api.sorts.getSorts.useQuery(
    { viewId },
    {
      enabled: !!viewId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const utils = api.useUtils();

  const createSort = api.sorts.createSort.useMutation({
    onSuccess: async () => {
      await utils.sorts.getSorts.invalidate({ viewId });
      await utils.sorts.getSorts.refetch({ viewId });
      await utils.table.getTableData.invalidate({ viewId, limit: 100 });
      await utils.table.getTableData.refetch({ viewId, limit: 100 });
    },
  });

  const updateSort = api.sorts.updateSort.useMutation({
    onSuccess: async () => {
      await utils.sorts.getSorts.invalidate({ viewId });
      await utils.sorts.getSorts.refetch({ viewId });
      await utils.table.getTableData.invalidate({ viewId, limit: 100 });
      await utils.table.getTableData.refetch({ viewId, limit: 100 });
    },
  });

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
        <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
          <SortAsc className="h-4 w-4" />
          <span>Sort</span>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        {hasSorts ? (
          <div className="flex flex-col space-y-2">
            {fetchSorts.data.map((sort) => (
              <div
                key={sort.id}
                className="flex items-center justify-between space-x-2"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-[80%] cursor-pointer border-1 px-1 text-left text-sm hover:bg-gray-100">
                    {sort.columnName}
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
                  <DropdownMenuTrigger className="w-[20%] cursor-pointer border-1 px-1 text-left text-sm hover:bg-gray-100">
                    {sort.direction === "asc" ? "A → Z" : "Z → A"}
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
                      A → Z
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
                      Z → A
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex">
                  <Plus className="h-6 w-6 pr-2 text-gray-400" />
                  <button className="cursor-pointer text-left text-xs text-gray-400">
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
                        })
                      }
                      className="flex cursor-pointer items-center justify-between rounded px-2 py-1 hover:bg-gray-100"
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
                >
                  <span>{column.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
