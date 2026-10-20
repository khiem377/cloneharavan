import {
  Edit,
  Trash2,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';

const CLIENT_STORE_URL =
  import.meta.env.VITE_STORE_FRONTEND_URL ||
  import.meta.env.VITE_CLIENT_URL ||
  'http://localhost:3000';

const STATUS_CONFIG = {
  published: {
    label: 'Đã đăng',
    variant: 'default',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15',
    dotClass: 'bg-emerald-500',
  },
  pending_review: {
    label: 'Chờ duyệt',
    variant: 'secondary',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15',
    dotClass: 'bg-amber-500',
  },
  draft: {
    label: 'Bản nháp',
    variant: 'outline',
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
    dotClass: 'bg-muted-foreground',
  },
  archived: {
    label: 'Lưu trữ',
    variant: 'destructive',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/15',
    dotClass: 'bg-rose-500',
  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
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
  loading = false,
  onToggleSelect,
  onToggleAll,
  onEdit,
  onDelete,
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
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onToggleAll}
                  aria-label="Chọn tất cả bài viết"
                />
              </div>
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
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skel-${i}`}>
                <TableCell className="w-10 text-center">
                  <Skeleton className="size-4 mx-auto" />
                </TableCell>
                {isColumnVisible('post') && (
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-[4px]" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-48" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                    </div>
                  </TableCell>
                )}
                {isColumnVisible('categories') && (
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                )}
                {isColumnVisible('author') && (
                  <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                )}
                {isColumnVisible('status') && (
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                )}
                {isColumnVisible('views') && (
                  <TableCell className="text-right"><Skeleton className="h-3.5 w-12 ml-auto" /></TableCell>
                )}
                {isColumnVisible('publishedAt') && (
                  <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                )}
                {isColumnVisible('actions') && (
                  <TableCell className="text-right"><Skeleton className="h-7 w-20 ml-auto" /></TableCell>
                )}
              </TableRow>
            ))
          ) : posts.length === 0 ? (
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
                  <TableCell className="w-10 px-3 py-2 text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(post._id)}
                        aria-label={`Chọn bài viết ${post.title}`}
                      />
                    </div>
                  </TableCell>

                  {isColumnVisible('post') && (
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <MediaThumbnailHover media={mediaObj}>
                          {post.thumbnailUrl ? (
                            <img
                              src={post.thumbnailUrl}
                              alt={post.title}
                              className="size-10 rounded-[4px] object-cover border border-border bg-muted shrink-0"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="size-10 rounded-[4px] bg-secondary border border-border flex items-center justify-center text-muted-foreground shrink-0">
                              <FileText className="size-4" />
                            </div>
                          )}
                        </MediaThumbnailHover>

                        <div className="flex flex-col min-w-0 max-w-sm">
                          <span
                            className="font-semibold text-xs text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                            onClick={() => onEdit(post)}
                          >
                            {post.title}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground font-mono truncate">
                              /{post.slug}
                            </span>
                            {post.isPinned && (
                              <Badge variant="outline" className="text-[10px] font-bold font-mono text-amber-600 bg-amber-500/10 border-amber-500/20 px-1 py-0 gap-0.5">
                                <Pin className="size-2.5" /> Ghim
                              </Badge>
                            )}
                            {post.isFeatured && (
                              <Badge variant="outline" className="text-[10px] font-bold font-mono text-purple-600 bg-purple-500/10 border-purple-500/20 px-1 py-0 gap-0.5">
                                <Star className="size-2.5" /> Nổi bật
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {isColumnVisible('categories') && (
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {post.categories?.length > 0 ? (
                          post.categories.map((c) => (
                            <Badge
                              key={c._id || c}
                              variant="secondary"
                              className="px-1.5 py-0 text-[10px] font-medium font-mono truncate"
                            >
                              {c.name || c}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground font-mono text-xs">—</span>
                        )}
                      </div>
                    </TableCell>
                  )}

                  {isColumnVisible('author') && (
                    <TableCell className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {post.authorId?.fullName || post.authorName || 'Ban biên tập'}
                    </TableCell>
                  )}

                  {isColumnVisible('status') && (
                    <TableCell className="px-3 py-2">
                      <Badge
                        variant="outline"
                        className={`gap-1.5 px-2 py-0.5 text-[11px] font-medium ${statusCfg.className}`}
                      >
                        <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                  )}

                  {isColumnVisible('views') && (
                    <TableCell className="px-3 py-2 text-right font-mono tabular-nums text-xs text-foreground font-semibold">
                      {(post.viewsCount || 0).toLocaleString('vi-VN')}
                    </TableCell>
                  )}

                  {isColumnVisible('publishedAt') && (
                    <TableCell className="px-3 py-2 font-mono text-xs text-muted-foreground tabular-nums">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </TableCell>
                  )}

                  {isColumnVisible('actions') && (
                    <TableCell className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xem trên trang người dùng"
                          onClick={() => window.open(`${CLIENT_STORE_URL}/blog/${post.slug}`, '_blank')}
                          className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Chỉnh sửa bài viết"
                          onClick={() => onEdit(post)}
                          className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
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
