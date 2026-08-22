import { useState, useEffect, useRef } from 'react';
import {
  ProductsIcon,
  CategoriesIcon,
  BrandsIcon,
  UsersIcon,
  ImageIcon,
  SparklesIcon,
  SearchIcon,
  RefreshCwIcon,
  PlusIcon,
  ChevronRightIcon,
  LayersIcon,
  ArrowUpRightIcon,
  FileTextIcon,
  ZapIcon,
  TagIcon,
  GiftIcon,
  EyeIcon,
} from '@/components/ui/Icons';
import { dashboardService } from '@/services/dashboard.service';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const searchContainerRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await dashboardService.getOverview();
      setData(res.data.data);
      if (isManualRefresh) {
        toast.success('Đã cập nhật dữ liệu tổng quan mới nhất');
      }
    } catch (e) {
      console.error(e);
      toast.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await dashboardService.searchGlobal(searchQuery);
        setSearchResults(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading && !data) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <RefreshCwIcon className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu tổng quan hệ thống...</p>
      </div>
    );
  }

  const { stats, distributions, recentProducts, recentBlogPosts } = data || {};

  return (
    <div className="p-3 sm:p-6 max-w-full overflow-x-hidden space-y-6">
      {/* Header & Global Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Tổng quan hệ thống <SparklesIcon className="size-5 text-amber-500" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Thống kê quản lý kho sản phẩm, bài viết blog, thư viện phương tiện & tiếp thị
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Search Component */}
          <div ref={searchContainerRef} className="relative flex-1 sm:w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-8 h-9 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
              placeholder="Tìm nhanh SP, Danh mục, Bài viết..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
            />
            {searching && (
              <RefreshCwIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
            )}

            {showSearchDropdown && searchResults && (
              <div className="absolute top-full left-0 right-0 z-40 mt-1 max-h-96 overflow-y-auto rounded-xl border border-border bg-popover shadow-xl p-2 space-y-3">
                {searchResults.products?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-muted-foreground px-2 mb-1.5 flex items-center gap-1">
                      <ProductsIcon className="size-3 text-blue-500" /> Sản phẩm
                    </p>
                    {searchResults.products.map((p) => (
                      <Link
                        key={p._id}
                        to={`/products/${p._id}/edit`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-accent rounded-md text-xs transition-colors"
                      >
                        {p.thumbnail?.url ? (
                          <img src={p.thumbnail.url} alt="" className="size-7 object-cover rounded border border-border shrink-0" />
                        ) : (
                          <div className="size-7 rounded bg-muted flex items-center justify-center shrink-0">
                            <ProductsIcon className="size-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-foreground truncate flex-1">{p.name}</span>
                        <span className="font-mono text-muted-foreground font-medium">
                          {(p.salePrice || p.price)?.toLocaleString('vi-VN')}đ
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.categories?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-muted-foreground px-2 mb-1.5 flex items-center gap-1">
                      <CategoriesIcon className="size-3 text-emerald-500" /> Danh mục
                    </p>
                    {searchResults.categories.map((c) => (
                      <Link
                        key={c._id}
                        to="/categories"
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-md text-xs transition-colors font-medium text-foreground"
                      >
                        <span>{c.name}</span>
                        <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.brands?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-muted-foreground px-2 mb-1.5 flex items-center gap-1">
                      <BrandsIcon className="size-3 text-purple-500" /> Thương hiệu
                    </p>
                    {searchResults.brands.map((b) => (
                      <Link
                        key={b._id}
                        to="/brands"
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-md text-xs transition-colors font-medium text-foreground"
                      >
                        <span>{b.name}</span>
                        <ChevronRightIcon className="size-3.5 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.blogPosts?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-muted-foreground px-2 mb-1.5 flex items-center gap-1">
                      <FileTextIcon className="size-3 text-indigo-500" /> Bài viết Blog
                    </p>
                    {searchResults.blogPosts.map((post) => (
                      <Link
                        key={post._id}
                        to={`/blog/posts/${post._id}/edit`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-md text-xs transition-colors font-medium text-foreground"
                      >
                        <span className="truncate flex-1">{post.title}</span>
                        <ChevronRightIcon className="size-3.5 text-muted-foreground shrink-0 ml-2" />
                      </Link>
                    ))}
                  </div>
                )}

                {!searchResults.products?.length &&
                  !searchResults.categories?.length &&
                  !searchResults.brands?.length &&
                  !searchResults.blogPosts?.length && (
                    <p className="text-xs text-center text-muted-foreground py-4">Không tìm thấy kết quả phù hợp</p>
                  )}
              </div>
            )}
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-foreground transition-colors disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCwIcon className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        <Link
          to="/products/new"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-medium text-foreground shadow-2xs"
        >
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <PlusIcon className="size-4" />
          </div>
          <span className="truncate">Thêm SP mới</span>
        </Link>

        <Link
          to="/promotions/flash-sales"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-xs font-medium text-foreground shadow-2xs"
        >
          <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <ZapIcon className="size-4" />
          </div>
          <span className="truncate">Tạo Flash Sale</span>
        </Link>

        <Link
          to="/promotions/coupons"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-xs font-medium text-foreground shadow-2xs"
        >
          <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <TagIcon className="size-4" />
          </div>
          <span className="truncate">Tạo Mã Giảm Giá</span>
        </Link>

        <Link
          to="/blog/posts/new"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-xs font-medium text-foreground shadow-2xs"
        >
          <div className="size-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <FileTextIcon className="size-4" />
          </div>
          <span className="truncate">Viết bài Blog</span>
        </Link>

        <Link
          to="/media"
          className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-xs font-medium text-foreground shadow-2xs col-span-2 sm:col-span-1"
        >
          <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <ImageIcon className="size-4" />
          </div>
          <span className="truncate">Quản lý Media</span>
        </Link>
      </div>

      {/* Main Metric Cards Grid (6 Clean Cards -> Clickable Page Links) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Sản phẩm & Biến thể -> /products */}
        <div
          onClick={() => navigate('/products')}
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              Sản Phẩm & Biến Thể
            </span>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <ProductsIcon className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold font-mono text-foreground">
                {stats?.totalProducts || 0}
              </h2>
              <span className="inline-flex items-center text-xs font-semibold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-md">
                <LayersIcon className="size-3 mr-1" />
                {stats?.totalVariants || 0} biến thể
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>{stats?.publishedProducts || 0} xuất bản • {stats?.outOfStockProducts || 0} hết hàng</span>
              <ChevronRightIcon className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Card 2: Danh mục -> /categories */}
        <div
          onClick={() => navigate('/categories')}
          className="p-4 rounded-xl border border-border bg-card hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-emerald-600 transition-colors">
              Danh Mục Sản Phẩm
            </span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CategoriesIcon className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold font-mono text-foreground">
                {stats?.totalCategories || 0}
              </h2>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Danh mục kho
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Phân loại nhóm hàng hóa trong kho</span>
              <ChevronRightIcon className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Card 3: Thương hiệu -> /brands */}
        <div
          onClick={() => navigate('/brands')}
          className="p-4 rounded-xl border border-border bg-card hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-purple-600 transition-colors">
              Thương Hiệu
            </span>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <BrandsIcon className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold font-mono text-foreground">
                {stats?.totalBrands || 0}
              </h2>
              <span className="inline-flex items-center text-xs font-semibold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-md">
                Thương hiệu
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Nhãn hàng hợp tác phân phối</span>
              <ChevronRightIcon className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Card 4: Blog -> /blog/posts */}
        <div
          onClick={() => navigate('/blog/posts')}
          className="p-4 rounded-xl border border-border bg-card hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-indigo-600 transition-colors">
              Bài Viết Blog
            </span>
            <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <FileTextIcon className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold font-mono text-foreground">
                {stats?.totalBlogPosts || 0}
              </h2>
              <span className="inline-flex items-center text-xs font-semibold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                {stats?.publishedBlogPosts || 0} đã đăng
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>{stats?.draftBlogPosts || 0} nháp • {stats?.pendingBlogPosts || 0} chờ duyệt</span>
              <ChevronRightIcon className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Card 5: Media & Dung lượng -> /media */}
        <div
          onClick={() => navigate('/media')}
          className="p-4 rounded-xl border border-border bg-card hover:border-cyan-500/50 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-cyan-600 transition-colors">
              Thư Viện Media
            </span>
            <div className="size-8 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <ImageIcon className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold font-mono text-foreground">
                {stats?.totalMedia || 0} <span className="text-xs font-sans font-normal text-muted-foreground">tệp media</span>
              </h2>
              <span className="inline-flex items-center text-xs font-semibold text-cyan-600 bg-cyan-500/10 px-2 py-0.5 rounded-md font-mono">
                {stats?.formattedMediaSize || '0 B'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>{stats?.totalFolders || 0} thư mục • {stats?.formattedMediaSize || '0 B'} tổng kích thước ảnh</span>
              <ChevronRightIcon className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Card 6: Users -> /settings */}
        <div
          onClick={() => navigate('/settings')}
          className="p-4 rounded-xl border border-border bg-card hover:border-pink-500/50 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-pink-600 transition-colors">
              Khách Hàng & Hệ Thống
            </span>
            <div className="size-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
              <UsersIcon className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold font-mono text-foreground">
                {stats?.totalCustomers || 0}
              </h2>
              <span className="inline-flex items-center text-xs font-semibold text-pink-600 bg-pink-500/10 px-2 py-0.5 rounded-md">
                {stats?.totalStaff || 1} nhân sự
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Tài khoản người dùng đăng ký</span>
              <ChevronRightIcon className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>
      </div>

      {/* Database Distributions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Product Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Cơ cấu Sản Phẩm theo Danh Mục</h3>
              <p className="text-xs text-muted-foreground">Phân bổ số lượng sản phẩm trong kho hàng</p>
            </div>
            <Link to="/categories" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Quản lý danh mục <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {distributions?.categoryDistribution?.length > 0 ? (
              distributions.categoryDistribution.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{cat.name}</span>
                    <span className="font-mono text-muted-foreground">
                      {cat.count} sản phẩm ({cat.percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.max(cat.percent, 3)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-center py-6 text-muted-foreground">Chưa có dữ liệu danh mục</p>
            )}
          </div>
        </div>

        {/* Product Status Overview */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Trạng Thái Kho Hàng</h3>
            <p className="text-xs text-muted-foreground">Tổng quan tình trạng tồn kho & hiển thị</p>
          </div>

          <div className="space-y-3 my-auto">
            <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500" /> Đã xuất bản
              </span>
              <span className="font-mono text-xs font-bold text-emerald-600">
                {stats?.publishedProducts || 0} SP
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-500" /> Cảnh báo tồn kho (≤ 5)
              </span>
              <span className="font-mono text-xs font-bold text-amber-600">
                {stats?.lowStockProducts || 0} SP
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-red-500" /> Hết hàng (0)
              </span>
              <span className="font-mono text-xs font-bold text-red-600">
                {stats?.outOfStockProducts || 0} SP
              </span>
            </div>
          </div>

          <Link
            to="/products"
            className="w-full py-2 text-center rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-foreground transition-colors inline-block"
          >
            Đi tới Danh sách sản phẩm
          </Link>
        </div>
      </div>

      {/* Two Column Tables: Recently Added Products & Latest Blog Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Products */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Sản Phẩm Mới Tạo</h3>
              <p className="text-xs text-muted-foreground">Sản phẩm gần đây vừa thêm vào kho</p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Tất cả <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentProducts?.length > 0 ? (
              recentProducts.map((prod) => (
                <div
                  key={prod._id}
                  onClick={() => navigate(`/products/${prod._id}/edit`)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {prod.thumbnail ? (
                      <img src={prod.thumbnail} alt="" className="size-9 object-cover rounded-md border border-border shrink-0" />
                    ) : (
                      <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <ProductsIcon className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-foreground truncate">{prod.name}</p>
                      <p className="text-[11px] text-muted-foreground">{prod.categoryName}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-semibold text-foreground">{prod.price?.toLocaleString('vi-VN')}đ</p>
                    <span className="text-[10px] font-mono text-muted-foreground">Tồn: {prod.stock}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-center py-6 text-muted-foreground">Chưa có sản phẩm nào</p>
            )}
          </div>
        </div>

        {/* Latest Blog Posts */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Bài Viết Mới</h3>
              <p className="text-xs text-muted-foreground">Bài viết blog gần đây trong hệ thống</p>
            </div>
            <Link to="/blog/posts" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Tất cả bài viết <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentBlogPosts?.length > 0 ? (
              recentBlogPosts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => navigate(`/blog/posts/${post._id}/edit`)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {post.thumbnailUrl ? (
                      <img src={post.thumbnailUrl} alt="" className="size-9 object-cover rounded-md border border-border shrink-0" />
                    ) : (
                      <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <FileTextIcon className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-foreground truncate">{post.title}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span className="flex items-center gap-1"><EyeIcon className="size-3" /> {post.viewsCount} lượt xem</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      post.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : post.status === 'draft'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {post.status === 'published' ? 'Đã xuất bản' : post.status === 'draft' ? 'Nháp' : 'Chờ duyệt'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-center py-6 text-muted-foreground">Chưa có bài viết nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Marketing Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/promotions/flash-sales"
          className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <ZapIcon className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Flash Sale</h4>
              <p className="text-[11px] text-muted-foreground">
                {stats?.activeFlashSales || 0} chương trình đang diễn ra (Tổng {stats?.totalFlashSales || 0})
              </p>
            </div>
          </div>
          <ChevronRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/promotions/coupons"
          className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center">
              <TagIcon className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Mã Giảm Giá (Coupons)</h4>
              <p className="text-[11px] text-muted-foreground">
                {stats?.activeCoupons || 0} mã đang hiệu lực (Tổng {stats?.totalCoupons || 0})
              </p>
            </div>
          </div>
          <ChevronRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          to="/promotions/gifts"
          className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <GiftIcon className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Quà Tặng Đơn Hàng</h4>
              <p className="text-[11px] text-muted-foreground">
                {stats?.activeGiftPrograms || 0} chương trình đang bật (Tổng {stats?.totalGiftPrograms || 0})
              </p>
            </div>
          </div>
          <ChevronRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
