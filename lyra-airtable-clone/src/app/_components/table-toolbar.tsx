import {
  LayoutList,
  Table,
  Rows,
  Palette,
  AlignLeft,
  Share2,
  ChevronDown,
  Users,
} from "lucide-react";
import SortDialog from "~/app/_components/sort-dialog";
import FilterDialog from "./filter-dialog";
import Search from "./search";
import HideDialog from "./hide-dialog";
import { api } from "~/trpc/react";
import React, { useState } from "react";

type Props = {
  tableId: string;
  viewId: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
};
const TableToolbar = ({
  tableId,
  viewId,
  searchQuery,
  setSearchQuery,
}: Props) => {
  const viewName = api.table.getViewName.useQuery({ viewId });
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex items-center space-x-4 h-11 text-[13px] whitespace-nowrap border-b border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <LayoutList className="h-4 w-4" />
        <span className="font-[500]">Views</span>
      </button>

      <div className="h-5 w-px bg-gray-300" />

      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <Table className="h-4 w-4 text-blue-600" />
        <span className="text-black font-[500]">{viewName.data ?? "Loading..."}</span>
        <Users className="ml-1 h-4 w-4 text-gray-500" />
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {/* Hide Fields */}
      <HideDialog tableId={tableId} viewId={viewId} searchQuery={searchQuery} />

      {/* Filter */}
      <FilterDialog
        tableId={tableId}
        viewId={viewId}
        searchQuery={searchQuery}
      />

      {/* Group */}
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <Rows className="h-4 w-4" />
        <span>Group</span>
      </button>

      {/* Sort */}
      <SortDialog tableId={tableId} viewId={viewId} searchQuery={searchQuery} />

      {/* Color */}
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <Palette className="h-4 w-4" />
        <span>Color</span>
      </button>

      {/* Row height / density */}
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <AlignLeft className="h-4 w-4" />
      </button>

      {/* Share and sync */}
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <Share2 className="h-4 w-4" />
        <span>Share and sync</span>
      </button>

      <div className="ml-auto">
        <div className="relative cursor-pointer">
          {/* Magnifying glass icon button */}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label="Open search"
            className="h-4 w-4 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-blackd" fill="currentColor"><use href="/icons/icon_definitions.svg#MagnifyingGlass"></use></svg>
          </button>
          {/* Dropdown with search input */}
          {isOpen && (
            <div className="absolute right-0 mt-3 z-50 w-75 flex flex-col border-1 border-t-0 border-gray-200 ">
              <Search value={searchQuery} onChange={setSearchQuery} />
              <div className="p-2 bg-gray-100">
                <span className="text-gray-500 text-[11px]">Use advanced search options in the </span>
                <div className="flex items-center gap-1">
                  <svg width="18" height="18" viewBox="0 0 16 16" className="text-blackd" fill="blue"><use href="/icons/icon_definitions.svg#ExtensionsFeature"></use></svg>
                  <span className="text-blue-600 text-[11px]"> search extension</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableToolbar;
