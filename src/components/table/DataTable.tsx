import React from "react";
import { Loader2, LucideIcon } from "lucide-react";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
}

export interface TableConfig {
  columns: TableColumn[];
  data: any[];
  keyExtractor?: (row: any, index: number) => string | number;
  onRowClick?: (row: any) => void;
  emptyStateIcon?: LucideIcon;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
}

const SkeletonRow = ({ columns }: { columns: TableColumn[] }) => (
  <tr>
    {columns.map((col) => (
      <td key={col.key} className="px-5 py-4">
        <div className="flex animate-pulse space-x-4">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
        </div>
      </td>
    ))}
  </tr>
);

const DataTable: React.FC<TableConfig> = ({
  columns,
  data,
  keyExtractor = (_, idx) => idx,
  onRowClick,
  emptyStateIcon: EmptyIcon,
  emptyStateTitle = "No data found",
  emptyStateDescription = "No records available",
  loading = false,
  striped = true,
  hoverable = true,
  bordered = true,
}) => {
  if (loading) {
    return (
      <div
        className={`bg-white rounded-xl ${bordered ? "border border-gray-100" : ""} overflow-x-auto`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead
              className={`${bordered ? "border-b border-gray-100" : ""} bg-gray-50`}
            >
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.width || ""}`}
                  >
                    <div className="flex items-center gap-2 animate-pulse">
                      <div className="h-3 w-20 rounded bg-gray-200"></div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body with Skeleton Rows */}
            <tbody className={`${bordered ? "divide-y divide-gray-50" : ""}`}>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <SkeletonRow key={rowIndex} columns={columns} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl ${bordered ? "border border-gray-100" : ""} overflow-x-auto`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead
            className={`${bordered ? "border-b border-gray-100" : ""} bg-gray-50`}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.width || ""}`}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && (
                      <svg
                        className="w-4 h-4 cursor-pointer hover:text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4"
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className={`${bordered ? "divide-y divide-gray-50" : ""}`}>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  {EmptyIcon && (
                    <EmptyIcon className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  )}
                  <p className="text-gray-400 text-base font-medium">
                    {emptyStateTitle}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    {emptyStateDescription}
                  </p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row, rowIndex)}
                  onClick={() => onRowClick?.(row)}
                  className={`${hoverable ? "hover:bg-gray-50 transition-colors cursor-pointer" : ""} ${striped && rowIndex % 2 === 0 ? "bg-gray-50" : ""}`}
                >
                  {columns.map((col) => (
                    <td
                      key={`${col.key}-${rowIndex}`}
                      className={`px-5 py-4 whitespace-nowrap ${col.width || ""}`}
                    >
                      {col.render ? (
                        col.render(row[col.key], row, rowIndex)
                      ) : (
                        <span className="text-sm text-gray-900">
                          {row[col.key] ?? "—"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
