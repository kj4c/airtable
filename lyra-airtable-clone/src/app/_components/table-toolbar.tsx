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

const TableToolbar = () => {
  return (
    <div className="flex items-center px-3 py-1 border-b border-gray-200 bg-white space-x-4 text-sm text-gray-700">
      {/* Views Button */}
      <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
        <LayoutList className="w-4 h-4" />
        <span>Views</span>
      </button>

      {/* Divider */}
      <div className="h-5 w-px bg-gray-300" />

      {/* Grid Selector */}
      <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
        <Table className="w-4 h-4 text-blue-600" />
        <span className="text-blue-600">Grid</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
        <Users className="w-4 h-4 text-gray-500 ml-1" />
      </button>

      {/* Hide Fields */}
      <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
        <EyeOff className="w-4 h-4" />
        <span>Hide fields</span>
      </button>

      {/* Filter */}
      <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
        <Filter className="w-4 h-4" />
        <span>Filter</span>
      </button>

      {/* Group */}
      <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
        <Rows className="w-4 h-4" />
        <span>Group</span>
      </button>

      {/* Sort */}
      <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
        <SortAsc className="w-4 h-4" />
        <span>Sort</span>
      </button>

      {/* Color */}
      <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
        <Palette className="w-4 h-4" />
        <span>Color</span>
      </button>

      {/* Row height / density */}
      <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
        <AlignLeft className="w-4 h-4" />
      </button>

      {/* Share and sync */}
      <button className="flex items-center space-x-1 px-2 py-1 hover:bg-gray-100 rounded">
        <Share2 className="w-4 h-4" />
        <span>Share and sync</span>
      </button>
    </div>
  );
};

export default TableToolbar;
