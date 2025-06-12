import { Switch } from "~/components/ui/switch";
import { EyeOff } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/trpc/react";
import { useEffect } from "react";

type Props = {
  tableId: string;
  viewId: string;
  searchQuery: string;
};

export default function HideDialog({ tableId, viewId, searchQuery }: Props) {
  const utils = api.useUtils();
  const fetchColumns = api.table.getAllColumns.useQuery(
    {
      tableId,
    },
    {
      enabled: !!tableId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const fetchHiddenColumns = api.table.getHiddenColumns.useQuery(
    {
      viewId,
    },
    {
      enabled: !!viewId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const hideColumn = api.filters.hideColumn.useMutation({
    onSuccess: async () => {
      await utils.table.getHiddenColumns.invalidate({ viewId });
      await utils.table.getColumns.invalidate({ tableId, viewId });
      await utils.table.getTableData.invalidate({
        viewId,
        limit: 100,
        searchQuery,
      });
    },
  });

  const hasHiddenColumns =
    fetchHiddenColumns.data && fetchHiddenColumns.data?.length > 0;

  const unhideColumn = api.filters.unhideColumn.useMutation({
    onSuccess: async () => {
      await utils.table.getHiddenColumns.invalidate({ viewId });
      await utils.table.getColumns.invalidate({ tableId, viewId });
      await utils.table.getTableData.invalidate({
        viewId,
        limit: 100,
        searchQuery,
      });
    },
  });

  useEffect(() => {
    void fetchColumns.refetch();
    void fetchHiddenColumns.refetch();
  }, [tableId, viewId]);

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer" asChild>
        <button
          className={
            `flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100 ` +
            (hasHiddenColumns ? "bg-blue-100" : "")
          }
        >
          <EyeOff className="h-4 w-4" />
          <span>
            {hasHiddenColumns
              ? `${fetchHiddenColumns.data.length} hidden field`
              : "Hide Fields"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col space-y-2">
          <div className="mb-2 flex justify-between border-b-2 py-3 text-xs text-gray-500">
            <p>Find a field</p>ⓘ
          </div>
          <div className="flex flex-col space-y-2">
            {fetchColumns.data
              ?.filter((column) => column.order !== 0)
              .map((column) => (
                <div
                  key={column.id}
                  className="flex cursor-pointer items-center space-x-5 rounded px-2 py-1 hover:bg-gray-100"
                  onClick={() => {
                    if (fetchHiddenColumns.data?.includes(column.id)) {
                      unhideColumn.mutate({ columnId: column.id, viewId });
                    } else {
                      hideColumn.mutate({ columnId: column.id, viewId });
                    }
                  }}
                >
                  <Switch
                    checked={!fetchHiddenColumns.data?.includes(column.id)}
                    className="pointer-events-none h-2 w-7 text-gray-400"
                  />
                  <span>{column.name}</span>
                </div>
              ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
