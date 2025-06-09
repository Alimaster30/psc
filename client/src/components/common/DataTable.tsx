import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Define column type for the new interface
interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  mobileLabel?: string;
}

// Define data table props for the new interface
interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  sortField?: string | null;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T) => string | number;
}

// Legacy interface for backward compatibility
interface LegacyColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  width?: string;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface LegacyDataTableProps<T> {
  columns: LegacyColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

// Main DataTable component with new interface
function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  onSort,
  sortField,
  sortDirection = 'asc',
  onRowClick,
  keyExtractor = (item: any) => item.id || item._id || Math.random().toString(),
}: DataTableProps<T>) {
  const [internalSortField, setInternalSortField] = useState<string | null>(null);
  const [internalSortDirection, setInternalSortDirection] = useState<'asc' | 'desc'>('asc');

  const currentSortField = sortField !== undefined ? sortField : internalSortField;
  const currentSortDirection = sortDirection !== undefined ? sortDirection : internalSortDirection;

  const handleSort = (field: string) => {
    if (!columns.find(col => col.key === field)?.sortable) return;

    const newDirection = currentSortField === field && currentSortDirection === 'asc' ? 'desc' : 'asc';

    if (onSort) {
      onSort(field, newDirection);
    } else {
      setInternalSortField(field);
      setInternalSortDirection(newDirection);
    }
  };

  // Sort data if no external sorting is provided
  const sortedData = onSort ? data : [...data].sort((a, b) => {
    if (!currentSortField) return 0;

    const column = columns.find(col => col.key === currentSortField);
    if (!column) return 0;

    // For sorting, we need to extract comparable values
    // This is a simplified approach - in practice, you might want more sophisticated sorting
    const aValue = String(column.render(a)).toLowerCase();
    const bValue = String(column.render(b)).toLowerCase();

    const comparison = aValue.localeCompare(bValue);
    return currentSortDirection === 'asc' ? comparison : -comparison;
  });

  // Render loading skeleton
  if (isLoading) {
    return (
      <>
        <style>{`
          @media (max-width: 767px) {
            .desktop-table-view {
              display: none !important;
            }
            .mobile-card-view {
              display: block !important;
            }
          }

          @media (min-width: 768px) {
            .desktop-table-view {
              display: block !important;
            }
            .mobile-card-view {
              display: none !important;
            }
          }
        `}</style>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Desktop Loading */}
          <div className="desktop-table-view">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        </div>

          {/* Mobile Loading */}
          <div className="mobile-card-view" style={{ padding: '1rem' }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              {columns
                .filter(column => !column.hideOnMobile)
                .map((_, colIndex) => (
                  <div key={colIndex} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                    <Skeleton width={80} height={16} />
                    <Skeleton width={120} height={16} />
                  </div>
                ))}
            </div>
          ))}
          </div>
        </div>
      </>
    );
  }

  // Render empty state
  if (sortedData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          {emptyIcon}
          <p className="text-gray-500 dark:text-gray-400 mt-4">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .desktop-table-view {
            display: none !important;
          }
          .mobile-card-view {
            display: block !important;
          }
        }

        @media (min-width: 768px) {
          .desktop-table-view {
            display: block !important;
          }
          .mobile-card-view {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Desktop Table View - Hidden on mobile (< 768px) */}
      <div
        style={{
          display: 'block'
        }}
        className="desktop-table-view"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {column.sortable ? (
                      <button
                        className="flex items-center focus:outline-none group"
                        onClick={() => handleSort(column.key)}
                      >
                        <span>{column.label}</span>
                        <div className="ml-1 flex flex-col">
                          <svg
                            className={`w-3 h-3 ${currentSortField === column.key && currentSortDirection === 'asc'
                              ? 'text-primary-500'
                              : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                          </svg>
                          <svg
                            className={`w-3 h-3 -mt-1 ${currentSortField === column.key && currentSortDirection === 'desc'
                              ? 'text-primary-500'
                              : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.map((item) => (
                <motion.tr
                  key={keyExtractor(item)}
                  className={onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                  onClick={() => onRowClick && onRowClick(item)}
                  whileHover={{ backgroundColor: onRowClick ? 'rgba(0, 0, 0, 0.05)' : 'transparent' }}
                >
                  {columns.map((column, index) => (
                    <td key={index} className="px-6 py-4 whitespace-nowrap">
                      {column.render(item)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Visible only on mobile (< 768px) */}
      <div className="block md:hidden space-y-4 p-4">
        {sortedData.map((item) => (
          <motion.div
            key={keyExtractor(item)}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${onRowClick ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''}`}
            onClick={() => onRowClick && onRowClick(item)}
            whileHover={{ scale: onRowClick ? 1.01 : 1 }}
            whileTap={{ scale: onRowClick ? 0.98 : 1 }}
            transition={{ duration: 0.15 }}
          >
            {columns
              .filter(column => !column.hideOnMobile)
              .map((column, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-start py-3 ${
                    index < columns.filter(col => !col.hideOnMobile).length - 1
                      ? 'border-b border-gray-100 dark:border-gray-600'
                      : ''
                  }`}
                >
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0 mr-4 min-w-[80px]">
                    {column.mobileLabel || column.label}:
                  </span>
                  <span className="text-base text-gray-900 dark:text-gray-100 text-right flex-1 font-medium">
                    {column.render(item)}
                  </span>
                </div>
              ))}
          </motion.div>
        ))}
      </div>
      </div>
    </>
  );
}

export default DataTable;
