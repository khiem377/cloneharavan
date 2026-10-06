import {
  Edit,
  Trash2,
  Eye,
  Check,
  Pin,
  Star,
  ExternalLink,
  FileText,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import { Button } from '@/components/ui/button';

const CLIENT_STORE_URL =
  import.meta.env.VITE_STORE_FRONTEND_URL ||
  import.meta.env.VITE_CLIENT_URL ||
  'http://localhost:3000';

const STATUS_CONFIG = {
  published: {
    label: 'Đã đăng',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dotClass: 'bg-emerald-500',
  },
  pending_review: {
    label: 'Chờ duyệt',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    dotClass: 'bg-amber-500',
  },
  draft: {
    label: 'Bản nháp',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    dotClass: 'bg-muted-foreground',
  },
  archived: {
    label: 'Lưu trữ',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    dotClass: 'bg-rose-500',
  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

export default function BlogPostTable({
  posts = [],
  selected = [],
  onToggleSelect,
  onToggleAll,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleFeature,
  isColumnVisible,
  highlightId,
  rowRefs,
  mediaMap = {},
}) {
  const isAllSelected = posts.length > 0 && selected.length === posts.length;

  return (
    <div className="rounded-[6px] border border-border bg-card overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/40 hover:bg-secondary/40">
            <TableHead className="w-10 text-center">
              <button
                type="button"
                className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background mx-auto transition-colors cursor-pointer ${
                  isAllSelected ? 'bg-primary border-primary text-primary-foreground' : ''
                }`}
                onClick={onToggleAll}
              >
                {isAllSelected && <Check className="size-3" />}
              </button>
            </TableHead>
            {isColumnVisible('post') && <TableHead>Bài viết</TableHead>}
            {isColumnVisible('categories') && <TableHead>Danh mục</TableHead>}
            {isColumnVisible('author') && <TableHead>Tác giả</TableHead>}
            {isColumnVisible('status') && <TableHead>Trạng thái</TableHead>}
            {isColumnVisible('views') && <TableHead className="text-right">Lượt xem</TableHead>}
            {isColumnVisible('publishedAt') && <TableHead>Ngày đăng</TableHead>}
            {isColumnVisible('actions') && <TableHead className="text-right w-28">Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground font-mono">
                Không tìm thấy bài viết nào phù hợp
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => {
              const isSelected = selected.includes(post._id);
              const isHighlighted = post._id === highlightId;
              const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
              const mediaObj = post.thumbnailMediaId ? mediaMap[post.thumbnailMediaId] : null;

              return (
                <TableRow
                  key={post._id}
                  ref={(el) => {
                    if (rowRefs && rowRefs.current) rowRefs.current[post._id] = el;
                  }}
                  className={`transition-colors hover:bg-muted/40 ${
                    isSelected || isHighlighted ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''
                  }`}
                >
                  {/* Select */}
                  <TableCell className="w-10 px-3 py-2 text-center">
                    <button
                      type="button"
                      className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background mx-auto transition-colors cursor-pointer ${
                        isSelected ? 'bg-primary border-primary text-primary-foreground' : ''
                      }`}
                      onClick={() => onToggleSelect(post._id)}
                    >
                      {isSelected && <Check className="size-3" />}
                    </button>
                  </TableCell>

                  {/* Post Info */}
                  {isColumnVisible('post') && (
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <MediaThumbnailHover media={mediaObj}>
                          {post.thumbnailUrl ? (
                            <img
                              src={post.thumbnailUrl}
                              alt={post.title}
                              className="size-10 rounded-[4px] object-cover border border-border bg-muted shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="size-10 rounded-[4px] bg-secondary border border-border flex items-center justify-center text-muted-foreground shrink-0">
                              <FileText className="size-4" />
                            </div>
                          )}
                        </MediaThumbnailHover>

                        <div className="flex flex-col min-w-0 max-w-sm">
                          <span className="font-semibold text-xs text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer" onClick={() => onEdit(post)}>
                            {post.title}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground font-mono truncate">
                              /{post.slug}
                            </span>
                            {post.isPinned && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold font-mono text-amber-600 bg-amber-500/10 border border-amber-500/20 px-1 rounded-[3px]">
                                <Pin className="size-2.5" /> Ghim
                              </span>
                            )}
                            {post.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold font-mono text-purple-600 bg-purple-500/10 border border-purple-500/20 px-1 rounded-[3px]">
                                <Star className="size-2.5" /> Nổi bật
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {/* Categories */}
                  {isColumnVisible('categories') && (
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {post.categories?.length > 0 ? (
                          post.categories.map((c) => (
                            <span
                              key={c._id || c}
                              className="inline-block px-1.5 py-0.2 rounded-[4px] bg-secondary border border-border text-[10px] font-medium text-foreground truncate"
                            >
                              {c.name || c}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground font-mono text-xs">—</span>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {/* Author */}
                  {isColumnVisible('author') && (
                    <TableCell className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {post.authorId?.fullName || post.authorName || 'Ban biên tập'}
                    </TableCell>
                  )}

                  {/* Status */}
                  {isColumnVisible('status') && (
                    <TableCell className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[11px] font-medium border ${statusCfg.badgeClass}`}
                      >
                        <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
                        {statusCfg.label}
                      </span>
                    </TableCell>
                  )}

                  {/* Views */}
                  {isColumnVisible('views') && (
                    <TableCell className="px-3 py-2 text-right font-mono tabular-nums text-xs text-foreground font-semibold">
                      {(post.viewsCount || 0).toLocaleString('vi-VN')}
                    </TableCell>
                  )}

                  {/* PublishedAt */}
                  {isColumnVisible('publishedAt') && (
                    <TableCell className="px-3 py-2 font-mono text-xs text-muted-foreground tabular-nums">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </TableCell>
                  )}

                  {/* Actions */}
                  {isColumnVisible('actions') && (
                    <TableCell className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Xem trên trang người dùng"
                          onClick={() => window.open(`${CLIENT_STORE_URL}/blog/${post.slug}`, '_blank')}
                          className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Chỉnh sửa bài viết"
                          onClick={() => onEdit(post)}
                          className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Xóa bài viết"
                          onClick={() => onDelete(post)}
                          className="size-7 rounded-[4px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
