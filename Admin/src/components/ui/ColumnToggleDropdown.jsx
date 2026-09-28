import React, { useState, useRef, useEffect } from 'react';
import { ColumnsIcon, EyeIcon, EyeOffIcon, RotateCcwIcon, CheckSquare } from '@/components/ui/Icons';

/**
 * Reusable Column Toggle Dropdown Component for Admin Data Tables
 *
 * Usage option 1 (passing columnVisibility hook object directly):
 *   const columnVisibility = useColumnVisibility('key', columnsConfig);
 *   <ColumnToggleDropdown columnVisibility={columnVisibility} />
 *
 * Usage option 2 (passing explicit props):
 *   <ColumnToggleDropdown
 *     columns={columnsConfig}
 *     visibleKeys={visibleKeys}
 *     onToggle={toggleColumn}
 *     onReset={resetColumns}
 *     onShowAll={showAllColumns}
 *   />
 */
export default function ColumnToggleDropdown({
  columnVisibility,
  columns: propsColumns,
  visibleKeys: propsVisibleKeys,
  onToggle: propsOnToggle,
  onReset: propsOnReset,
  onShowAll: propsOnShowAll,
  buttonText = 'Cột hiển thị',
  align = 'right', // 'left' | 'right'
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Extract from columnVisibility object if provided
  const columns = columnVisibility ? columnVisibility.columns : (propsColumns || []);
  const visibleKeys = columnVisibility ? columnVisibility.visibleKeys : (propsVisibleKeys || []);
  const onToggle = columnVisibility ? columnVisibility.toggleColumn : propsOnToggle;
  const onReset = columnVisibility ? columnVisibility.resetColumns : propsOnReset;
  const onShowAll = columnVisibility ? columnVisibility.showAllColumns : propsOnShowAll;

  // Calculate counts
  const totalCount = columns.length;
  const visibleCount = visibleKeys.length;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!columns || columns.length === 0) return null;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-ring/20"
        title="Tuỳ chỉnh hiển thị các cột trong bảng"
      >
        <ColumnsIcon size={14} className="text-primary shrink-0" />
        <span>{buttonText}</span>
        <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {visibleCount}/{totalCount}
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-64 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-muted/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ColumnsIcon size={14} className="text-primary" />
              <span>Cột hiển thị</span>
            </div>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-muted"
                title="Khôi phục về mặc định"
              >
                <RotateCcwIcon size={12} />
                <span>Đặt lại</span>
              </button>
            )}
          </div>

          {/* Column Checklist */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
            {columns.map((col) => {
              const isChecked = col.alwaysVisible || visibleKeys.includes(col.id);
              const isDisabled = Boolean(col.alwaysVisible);

              return (
                <label
                  key={col.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    isDisabled
                      ? 'opacity-60 cursor-not-allowed bg-muted/20'
                      : isChecked
                      ? 'bg-primary/5 hover:bg-primary/10 text-foreground font-medium'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => !isDisabled && onToggle && onToggle(col.id)}
                      className="size-3.5 rounded border-input text-primary focus:ring-ring cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="truncate">{col.label}</span>
                  </div>

                  {isDisabled ? (
                    <span className="text-[10px] text-muted-foreground font-normal shrink-0">Bắt buộc</span>
                  ) : isChecked ? (
                    <EyeIcon size={13} className="text-primary shrink-0" />
                  ) : (
                    <EyeOffIcon size={13} className="text-muted-foreground shrink-0" />
                  )}
                </label>
              );
            })}
          </div>

          {/* Footer Actions */}
          {onShowAll && (
            <div className="border-t border-border p-2 bg-muted/20 flex items-center justify-between">
              <button
                type="button"
                onClick={onShowAll}
                className="w-full text-center py-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
              >
                Hiện tất cả các cột ({totalCount})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
