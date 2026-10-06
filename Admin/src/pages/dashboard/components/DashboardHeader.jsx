import { useState, useEffect, useRef } from 'react';
import { SearchIcon, RefreshCwIcon, PlusIcon, ChevronRightIcon } from '@/components/ui/Icons';
import { dashboardService } from '@/services/dashboard.service';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DashboardHeader({ period, setPeriod, onRefresh, isFetching }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await dashboardService.searchGlobal(searchQuery);
        setSearchResults(res.data.data);
      } catch {
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Tổng quan Kinh doanh</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold font-mono">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            HỆ THỐNG TRỰC TUYẾN
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Trung tâm điều hành và phân tích số liệu thời gian thực
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Period Selector */}
        <div className="flex items-center border border-border bg-secondary/50 rounded-[6px] p-0.5 gap-0.5">
          {[
            { v: '7days', l: '7 Ngày' },
            { v: '30days', l: '30 Ngày' },
            { v: '90days', l: '90 Ngày' },
            { v: '6months', l: '6 Tháng' },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setPeriod(opt.v)}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold font-mono transition-colors active:scale-[0.98] cursor-pointer ${
                period === opt.v
                  ? 'bg-background text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>

        {/* Global Search */}
        <div ref={searchContainerRef} className="relative w-full sm:w-60">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm nhanh SP, bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full h-8 pl-8 pr-8 rounded-[6px] border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors font-sans"
          />
          {searching && (
            <RefreshCwIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-muted-foreground" />
          )}

          {showSearchDropdown && searchResults && (
            <div className="absolute top-10 left-0 w-80 rounded-[6px] border border-border bg-popover text-popover-foreground shadow-md z-50 max-h-80 overflow-y-auto divide-y divide-border">
              {searchResults.products?.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground font-mono px-1 mb-1">
                    Sản phẩm ({searchResults.products.length})
                  </p>
                  {searchResults.products.map((p) => (
                    <Link
                      key={p._id}
                      to={`/products/${p._id}/edit`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-[4px] text-xs gap-2 transition-colors"
                    >
                      <span className="font-medium truncate">{p.name}</span>
                      <span className="text-muted-foreground font-mono tabular-nums shrink-0">
                        {(p.salePrice || p.price)?.toLocaleString('vi-VN')}đ
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.blogPosts?.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground font-mono px-1 mb-1">
                    Bài viết ({searchResults.blogPosts.length})
                  </p>
                  {searchResults.blogPosts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/blog/posts/${post._id}/edit`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-[4px] text-xs gap-2 transition-colors"
                    >
                      <span className="font-medium truncate">{post.title}</span>
                      <ChevronRightIcon className="size-3 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
              {!searchResults.products?.length && !searchResults.blogPosts?.length && (
                <p className="text-xs text-muted-foreground text-center py-4 font-mono">Không tìm thấy kết quả</p>
              )}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-8 px-3 rounded-[6px] gap-1.5 font-semibold text-xs active:scale-[0.98]"
        >
          <RefreshCwIcon className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </Button>

        {/* Primary Action Button */}
        <Button
          size="sm"
          onClick={() => navigate('/products/new')}
          className="h-8 px-3.5 rounded-[6px] gap-1.5 text-xs font-semibold shadow-2xs active:scale-[0.98]"
        >
          <PlusIcon className="size-3.5" />
          <span>Thêm sản phẩm</span>
        </Button>
      </div>
    </div>
  );
}
