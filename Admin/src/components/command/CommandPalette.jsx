import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, HelpCircle } from 'lucide-react';
import { COMMAND_ITEMS, removeVietnameseTones } from './commandItems';

export default function CommandPalette({
  isOpen,
  onClose,
  onChangePass,
  onStartTour,
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return COMMAND_ITEMS;
    const q = query.toLowerCase().trim();
    const qNoTone = removeVietnameseTones(q);
    return COMMAND_ITEMS.filter((item) => {
      const titleLower = item.title.toLowerCase();
      const titleNoTone = removeVietnameseTones(titleLower);
      const groupLower = item.group.toLowerCase();
      const pathLower = (item.path || '').toLowerCase();
      return (
        titleLower.includes(q) ||
        titleNoTone.includes(qNoTone) ||
        groupLower.includes(q) ||
        pathLower.includes(q)
      );
    });
  }, [query]);

  // Keyboard navigation inside Command Palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          executeCommand(selected);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const executeCommand = (item) => {
    onClose();
    if (item.action === 'changepass') {
      if (onChangePass) onChangePass();
    } else if (item.action === 'start-tour') {
      if (onStartTour) onStartTour();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-[12vh] sm:pt-[15vh] px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[6px] border border-border bg-card shadow-lg overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-background">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tìm nhanh trang, thao tác, hoặc gõ phím tắt... (Ctrl+K)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] border border-border bg-muted/60 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Không tìm thấy lệnh hoặc phân hệ nào khớp với "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon || HelpCircle;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-selected={isSelected}
                  onClick={() => executeCommand(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-[6px] text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`size-4 shrink-0 ${
                        isSelected ? 'text-primary-foreground' : 'text-primary'
                      }`}
                    />
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-[4px] font-mono font-medium ${
                          isSelected
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {item.group}
                    </span>
                    <kbd
                      className={`px-1 py-0.5 rounded-[3px] font-mono text-[9px] ${
                        isSelected
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted border border-border text-muted-foreground'
                      }`}
                    >
                      ↵
                    </kbd>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground select-none">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono text-[10px] px-1 bg-muted rounded border border-border">↑</kbd>{' '}
              <kbd className="font-mono text-[10px] px-1 bg-muted rounded border border-border">↓</kbd> để di chuyển
            </span>
            <span>
              <kbd className="font-mono text-[10px] px-1 bg-muted rounded border border-border">↵</kbd> để chọn
            </span>
          </div>
          <span className="font-mono text-[10px] tabular-nums">
            {filteredItems.length} kết quả
          </span>
        </div>
      </div>
    </div>
  );
}
