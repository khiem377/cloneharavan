'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../../common/Icon';
import PALETTE from '../../../constants/palette';
import { searchService } from '../../../services/search.service';

export const SearchSuggestionsDropdown = ({
  query,
  selectedScope = 'products',
  suggestData,
  loading,
  hasSuggestions,
  onKeywordClick,
  onClose,
}) => {
  const isBlogScope = selectedScope === 'blogs';

  return (
    <div>
      <button
        type="button"
        onClick={() => onKeywordClick(query)}
        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-700 cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <Icon name="search" size={14} color="#64748b" />
          <span>
            {isBlogScope ? 'Tìm kiếm bài viết: ' : 'Có thể bạn muốn tìm: '}
            <strong className="text-[#284ea1]">{query}</strong>
          </span>
        </div>
        <Icon name="chevron-right" size={12} color="#94a3b8" />
      </button>

      {/* When scope is BLOGS: Show blog suggestions */}
      {isBlogScope && (
        <>
          {suggestData.blogs?.length > 0 ? (
            <div className="p-3 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                BÀI VIẾT GỢI Ý
              </div>
              <div className="space-y-1.5">
                {suggestData.blogs.map((blog) => {
                  const thumb =
                    blog.thumbnail?.url ||
                    blog.thumbnailUrl ||
                    (typeof blog.thumbnail === 'string' ? blog.thumbnail : null) ||
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80';
                  return (
                    <Link
                      key={blog._id || blog.slug}
                      href={`/blogs/${blog.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50/40 transition group"
                    >
                      <img
                        src={thumb}
                        alt={blog.title}
                        className="w-14 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
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
          ) : !loading ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Không tìm thấy bài viết nào cho &ldquo;<span className="font-semibold text-slate-700">{query}</span>&rdquo;
            </div>
          ) : null}
        </>
      )}

      {/* When scope is PRODUCTS or others: Show category & product suggestions */}
      {!isBlogScope && (
        <>
          {suggestData.categories?.length > 0 && (
            <div className="p-3 border-b border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                GỢI Ý TÌM KIẾM
              </div>
              <div className="space-y-1">
                {suggestData.categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/collections/${cat.slug || cat._id}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 transition"
                  >
                    <Icon name="search" size={13} color="#94a3b8" />
                    <span className="font-medium text-slate-800">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {suggestData.products?.length > 0 && (
            <div className="p-3 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                SẢN PHẨM GỢI Ý
              </div>
              <div className="space-y-1.5">
                {suggestData.products.map((prod) => {
                  const thumb =
                    prod.thumbnail?.url ||
                    prod.thumbnail ||
                    prod.images?.[0]?.url ||
                    '/placeholder.png';
                  const price = prod.salePrice || prod.price || 0;
                  const originalPrice = prod.salePrice ? prod.price : 0;
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
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50/50 transition group"
                    >
                      <img
                        src={thumb}
                        alt={prod.name}
                        className="w-12 h-12 object-contain rounded-lg border border-slate-100 bg-white shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#284ea1] transition">
                          {prod.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {price > 0 ? (
                            <span className="text-xs font-bold text-red-600">
                              {price.toLocaleString('vi-VN')} đ
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Liên hệ</span>
                          )}
                          {originalPrice > price && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {originalPrice.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                          {discountPercent > 0 && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 py-0.2 rounded">
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
        </>
      )}

      {hasSuggestions && (
        <button
          type="button"
          onClick={() => onKeywordClick(query)}
          className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 text-xs font-semibold text-[#284ea1] transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Xem tất cả kết quả cho &ldquo;{query}&rdquo;</span>
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
