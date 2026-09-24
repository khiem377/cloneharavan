import React from 'react';
import Link from 'next/link';
import Icon from '../../../components/common/Icon';

export default function SearchEmptyState({ query = '', hasFilters = false, onResetFilters }) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-lg border border-gray-200 shadow-xs space-y-4">
      <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
        <Icon name="search" size={24} />
      </div>

      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="text-base font-bold text-gray-900">
          Không tìm thấy sản phẩm phù hợp
        </h3>
        <p className="text-xs text-gray-500">
          {query
            ? `Không có kết quả nào khớp với "${query}". Hãy thử kiểm tra lỗi chính tả hoặc giảm bớt bộ lọc.`
            : 'Vui lòng nhập từ khóa tìm kiếm để khám phá các sản phẩm nổi bật.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {hasFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition"
          >
            <Icon name="rotate-ccw" size={13} />
            <span>Xóa bộ lọc</span>
          </button>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
        >
          <span>Về trang chủ</span>
        </Link>
      </div>

      <div className="pt-4 border-t border-gray-100 max-w-md mx-auto">
        <p className="text-[11px] font-medium text-gray-400 mb-2">
          Gợi ý từ khóa phổ biến:
        </p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {['Tivi', 'Tivi Samsung', 'Tivi Sony', 'Tủ lạnh', 'Máy giặt', 'Máy lạnh'].map((kw) => (
            <Link
              key={kw}
              href={`/search?q=${encodeURIComponent(kw)}`}
              className="px-2.5 py-1 bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 rounded text-xs text-gray-600 transition"
            >
              {kw}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
