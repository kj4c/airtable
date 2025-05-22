// components/ui/DataTable.tsx
"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { Button } from "./button";
import { api } from "~/trpc/react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "./input";
import { Plus } from "lucide-react";

// define the type of the data, TData is a generic type
type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  tableId: string;
};

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function DataTable<TData>({ columns, data, tableId }: DataTableProps<TData>) {
	const [open, setOpen] = React.useState(false);
	const [columnName, setColumnName] = React.useState("");
	const [type, setType] = React.useState<"text" | "number">("text");
	const utils = api.useUtils();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const createColumn = api.table.createColumn.useMutation({
	 onSuccess: async () => {
		await utils.table.getTableData.invalidate({ 
			tableId: tableId,
			offset: 0,
			limit: 100,
		});
	 },
  })

  const createRow = api.table.createRow.useMutation({
	 onSuccess: async () => {
		await utils.table.getTableData.invalidate({ 
			tableId: tableId,
			offset: 0,
			limit: 100,
		});
	 },
  })

  return (
    <div className="overflow-x-auto border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            // get the columns 
            <tr key={headerGroup.id}>
							<th className="w-20">
							</th>
            	{headerGroup.headers.map(header => (
                <th key={header.id} className="px-4 py-2 text-left text-sm font-semibold text-black border-2">
                	{flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
							<th className=" text-left text-sm font-semibold text-black border-2 w-[60px]">
								<Dialog open={open} onOpenChange={setOpen}>
									<DialogTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="w-20 flex items-center justify-center hover:bg-white/10 group cursor-pointer"
										>   
										<Plus className="text-gray-500 group-hover:text-black transition-colors" />
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Add a new column</DialogTitle>
											<DialogDescription>
												Enter the name and the type of the new column below.
											</DialogDescription>
										</DialogHeader>
											<Input
												placeholder="Column name"
												onChange={(e) => {
													setColumnName(e.target.value);
													}
												}
												value={columnName}
											/>
											<DropdownMenu>
												<DropdownMenuTrigger
													className="w-full px-3 py-2 text-sm text-left text-black border-2 rounded-md"
												>{capitalizeFirstLetter(type)}</DropdownMenuTrigger>
												<DropdownMenuContent>
													<DropdownMenuItem onClick={() => setType("text")}>Text</DropdownMenuItem>
													<DropdownMenuItem onClick={() => setType("number")}>Number</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
											<Button
												onClick={() => {
													if (columnName.trim()) {
														createColumn.mutate({
															name: columnName,
															type: type,
															tableId: tableId,
														});
														setColumnName("");
														setType("text");
														setOpen(false);
													}
												}}
												className="text-white"
											>
												Create column
											</Button>
									</DialogContent>
								</Dialog>
							</th>
            </tr>
          ))}

        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
            {table.getRowModel().rows.map(row => (
							// display the rows
							// put number 
							<tr key={row.id}>
								<td className="px-4 py-2 h-10 border-2 text-sm text-gray-900">
									{row.index + 1}
								</td>
									{row.getVisibleCells().map(cell => (
										<td key={cell.id} className="px-4 py-2 h-10 border-2 text-sm text-gray-900">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
							</tr>
            ))}
						<tr>
	            <td colSpan={columns.length + 1} className="">
              <Button
                onClick={() => {
                  createRow.mutate({
                    tableId: tableId
                  });
                }}
								size="icon"
								className="w-20 rounded-none flex items-center justify-center border-r-2 border-l-2 border-b-2 bg-white hover:bg-gray-50 text-black group cursor-pointer"
              >
								<Plus className="text-gray-500 transition-colors" />
              </Button>
            </td>						
						</tr>
        </tbody>
      </table>
    </div>
  );
}
