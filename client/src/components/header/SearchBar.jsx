'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../common/Icon';
import PALETTE from '../../constants/palette';
import { searchService } from '../../services/search.service';
import { useStoreData } from '../../providers/StoreProvider';
import VisualSearchModal from './VisualSearchModal';
import SearchCategoryPicker from './search/SearchCategoryPicker';
import SearchTrendingPills from './search/SearchTrendingPills';
import SearchSuggestionsDropdown from './search/SearchSuggestionsDropdown';

const SEARCH_SCOPES = [
  { label: 'Sản phẩm', value: 'products' },
  { label: 'Bài viết', value: 'blogs' },
  { label: 'Thương hiệu', value: 'brands' },
];

export const SearchBar = () => {
  const router = useRouter();
  const { trendingKeywords = [] } = useStoreData();
  const [liveTrending, setLiveTrending] = useState(trendingKeywords);
  const [query, setQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('products');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestData, setSuggestData] = useState({
    prediction: null,
    didYouMean: null,
    isTypo: false,
    suggestedKeywords: [],
    categories: [],
    products: [],
    blogs: [],
    brands: [],
  });
  const [loading, setLoading] = useState(false);
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);

  const containerRef = useRef(null);
  const categoryRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (trendingKeywords && trendingKeywords.length > 0) {
      setLiveTrending(trendingKeywords);
    }
  }, [trendingKeywords]);

  const handleFocus = async () => {
    setIsOpen(true);
    try {
      const fresh = await searchService.getTrending(10, 'all');
      if (Array.isArray(fresh) && fresh.length > 0) {
        setLiveTrending(fresh);
      }
    } catch {
      // Keep existing trending
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setSuggestData({
        prediction: null,
        didYouMean: null,
        isTypo: false,
        suggestedKeywords: [],
        categories: [],
        products: [],
        blogs: [],
        brands: [],
      });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchService.getSuggestions(val);
        setSuggestData({
          prediction: res.prediction || null,
          didYouMean: res.didYouMean || null,
          isTypo: !!res.isTypo,
          suggestedKeywords: res.suggestedKeywords || [],
          categories: res.categories || [],
          products: res.products || [],
          blogs: res.blogs || [],
          brands: res.brands || [],
        });
      } catch (err) {
        console.error('Suggest error:', err);
      } finally {
        setLoading(false);
      }
    }, 180);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    const trimmed = query.trim();
    setIsOpen(false);

    if (selectedScope === 'blogs') {
      router.push(`/blogs?keyword=${encodeURIComponent(trimmed)}`);
    } else if (selectedScope === 'brands') {
      router.push(`/search?q=${encodeURIComponent(trimmed)}&brand=${encodeURIComponent(trimmed.toLowerCase())}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleKeywordClick = (kw) => {
    setQuery(kw);
    setIsOpen(false);
    if (selectedScope === 'blogs') {
      router.push(`/blogs?keyword=${encodeURIComponent(kw)}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(kw)}`);
    }
  };

  const handleKeyDown = (e) => {
    const list = suggestData.suggestedKeywords || [];
    if (!isOpen || list.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && list[activeIndex]) {
      e.preventDefault();
      const text = typeof list[activeIndex] === 'string' ? list[activeIndex] : list[activeIndex].text;
      handleKeywordClick(text);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const hasSuggestions =
    suggestData.suggestedKeywords?.length > 0 ||
    suggestData.products?.length > 0 ||
    suggestData.blogs?.length > 0;

  const getPlaceholder = () => {
    if (selectedScope === 'blogs') return 'Tìm kiếm bài viết...';
    if (selectedScope === 'brands') return 'Tìm kiếm thương hiệu...';
    return 'Tìm kiếm sản phẩm...';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full h-10 border border-slate-300 rounded-full bg-white shadow-xs hover:border-slate-400 focus-within:border-[#284ea1] transition"
      >
        <SearchCategoryPicker
          categories={SEARCH_SCOPES}
          selectedCategory={selectedScope}
          onSelectCategory={(val) => {
            setSelectedScope(val);
            setIsCategoryDropdownOpen(false);
          }}
          isOpen={isCategoryDropdownOpen}
          onToggle={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          containerRef={categoryRef}
        />

        <div className="h-5 w-[1px] bg-slate-200 shrink-0" />

        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          aria-label="Tìm kiếm sản phẩm, tin tức hoặc thương hiệu"
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none min-w-0"
        />

        <button
          type="button"
          onClick={() => setIsVisualModalOpen(true)}
          className="p-1.5 text-slate-400 hover:text-[#284ea1] transition cursor-pointer shrink-0"
          title="Tìm kiếm bằng hình ảnh"
          aria-label="Tìm kiếm bằng hình ảnh"
        >
          <Icon name="camera" size={18} color="#64748b" />
        </button>

        <button
          type="submit"
          aria-label="Thực hiện tìm kiếm"
          className="w-12 sm:w-14 h-full rounded-r-full flex items-center justify-center text-white transition cursor-pointer hover:opacity-90 shrink-0"
          style={{ backgroundColor: PALETTE.primary }}
        >
          {loading ? (
            <Icon name="spinner" size={16} color="#ffffff" />
          ) : (
            <Icon name="search" size={16} color="#ffffff" />
          )}
        </button>
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[6px] shadow-lg border border-slate-200 overflow-hidden z-50 max-h-[75vh] overflow-y-auto animate-fadeIn">
          {!query.trim() && (
            <SearchTrendingPills
              trendingKeywords={liveTrending}
              onKeywordClick={handleKeywordClick}
            />
          )}

          {query.trim() && (
            <SearchSuggestionsDropdown
              query={query}
              selectedScope={selectedScope}
              suggestData={suggestData}
              loading={loading}
              hasSuggestions={hasSuggestions}
              onKeywordClick={handleKeywordClick}
              onClose={() => setIsOpen(false)}
              activeIndex={activeIndex}
            />
          )}
        </div>
      )}

      <VisualSearchModal
        isOpen={isVisualModalOpen}
        onClose={() => setIsVisualModalOpen(false)}
      />
    </div>
  );
};

export default SearchBar;
