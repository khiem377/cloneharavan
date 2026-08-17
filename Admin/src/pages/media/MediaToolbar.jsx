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
    <div className="media-toolbar">
      {/* Left */}
      <div className="toolbar-left">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm tên file hoặc folder..."
            className="search-input"
          />
          {search && (
            <button className="search-clear icon-btn-sm" onClick={() => onSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>
        <span className="media-count">{total} ảnh</span>
      </div>

      {/* Right */}
      <div className="toolbar-right">
        {/* Sort */}
        <div className="sort-select-wrap">
          <ArrowUpDown size={12} className="sort-icon" />
          <select
            className="sort-select"
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

        {/* Grid / List toggle */}
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            title="Dạng lưới"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            title="Dạng danh sách"
            onClick={() => onViewModeChange('list')}
          >
            <List size={14} />
          </button>
        </div>

        {/* Bulk actions */}
        {selectedCount > 0 && (
          <>
            <span className="selected-badge">{selectedCount} đã chọn</span>
            <button className="btn-danger-sm" onClick={onBulkDelete}>
              <Trash2 size={13} /> Xóa
            </button>
            <button className="btn-ghost-sm" onClick={onClearSelect}>
              <X size={13} /> Bỏ chọn
            </button>
          </>
        )}

        <button className="btn-primary-sm" onClick={onUpload}>
          <Upload size={13} /> Upload
        </button>
      </div>
    </div>
  );
}
