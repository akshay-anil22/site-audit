import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

export default function CustomPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className = '',
}) {
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handleFirstPage = () => onPageChange?.(1)
  const handlePrevPage = () => onPageChange?.(Math.max(1, currentPage - 1))
  const handleNextPage = () => onPageChange?.(Math.min(totalPages, currentPage + 1))
  const handleLastPage = () => onPageChange?.(totalPages)

  const rowsPerPageSelect = showPageSize ? (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-[#71717A] whitespace-nowrap">
        Rows per page:
      </span>
      <div className="relative">
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange?.(Number(e.target.value))
            onPageChange?.(1)
          }}
          className="appearance-none h-9 w-[78px] pl-3 pr-7 text-sm font-medium text-[#09090B] bg-white border border-[#E4E4E7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#09090B] cursor-pointer hover:bg-[#F4F4F5] transition-colors"
        >
          {pageSizeOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[#71717A]">
          <ChevronUpDownIcon className="w-4 h-4" />
        </div>
      </div>
    </div>
  ) : null

  const navigationControls = (
    <div className="flex items-center gap-4 sm:gap-2">
      <button
        type="button"
        onClick={handleFirstPage}
        disabled={currentPage === 1}
        className="p-1.5 rounded hover:bg-[#F4F4F5] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="First page"
      >
        <ChevronDoubleLeftIcon className="w-4 h-4 text-[#09090B]" />
      </button>
      <button
        type="button"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className="p-1.5 rounded hover:bg-[#F4F4F5] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-4 h-4 text-[#09090B]" />
      </button>
      <span className="text-sm font-semibold text-[#09090B] px-2 whitespace-nowrap">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={handleNextPage}
        disabled={currentPage >= totalPages}
        className="p-1.5 rounded hover:bg-[#F4F4F5] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-4 h-4 text-[#09090B]" />
      </button>
      <button
        type="button"
        onClick={handleLastPage}
        disabled={currentPage >= totalPages}
        className="p-1.5 rounded hover:bg-[#F4F4F5] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Last page"
      >
        <ChevronDoubleRightIcon className="w-4 h-4 text-[#09090B]" />
      </button>
    </div>
  )

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${className}`}>
      <div className="text-sm font-medium text-[#71717A] whitespace-nowrap">
        Showing {startItem} - {endItem} of {totalItems} {totalItems === 1 ? 'issue' : 'Issues'}
      </div>

      {/* Mobile View */}
      <div className="flex flex-col sm:hidden gap-2">
        {rowsPerPageSelect}
        <div className="flex items-center justify-center">
          {navigationControls}
        </div>
      </div>

      {/* Desktop View */}
      <div className={`hidden sm:flex items-center ${showPageSize ? 'gap-1' : ''}`}>
        {rowsPerPageSelect}
        {navigationControls}
      </div>
    </div>
  )
}