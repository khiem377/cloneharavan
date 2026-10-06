import { Plus, RefreshCw, Trash2, Search, X, Filter } from 'lucide-react';
import Can from '@/components/auth/Can';
import { Button } from '@/components/ui/button';
import ColumnToggleDropdown from '@/components/ui/ColumnToggleDropdown';
import DateRangePicker from '@/components/ui/DateRangePicker';

export default function BlogToolbar({
  keyword,
  setKeyword,
  onSearchSubmit,
  query,
  setQuery,
  dateRange,
  onDateRangeChange,
  onResetFilters,
  categoriesList = [],
  totalCount,
  onRefresh,
  loading,
  onCreateNew,
  selectedCount,
  onBulkDelete,
  columnVisibility,
}) {
  return (
    <div className="space-y-4">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Tin tức</h1>
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-[4px] border border-border">
              {totalCount || 0} bài viết
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý nội dung bài viết, chuẩn SEO và tương tác người đọc trên toàn hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 rounded-[6px] gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <ColumnToggleDropdown {...columnVisibility} />

          <Can do="blog.create">
            <Button
              size="sm"
              onClick={onCreateNew}
              className="h-8 px-3.5 rounded-[6px] gap-1.5 text-xs font-semibold shadow-2xs active:scale-[0.98]"
            >
              <Plus className="size-3.5" />
              <span>Viết bài mới</span>
            </Button>
          </Can>
        </div>
      </div>

      {/* 2. Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <form onSubmit={onSearchSubmit} className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, slug..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-[6px] border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={query.status || ''}
            onChange={(e) =>
              setQuery((q) => ({ ...q, status: e.target.value || undefined, page: 1 }))
            }
            className="h-8 px-2.5 rounded-[6px] border border-border bg-card text-xs text-foreground outline-none focus:border-ring transition-colors cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đã đăng</option>
            <option value="draft">Bản nháp</option>
            <option value="pending_review">Chờ duyệt</option>
            <option value="archived">Lưu trữ</option>
          </select>

          {/* Category Filter */}
          <select
            value={query.categoryId || ''}
            onChange={(e) =>
              setQuery((q) => ({ ...q, categoryId: e.target.value || undefined, page: 1 }))
            }
            className="h-8 px-2.5 rounded-[6px] border border-border bg-card text-xs text-foreground outline-none focus:border-ring transition-colors cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categoriesList.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date range picker */}
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onChange={onDateRangeChange}
            placeholder="Lọc theo ngày đăng"
          />

          {/* Reset Filters */}
          {(query.status || query.categoryId || query.keyword || query.startDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 px-2 rounded-[6px] text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5 mr-1" /> Đặt lại
            </Button>
          )}

          {/* Bulk delete */}
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              className="h-8 px-3 rounded-[6px] text-xs gap-1.5 active:scale-[0.98]"
            >
              <Trash2 className="size-3.5" />
              <span>Xóa {selectedCount} bài viết</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
