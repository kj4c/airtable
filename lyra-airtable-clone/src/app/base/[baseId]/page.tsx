"use client";

import { DataTable } from "~/app/_components/table";
import { api } from "~/trpc/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import BaseLayout from "~/components/ui/base-layout";
import { Button } from "~/components/ui/button";
import React from "react";

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
      if (newTable) {
        setSelectedTableId(newTable.id);
      }
      await utils.base.getTables.invalidate();
    },
  });

  const handleCreate =() => {
    createTable.mutate({
    name: `Table ${(baseData?.length ?? 0) + 1}`,
    baseId: baseId,
    })
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
      <div className="">
        <div className="mb-4 flex w-full bg-green-800">
          <div className="ml-2">
            {baseData?.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTableId(t.id)}
                className={`cursor-pointer rounded-t-xs bg-green-800 px-4 py-1 text-sm ${
                  selectedTableId === t.id
                    ? "bg-white text-black"
                    : "bg-gray-200 text-white hover:bg-green-900"
                }`}
              >
                {t.name}
              </button>
            ))}
            <Button
              className="ml-2 cursor-pointer bg-transparent text-sm"
              onClick={() =>
                handleCreate()
              }
            >
              + Add or import
            </Button>
          </div>
        </div>

        {selectedTableId && (
          <DataTable
            tableId={selectedTableId}
          />
        )}
      </div>
    </BaseLayout>
  );
}
