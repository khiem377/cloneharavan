import { Plus, LayoutGrid, List } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';

export const TYPE_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'hero', label: 'Hero (Slider chính)' },
  { key: 'popup', label: 'Popup' },
  { key: 'sidebar', label: 'Sidebar' },
  { key: 'category-top', label: 'Đầu danh mục' },
  { key: 'product-top', label: 'Đầu sản phẩm' },
];

export default function BannerToolbar({
  typeFilter,
  setTypeFilter,
  viewMode,
  setViewMode,
  totalCount,
  visibleCount,
  onCreateNew,
}) {
  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Banner</h1>
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-[4px] border border-border">
              {totalCount} banner • {visibleCount} đang hiển thị
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kéo thả để sắp xếp thứ tự hiển thị banner trên hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-border bg-secondary/50 rounded-[6px] p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-[4px] transition-colors cursor-pointer active:scale-[0.98] ${
                viewMode === 'table' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Xem dạng bảng"
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[4px] transition-colors cursor-pointer active:scale-[0.98] ${
                viewMode === 'grid' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Xem dạng lưới"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>

          {/* Primary Create Button */}
          <Button
            size="sm"
            onClick={onCreateNew}
            className="h-8 px-3.5 rounded-[6px] gap-1.5 text-xs font-semibold shadow-2xs active:scale-[0.98]"
          >
            <Plus className="size-3.5" />
            <span>Tạo banner mới</span>
          </Button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border">
        {TYPE_TABS.map((tab) => {
          const isActive = typeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'bg-foreground text-background font-bold shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
