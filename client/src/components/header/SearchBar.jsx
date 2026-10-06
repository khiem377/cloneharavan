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
  const [suggestData, setSuggestData] = useState({ categories: [], products: [], blogs: [], brands: [] });
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

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setSuggestData({ categories: [], products: [], blogs: [], brands: [] });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchService.getSuggestions(val);
        setSuggestData({
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
    }, 250);
  };

  const saveRecentSearch = (kw) => {
    if (!kw || typeof window === 'undefined') return;
    try {
      const clean = kw.trim();
      if (!clean) return;
      const stored = localStorage.getItem('shop_recent_searches');
      const list = stored ? JSON.parse(stored) : [];
      const filtered = [clean, ...list.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      localStorage.setItem('shop_recent_searches', JSON.stringify(filtered));
    } catch {
      // Ignore
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const trimmed = query.trim();
    saveRecentSearch(trimmed);
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
    saveRecentSearch(kw);
    setQuery(kw);
    setIsOpen(false);
    if (selectedScope === 'blogs') {
      router.push(`/blogs?keyword=${encodeURIComponent(kw)}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(kw)}`);
    }
  };

  const hasSuggestions =
    suggestData.categories?.length > 0 ||
    suggestData.products?.length > 0 ||
    suggestData.blogs?.length > 0;

  const getPlaceholder = () => {
    if (selectedScope === 'blogs') return 'Tìm theo bài viết, tin tức...';
    if (selectedScope === 'brands') return 'Tìm theo thương hiệu (Samsung, Sony...)...';
    return 'Tìm theo tên sản phẩm...';
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
          placeholder={getPlaceholder()}
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none min-w-0"
        />

        <button
          type="button"
          onClick={() => setIsVisualModalOpen(true)}
          className="p-1.5 text-slate-400 hover:text-[#284ea1] transition cursor-pointer shrink-0"
          title="Tìm kiếm bằng hình ảnh"
        >
          <Icon name="camera" size={18} color="#64748b" />
        </button>

        <button
          type="submit"
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
