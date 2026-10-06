import React from 'react';
import Link from 'next/link';
import Icon from '../../../components/common/Icon';
import { Button } from '@/components/ui/button';

export default function SearchEmptyState({ query = '', hasFilters = false, onResetFilters }) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-[6px] border border-gray-200 shadow-xs space-y-4">
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
            : hasFilters
            ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại. Vui lòng thử nới lỏng hoặc xóa bớt bộ lọc.'
            : 'Vui lòng nhập từ khóa tìm kiếm để khám phá các sản phẩm nổi bật.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {hasFilters && (
          <Button
            variant="default"
            size="sm"
            onClick={onResetFilters}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs gap-1.5 h-8"
          >
            <Icon name="rotate-ccw" size={13} />
            <span>Xóa bộ lọc</span>
          </Button>
        )}

        <Link href="/">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs font-semibold h-8"
          >
            Về trang chủ
          </Button>
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
              className="px-2.5 py-1 bg-gray-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 rounded-[4px] text-xs text-gray-600 transition"
            >
              {kw}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
