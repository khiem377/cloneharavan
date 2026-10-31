import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Info, X, ExternalLink, Trash2 } from '@/components/ui/Icons';

const BADGE_COLORS = {
  'Banner': 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  'Thương hiệu': 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30',
  'Danh mục': 'bg-green-500/15 text-green-600 border-green-500/30',
  'Sản phẩm': 'bg-purple-500/15 text-purple-600 border-purple-500/30',
  'Biến thể sản phẩm': 'bg-orange-500/15 text-orange-600 border-orange-500/30',
};

export default function MediaUsageModal({ mediaItems, usages, onForceDelete, onCancel, isDeleting, viewOnly = false }) {
  const navigate = useNavigate();

  const usedItems = mediaItems.filter((m) => usages[m._id]?.length > 0);
  const unusedCount = mediaItems.length - usedItems.length;

  const handleNavigate = (url) => {
    navigate(url);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-[6px] border border-border bg-card shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: '85vh' }}>
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-[6px] shrink-0 ${viewOnly ? 'bg-primary/15' : 'bg-amber-500/15'}`}>
              {viewOnly
                ? <Info size={18} className="text-primary" />
                : <AlertTriangle size={18} className="text-amber-500" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {viewOnly ? 'Ảnh được sử dụng ở' : 'Ảnh đang được sử dụng'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {usedItems.length} ảnh đang được dùng ở các vị trí bên dưới
                {unusedCount > 0 && `, ${unusedCount} ảnh chưa được dùng`}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1 rounded-[6px] text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all cursor-pointer shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          {usedItems.map((item) => (
            <div key={item._id} className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={item.url}
                  alt={item.filename}
                  className="h-9 w-9 rounded-[6px] object-cover border border-border shrink-0"
                />
                <span className="text-xs font-medium text-foreground truncate">{item.filename}</span>
              </div>
              <div className="flex flex-col gap-1.5 pl-11">
                {usages[item._id].map((usage, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 rounded-[6px] border border-border bg-muted/30 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex shrink-0 items-center rounded-[6px] border px-2 py-0.5 text-[10px] font-semibold ${BADGE_COLORS[usage.displayName] || 'bg-muted text-muted-foreground border-border'}`}>
                        {usage.displayName}
                      </span>
                      <span className="text-xs text-foreground truncate">{usage.entityName}</span>
                    </div>
                    <button
                      onClick={() => handleNavigate(usage.adminUrl)}
                      className="shrink-0 inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Đến trang <ExternalLink size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border shrink-0 bg-muted/10">
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-[6px] border border-border text-sm font-medium text-foreground hover:bg-accent active:scale-[0.98] transition-all cursor-pointer"
          >
            {viewOnly ? 'Đóng' : 'Hủy'}
          </button>
          {!viewOnly && (
            <button
              onClick={onForceDelete}
              disabled={isDeleting}
              className="h-9 px-4 rounded-[6px] bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              {isDeleting ? 'Đang xóa...' : `Vẫn xóa vĩnh viễn (${mediaItems.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
