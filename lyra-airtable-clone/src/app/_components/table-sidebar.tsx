"use client";

import { useState } from "react";
import {
  Plus,
  TableCellsSplit,
  Calendar1,
  LayoutGrid,
  KanbanSquare,
  ListChecks,
  RulerDimensionLine,
  AlignHorizontalJustifyEnd,
  FileText,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { api } from "~/trpc/react";

type viewType = {
  name: string;
  id: string;
};
type Props = {
  viewList: viewType[];
  tableId: string;
  onViewChange: (viewId: string) => void;
  selectedViewId: string | null;
};

export default function ViewSidebar({
  viewList,
  tableId,
  onViewChange,
  selectedViewId,
}: Props) {
  const [createOpen, setCreateOpen] = useState(true);
  const [viewIsOpen, setViewIsOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("New Grid View");
  const utils = api.useUtils();

  const createView = api.table.createView.useMutation({
    onSuccess: async (newView) => {
      if (newView?.id) {
        onViewChange(newView.id);
        await utils.table.getViews.invalidate();
      } else {
        console.error("Failed to create view: missing ID");
      }
    },
  });

  return (
    <div className="flex h-screen w-64 flex-col overflow-y-auto border-r border-gray-200 px-3 py-2 text-sm font-medium text-black">
      {/* Search bar */}
      <div className="mb-2 flex items-center">
        <Search className="mr-2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Find a view"
          className="w-full border-none p-1 text-sm text-gray-800 outline-none"
        />
      </div>

      <hr className="mb-2 border-blue-600" />

      <div className="h-[20%] space-y-1 overflow-y-auto">
        {viewList.map((view) => (
          <button
            key={view.id}
            onClick={() => {
              onViewChange(view.id);
            }}
            className={`flex w-full cursor-pointer items-center rounded px-2 py-1 text-left ${
              selectedViewId === view.id ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            <TableCellsSplit className="mr-2 h-4 w-4 text-blue-600" />
            <span className="flex-1 text-black">{view.name}</span>
            {selectedViewId === view.id && (
              <Check className="h-4 w-4 text-gray-500" />
            )}
          </button>
        ))}
      </div>

      <hr className="my-2" />

      <div className="h-[80%] overflow-y-auto">
        <button
          className="flex w-full cursor-pointer items-center rounded px-2 py-1 font-medium hover:bg-gray-100"
          onClick={() => setCreateOpen(!createOpen)}
        >
          <span className="flex-1 text-left">Create...</span>
          {createOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {createOpen && (
          <div className="mt-1 space-y-1 pl-4 text-sm">
            {[
              {
                name: "Grid",
                icon: (
                  <TableCellsSplit className="mr-2 h-4 w-4 text-blue-500" />
                ),
                onClick: () => setViewIsOpen(true),
              },
              {
                name: "Calendar",
                icon: <Calendar1 className="mr-2 h-4 w-4 text-orange-500" />,
              },
              {
                name: "Gallery",
                icon: <LayoutGrid className="mr-2 h-4 w-4 text-purple-500" />,
              },
              {
                name: "Kanban",
                icon: <KanbanSquare className="mr-2 h-4 w-4 text-green-600" />,
              },
              {
                name: "Timeline",
                tag: "Team",
                icon: (
                  <RulerDimensionLine className="mr-2 h-4 w-4 text-red-600" />
                ),
              },
              {
                name: "List",
                icon: <ListChecks className="mr-2 h-4 w-4 text-gray-700" />,
              },
              {
                name: "Gantt",
                icon: (
                  <AlignHorizontalJustifyEnd className="mr-2 h-4 w-4 text-emerald-600" />
                ),
                tag: "Team",
              },
              { name: "New section", tag: "Team" },
              {
                name: "Form",
                icon: <FileText className="mr-2 h-4 w-4 text-pink-500" />,
              },
            ].map((view) => (
              <div
                key={view.name}
                className="flex cursor-pointer items-center justify-between rounded px-2 py-1 hover:bg-gray-100"
                onClick={view.onClick ?? undefined}
              >
                <div className="flex cursor-pointer items-center">
                  {view.icon}
                  <span>{view.name}</span>
                  {view.tag && (
                    <span className="ml-2 rounded bg-blue-100 px-1 text-xs text-blue-700">
                      {view.tag}
                    </span>
                  )}
                </div>
                <Plus className="h-4 w-4 text-gray-500" />
              </div>
            ))}
          </div>
        )}
      </div>
      {viewIsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col rounded bg-white p-4 shadow-lg">
            <input
              autoFocus
              type="text"
              className="w-64 rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createView.mutate({ name: newViewName, tableId });
                  setNewViewName("New Grid View");
                  setViewIsOpen(false);
                }
                if (e.key === "Escape") setViewIsOpen(false);
              }}
            />
            <div className="mt-1 flex cursor-pointer items-center justify-end space-x-2">
              <button
                className="mt-5 flex cursor-pointer items-center rounded px-3 py-1 hover:bg-gray-100"
                onClick={() => setViewIsOpen(false)}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  createView.mutate({ name: newViewName, tableId });
                  setNewViewName("New Grid View");
                  setViewIsOpen(false);
                }}
                className="mt-5 flex cursor-pointer items-center space-x-2 rounded bg-blue-500 px-3 py-1 text-white"
              >
                <span>Create View</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
