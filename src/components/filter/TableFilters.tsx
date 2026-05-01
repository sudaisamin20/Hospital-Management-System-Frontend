import React from "react";
import { Search, X } from "lucide-react";

export interface FilterConfig {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    id: string;
    label: string;
    type: "text" | "select" | "date";
    value?: string;
    onChange?: (value: string) => void;
    options?: Array<{ label: string; value: string }>;
  }>;
  onClearAll?: () => void;
  showClearButton?: boolean;
}

const TableFilters: React.FC<FilterConfig> = ({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  onClearAll,
  showClearButton = true,
}) => {
  // Check if any filter has an active value (excluding "All")
  const hasActiveFilters =
    (searchValue && searchValue.trim() !== "") ||
    filters.some((f) => f.value && f.value !== "" && f.value !== "All");

  return (
    <div className="space-y-3 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search Input */}
        <div
          className={`relative ${filters.length < 3 ? "md:col-span-2" : ""}`}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="text-sm w-full pl-8 pr-2 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
          />
        </div>

        {/* Dynamic Filters */}
        {filters.map((filter) => (
          <div key={filter.id}>
            {filter.type === "select" ? (
              <select
                value={filter.value || ""}
                onChange={(e) => filter.onChange?.(e.target.value)}
                className="text-sm w-full p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
              >
                <option value="">{filter.label}</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : filter.type === "date" ? (
              <input
                type="date"
                value={filter.value || ""}
                onChange={(e) => filter.onChange?.(e.target.value)}
                className="text-sm w-full p-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
              />
            ) : (
              <input
                type="text"
                placeholder={filter.label}
                value={filter.value || ""}
                onChange={(e) => filter.onChange?.(e.target.value)}
                className="text-sm w-full p-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
              />
            )}
          </div>
        ))}
      </div>

      {/* Clear Filters Button - Only shows when filters are active */}
      {showClearButton && hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="text-sm cursor-pointer text-blue-600 hover:text-blue-800 transition-colors font-medium flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default TableFilters;
