import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Sparkles, Clock } from '@/components/ui/Icons';
import { useFlashSales } from '@/hooks/useFlashSales';
import { useMediaByIds } from '@/hooks/useMedia';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import { flashSaleService } from '@/services/flashSale.service';
import { toast } from '@/providers/ToastProvider';
import DataTablePagination from '@/components/ui/DataTablePagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FlashSaleFormModal from './FlashSaleFormModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import { useSearchParams } from 'react-router-dom';

const STATUS_TAB_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang diễn ra' },
  { value: 'upcoming', label: 'Sắp diễn ra' },
  { value: 'ended', label: 'Đã kết thúc' },
  { value: 'disabled', label: 'Đang ẩn' },
];

function StatusBadge({ status }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Đang diễn ra
      </span>
    );
  }
  if (status === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
        <span className="size-1.5 rounded-full bg-blue-500" />
        Sắp diễn ra
      </span>
    );
  }
  if (status === 'ended') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
        <span className="size-1.5 rounded-full bg-muted-foreground" />
        Đã kết thúc
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      Đang ẩn
    </span>
  );
}

export default function FlashSalePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const rowRefs = useRef({});

  const [query, setQuery] = useState({ page: 1, limit: 10, search: initialSearch, status: '' });
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [modalTarget, setModalTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: flashSales, pagination, loading, refetch } = useFlashSales(query);

  const resolveId = (v) => (v && typeof v === 'object' ? v._id : v);
  const bannerIds = (flashSales || []).map((s) => resolveId(s.banner?.mediaId || s.banner?._id)).filter(Boolean);
  const { data: mediaMap = {} } = useMediaByIds(bannerIds);

  const highlightId = searchParams.get('highlight');
  useEffect(() => {
    if (!highlightId) return;
    flashSaleService.locate(highlightId, query.limit)
      .then((res) => { setQuery(q => ({ ...q, page: res.data?.data?.page || 1 })); })
      .catch(() => {});
  }, [highlightId]);
  useEffect(() => {
    if (!highlightId || !flashSales?.length) return;
    const found = flashSales.find((s) => s._id === highlightId);
    if (!found) return;
    setTimeout(() => {
      const el = rowRefs.current[highlightId];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    setSearchParams((p) => { p.delete('highlight'); return p; }, { replace: true });
  }, [highlightId, flashSales]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleTabChange = (status) => {
    setQuery((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleToggleStatus = async (item) => {
    try {
      await flashSaleService.toggleStatus(item._id, !item.isActive);
      toast.success(`Đã ${!item.isActive ? 'kích hoạt' : 'tắt'} Flash Sale`);
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    try {
      await flashSaleService.remove(id);
      toast.success('Đã xóa chương trình Flash Sale');
      setDeleteTarget(null);
      refetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi xóa chương trình');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden min-h-full bg-background text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            Flash Sale
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý các chương trình bán hàng giờ vàng giảm giá sốc
          </p>
        </div>

        <Button
          onClick={() => setModalTarget('create')}
          size="sm"
          className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98]"
        >
          <Plus size={15} className="mr-1" /> Tạo chương trình mới
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[6px] border border-border bg-card">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STATUS_TAB_OPTIONS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                query.status === tab.value
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 rounded-[6px] text-xs"
            placeholder="Tìm theo tên chương trình..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
      </div>

      <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-xs text-muted-foreground">Đang tải...</div>
        ) : flashSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-xs text-muted-foreground">
            <Clock size={36} className="text-muted-foreground/50" />
            <p className="font-mono">Chưa có chương trình Flash Sale nào</p>
            <Button
              onClick={() => setModalTarget('create')}
              size="sm"
              className="h-8 rounded-[6px] text-xs mt-1 font-semibold"
            >
              <Plus size={13} className="mr-1" /> Tạo ngay
            </Button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold py-2">Banner / Tên chương trình</TableHead>
                  <TableHead className="text-xs font-semibold py-2">Khung giờ</TableHead>
                  <TableHead className="text-xs font-semibold py-2 text-center w-20">Số SP</TableHead>
                  <TableHead className="text-xs font-semibold py-2 w-28">Trạng thái</TableHead>
                  <TableHead className="text-right py-2 w-28">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flashSales.map((item) => (
                  <TableRow
                    key={item._id}
                    ref={(el) => { rowRefs.current[item._id] = el; }}
                    className={`hover:bg-muted/30 transition-colors ${item._id === highlightId ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''}`}
                  >
                    <TableCell className="py-2">
                      <div className="flex items-center gap-3">
                        {item.banner?.url ? (
                          (() => {
                            const mid = resolveId(item.banner?.mediaId || item.banner?._id);
                            return (
                              <MediaThumbnailHover media={mid ? mediaMap[mid] : null} className="h-10 w-16 shrink-0 rounded-[4px] overflow-hidden border border-border bg-muted">
                                <img src={item.banner.url} alt="" className="h-full w-full object-cover" />
                              </MediaThumbnailHover>
                            );
                          })()
                        ) : (
                          <div className="h-10 w-16 rounded-[4px] border border-border bg-muted shrink-0 flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                            No Banner
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-foreground truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-[3px] border border-border">
                              /{item.slug || '—'}
                            </span>
                            <a
                              href={`http://localhost:3000/flash-sale/${item.slug || item._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                            >
                              Xem trang &rarr;
                            </a>
                          </div>
                          {item.description && <p className="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5">{item.description}</p>}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-2 text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                      <div><span className="text-foreground font-medium">Từ:</span> {formatDate(item.startDate)}</div>
                      <div><span className="text-foreground font-medium">Đến:</span> {formatDate(item.endDate)}</div>
                    </TableCell>

                    <TableCell className="py-2 text-center font-semibold text-xs">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[4px] bg-muted border border-border text-xs font-mono tabular-nums">
                        {item.items?.length || 0}
                      </span>
                    </TableCell>

                    <TableCell className="py-2">
                      <StatusBadge status={item.status} />
                    </TableCell>

                    <TableCell className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(item)}
                          className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                          title={item.isActive ? 'Tắt Flash Sale' : 'Bật Flash Sale'}
                        >
                          {item.isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setModalTarget(item)}
                          className="h-7 w-7 rounded-[4px] text-muted-foreground hover:text-foreground"
                          title="Chỉnh sửa"
                        >
                          <Edit className="size-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(item)}
                          className="h-7 w-7 rounded-[4px] text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          title="Xóa"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DataTablePagination
          page={query.page}
          pageSize={query.limit}
          total={pagination?.total || 0}
          totalPages={pagination?.totalPages || 1}
          onPageChange={(p) => setQuery((prev) => ({ ...prev, page: p }))}
          onPageSizeChange={(s) => setQuery((prev) => ({ ...prev, limit: s, page: 1 }))}
          className="px-4 py-2 border-t border-border"
        />
      </Card>

      {modalTarget && (
        <FlashSaleFormModal
          flashSale={modalTarget === 'create' ? null : modalTarget}
          onClose={() => setModalTarget(null)}
          onSuccess={() => refetch()}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          title="Xóa Flash Sale"
          description={`Bạn có chắc muốn xóa chương trình "${deleteTarget.name}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Xóa chương trình"
          danger
          onConfirm={() => handleDelete(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
