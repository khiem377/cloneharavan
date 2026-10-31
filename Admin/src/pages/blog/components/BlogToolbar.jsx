import React from 'react';
import { Plus, RefreshCw, Trash2, Search, X } from 'lucide-react';
import Can from '@/components/auth/Can';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
            <span className="text-xs font-mono tabular-nums text-muted-foreground bg-secondary px-2 py-0.5 rounded-[4px] border border-border">
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
              className="h-8 px-3.5 rounded-[6px] gap-1.5 text-xs font-semibold shadow-none active:scale-[0.98]"
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
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Tìm theo tiêu đề, slug..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-[6px] text-xs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            value={query.status || 'ALL'}
            onValueChange={(val) =>
              setQuery((q) => ({ ...q, status: val === 'ALL' ? undefined : val, page: 1 }))
            }
          >
            <SelectTrigger className="h-8 w-36 rounded-[6px] text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="published">Đã đăng</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="pending_review">Chờ duyệt</SelectItem>
              <SelectItem value="archived">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={query.categoryId || 'ALL'}
            onValueChange={(val) =>
              setQuery((q) => ({ ...q, categoryId: val === 'ALL' ? undefined : val, page: 1 }))
            }
          >
            <SelectTrigger className="h-8 w-44 rounded-[6px] text-xs">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              <SelectItem value="ALL">Tất cả danh mục</SelectItem>
              {categoriesList.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
