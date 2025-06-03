"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  TableCellsSplit,
  Calendar1,
  LayoutGrid,
  KanbanSquare,
  ListChecks,
  RulerDimensionLine,
  AlignHorizontalJustifyEnd ,
  Folder,
  FileText,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { api } from "~/trpc/react";

type viewType = {
  name: string;
  id: string;
}
type Props = {
  viewList: viewType[];
  tableId: string;
  onViewChange: (viewId: string) => void;
  selectedViewId: string | null;
};

export default function ViewSidebar( { viewList, tableId, onViewChange, selectedViewId }: Props) {
  const [createOpen, setCreateOpen] = useState(true);
  const utils = api.useUtils();

  const createView = api.table.createView.useMutation({
    onSuccess: async () => {
      // invalidate cache
      await utils.table.getViews.invalidate();
    },
  })

  return (
    <div className="w-64 h-screen overflow-y-auto flex flex-col border-r border-gray-200 px-3 py-2 text-sm text-gray-700">
      {/* Search bar */}
      <div className="flex items-center mb-2">
        <Search className="w-4 h-4 mr-2 text-gray-400" />
        <input
          type="text"
          placeholder="Find a view"
          className="w-full border-none p-1 outline-none text-sm text-gray-800"
        />
      </div>

      <hr className="mb-2 border-blue-600" />

      <div className="h-[20%] overflow-y-auto space-y-1">
        {viewList.map((view) => (
          <button
            key={view.id}
            onClick={() => {
              onViewChange(view.id);
            }}
            className={`flex items-center w-full text-left px-2 py-1 rounded ${
              selectedViewId === view.id ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            <TableCellsSplit className="w-4 h-4 mr-2" />
            <span className="flex-1">{view.name}</span>
            {selectedViewId === view.id && <Check className="w-4 h-4 text-blue-600" />}
          </button>
        ))}
      </div>

      <hr className="my-2" />
      
      <div className="h-[80%] overflow-y-auto">
        <button
          className="flex items-center w-full px-2 py-1 font-medium hover:bg-gray-100 rounded"
          onClick={() => setCreateOpen(!createOpen)}
        >
          <span className="flex-1 text-left">Create...</span>
          {createOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {createOpen && (
          <div className="mt-1 space-y-1 pl-4 text-sm">
            {[
              { name: "Grid", icon: <TableCellsSplit className="w-4 h-4 mr-2 text-blue-500" />, onClick: () => createView.mutate({ name: "New Grid View" , tableId: tableId })},
              { name: "Calendar", icon: <Calendar1 className="w-4 h-4 mr-2 text-orange-500" /> },
              { name: "Gallery", icon: <LayoutGrid className="w-4 h-4 mr-2 text-purple-500" /> },
              { name: "Kanban", icon: <KanbanSquare className="w-4 h-4 mr-2 text-green-600" /> },
              { name: "Timeline", tag: "Team", icon: <RulerDimensionLine className="w-4 h-4 mr-2 text-red-600" /> },
              { name: "List", icon: <ListChecks className="w-4 h-4 mr-2 text-gray-700" /> },
              { name: "Gantt", icon: <AlignHorizontalJustifyEnd className="w-4 h-4 mr-2 text-emerald-600" />, tag: "Team" },
              { name: "New section", tag: "Team" },
              { name: "Form", icon: <FileText className="w-4 h-4 mr-2 text-pink-500" /> },
            ].map((view) => (
              <div
                key={view.name}
                className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                onClick={view.onClick ? view.onClick : undefined}
              >
                <div className="flex items-center cursor-pointer">
                  {view.icon}
                  <span>{view.name}</span>
                  {view.tag && (
                    <span className="ml-2 rounded bg-blue-100 px-1 text-xs text-blue-700">
                      {view.tag}
                    </span>
                  )}
                </div>
                <Plus className="w-4 h-4 text-gray-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
