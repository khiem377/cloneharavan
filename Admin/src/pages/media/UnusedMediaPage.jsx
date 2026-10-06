import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, RefreshCw, HardDrive, ImageOff, Check, AlertTriangle, ExternalLink } from '@/components/ui/Icons';
import { useUnusedMedia, useMediaStats } from '@/hooks/useMedia';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '@/services/media.service';
import { toast } from '@/providers/ToastProvider';
import DataTablePagination from '@/components/ui/DataTablePagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function StatCard({ label, value, sub, color = 'text-foreground' }) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardContent className="p-4 flex flex-col gap-1">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${color}`}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground font-mono tabular-nums">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function resolveFolderId(folderId) {
  if (!folderId) return null;
  if (typeof folderId === 'string') return folderId;
  if (typeof folderId === 'object') return folderId._id || null;
  return null;
}

export default function UnusedMediaPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 30;
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: unusedData, isLoading, refetch } = useUnusedMedia({ page, limit });
  const { data: stats } = useMediaStats();

  const items = unusedData?.media ?? [];
  const total = unusedData?.total ?? 0;
  const totalPages = unusedData?.totalPages ?? 1;

  const { mutate: deleteBulk, isPending: isDeleting } = useMutation({
    mutationFn: (ids) => mediaService.deleteBulk(ids, true),
    onSuccess: (_, ids) => {
      toast.success(`Đã xóa ${ids.length} ảnh không sử dụng`);
      setSelectedIds(new Set());
      setShowConfirm(false);
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'media' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Xóa thất bại'),
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((m) => m._id))
    );
  };

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const totalUnusedSize = items.reduce((acc, m) => acc + (m.size || 0), 0);

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-5 w-full max-w-6xl mx-auto bg-background text-foreground min-h-full">
      {/* Header */}
      <Card className="rounded-[6px] border border-border shadow-none">
        <CardContent className="p-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <HardDrive size={22} className="text-primary" />
              Dọn kho ảnh
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Danh sách ảnh chưa được sử dụng ở bất kỳ sản phẩm, banner, danh mục hay bài viết nào.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-9 rounded-[6px] text-xs font-medium"
          >
            <RefreshCw size={14} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Tổng ảnh trong kho"
          value={stats?.totalFiles?.toLocaleString() ?? '—'}
          sub={`${formatSize(stats?.totalSize)} tổng dung lượng`}
        />
        <StatCard
          label="Ảnh chưa sử dụng"
          value={total.toLocaleString()}
          sub={total > 0 ? `~${formatSize(totalUnusedSize)} có thể giải phóng` : 'Kho sạch'}
          color={total > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}
        />
        <StatCard label="Ảnh" value={stats?.images?.toLocaleString() ?? '—'} sub="tệp hình ảnh" />
        <StatCard label="Video" value={stats?.videos?.toLocaleString() ?? '—'} sub="tệp video" />
      </div>

      {/* Warning */}
      {total > 0 && (
        <div className="flex items-start gap-3 rounded-[6px] border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            Có <strong>{total}</strong> ảnh chưa sử dụng. Xóa sẽ xóa <strong>vĩnh viễn</strong> trên bộ nhớ Cloud.
            Kiểm tra kỹ trước khi xóa.
          </span>
        </div>
      )}

      {/* Toolbar chon nhieu */}
      {selectedIds.size > 0 && (
        <Card className="rounded-[6px] border border-border bg-muted/40 shadow-none">
          <CardContent className="p-3 flex items-center gap-2">
            <span className="text-xs text-foreground font-medium font-mono tabular-nums">{selectedIds.size} đã chọn</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              className="h-8 px-3 rounded-[6px] text-xs font-medium active:scale-[0.98] transition-transform"
            >
              <Trash2 size={13} className="mr-1" /> Xóa {selectedIds.size} ảnh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="h-8 px-2 text-xs text-muted-foreground ml-auto rounded-[6px]"
            >
              Bỏ chọn
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
            <RefreshCw size={22} className="animate-spin text-primary" />
            <span className="text-sm">Đang quét kho ảnh...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="size-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ImageOff size={26} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Kho ảnh sạch!</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tất cả ảnh đều đang được sử dụng.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-b border-border text-xs">
                    <TableHead className="px-3.5 py-3 w-10">
                      <button
                        className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background transition-colors cursor-pointer ${allSelected ? 'bg-primary border-primary text-primary-foreground' : ''}`}
                        onClick={toggleAll}
                      >
                        {allSelected && <Check size={10} />}
                      </button>
                    </TableHead>
                    <TableHead className="px-3.5 py-3 w-16">Hình</TableHead>
                    <TableHead className="px-3.5 py-3">Tên file</TableHead>
                    <TableHead className="px-3.5 py-3">Thư mục</TableHead>
                    <TableHead className="px-3.5 py-3">Dung lượng</TableHead>
                    <TableHead className="px-3.5 py-3">Ngày upload</TableHead>
                    <TableHead className="px-3.5 py-3 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {items.map((item) => {
                    const isSelected = selectedIds.has(item._id);
                    const isImage = item.mimeType?.startsWith('image/') ||
                      /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(item.filename || '');
                    const folderId = resolveFolderId(item.folderId);
                    const folderName = item.folderId?.name || null;
                    const folderLink = folderId
                      ? `/media?folderId=${folderId}&mediaId=${item._id}`
                      : `/media?mediaId=${item._id}`;

                    return (
                      <TableRow key={item._id} className={isSelected ? 'bg-primary/5' : ''}>
                        <TableCell className="px-3.5 py-3 align-middle">
                          <button
                            className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background transition-colors cursor-pointer ${isSelected ? 'bg-primary border-primary text-primary-foreground' : ''}`}
                            onClick={() => toggleSelect(item._id)}
                          >
                            {isSelected && <Check size={10} />}
                          </button>
                        </TableCell>
                        <TableCell className="px-3.5 py-2.5 align-middle">
                          {isImage ? (
                            <img
                              src={item.url}
                              alt={item.filename}
                              className="h-10 w-14 object-cover rounded-[4px] border border-border bg-muted"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-10 w-14 rounded-[4px] border border-border bg-muted flex items-center justify-center text-[9px] font-mono font-bold text-muted-foreground">
                              {item.filename?.split('.').pop()?.toUpperCase()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-3.5 py-3 align-middle max-w-[200px]">
                          <p className="text-xs font-medium text-foreground truncate">{item.filename}</p>
                        </TableCell>
                        <TableCell className="px-3.5 py-3 align-middle">
                          {folderName ? (
                            <Link
                              to={folderLink}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                              title={`Mở thư mục "${folderName}" trong Media`}
                            >
                              {folderName}
                              <ExternalLink size={10} className="shrink-0 opacity-60" />
                            </Link>
                          ) : (
                            <Link
                              to="/media"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
                              title="Mở thư mục gốc trong Media"
                            >
                              Gốc
                              <ExternalLink size={10} className="shrink-0 opacity-60" />
                            </Link>
                          )}
                        </TableCell>
                        <TableCell className="px-3.5 py-3 align-middle">
                          <span className="text-xs font-mono tabular-nums text-muted-foreground">{formatSize(item.size)}</span>
                        </TableCell>
                        <TableCell className="px-3.5 py-3 align-middle">
                          <span className="text-xs text-muted-foreground font-mono tabular-nums">{formatDate(item.createdAt)}</span>
                        </TableCell>
                        <TableCell className="px-3.5 py-3 align-middle text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => { setSelectedIds(new Set([item._id])); setShowConfirm(true); }}
                            className="h-7 px-2 text-xs rounded-[4px]"
                          >
                            <Trash2 size={12} className="mr-1" /> Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="px-4 py-3 border-t border-border bg-background">
              <DataTablePagination
                page={page} pageSize={limit} total={total} totalPages={totalPages}
                onPageChange={setPage} showPageSize={false}
              />
            </div>
          </>
        )}
      </Card>

      {showConfirm && (
        <ConfirmDialog
          open={showConfirm}
          title="Xóa ảnh không sử dụng"
          description={`Xóa ${selectedIds.size} ảnh? Hành động này xóa vĩnh viễn trên Cloudinary và không thể hoàn tác.`}
          confirmText="Xóa vĩnh viễn"
          variant="danger"
          onConfirm={() => deleteBulk([...selectedIds])}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
