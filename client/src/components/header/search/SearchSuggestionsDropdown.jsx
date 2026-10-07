'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../../common/Icon';
import PALETTE from '../../../constants/palette';
import { searchService } from '../../../services/search.service';

export const SearchSuggestionsDropdown = ({
  query,
  selectedScope = 'products',
  suggestData = {},
  loading,
  hasSuggestions,
  onKeywordClick,
  onClose,
  activeIndex = -1,
}) => {
  const isBlogScope = selectedScope === 'blogs';
  const predictionText = suggestData.prediction || '';
  const isTypoCorrection = Boolean(
    suggestData.isTypo ||
    (suggestData.didYouMean && suggestData.didYouMean.toLowerCase() !== (query || '').trim().toLowerCase())
  );
  const hasDistinctPrediction =
    Boolean(predictionText) &&
    predictionText.trim().toLowerCase() !== (query || '').trim().toLowerCase();

  // Chỉ lấy 3-4 từ khóa gợi ý theo yêu cầu
  const keywords = (suggestData.suggestedKeywords || []).slice(0, 4);
  const products = (suggestData.products || []).slice(0, 4);

  return (
    <div className="divide-y divide-slate-100 bg-white">
      {/* 1. Header Typo Correction / "Có thể bạn muốn tìm" (Chuẩn theo video tham khảo) */}
      {hasDistinctPrediction && isTypoCorrection ? (
        <button
          type="button"
          onClick={() => onKeywordClick(predictionText)}
          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition flex items-start gap-3 cursor-pointer group bg-slate-50/50"
        >
          <div className="mt-0.5 shrink-0 text-[#284ea1]">
            <Icon name="search" size={15} color="#284ea1" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-700">
              <span className="text-slate-600">Có thể bạn muốn tìm: </span>
              <strong className="text-[#284ea1] font-semibold group-hover:underline">
                {predictionText}
              </strong>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Thay vì &ldquo;{query}&rdquo;
            </div>
          </div>
          <Icon name="chevron-right" size={12} color="#94a3b8" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onKeywordClick(query)}
          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 cursor-pointer transition"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Icon name="search" size={14} color="#64748b" />
            <span>
              {isBlogScope ? 'Tìm kiếm bài viết: ' : 'Tìm kiếm theo từ khóa: '}
              <strong className="text-[#284ea1] font-semibold">{query}</strong>
            </span>
          </div>
          <Icon name="chevron-right" size={12} color="#94a3b8" />
        </button>
      )}

      {/* 2. GỢI Ý TÌM KIẾM (2-4 từ khóa gọn gàng) */}
      {keywords.length > 0 && (
        <div className="py-2">
          <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            GỢI Ý TÌM KIẾM
          </div>
          <div className="space-y-0.5">
            {keywords.map((item, idx) => {
              const itemText = typeof item === 'string' ? item : item.text;
              const isSelected = activeIndex === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onKeywordClick(itemText)}
                  className={`w-full text-left px-4 py-2 flex items-center justify-between transition cursor-pointer text-xs ${
                    isSelected ? 'bg-blue-50 text-[#284ea1]' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      name="search"
                      size={13}
                      color={isSelected ? '#284ea1' : '#94a3b8'}
                    />
                    <div className="truncate">
                      <div className="font-medium truncate">{itemText}</div>
                    </div>
                  </div>
                  <Icon
                    name="arrow-up-right"
                    size={12}
                    color={isSelected ? '#284ea1' : '#cbd5e1'}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SẢN PHẨM GỢI Ý */}
      {!isBlogScope && products.length > 0 && (
        <div className="p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            SẢN PHẨM GỢI Ý
          </div>
          <div className="space-y-1.5">
            {products.map((prod) => {
              const thumb =
                prod.thumbnail?.url ||
                prod.thumbnail ||
                prod.images?.[0]?.url ||
                '/placeholder.png';
              const isFs = Boolean(prod.isFlashSale || (prod.flashSalePrice && prod.flashSalePrice > 0));
              const price = isFs && prod.flashSalePrice ? prod.flashSalePrice : (prod.salePrice || prod.price || 0);
              const originalPrice = isFs && prod.flashSaleOriginalPrice ? prod.flashSaleOriginalPrice : (prod.salePrice ? prod.price : 0);
              const discountPercent =
                originalPrice > price
                  ? Math.round(((originalPrice - price) / originalPrice) * 100)
                  : 0;

              return (
                <Link
                  key={prod._id}
                  href={`/products/${prod.slug || prod._id}`}
                  onClick={() => {
                    searchService.recordClick(query, prod._id);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2 rounded-[6px] hover:bg-slate-50 transition group"
                >
                  <img
                    src={thumb}
                    alt={prod.name}
                    className="w-11 h-11 object-contain rounded-[4px] border border-slate-100 bg-white shrink-0 p-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#284ea1] transition">
                      {prod.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {price > 0 ? (
                        <span className="text-xs font-bold text-red-600 font-mono tabular-nums">
                          {price.toLocaleString('vi-VN')} đ
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Liên hệ</span>
                      )}
                      {originalPrice > price && (
                        <span className="text-[11px] text-slate-400 line-through font-mono tabular-nums">
                          {originalPrice.toLocaleString('vi-VN')} đ
                        </span>
                      )}
                      {discountPercent > 0 && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded-[3px]">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Blog Scope results */}
      {isBlogScope && suggestData.blogs?.length > 0 && (
        <div className="p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            BÀI VIẾT GỢI Ý
          </div>
          <div className="space-y-1.5">
            {suggestData.blogs.slice(0, 3).map((blog) => {
              const thumb =
                blog.thumbnail?.url ||
                blog.thumbnailUrl ||
                (typeof blog.thumbnail === 'string' ? blog.thumbnail : null) ||
                '/placeholder.png';
              return (
                <Link
                  key={blog._id || blog.slug}
                  href={`/blogs/${blog.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-[6px] hover:bg-slate-50 transition group"
                >
                  <img
                    src={thumb}
                    alt={blog.title}
                    className="w-14 h-10 object-cover rounded-[4px] bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-[#284ea1] transition">
                      {blog.title}
                    </p>
                    {blog.excerpt && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Footer button */}
      {hasSuggestions && (
        <button
          type="button"
          onClick={() => onKeywordClick(predictionText || query)}
          className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#284ea1] transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Xem tất cả kết quả cho &ldquo;{predictionText || query}&rdquo;</span>
          <Icon name="chevron-right" size={13} color={PALETTE.primary} />
        </button>
      )}

      {!hasSuggestions && !loading && (
        <div className="py-8 text-center text-xs text-slate-500">
          Không tìm thấy gợi ý nào cho &ldquo;<span className="font-semibold text-slate-700">{query}</span>&rdquo;
        </div>
      )}
    </div>
  );
};

export default SearchSuggestionsDropdown;
