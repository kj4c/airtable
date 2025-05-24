"use client";

import { DataTable } from "~/app/_components/table";
import { api } from "~/trpc/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { RowData } from "types";
import BaseLayout from "~/components/ui/base-layout";
import { Button } from "~/components/ui/button";

export default function BaseDashboard() {
  const params = useParams<{ baseId: string }>();
  const { baseId } = params;
  const [baseName, setBaseName] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const utils = api.useUtils();

  // get base name
  const baseNamedata = api.base.getBaseName.useQuery(
    {
      baseId: baseId,
    },
    {
      enabled: !!baseId,
    },
  );

  useEffect(() => {
    if (baseNamedata.data) {
      setBaseName(baseNamedata.data);
    }
  }, [baseNamedata.data]);

  // add new table
  const createTable = api.base.createTable.useMutation({
    onSuccess: async (newTable) => {
      if (newTable) {
        setSelectedTableId(newTable.id);
      }
      await utils.base.getTables.invalidate();
    },
  });

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

  // 2. Fetch columns and rows for the selected table
  const {
    data: tableData,
    error: tableError,
    isLoading: tableLoading,
  } = api.table.getTableData.useQuery(
    {
      tableId: selectedTableId ?? "",
      offset: 0,
      limit: 100,
    },
    {
      enabled: !!selectedTableId, // this makes it so that the table runs only if the selectedTableId is not null
    },
  );

  const columns = tableData?.columns ?? [];
  const data = tableData?.data ?? [];

  return (
    <BaseLayout baseName={baseName}>
      <div className="">
        <div className="mb-4 flex bg-green-800 w-full">
          <div className="ml-2">
            {baseData?.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTableId(t.id)}
                className={`rounded-t-xs px-4 py-1 text-sm cursor-pointer bg-green-800 ${
                  selectedTableId === t.id
                    ? "bg-white text-black"
                    : "bg-gray-200 hover:bg-green-900"
                }`}
              >
                {t.name}
              </button>
            ))}
            <button className="bg-transparent cursor-pointer text-sm ml-2"
              onClick={() => createTable.mutate({ 
                name: `Table ${(baseData?.length ?? 0) + 1}`,
                baseId: baseId 
              })}
            >
              + Add or import
            </button>
          </div>
        </div>

        {selectedTableId && (
          <DataTable columns={columns} data={data} tableId={selectedTableId} />
        )}
      </div>
    </BaseLayout>
  );
}
