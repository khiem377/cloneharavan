import { Link } from 'react-router-dom';
import { ChevronRightIcon, FileTextIcon } from '@/components/ui/Icons';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

export default function DashboardRecentBlogPosts({ recentBlogPosts = [] }) {
  return (
    <div className="border border-border bg-card rounded-[6px] p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Bài viết tin tức mới đăng</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Nội dung tin tức & bài viết công nghệ</p>
        </div>
        <Link
          to="/blog/posts"
          className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium font-mono"
        >
          Tất cả <ChevronRightIcon className="size-3" />
        </Link>
      </div>
      <div className="divide-y divide-border/60">
        {recentBlogPosts.length > 0 ? (
          recentBlogPosts.slice(0, 4).map((post) => {
            const img =
              post.thumbnailUrl ||
              (typeof post.thumbnail === 'string' ? post.thumbnail : post.thumbnail?.url || '');
            return (
              <Link
                key={post._id}
                to={`/blog/posts/${post._id}/edit`}
                className="group py-2 flex items-center gap-3 hover:bg-accent/40 px-1 rounded-[4px] transition-colors"
              >
                {img ? (
                  <img
                    src={img}
                    alt={post.title}
                    className="w-12 h-9 rounded-[4px] object-cover border border-border shrink-0 bg-muted"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-9 rounded-[4px] bg-secondary border border-border shrink-0 flex items-center justify-center">
                    <FileTextIcon className="size-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {post.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    {post.viewsCount || 0} lượt xem
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded-[4px] border ${
                      post.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {post.status === 'published' ? 'Đã đăng' : 'Nháp'}
                  </span>
                  <p className="text-[10px] text-muted-foreground font-mono tabular-nums mt-0.5">
                    {formatDate(post.publishedAt || post.createdAt)}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8 font-mono">Chưa có bài viết</p>
        )}
      </div>
    </div>
  );
}
