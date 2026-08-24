import { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
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
import { useDashboardOverview } from '@/hooks/useDashboard';
import { dashboardService } from '@/services/dashboard.service';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 border border-border/80 backdrop-blur-md p-3 rounded-xl shadow-xl text-xs font-medium space-y-1 z-50">
        <p className="text-muted-foreground font-semibold border-b border-border/50 pb-1 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-foreground">{entry.value.toLocaleString('vi-VN')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Data mẫu xu hướng 7 ngày gần nhất
const trendData = [
  { name: 'Thứ 2', views: 420, interactions: 210 },
  { name: 'Thứ 3', views: 680, interactions: 340 },
  { name: 'Thứ 4', views: 510, interactions: 290 },
  { name: 'Thứ 5', views: 890, interactions: 450 },
  { name: 'Thứ 6', views: 1200, interactions: 610 },
  { name: 'Thứ 7', views: 1540, interactions: 820 },
  { name: 'Chủ nhật', views: 1320, interactions: 740 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading: loading, isFetching: refreshing, refetch } = useDashboardOverview();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualRefresh = async () => {
    try {
      await refetch();
      toast.success('Đã cập nhật dữ liệu tổng quan mới nhất');
    } catch (e) {
      toast.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
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

  const {
    stats = {},
    distributions = {},
    categoryDistribution: rootCategoryDist = [],
    recentProducts = [],
    recentBlogPosts = []
  } = data || {};

  const categoryDistribution = distributions?.categoryDistribution || rootCategoryDist || [];

  const stockPieData = [
    { name: 'Đã xuất bản', value: stats.publishedProducts || 0, color: '#10b981' },
    { name: 'Cảnh báo tồn kho', value: stats.lowStockProducts || 0, color: '#f59e0b' },
    { name: 'Hết hàng', value: stats.outOfStockProducts || 0, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  const blogPieData = [
    { name: 'Đã đăng', value: stats.publishedBlogPosts || 0, color: '#6366f1' },
    { name: 'Nháp', value: stats.draftBlogPosts || 0, color: '#94a3b8' },
    { name: 'Chờ duyệt', value: stats.pendingBlogPosts || 0, color: '#eab308' },
  ].filter((item) => item.value > 0);

  const BAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
  const hasItemsWithProducts = (categoryDistribution || []).some((item) => item && item.count > 0);
  const displayCategories = hasItemsWithProducts
    ? (categoryDistribution || []).filter((item) => item && item.count > 0)
    : (categoryDistribution || []);

  const categoryBarData = displayCategories.map((item, idx) => ({
    _id: item._id,
    name: item.name,
    count: item.count || 0,
    percent: item.percent || 0,
    fill: BAR_COLORS[idx % BAR_COLORS.length],
  }));

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Tổng quan hệ thống <SparklesIcon className="size-5 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Thống kê quản lý kho sản phẩm, bài viết blog, thư viện phương tiện & tiếp thị
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Global Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 sm:w-72">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm nhanh SP, Danh mục, Bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {searching && (
                <RefreshCwIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Dropdown Result */}
            {showSearchDropdown && searchResults && (
              <div className="absolute right-0 top-11 w-full sm:w-96 rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl p-3 z-50 max-h-96 overflow-y-auto space-y-3 backdrop-blur-md">
                {searchResults.products?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-muted-foreground px-2 mb-1.5 flex items-center gap-1">
                      <ProductsIcon className="size-3 text-primary" /> Sản phẩm ({searchResults.products.length})
                    </p>
                    {searchResults.products.map((p) => (
                      <Link
                        key={p._id}
                        to={`/products/${p._id}/edit`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-md text-xs transition-colors"
                      >
                        <span className="font-medium text-foreground truncate">{p.name}</span>
                        <span className="text-muted-foreground font-mono text-[11px] shrink-0 ml-2">
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
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium text-foreground transition-colors disabled:opacity-50 cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCwIcon className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
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
          className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-xs font-medium text-foreground shadow-2xs"
        >
          <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <ImageIcon className="size-4" />
          </div>
          <span className="truncate">Quản lý Media</span>
        </Link>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Link to="/products" className="group rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-primary/50 hover:shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sản phẩm & Biến thể</span>
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <ProductsIcon className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">{stats.totalProducts || 0}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRightIcon className="size-3" /> +12%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{stats.publishedProducts || 0} xuất bản</span>
            <span>•</span>
            <span className="text-amber-500 font-medium">{stats.totalVariants || 0} biến thể</span>
          </div>
        </Link>

        {/* Card 2 */}
        <Link to="/categories" className="group rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-emerald-500/50 hover:shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Danh mục & Thương hiệu</span>
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CategoriesIcon className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">{stats.totalCategories || 0}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              {stats.totalBrands || 0} TH
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Cơ cấu nhóm hàng sản phẩm kho
          </div>
        </Link>

        {/* Card 3 */}
        <Link to="/blog/posts" className="group rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-indigo-500/50 hover:shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bài viết Blog</span>
            <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileTextIcon className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">{stats.totalBlogPosts || 0}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.publishedBlogPosts || 0} đã đăng
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{stats.draftBlogPosts || 0} nháp</span>
            <span>•</span>
            <span className="text-amber-500">{stats.pendingBlogPosts || 0} chờ duyệt</span>
          </div>
        </Link>

        {/* Card 4 */}
        <Link to="/media" className="group rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all hover:border-purple-500/50 hover:shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thư viện Media</span>
            <div className="size-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImageIcon className="size-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">{stats.totalMedia || 0}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600">
              {stats.formattedMediaSize || '21.7 MB'}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {stats.totalFolders || 0} thư mục chứa ảnh & tệp
          </div>
        </Link>
      </div>

      {/* Main Row 1: Top Categories Distribution + Stock Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories Distribution */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between">
          <div className="pb-3 border-b border-border/60 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Top Danh Mục Nhiều Sản Phẩm</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Phân bổ sản phẩm thực tế theo nhóm danh mục</p>
            </div>
            <Link to="/categories" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              Tất cả <ChevronRightIcon className="size-3" />
            </Link>
          </div>

          <div className="py-4 space-y-2.5">
            {categoryBarData && categoryBarData.length > 0 ? (
              categoryBarData.map((cat, idx) => (
                <Link
                  key={cat._id || idx}
                  to={cat._id ? `/products?category=${cat._id}` : '/products'}
                  className="group block p-2 rounded-xl hover:bg-muted/50 transition-all cursor-pointer border border-transparent hover:border-border/60"
                  title={`Xem danh sách sản phẩm thuộc danh mục ${cat.name}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {cat.name}
                    </span>
                    <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {cat.count} sản phẩm ({cat.percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                      style={{
                        width: `${Math.max(cat.percent, cat.count > 0 ? 5 : 0)}%`,
                        backgroundColor: cat.fill,
                      }}
                    />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Chưa có dữ liệu danh mục</p>
            )}
          </div>
        </div>

        {/* Donut Chart: Stock Status */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between">
          <div className="pb-3 border-b border-border/60">
            <h2 className="text-base font-bold text-foreground">Trạng thái Kho Hàng</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Tỷ lệ tổng quan hàng tồn & sẵn có</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Total Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-foreground">{stats.totalProducts || 0}</span>
              <span className="text-[11px] font-medium text-muted-foreground">Sản phẩm</span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-center">
            <Link to="/products?status=published" className="p-1 rounded-lg hover:bg-muted/40 transition-colors">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500" /> Công khai
              </div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.publishedProducts || 0}</p>
            </Link>
            <Link to="/products?status=draft" className="p-1 rounded-lg hover:bg-muted/40 transition-colors">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full bg-amber-500" /> Cảnh báo
              </div>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">{stats.lowStockProducts || 0}</p>
            </Link>
            <Link to="/products?status=out_of_stock" className="p-1 rounded-lg hover:bg-muted/40 transition-colors">
              <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full bg-rose-500" /> Hết hàng
              </div>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">{stats.outOfStockProducts || 0}</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Row 2: Recent Products & Recent Blog Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Sản Phẩm Mới Tạo</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Sản phẩm vừa cập nhật vào hệ thống</p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              Tất cả <ChevronRightIcon className="size-3" />
            </Link>
          </div>

          <div className="divide-y divide-border/60 overflow-hidden">
            {recentProducts && recentProducts.length > 0 ? (
              recentProducts.slice(0, 4).map((p) => {
                const prodImg = typeof p.thumbnail === 'string' ? p.thumbnail : (p.thumbnail?.url || '');
                return (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}/edit`}
                    className="group py-3 flex items-center justify-between gap-3 hover:bg-muted/40 px-2.5 rounded-xl transition-all cursor-pointer"
                    title={`Chỉnh sửa sản phẩm ${p.name}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {prodImg ? (
                        <img
                          src={prodImg}
                          alt={p.name}
                          className="size-10 rounded-lg object-cover bg-muted border border-border shrink-0 group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100?text=No+Img';
                          }}
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0 font-bold text-xs group-hover:scale-105 transition-transform">
                          {p.name?.charAt(0) || 'P'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          SKU: <span className="font-mono">{p.sku || 'N/A'}</span> • {p.brandName || p.brand?.name || 'Chưa có hãng'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-bold text-xs text-foreground">
                        {(p.salePrice || p.price)?.toLocaleString('vi-VN')}đ
                      </span>
                      <div
                        className="size-7 rounded-md bg-muted group-hover:bg-accent text-muted-foreground group-hover:text-foreground flex items-center justify-center transition-colors"
                        title="Chỉnh sửa"
                      >
                        <EyeIcon className="size-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Chưa có sản phẩm</p>
            )}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h2 className="text-base font-bold text-foreground">Bài Viết Mới Đăng</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Bài viết tin tức vừa được xuất bản</p>
            </div>
            <Link to="/blog/posts" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
              Tất cả <ChevronRightIcon className="size-3" />
            </Link>
          </div>

          <div className="divide-y divide-border/60 overflow-hidden">
            {recentBlogPosts && recentBlogPosts.length > 0 ? (
              recentBlogPosts.slice(0, 4).map((post) => {
                const blogImg = post.thumbnailUrl || (typeof post.thumbnail === 'string' ? post.thumbnail : (post.thumbnail?.url || ''));
                return (
                  <Link
                    key={post._id}
                    to={`/blog/posts/${post._id}/edit`}
                    className="group py-3 flex items-center justify-between gap-3 hover:bg-muted/40 px-2.5 rounded-xl transition-all cursor-pointer"
                    title={`Chỉnh sửa bài viết ${post.title}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {blogImg ? (
                        <img
                          src={blogImg}
                          alt={post.title}
                          className="size-10 rounded-lg object-cover bg-muted border border-border shrink-0 group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100?text=Blog';
                          }}
                        />
                      ) : (
                        <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                          <FileTextIcon className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{post.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {post.viewsCount || 0} lượt xem • {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                        </p>
                      </div>
                    </div>

                    <div
                      className="size-7 rounded-md bg-muted group-hover:bg-accent text-muted-foreground group-hover:text-foreground flex items-center justify-center transition-colors shrink-0"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="size-3.5" />
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">Chưa có bài viết</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
