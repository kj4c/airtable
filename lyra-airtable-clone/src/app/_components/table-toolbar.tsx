import {
  LayoutList,
  Table,
  EyeOff,
  Filter,
  Rows,
  SortAsc,
  Palette,
  AlignLeft,
  Share2,
  ChevronDown,
  Users,
} from "lucide-react";
import SortDialog from "~/components/ui/sort-dialog";

const TableToolbar = () => {
  return (
    <div className="flex items-center space-x-4 border-b border-gray-200 bg-white px-3 py-1 text-sm text-gray-700">
      {/* Views Button */}
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <LayoutList className="h-4 w-4" />
        <span>Views</span>
      </button>

      {/* Divider */}
      <div className="h-5 w-px bg-gray-300" />

      {/* Grid Selector */}
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <Table className="h-4 w-4 text-blue-600" />
        <span className="text-blue-600">Grid</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
        <Users className="ml-1 h-4 w-4 text-gray-500" />
      </button>

      {/* Hide Fields */}
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <EyeOff className="h-4 w-4" />
        <span>Hide fields</span>
      </button>

      {/* Filter */}
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <Filter className="h-4 w-4" />
        <span>Filter</span>
      </button>

      {/* Group */}
      <button className="flex items-center space-x-1 rounded px-2 py-1 hover:bg-gray-100">
        <Rows className="h-4 w-4" />
        <span>Group</span>
      </button>

      {/* Sort */}
      <SortDialog />


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
    </div>
  );
};

export default TableToolbar;
