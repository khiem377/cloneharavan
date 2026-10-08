import { Search, Trash2, X, LayoutGrid, List } from '@/components/ui/Icons';
import { useRef } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const SORT_OPTIONS = [
  { value: 'createdAt|desc', label: 'Mới nhất' },
  { value: 'createdAt|asc',  label: 'Cũ nhất'  },
  { value: 'filename|asc',   label: 'Tên A→Z'  },
  { value: 'filename|desc',  label: 'Tên Z→A'  },
  { value: 'size|desc',      label: 'Lớn nhất' },
  { value: 'size|asc',       label: 'Nhỏ nhất' },
];

export default function MediaToolbar({
  search, onSearch, onSearchEnter, selectedCount, onBulkDelete, onClearSelect, total,
  sortBy, sortDir, onSortChange, viewMode, onViewModeChange,
}) {
  const inputRef = useRef(null);
  const sortVal  = `${sortBy}|${sortDir}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-foreground">
      <div className="flex items-center gap-2">
        <div className="relative flex items-center rounded-[6px] w-64">
          <Search size={14} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onSearchEnter) onSearchEnter(search);
            }}
            placeholder="Tìm file... (Enter để tìm)"
            className="h-8 pl-8 pr-7 text-xs rounded-[6px]"
          />
          {search && (
            <button className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => onSearch('')}>
              <X size={12} />
            </button>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground whitespace-nowrap font-mono tabular-nums">{total} ảnh</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-36 shrink-0">
          <SearchableSelect
            options={SORT_OPTIONS}
            value={sortVal}
            onChange={(val) => {
              const [by, dir] = val.split('|');
              onSortChange(by, dir);
            }}
            creatable={false}
            placeholder="Sắp xếp..."
          />
        </div>

        <div className="flex items-center rounded-[6px] border border-border bg-muted p-0.5">
          <button
            className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`}
            title="Dạng lưới"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid size={13} />
          </button>
          <button
            className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-background text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`}
            title="Dạng danh sách"
            onClick={() => onViewModeChange('list')}
          >
            <List size={13} />
          </button>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="rounded-[4px] text-[10px] font-semibold font-mono tabular-nums">
              {selectedCount} đã chọn
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 px-2.5 rounded-[4px] text-xs font-medium"
              onClick={onBulkDelete}
            >
              <Trash2 size={12} className="mr-1" /> Xóa
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 rounded-[4px] text-xs text-muted-foreground"
              onClick={onClearSelect}
            >
              <X size={12} className="mr-0.5" /> Bỏ chọn
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
