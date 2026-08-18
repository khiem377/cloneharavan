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

export default function DataTablePagination({
  page = 1,
  pageSize = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  showJumpToPage = true,
  className = '',
}) {
  const [jumpInput, setJumpInput] = useState(String(page));

  useEffect(() => {
    setJumpInput(String(page));
  }, [page]);

  if (!total) return null;

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(jumpInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      onPageChange(parsed);
    } else {
      setJumpInput(String(page));
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border mt-4 text-xs text-muted-foreground ${className}`}>
      {/* Left: Summary text */}
      <div className="flex items-center gap-2">
        <span>
          Hiển thị <strong>{startItem}–{endItem}</strong> trong <strong>{total}</strong> bản ghi
        </span>
      </div>

      {/* Right Controls Group (PageSize, JumpToPage, Pagination buttons) */}
      <div className="flex flex-wrap items-center gap-3 ml-auto">
        {/* PageSize dropdown */}
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span>Hiển thị</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-ring cursor-pointer"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Jump To Page */}
        {showJumpToPage && totalPages > 1 && (
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 border-l border-border pl-3">
            <span>Đến trang:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="h-8 w-12 rounded-md border border-input bg-background px-1.5 text-center text-xs font-semibold text-foreground outline-none focus:border-ring"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              onBlur={handleJumpSubmit}
            />
            <span>/ {totalPages}</span>
          </form>
        )}

        {/* Pagination buttons */}
        {totalPages > 1 && (
          <Pagination className="mx-0 w-auto border-l border-border pl-3">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={page <= 1}
                  onClick={() => page > 1 && onPageChange(page - 1)}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && p - arr[idx - 1] > 1 && (
                      <PaginationItem key={`ellipsis-${p}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === page}
                        onClick={() => p !== page && onPageChange(p)}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))}

              <PaginationItem>
                <PaginationNext
                  disabled={page >= totalPages}
                  onClick={() => page < totalPages && onPageChange(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
