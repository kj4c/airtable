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
  AlignHorizontalJustifyEnd ,
  Folder,
  FileText,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function ViewSidebar() {
  const [selectedView, setSelectedView] = useState("Grid 2");
  const [createOpen, setCreateOpen] = useState(true);

  const views = ["Grid 1", "Grid 2", "Grid 3", "Grid 6","Grid 5","Grid 4",];

  return (
    <div className="w-64 h-full overflow-y-auto flex flex-col border-r border-gray-200 px-3 py-2 text-sm text-gray-700">
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

      <div className="h-[100px] overflow-y-auto space-y-1">
        {views.map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`flex items-center w-full text-left px-2 py-1 rounded ${
              selectedView === view ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            <TableCellsSplit className="w-4 h-4 mr-2" />
            <span className="flex-1">{view}</span>
            {selectedView === view && <Check className="w-4 h-4 text-blue-600" />}
          </button>
        ))}
      </div>

      <hr className="my-2" />
      
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
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
              { name: "Grid", icon: <TableCellsSplit className="w-4 h-4 mr-2 text-blue-500" /> },
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
                className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100"
              >
                <div className="flex items-center">
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
