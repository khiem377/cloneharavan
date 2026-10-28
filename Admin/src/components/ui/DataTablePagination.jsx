import React, { useState, useEffect } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

import SearchableSelect from './SearchableSelect';

export default function DataTablePagination({
  page = 1,
  pageSize = 10,
  total,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  showJumpToPage = true,
  className = '',
}) {
  const rawTotal = totalItems !== undefined ? totalItems : (total !== undefined ? total : 0);
  const numPage = typeof page === 'number' && !isNaN(page) ? page : (parseInt(page, 10) || 1);
  const numPageSize = typeof pageSize === 'number' && !isNaN(pageSize) ? pageSize : (parseInt(pageSize, 10) || 10);
  const numTotal = typeof rawTotal === 'number' && !isNaN(rawTotal) ? rawTotal : (parseInt(rawTotal, 10) || 0);
  const effectiveTotalPages = Math.max(1, totalPages || Math.ceil(numTotal / numPageSize) || 1);

  const [jumpInput, setJumpInput] = useState(String(numPage));

  useEffect(() => {
    setJumpInput(String(numPage));
  }, [numPage]);

  if (!numTotal) return null;

  const startItem = numTotal === 0 ? 0 : (numPage - 1) * numPageSize + 1;
  const endItem = Math.min(numPage * numPageSize, numTotal);

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(jumpInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= effectiveTotalPages) {
      onPageChange(parsed);
    } else {
      setJumpInput(String(numPage));
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border mt-4 text-xs text-muted-foreground ${className}`}>
      {/* Left: Summary text */}
      <div className="flex items-center gap-2">
        <span>
          Hiển thị <strong>{startItem}–{endItem}</strong> trong <strong>{numTotal}</strong> bản ghi
        </span>
      </div>

      {/* Right Controls Group (PageSize, JumpToPage, Pagination buttons) */}
      <div className="flex flex-wrap items-center gap-3 ml-auto">
        {/* PageSize dropdown */}
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span>Hiển thị</span>
            <SearchableSelect
              className="w-28"
              options={pageSizeOptions.map((opt) => ({
                label: `${opt} / trang`,
                value: String(opt),
              }))}
              value={String(pageSize)}
              onChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }}
              creatable={false}
              placeholder={`${pageSize} / trang`}
            />
          </div>
        )}

        {/* Jump To Page */}
        {showJumpToPage && effectiveTotalPages > 1 && (
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 border-l border-border pl-3">
            <span>Đến trang:</span>
            <input
              type="number"
              min={1}
              max={effectiveTotalPages}
              className="h-8 w-12 rounded-md border border-input bg-background px-1.5 text-center text-xs font-semibold text-foreground outline-none focus:border-ring"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onBlur={handleJumpSubmit}
            />
            <span>/ {effectiveTotalPages}</span>
          </form>
        )}

        {/* Pagination buttons */}
        {effectiveTotalPages > 1 && (
          <Pagination className="mx-0 w-auto border-l border-border pl-3">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={numPage <= 1}
                  onClick={() => numPage > 1 && onPageChange(numPage - 1)}
                />
              </PaginationItem>

              {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === effectiveTotalPages || Math.abs(p - numPage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && p - arr[idx - 1] > 1 && (
                      <PaginationItem key={`ellipsis-${p}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === numPage}
                        onClick={() => p !== numPage && onPageChange(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))}

              <PaginationItem>
                <PaginationNext
                  disabled={numPage >= effectiveTotalPages}
                  onClick={() => numPage < effectiveTotalPages && onPageChange(numPage + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
