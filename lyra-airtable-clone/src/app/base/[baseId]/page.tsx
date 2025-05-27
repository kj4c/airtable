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

export default function BaseDashboard() {
  const params = useParams<{ baseId: string }>();
  const searchParams = useSearchParams();
  const { baseId } = params;
  const baseName = searchParams.get("name");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const utils = api.useUtils();

  // add new table
  const createTable = api.base.createTable.useMutation({
    onSuccess: async (newTable) => {
      await utils.base.getTables.invalidate();
    },
  });

  const insertColumn = api.table.createColumn.useMutation({
    onSuccess: async () => {
      await utils.table.getColumns.invalidate();
    },
  });

  const handleCreate = async () => {
    const newTable = await createTable.mutateAsync({
      name: `Table ${(baseData?.length ?? 0) + 1}`,
      baseId: baseId,
    })

    if (newTable?.id) {
      setSelectedTableId(newTable.id);

      await insertColumn.mutateAsync({
        name: `Name`,
        type: "text",
        tableId: newTable.id
      })
    }
  }

  // 1. Fetch all tables for this base
  const {
    data: baseData,
    error,
    isLoading,
  } = api.base.getTables.useQuery(
    {
      baseId: baseId,
    },
    {
      enabled: !!baseId, // this makes it so that the table runs only if the baseId is not null
    },
  );

  useEffect(() => {
    const firstTable = baseData?.[0];
    if (firstTable && !selectedTableId) {
      setSelectedTableId(firstTable.id);
    }
  }, [baseData, selectedTableId]);

  return (
    <BaseLayout baseName={baseName ?? "No base name"}>
      <div className="flex flex-col w-full flex-1">
        <div className="flex flex-col w-full items-stretch bg-green-800">
          <div className="ml-2 flex items-end h-8 bg-green-800 px-2">
            {baseData?.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTableId(t.id)}
                className={`h-8 cursor-pointer rounded-t-xs bg-green-800 px-4 py-1 text-xs ${
                  selectedTableId === t.id
                    ? "bg-white text-black rounded-b-none border-b-0"
                    : "bg-gray-200 text-white hover:bg-green-900"
                }`}
              >
                {t.name}
                {selectedTableId === t.id &&
                  <ChevronDown className="inline ml-1 h-3 w-3" />
                }
              </button>
            ))}
            <Button
              className="ml-2 cursor-pointer bg-transparent text-sm hover:bg-transparent hover:text-white text-gray-200"
              onClick={() =>
                handleCreate()
              }
            >
              + Add or import
            </Button>
          </div>
          <div className="border-t-0">
            <TableToolbar />
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <ViewSidebar />
          <div className="flex-1 overflow-hidden">
            {selectedTableId && (
              <div className="h-[calc(100vh-130px)] w-full overflow-auto">
                <DataTable tableId={selectedTableId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
