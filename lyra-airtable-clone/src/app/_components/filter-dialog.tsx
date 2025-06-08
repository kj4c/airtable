import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Filter, Trash2 } from "lucide-react";
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
export default function FilterDialog({ tableId, viewId }: Props) {
  const fetchFilters = api.filters.getFilters.useQuery(
    { viewId },
    {
      enabled: !!viewId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const utils = api.useUtils();

  const stringFilters = ["contains", "does not contain", "is", "is not empty", "is empty"];
  const numFilters = [">", "<"];

  const createFilter = api.filters.createFilter.useMutation({
    onSuccess: async () => {
      await utils.filters.getFilters.invalidate({ viewId });
      await utils.table.getTableData.invalidate({ viewId, limit: 100 });
    },
  });

  const updateFilter = api.filters.updateFilter.useMutation({
    onSuccess: async () => {
      await utils.filters.getFilters.invalidate({ viewId });
      await utils.table.getTableData.invalidate({ viewId, limit: 100 });
    },
  });

  const deleteFilter = api.filters.deleteFilter.useMutation({
    onSuccess: async () => {
      await utils.filters.getFilters.invalidate({ viewId });
      await utils.table.getTableData.invalidate({ viewId, limit: 100 });
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

  const hasFilters = fetchFilters.data && fetchFilters.data.length > 0;

return (
    <Popover>
      <PopoverTrigger className="cursor-pointer" asChild>
        <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[500px]">
        {hasFilters ? (
          <>
            <div className="text-xs text-gray-500 mb-2">In this view, show records</div>
            <div className="flex flex-col space-y-2">
              {fetchFilters.data.map((filter) => (
                <div key={filter.id} className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-[150px] cursor-pointer text-left border px-2 py-1 text-sm bg-white">
                      {filter.columnName}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {fetchColumns.data?.map((col) => (
                        <DropdownMenuItem
                          key={col.id}
                          onClick={() =>
                            updateFilter.mutate({
                              filterId: filter.id,
                              columnId: col.id,
                            })
                          }
                        >
                          {col.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-[200px] cursor-pointer text-left border px-2 py-1 text-sm bg-white">
                      {filter.operator || "="}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {(filter.columnType === "number" ? numFilters : stringFilters).map((op) => (
                        <DropdownMenuItem
                          key={op}
                          onClick={() =>
                            updateFilter.mutate({
                              filterId: filter.id,
                              operator: op,
                            })
                          }
                          className="cursor-pointer"
                        >
                          {op}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <input
                    type="text"
                    defaultValue={
                      filter.operator === "is empty" || filter.operator === "is not empty"
                        ? ""
                        : filter.value ?? ""
                    }
										onBlur={(e) => {
											const newValue = e.target.value.trim();
                      const currentValue = filter.value ?? "";
											if (newValue !== currentValue) {
												updateFilter.mutate({
													filterId: filter.id,
													value: newValue,
                          operator: filter.operator,
												});
											}
										}}
                    disabled={filter.operator === "is empty" || filter.operator === "is not empty"}
                    placeholder={filter.operator === "is empty" || filter.operator === "is not empty" ? "" : "Enter a value"}
                    className="flex-1 border px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      deleteFilter.mutate({ filterId: filter.id });
                    }}
                  >
                    <Trash2 className="border px-2 py-1 w-8 h-[29.65px] text-gray-600 cursor-pointer"/>
                  </button>
                </div>
              ))}

              <div className="flex gap-3">
                <button
                  className="text-gray-600 text-xs font-medium hover:text-gray-800 cursor-pointer"
                  onClick={() => {
                    const firstColumn = fetchColumns.data?.[0];
                    if (!firstColumn) return;

                    const isString = firstColumn.type === "text";
                    const isNumber = firstColumn.type === "number";

                    createFilter.mutate({
                      viewId,
                      columnId: firstColumn.id,
                      operator: isString ? "contains" : isNumber ? "=" : "",
                      value: "",
                    });
                  }}
                >
                  + Add condition
                </button>

                <button className="text-gray-600 text-xs font-medium hover:text-gray-800">
                  + Add condition group ⓘ
                </button>
              </div>
            
            </div>
          </>
        ) : (
          <div className="flex flex-col space-y-2">
            <span className="text-sm text-gray-400 font-light">
              No filter conditions are applied ⓘ
            </span>

            <div className="flex flex-row items-center justify-between">
              <button
                className="text-gray-600 cursor-pointer text-xs font-medium"
                onClick={() => {
                  const firstColumn = fetchColumns.data?.[0];
                  if (!firstColumn) return;

                  const isString = firstColumn.type === "text";
                  const isNumber = firstColumn.type === "number";

                  createFilter.mutate({
                    viewId,
                    columnId: firstColumn.id,
                    operator: isString ? "contains" : isNumber ? "=" : "",
                    value: "",
                  });
                }}
              >
                + Add condition
              </button>

              <button className="text-gray-600 cursor-pointer text-xs font-medium">
                + Add condition group ⓘ
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
