"use client";

import { DataTable } from "~/components/ui/table";
import { api } from "~/trpc/react";
import { generateColumns, generateRows } from "./data";
import { DataTableClient } from "./data-table-client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  params: {
    baseId: string;
  };
};

export default function BaseDashboard() {
  const params = useParams<{ baseId: string }>();
  const { baseId } = params;
  const [baseName, setBaseName] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // 1. Fetch all tables for this base
  const {data: baseData, error, isLoading} = api.base.getTables.useQuery({
    baseId: params.baseId,
  });

  useEffect(() => {
    const firstTable = baseData?.[0];
    if (firstTable && !selectedTableId) {
      setSelectedTableId(firstTable.id);
    }
  }, [baseData, selectedTableId]);

  // 2. Fetch columns and rows for the selected table
  const { data: tableData, error: tableError, isLoading: tableLoading } = api.table.getTableData.useQuery({
    tableId: selectedTableId ?? "",
    offset: 0,
    limit: 100,
  },
  {
    enabled: !!selectedTableId, // this makes it so that the table runs only if the selectedTableId is not null
  }
  );
  
  const rows = tableData?.rows ?? [];
  const columns = tableData?.columns ?? [];
  const cells = tableData?.cells ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {baseData?.find(t => t.id === selectedTableId)?.name ?? "Loading..."}
      </h1>

      <div className="flex gap-2 mb-4">
        {baseData?.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTableId(t.id)}
            className={`px-4 py-2 rounded ${
              selectedTableId === t.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {selectedTableId && (
        <DataTableClient
          columns={columns}
          rows={rows}
          cells={cells}
          tableId={selectedTableId}
        />
      )}
    </div>
  );
}
