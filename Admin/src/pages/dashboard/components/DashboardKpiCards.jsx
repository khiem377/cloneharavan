import { Link } from 'react-router-dom';
import {
  ProductsIcon,
  UsersIcon,
  FileTextIcon,
  ImageIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
} from '@/components/ui/Icons';
import { Card } from '@/components/ui/card';

function StatCard({ label, value, sub, growth, icon: Icon, to }) {
  const isUp = growth >= 0;
  const content = (
    <div className="relative overflow-hidden border border-border bg-card rounded-[6px] p-4 flex flex-col justify-between gap-3 hover:border-foreground/30 transition-all cursor-pointer active:scale-[0.98] group shadow-2xs">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          {label}
        </span>
        <div className="size-8 rounded-[6px] border border-border bg-secondary/70 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
          <Icon className="size-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold text-foreground tracking-tight font-mono tabular-nums">
          {typeof value === 'number' ? value.toLocaleString('vi-VN') : (value ?? 0)}
        </div>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {growth !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold font-mono px-1.5 py-0.2 rounded-[4px] border ${
                isUp
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              {isUp ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
              {Math.abs(growth)}%
            </span>
          )}
          {sub && <span className="text-[11px] text-muted-foreground truncate">{sub}</span>}
        </div>
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
        icon={ProductsIcon}
        to="/products"
      />
      <StatCard
        label="Khách hàng"
        value={stats.totalCustomers}
        sub={`${stats.newCustomers || 0} mới trong kỳ`}
        growth={stats.customerGrowth}
        icon={UsersIcon}
        to="/customers"
      />
      <StatCard
        label="Bài viết Tin tức"
        value={stats.totalBlogPosts}
        sub={`${stats.publishedBlogPosts || 0} đã đăng • ${stats.draftBlogPosts || 0} nháp`}
        growth={stats.blogGrowth}
        icon={FileTextIcon}
        to="/blog/posts"
      />
      <StatCard
        label="Tài nguyên Media"
        value={stats.totalMedia}
        sub={`${stats.formattedMediaSize || '—'} • ${stats.totalFolders || 0} thư mục`}
        icon={ImageIcon}
        to="/media"
      />
    </div>
  );
}
