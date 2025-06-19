"use client";

import { DataTable } from "~/app/_components/table";
import { api } from "~/trpc/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import BaseLayout from "~/components/ui/base-layout";
import { Button } from "~/components/ui/button";
import React from "react";
import { ChevronDown, Plus } from "lucide-react";
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
        limit: 500,
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
      if (!selectedViewId || !viewsData.some(view => view.id === selectedViewId)) {
        setSelectedViewId(viewsData[0]?.id ?? null);
      }
    } else if (viewsData) {
      setViews([]);
      setSelectedViewId(null);
    }
    setSearchQuery("");
  }, [viewsData, selectedViewId]);

  useEffect(() => {
    if (baseData && baseData.length > 0 && !selectedTableId) {
      setSelectedTableId(baseData[0]?.id ?? null);
      if (viewsData && viewsData.length > 0) {
        setSelectedViewId(viewsData[0]?.id ?? null);
      }
    }
  }, [baseData, selectedTableId, viewsData]);

  useEffect(() => {
    const storedTableId = localStorage.getItem("tableId");
    const storedViewId = localStorage.getItem("viewId");
    if (storedTableId) setSelectedTableId(storedTableId);
    if (storedViewId) setSelectedViewId(storedViewId);
  }, []);

  useEffect(() => {
    if (selectedTableId) localStorage.setItem("tableId", selectedTableId);
  }, [selectedTableId]);
  
  useEffect(() => {
    if (selectedViewId) localStorage.setItem("viewId", selectedViewId);
  }, [selectedViewId]);

  return (
    <BaseLayout baseName={baseName ?? "No base name"}>
      <div className="flex w-full flex-1 flex-col">
        <div className="flex flex-col items-stretch bg-[#048a0e] ">
          <div className=" flex h-8 w-full items-center">
            <div className="pl-3 flex items-center bg-[#0a7c0e] w-full mr-2 rounded-t-sm">
              {baseData?.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTableChange(t.id)}
                  disabled={selectedTableId === t.id}
                  className={`h-8 cursor-pointer rounded-t-xs bg-[#0a7c0e] px-4 py-1 text-[13px] flex items-center justify-center ${
                    selectedTableId === t.id
                      ? "rounded-b-none border-b-0 bg-white text-black"
                      : "text-white hover:bg-[#08700c]"
                  }`}
                >
                  {t.name}
                </button>
              ))}
              <div className="relative flex items-center h-8">
                <div className="h-3 w-px bg-white opacity-30 mr-[11px] mt-[1px]" />
                <button className="flex items-center justify-center h-[16px] w-[16px]">
                  <ChevronDown className="h-[16px] w-[16px] text-white stroke-[1.5px]" />
                </button>
                <div className="h-3 w-px bg-white opacity-30 ml-[11px] mt-[1px]" />
              </div>

              <button
                className="h-8 px-3 flex items-center cursor-pointer bg-transparent text-sm text-gray-200 hover:bg-transparent hover:text-white"
                onClick={() => handleCreate()}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" className="text-white" fill="currentColor"><use href="/icons/icon_definitions.svg#Plus"></use></svg>
                <span className="ml-2 text-[13px] font-[400] pt-[2px]">Add or import</span>
              </button>
            </div>
            
            <div className="ml-auto flex items-center rounded-tl-sm h-8 bg-[#0a7c0e] px-4 w-[165.578px]">
              <span className="text-white text-[13px] font-[400]">Extensions</span>
              <span className="ml-4 text-white text-[13px] font-[400]">Tools</span>
              <ChevronDown className="h-[16px] w-[16px] ml-1 text-white stroke-[1.5px]" />
            </div>
        
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
