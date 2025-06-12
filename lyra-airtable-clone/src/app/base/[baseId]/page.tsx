"use client";

import { DataTable } from "~/app/_components/table";
import { api } from "~/trpc/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import BaseLayout from "~/components/ui/base-layout";
import { Button } from "~/components/ui/button";
import React from "react";
import { ChevronDown } from "lucide-react";
import TableToolbar from "~/app/_components/table-toolbar";
import ViewSidebar from "~/app/_components/table-sidebar";
import { useDebounce } from "use-debounce";

type viewType = {
  name: string;
  id: string;
};

export default function BaseDashboard() {
  const params = useParams<{ baseId: string }>();
  const searchParams = useSearchParams();
  const { baseId } = params;
  const baseName = searchParams.get("name");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [views, setViews] = useState<viewType[]>([]);
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const utils = api.useUtils();

  // add new table
  const createTable = api.base.createTable.useMutation({
    onSuccess: async () => {
      await utils.base.getTables.invalidate();
    },
  });

  const insertColumn = api.table.createColumn.useMutation();

  const insertRow = api.table.createRow.useMutation();

  const handleCreate = async () => {
    const newTable = await createTable.mutateAsync({
      name: `Table ${(baseData?.length ?? 0) + 1}`,
      baseId: baseId,
    });

    if (newTable?.id) {
      await insertColumn.mutateAsync({
        name: "Name",
        type: "text",
        tableId: newTable.id,
      });
      await insertColumn.mutateAsync({
        name: "Notes",
        type: "text",
        tableId: newTable.id,
      });
      await insertColumn.mutateAsync({
        name: "Number",
        type: "number",
        tableId: newTable.id,
      });

      await Promise.all(
        Array.from({ length: 3 }).map(() =>
          insertRow.mutateAsync({
            tableId: newTable.id,
            valueWanted: true,
          }),
        ),
      );

      await utils.table.getColumns.invalidate();
      await utils.table.getAllColumns.invalidate({ tableId: newTable.id });
      await utils.table.getTableData.invalidate({
        viewId: selectedViewId ?? "",
        limit: 100,
        searchQuery: debouncedSearchQuery,
      });
    }
  };

  // fetch tables
  const { data: baseData } = api.base.getTables.useQuery(
    {
      baseId: baseId,
    },
    {
      enabled: !!baseId, // this makes it so that the table runs only if the baseId is not null
    },
  );

  const { data: viewsData } = api.table.getViews.useQuery(
    { tableId: selectedTableId ?? "" },
    { enabled: !!selectedTableId },
  );

  const handleTableChange = (tableId: string) => {
    setSelectedTableId(tableId);
    // the first one
  };

  useEffect(() => {
    if (viewsData && viewsData.length > 0) {
      setViews(viewsData.map(({ id, name }) => ({ id, name })));
      setSelectedViewId(viewsData[0]?.id ?? null);
    } else {
      setViews([]);
      setSelectedViewId(null);
    }
    setSearchQuery("");
  }, [viewsData, selectedTableId]);

  useEffect(() => {
    const firstTable = baseData?.[0];
    if (firstTable && !selectedTableId) {
      setSelectedTableId(firstTable.id);
    }
  }, [baseData, selectedTableId]);

  return (
    <BaseLayout baseName={baseName ?? "No base name"}>
      <div className="flex w-full flex-1 flex-col">
        <div className="flex w-full flex-col items-stretch bg-green-800">
          <div className="ml-2 flex h-8 items-end bg-green-800 px-2">
            {baseData?.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTableChange(t.id)}
                disabled={selectedTableId === t.id}
                className={`h-8 cursor-pointer rounded-t-xs bg-green-800 px-4 py-1 text-xs ${
                  selectedTableId === t.id
                    ? "rounded-b-none border-b-0 bg-white text-black"
                    : "bg-gray-200 text-white hover:bg-green-900"
                }`}
              >
                {t.name}
                {selectedTableId === t.id && (
                  <ChevronDown className="ml-1 inline h-3 w-3" />
                )}
              </button>
            ))}
            <Button
              className="ml-2 cursor-pointer bg-transparent pt-3 text-sm text-gray-200 hover:bg-transparent hover:text-white"
              onClick={() => handleCreate()}
            >
              + Add or import
            </Button>
          </div>
          <div className="border-t-0">
            {selectedTableId && selectedViewId && (
              <TableToolbar
                tableId={selectedTableId}
                viewId={selectedViewId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {selectedTableId && (
            <ViewSidebar
              viewList={views}
              tableId={selectedTableId}
              onViewChange={setSelectedViewId}
              selectedViewId={selectedViewId}
            />
          )}
          <div className="flex-1 overflow-hidden">
            {selectedTableId && selectedViewId && (
              <div className="h-screen w-full overflow-auto">
                <DataTable
                  tableId={selectedTableId}
                  viewId={selectedViewId}
                  searchQuery={debouncedSearchQuery}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
