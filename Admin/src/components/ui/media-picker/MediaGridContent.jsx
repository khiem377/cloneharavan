import React from 'react';
import { Search, X, Check, ChevronRight, Home, FolderOpen } from '@/components/ui/Icons';
import DataTablePagination from '@/components/ui/DataTablePagination';

export default function MediaGridContent({
  crumbs,
  search,
  setSearch,
  setPage,
  onFolderSelect,
  isLoading,
  modalFolders,
  mediaItems,
  isSelected,
  handleCardClick,
  onSelect,
  onClose,
  isMultiple,
  pickedMultiple,
  page,
  total,
  totalPages,
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
      <div className="flex items-center justify-between gap-3 p-3 border-b border-border bg-muted/10 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <button
            type="button"
            className="hover:text-foreground transition-colors cursor-pointer"
            onClick={() => onFolderSelect(null)}
          >
            <Home size={13} />
          </button>
          {crumbs.map((c) => (
            <span key={c._id} className="flex items-center gap-1.5">
              <ChevronRight size={11} className="text-muted-foreground/60" />
              <button
                type="button"
                className="hover:text-foreground transition-colors cursor-pointer font-medium text-foreground"
                onClick={() => onFolderSelect(c._id)}
              >
                {c.name}
              </button>
            </span>
          ))}
        </div>

        <div className="relative flex items-center w-56">
          <Search size={14} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
          <input
            className="h-8 w-full rounded-[6px] border border-input bg-background pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm tên file..."
          />
          {search && (
            <button
              type="button"
              className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setSearch('')}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-[6px] bg-muted animate-pulse border border-border" />
            ))}
          </div>
        ) : (mediaItems.length === 0 && modalFolders.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <p className="text-xs font-medium">Không có ảnh hoặc thư mục nào</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {modalFolders.length > 0 && (
              <div className="space-y-1.5 pb-3 border-b border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider tabular-nums font-mono">
                  Thư mục ({modalFolders.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {modalFolders.map((sf) => (
                    <button
                      key={sf._id}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-[6px] border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-amber-500/60 hover:bg-amber-500/10 active:scale-[0.98] transition-all cursor-pointer"
                      onClick={() => onFolderSelect(sf._id)}
                    >
                      <FolderOpen size={15} className="text-amber-600 shrink-0" />
                      <span>{sf.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mediaItems.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 content-start">
                {mediaItems.map((item) => {
                  const active = isSelected(item._id);
                  return (
                    <div
                      key={item._id}
                      className={`relative aspect-square rounded-[6px] border overflow-hidden cursor-pointer transition-all bg-card ${active ? 'border-primary ring-1 ring-primary/40 shadow-2xs' : 'border-border hover:border-primary/50'}`}
                      onClick={() => handleCardClick(item)}
                      onDoubleClick={() => {
                        if (!isMultiple) {
                          onSelect(item);
                          onClose();
                        }
                      }}
                    >
                      <img src={item.url} alt={item.filename} loading="lazy" className="size-full object-cover" />
                      {active && (
                        <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs z-10 font-bold text-[10px] tabular-nums font-mono">
                          {isMultiple ? (pickedMultiple.findIndex((x) => x._id === item._id) + 1) : <Check size={12} />}
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-white truncate px-1.5 font-medium">
                        {item.filename}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-3 pb-3 shrink-0">
        <DataTablePagination
          page={page}
          pageSize={20}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          showPageSize={false}
          showJumpToPage={totalPages > 5}
        />
      </div>
    </div>
  );
}
