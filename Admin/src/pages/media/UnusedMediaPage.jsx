import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, RefreshCw, HardDrive, ImageOff, Check, AlertTriangle, ExternalLink } from '@/components/ui/Icons';
import { useUnusedMedia, useMediaStats } from '@/hooks/useMedia';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '@/services/media.service';
import { toast } from '@/providers/ToastProvider';
import DataTablePagination from '@/components/ui/DataTablePagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1 shadow-2xs">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// Resolve folder ID cho link — folderId co the la string, ObjectId, hoac populated object
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
    mutationFn: (ids) => mediaService.deleteBulk(ids, true), // force=true
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
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HardDrive size={22} className="text-muted-foreground" />
            Dọn kho ảnh
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Danh sách ảnh chưa được sử dụng ở bất kỳ sản phẩm, banner, danh mục hay bài viết nào.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

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
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            Có <strong>{total}</strong> ảnh chưa sử dụng. Xóa sẽ xóa <strong>vĩnh viễn</strong>.
            Kiểm tra kỹ trước khi xóa.
          </span>
        </div>
      )}

      {/* Toolbar chon nhieu */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <span className="text-sm text-foreground font-medium">{selectedIds.size} đã chọn</span>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={13} /> Xóa {selectedIds.size} ảnh
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-auto"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
            <RefreshCw size={22} className="animate-spin" />
            <span className="text-sm">Đang quét kho ảnh...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <ImageOff size={28} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Kho ảnh sạch!</p>
              <p className="text-sm text-muted-foreground mt-1">Tất cả ảnh đều đang được sử dụng.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    <th className="px-3.5 py-3 w-10">
                      <button
                        className={`flex size-4 items-center justify-center rounded border border-input bg-background transition-colors cursor-pointer ${allSelected ? 'bg-primary border-primary text-primary-foreground' : ''}`}
                        onClick={toggleAll}
                      >
                        {allSelected && <Check size={10} />}
                      </button>
                    </th>
                    <th className="px-3.5 py-3 w-16">Hình</th>
                    <th className="px-3.5 py-3">Tên file</th>
                    <th className="px-3.5 py-3">Thư mục</th>
                    <th className="px-3.5 py-3">Dung lượng</th>
                    <th className="px-3.5 py-3">Ngày upload</th>
                    <th className="px-3.5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
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
                      <tr key={item._id} className={`hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                        <td className="px-3.5 py-3 align-middle">
                          <button
                            className={`flex size-4 items-center justify-center rounded border border-input bg-background transition-colors cursor-pointer ${isSelected ? 'bg-primary border-primary text-primary-foreground' : ''}`}
                            onClick={() => toggleSelect(item._id)}
                          >
                            {isSelected && <Check size={10} />}
                          </button>
                        </td>
                        <td className="px-3.5 py-2.5 align-middle">
                          {isImage ? (
                            <img
                              src={item.url}
                              alt={item.filename}
                              className="h-10 w-14 object-cover rounded-md border border-border bg-muted"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-10 w-14 rounded-md border border-border bg-muted flex items-center justify-center text-[9px] font-mono font-bold text-muted-foreground">
                              {item.filename?.split('.').pop()?.toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="px-3.5 py-3 align-middle max-w-[200px]">
                          <p className="text-xs font-medium text-foreground truncate">{item.filename}</p>
                        </td>
                        <td className="px-3.5 py-3 align-middle">
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
                        </td>
                        <td className="px-3.5 py-3 align-middle">
                          <span className="text-xs font-mono text-muted-foreground">{formatSize(item.size)}</span>
                        </td>
                        <td className="px-3.5 py-3 align-middle">
                          <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                        </td>
                        <td className="px-3.5 py-3 align-middle">
                          <button
                            onClick={() => { setSelectedIds(new Set([item._id])); setShowConfirm(true); }}
                            className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs text-destructive bg-destructive/5 hover:bg-destructive/15 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} /> Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-border bg-background">
              <DataTablePagination
                page={page} pageSize={limit} total={total} totalPages={totalPages}
                onPageChange={setPage} showPageSize={false}
              />
            </div>
          </>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          open={showConfirm}
          title="Xóa ảnh không sử dụng"
          message={`Xóa ${selectedIds.size} ảnh? Hành động này xóa vĩnh viễn trên Cloudinary và không thể hoàn tác.`}
          confirmText="Xóa vĩnh viễn"
          variant="danger"
          onConfirm={() => deleteBulk([...selectedIds])}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
