"use client";

import { useState } from "react";
import AppLayout from "~/components/ui/app-layout";
import { BaseBox } from "~/components/ui/base-box";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader } from "lucide-react";

export default function BasePage() {
  const [open, setOpen] = useState(false);
  const [baseName, setBaseName] = useState("");
  const [error, setError] = useState("");
  const utils = api.useUtils();

  const { data: userBases, refetch, isLoading } = api.base.getAll.useQuery();

  // call the api using api.base.createBase, possible from root.ts
  const createBase = api.base.createBase.useMutation({
    onSuccess: async () => {
      setBaseName("");
      setOpen(false);
      setError("");
      void refetch();
    },
  });

  const createTableMutation = api.base.createTable.useMutation();
  const createColumn = api.table.createColumn.useMutation();
  const createRow = api.table.createRow.useMutation({
    onSuccess: async () => {
      await utils.table.getTableData.invalidate();
    },
  });

  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // if no session, redirect to home page
  if (!session) {
    window.location.href = "/";
    return null;
  }

  const handleCreateBase = async () => {
    if (!baseName.trim()) return;
    const base = await createBase.mutateAsync({ name: baseName });

    if (base?.id) {
      const table = await createTableMutation.mutateAsync({
        baseId: base.id,
        name: "Table 1",
      });

      const defaultColumns = [
        { name: "Name", type: "text" },
        { name: "Notes", type: "text" },
        { name: "Number", type: "number" },
      ];
      // default column for the table
      if (table?.id) {
        for (const col of defaultColumns) {
          await createColumn.mutateAsync({
            tableId: table.id,
            name: col.name,
            type: col.type as "text" | "number",
          });
        }

        await Promise.all(
          Array.from({ length: 3 }).map(() =>
            createRow.mutateAsync({
              tableId: table.id,
              valueWanted: true,
            }),
          ),
        );

        await utils.table.getColumns.invalidate();
        await utils.table.getTableData.invalidate();
      }
    }

    setOpen(false);
  };

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Home</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                setError("");
              }}
            >
              Create a Base
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Base</DialogTitle>
              <DialogDescription>
                Enter the name of your base below.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await handleCreateBase();
                }
              }}
              placeholder="Base name"
            />
            <Button className="cursor-pointer" onClick={handleCreateBase}>
              Create
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
          <Loader className="h-12 w-12 animate-spin text-gray-600" />
          <span className="ml-2 text-lg text-gray-600">Loading bases...</span>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-4">
          {userBases?.map((base) => (
            <Link
              href={`/base/${base.id}?name=${encodeURIComponent(base.name)}`}
              key={base.id}
            >
              <BaseBox key={base.id} name={base.name} />
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
