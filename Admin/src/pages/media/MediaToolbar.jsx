import { Search, Upload, Trash2, X, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { useRef } from 'react';

const SORT_OPTIONS = [
  { value: 'createdAt|desc', label: 'Mới nhất' },
  { value: 'createdAt|asc',  label: 'Cũ nhất'  },
  { value: 'filename|asc',   label: 'Tên A→Z'  },
  { value: 'filename|desc',  label: 'Tên Z→A'  },
  { value: 'size|desc',      label: 'Lớn nhất' },
  { value: 'size|asc',       label: 'Nhỏ nhất' },
];

export default function MediaToolbar({
  search, onSearch, selectedCount, onUpload, onBulkDelete, onClearSelect, total,
  sortBy, sortDir, onSortChange, viewMode, onViewModeChange,
}) {
  const inputRef = useRef(null);
  const sortVal  = `${sortBy}|${sortDir}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-border bg-background shrink-0 text-foreground">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center w-64 rounded-md border border-input bg-background overflow-hidden">
          <Search size={15} className="absolute left-2.5 size-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm tên file..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          {search && (
            <button className="absolute right-2.5 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => onSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{total} ảnh</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex items-center rounded-md border border-input bg-background">
          <ArrowUpDown size={12} className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
          <select
            className="h-9 pl-8 pr-3 text-xs bg-transparent outline-none cursor-pointer text-foreground"
            value={sortVal}
            onChange={(e) => {
              const [by, dir] = e.target.value.split('|');
              onSortChange(by, dir);
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center rounded-md border border-border bg-muted p-0.5">
          <button
            className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-background text-foreground font-semibold shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`}
            title="Dạng lưới"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            className={`p-1.5 rounded transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-background text-foreground font-semibold shadow-2xs' : 'text-muted-foreground hover:text-foreground'}`}
            title="Dạng danh sách"
            onClick={() => onViewModeChange('list')}
          >
            <List size={14} />
          </button>
        </div>

        {selectedCount > 0 && (
          <>
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{selectedCount} đã chọn</span>
            <button className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-destructive/10 text-destructive px-3 text-xs font-medium hover:bg-destructive/20 transition-colors cursor-pointer" onClick={onBulkDelete}>
              <Trash2 size={13} /> Xóa
            </button>
            <button className="inline-flex h-8 items-center justify-center gap-1 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={onClearSelect}>
              <X size={13} /> Bỏ chọn
            </button>
          </>
        )}

        <button className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer" onClick={onUpload}>
          <Upload size={13} /> Upload
        </button>
      </div>
    </div>
  );
}
