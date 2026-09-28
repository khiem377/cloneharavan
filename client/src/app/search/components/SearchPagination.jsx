import React from 'react';
import Link from 'next/link';
import Icon from '@/components/common/Icon';

export default function SearchPagination({ pagination, buildUrl }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const safeBuildUrl = buildUrl || (({ page }) => `?page=${page}`);
  const { page, totalPages } = pagination;
  const currentPage = Number(page) || 1;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return { pages, hasStartEllipsis: start > 1, hasEndEllipsis: end < totalPages };
  };

  const { pages, hasStartEllipsis, hasEndEllipsis } = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 pt-6 pb-2">
      {currentPage > 1 && (
        <Link
          href={safeBuildUrl({ page: currentPage - 1 })}
          className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:border-red-600 hover:text-red-600 transition"
          aria-label="Trang trước"
        >
          <Icon name="chevron-left" size={14} />
        </Link>
      )}

      {hasStartEllipsis && (
        <>
          <Link
            href={safeBuildUrl({ page: 1 })}
            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 hover:border-red-600 hover:text-red-600 transition"
          >
            1
          </Link>
          <span className="w-5 text-center text-gray-400 text-xs">...</span>
        </>
      )}

      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <Link
            key={p}
            href={safeBuildUrl({ page: p })}
            className={`w-8 h-8 rounded flex items-center justify-center text-xs transition ${
              isActive
                ? 'bg-red-600 text-white font-bold border border-red-600'
                : 'border border-gray-200 text-gray-700 hover:border-red-600 hover:text-red-600 font-medium'
            }`}
          >
            {p}
          </Link>
        );
      })}

      {hasEndEllipsis && (
        <>
          <span className="w-5 text-center text-gray-400 text-xs">...</span>
          <Link
            href={safeBuildUrl({ page: totalPages })}
            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 hover:border-red-600 hover:text-red-600 transition"
          >
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link
          href={safeBuildUrl({ page: currentPage + 1 })}
          className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-600 hover:border-red-600 hover:text-red-600 transition"
          aria-label="Trang sau"
        >
          <Icon name="chevron-right" size={14} />
        </Link>
      )}
    </div>
  );
}
