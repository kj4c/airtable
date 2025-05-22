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

export default function BasePage() {
  const [open, setOpen] = useState(false);
  const [baseName, setBaseName] = useState("");
  const [error, setError] = useState("");

  const { data: userBases, refetch } = api.base.getAll.useQuery();

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


  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // if no session, redirect to home page
  if (!session) {
    window.location.href ="/";
    return null;
  }

  return (
    <AppLayout>
      
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Home</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
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
              <DialogDescription>Enter the name of your base below.</DialogDescription>
            </DialogHeader>
            <Input
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              placeholder="Base name"
            />
            <Button
              onClick={() => {
                if (baseName.trim()) {
                  createBase.mutateAsync({ name: baseName }).then((base) => {
                    if (base?.id) {
                      createTableMutation.mutateAsync({
                        baseId: base.id,
                        name: "Table 1",
                      });
                    }
                  });
                } else {
                  setError("Base name cannot be empty");
                }
              }}
            >
              Create
            </Button>
            <p className="text-red-500 mt-2 text-sm justify-center flex">
              {error}
            </p>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        {userBases?.map((base) => (
          <Link href={`/base/${base.id}`} key={base.id}>
            <BaseBox key={base.id} name={base.name} />
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
