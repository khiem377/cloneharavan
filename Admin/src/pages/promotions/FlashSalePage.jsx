import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Sparkles, Clock } from '@/components/ui/Icons';
import { useFlashSales } from '@/hooks/useFlashSales';
import { flashSaleService } from '@/services/flashSale.service';
import { toast } from '@/providers/ToastProvider';
import DataTablePagination from '@/components/ui/DataTablePagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import FlashSaleFormModal from './FlashSaleFormModal';

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
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Đang diễn ra
      </span>
    );
  }
  if (status === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
        <span className="size-1.5 rounded-full bg-blue-500" />
        Sắp diễn ra
      </span>
    );
  }
  if (status === 'ended') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-500/10 text-gray-500 border border-gray-500/20">
        <span className="size-1.5 rounded-full bg-gray-400" />
        Đã kết thúc
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground border border-border">
      <span className="size-1.5 rounded-full bg-muted-foreground" />
      Đang ẩn
    </span>
  );
}

export default function FlashSalePage() {
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', status: '' });
  const [searchInput, setSearchInput] = useState('');
  const [modalTarget, setModalTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: flashSales, pagination, loading, refetch } = useFlashSales(query);

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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="size-6 text-amber-500" />
            Flash Sale
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý các chương trình bán hàng giờ vàng giảm giá sốc
          </p>
        </div>

        <button
          onClick={() => setModalTarget('create')}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus size={15} /> Tạo chương trình mới
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STATUS_TAB_OPTIONS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${query.status === tab.value ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 h-9 rounded-md border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-colors"
            placeholder="Tìm theo tên chương trình..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-sm text-muted-foreground">Đang tải...</div>
        ) : flashSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-sm text-muted-foreground">
            <Clock size={40} className="text-muted-foreground/50" />
            <p>Chưa có chương trình Flash Sale nào</p>
            <button
              onClick={() => setModalTarget('create')}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Plus size={13} /> Tạo ngay
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                  <th className="px-4 py-3">Banner / Tên chương trình</th>
                  <th className="px-4 py-3">Khung giờ</th>
                  <th className="px-4 py-3 text-center">Số SP</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {flashSales.map((item) => (
                  <tr key={item._id} className="border-b border-border/60 transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-3">
                        {item.banner?.url ? (
                          <img src={item.banner.url} alt="" className="h-12 w-20 object-cover rounded border border-border bg-muted shrink-0" />
                        ) : (
                          <div className="h-12 w-20 rounded border border-border bg-muted shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                            No Banner
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
                          {item.description && <p className="text-xs text-muted-foreground truncate max-w-sm">{item.description}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-middle text-xs font-mono text-muted-foreground whitespace-nowrap">
                      <div><span className="text-foreground font-medium">Từ:</span> {formatDate(item.startDate)}</div>
                      <div><span className="text-foreground font-medium">Đến:</span> {formatDate(item.endDate)}</div>
                    </td>

                    <td className="px-4 py-3.5 align-middle text-center font-semibold text-sm">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-muted border border-border text-xs font-mono">
                        {item.items?.length || 0}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 align-middle">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-4 py-3.5 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={item.isActive ? 'Tắt Flash Sale' : 'Bật Flash Sale'}
                        >
                          {item.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </button>

                        <button
                          onClick={() => setModalTarget(item)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit className="size-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DataTablePagination
          page={page => setQuery((p) => ({ ...p, page }))}
          pageSize={query.limit}
          total={pagination.total || 0}
          totalPages={pagination.totalPages || 1}
          onPageChange={(p) => setQuery((prev) => ({ ...prev, page: p }))}
          onPageSizeChange={(s) => setQuery((prev) => ({ ...prev, limit: s, page: 1 }))}
          className="px-4"
        />
      </div>

      {modalTarget && (
        <FlashSaleFormModal
          flashSale={modalTarget === 'create' ? null : modalTarget}
          onClose={() => setModalTarget(null)}
          onSuccess={() => refetch()}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa Flash Sale"
          description={`Bạn có chắc muốn xóa chương trình "${deleteTarget.name}"? Hành động này không thể hoàn tác.`}
          onConfirm={() => handleDelete(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
