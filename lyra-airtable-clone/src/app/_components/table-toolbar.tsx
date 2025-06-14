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

  return (
    <div className="flex items-center space-x-4 border-b border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <LayoutList className="h-4 w-4" />
        <span>Views</span>
      </button>

      <div className="h-5 w-px bg-gray-300" />

      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <Table className="h-4 w-4 text-blue-600" />
        <span className="text-blue-600">{viewName.data ?? "Loading..."}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
        <Users className="ml-1 h-4 w-4 text-gray-500" />
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

      <Search value={searchQuery} onChange={setSearchQuery} />
    </div>
  );
};

export default TableToolbar;
