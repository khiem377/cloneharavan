'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationFirst,
  PaginationPrevious,
  PaginationNext,
  PaginationLast,
} from '../ui/pagination';

export const BlogPaginationWrapper = ({ currentPage = 1, totalPages = 1 }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber === currentPage) return;
    router.push(createPageURL(pageNumber));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('ellipsis-start');
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('ellipsis-end');
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const pages = getPageNumbers();

  return (
    <div className="py-8 flex justify-center w-full">
      <Pagination>
        <PaginationContent>
          {/* Jump to first page */}
          <PaginationItem>
            <PaginationFirst
              onClick={() => handlePageClick(1)}
              disabled={currentPage <= 1}
            />
          </PaginationItem>

          {/* Previous page */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage <= 1}
            />
          </PaginationItem>

          {/* Page numbers + Ellipsis */}
          {pages.map((p, idx) => {
            if (p === 'ellipsis-start' || p === 'ellipsis-end') {
              return (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={isActive}
                  onClick={() => handlePageClick(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next page */}
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage >= totalPages}
            />
          </PaginationItem>

          {/* Jump to last page */}
          <PaginationItem>
            <PaginationLast
              onClick={() => handlePageClick(totalPages)}
              disabled={currentPage >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default BlogPaginationWrapper;
