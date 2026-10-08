import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  DashProductIcon,
  DashUserIcon,
  DashBlogIcon,
  DashMediaIcon,
} from '@/components/ui/Icons';

function StatCard({ label, value, sub, growth, Icon, to }) {
  const isUp = growth >= 0;

  const content = (
    <div className="border border-border bg-card rounded-[6px] p-4 flex items-center justify-between gap-3.5 hover:border-foreground/25 hover:shadow-2xs transition-all duration-150 cursor-pointer active:scale-[0.98] group">
      {/* Left Content Area: Label, Metric Number, Subtitle/Growth */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono truncate">
          {label}
        </span>

        <div>
          <div className="text-2xl font-bold text-foreground tracking-tight font-mono tabular-nums leading-none">
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : (value ?? 0)}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            {growth !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-[4px] border shrink-0 ${
                  isUp
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}
              >
                {isUp ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
                {Math.abs(growth)}%
              </span>
            )}
            {sub && <span className="text-[11px] text-muted-foreground truncate leading-tight font-normal">{sub}</span>}
          </div>
        </div>
      </div>

      {/* Right Content Area: Elegant Monochromatic Custom SVG Icon Container */}
      <div className="size-11 rounded-[6px] bg-secondary/80 border border-border text-foreground/80 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-foreground group-hover:border-foreground/20 transition-all duration-150">
        <Icon
          size={24}
          className="transition-transform duration-150 group-hover:scale-105 pointer-events-none"
        />
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

function StatCardSkeleton() {
  return <div className="animate-pulse bg-muted rounded-[6px] h-28" />;
}

export default function DashboardKpiCards({ stats = {}, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        label="Tổng sản phẩm"
        value={stats.totalProducts}
        sub={`${stats.publishedProducts || 0} đang bán • ${stats.totalVariants || 0} biến thể`}
        growth={stats.productGrowth}
        Icon={DashProductIcon}
        to="/products"
      />
      <StatCard
        label="Khách hàng"
        value={stats.totalCustomers}
        sub={`${stats.newCustomers || 0} mới trong kỳ`}
        growth={stats.customerGrowth}
        Icon={DashUserIcon}
        to="/customers"
      />
      <StatCard
        label="Bài viết Tin tức"
        value={stats.totalBlogPosts}
        sub={`${stats.publishedBlogPosts || 0} đã đăng • ${stats.draftBlogPosts || 0} nháp`}
        growth={stats.blogGrowth}
        Icon={DashBlogIcon}
        to="/blog/posts"
      />
      <StatCard
        label="Tài nguyên Media"
        value={stats.totalMedia}
        sub={`${stats.formattedMediaSize || '—'} • ${stats.totalFolders || 0} thư mục`}
        Icon={DashMediaIcon}
        to="/media"
      />
    </div>
  );
}
