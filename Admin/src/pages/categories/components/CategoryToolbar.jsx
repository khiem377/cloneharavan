import { Plus, RefreshCw, Trash2 } from '@/components/ui/Icons';
import Can from '@/components/auth/Can';
import { Button } from '@/components/ui/button';

export default function CategoryToolbar({
  keyword,
  setKeyword,
  selectedCount,
  onRefresh,
  isLoading,
  onCreate,
  onBulkDelete,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Danh mục sản phẩm</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cấu trúc phân cấp đa tầng (Cấp 1, Cấp 2, Cấp 3) cho sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 rounded-[6px] gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <Can do="category.manage">
            <Button
              size="sm"
              onClick={onCreate}
              className="h-8 px-3.5 rounded-[6px] gap-1.5 text-xs font-semibold shadow-2xs active:scale-[0.98]"
            >
              <Plus className="size-3.5" />
              <span>Tạo danh mục</span>
            </Button>
          </Can>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="h-8 w-full sm:w-64 rounded-[6px] border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors"
          placeholder="Tìm theo tên danh mục..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="h-8 px-3 rounded-[6px] text-xs gap-1.5 active:scale-[0.98]"
          >
            <Trash2 className="size-3.5" />
            <span>Xóa {selectedCount} danh mục</span>
          </Button>
        )}
      </div>
    </div>
  );
}
