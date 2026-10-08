import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, X } from '@/components/ui/Icons';
import { Input } from '@/components/ui/input';
import { buildTree, buildRelationMaps, getAncestors, getDescendants } from '@/utils/treeUtils';

function HighlightText({ text, query }) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-200 dark:bg-amber-700/50 text-foreground rounded-[2px] not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/**
 * Hierarchical Category Tree Multi Picker with Search and Auto-Ancestry Select
 */
export default function CategoryTreeMultiPicker({ categories = [], value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  const tree = buildTree(categories);
  const { parentMap, childrenMap } = buildRelationMaps(categories);
  const getAncestorIds = (id) => getAncestors(parentMap, id);
  const getDescendantIds = (id) => getDescendants(childrenMap, id);

  const searchQ = search.trim().toLowerCase();
  const visibleIds = useMemo(() => {
    if (!searchQ) return null;
    const matched = new Set();
    categories.forEach((c) => {
      if (c.name.toLowerCase().includes(searchQ)) {
        matched.add(c._id);
        getAncestorIds(c._id).forEach((a) => matched.add(a));
      }
    });
    return matched;
  }, [searchQ, categories]);

  useEffect(() => {
    if (!categories?.length) return;
    const toExpand = {};
    if (searchQ && visibleIds) {
      visibleIds.forEach((id) => {
        toExpand[id] = true;
      });
    } else {
      value.forEach((id) => {
        getAncestorIds(id).forEach((a) => {
          toExpand[a] = true;
        });
      });
    }
    setExpanded((prev) => ({ ...prev, ...toExpand }));
  }, [searchQ, value, categories]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 60);
  }, [open]);

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  const toggleCheck = (id) => {
    const isChecked = value.includes(id);
    if (isChecked) {
      onChange(value.filter((v) => v !== id && !getDescendantIds(id).includes(v)));
    } else {
      onChange([...new Set([...value, id, ...getAncestorIds(id)])]);
    }
  };

  const removeCat = (id, e) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== id && !getDescendantIds(id).includes(v)));
  };

  const selectedCats = value
    .map((id) => categories.find((c) => c._id === id))
    .filter(Boolean);

  const renderNode = (node, depth = 0) => {
    if (visibleIds && !visibleIds.has(node._id)) return null;
    const hasChildren = node.children?.length > 0;
    const isChecked = value.includes(node._id);
    const isExpanded = expanded[node._id];
    const isSearchMatch = searchQ && node.name.toLowerCase().includes(searchQ);

    return (
      <div key={node._id}>
        <div
          style={{ paddingLeft: `${depth * 16 + 6}px` }}
          className={`flex items-center gap-2 py-1.5 pr-2 rounded-[6px] transition-colors ${
            isChecked ? 'bg-primary/5' : 'hover:bg-muted'
          } ${isSearchMatch ? 'ring-1 ring-inset ring-amber-400/50' : ''}`}
        >
          <button
            type="button"
            className={`size-4 flex items-center justify-center shrink-0 text-muted-foreground transition-transform ${
              hasChildren ? 'hover:text-foreground cursor-pointer' : 'opacity-0 pointer-events-none'
            }`}
            onClick={(e) => toggleExpand(node._id, e)}
          >
            <ChevronDown size={12} className={isExpanded ? '' : '-rotate-90'} />
          </button>
          <label className="flex items-center gap-2 flex-1 cursor-pointer select-none min-w-0">
            <input
              type="checkbox"
              className="size-3.5 rounded-[4px] border-input cursor-pointer accent-primary shrink-0"
              checked={isChecked}
              onChange={() => toggleCheck(node._id)}
            />
            <span
              className={`text-xs truncate ${
                isChecked ? 'font-medium text-primary' : 'text-foreground'
              }`}
            >
              <HighlightText text={node.name} query={searchQ} />
            </span>
          </label>
        </div>
        {hasChildren && (isExpanded || (visibleIds && visibleIds.has(node._id))) && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const hasResults = !visibleIds || visibleIds.size > 0;

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        className="min-h-9 w-full rounded-[6px] border border-input bg-background px-3 py-1.5 text-xs text-left text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring/20 transition-colors cursor-pointer flex flex-wrap items-center gap-1.5"
        onClick={() => setOpen((v) => !v)}
      >
        {selectedCats.length === 0 ? (
          <span className="text-muted-foreground py-0.5">-- Chọn danh mục --</span>
        ) : (
          selectedCats.map((c) => (
            <span
              key={c._id}
              className="inline-flex items-center gap-1 rounded-[4px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 text-xs font-medium"
            >
              {c.name}
              <button
                type="button"
                className="hover:text-destructive cursor-pointer leading-none ml-0.5"
                onClick={(e) => removeCat(c._id, e)}
              >
                ×
              </button>
            </span>
          ))
        )}
        <ChevronDown
          size={14}
          className={`ml-auto shrink-0 text-muted-foreground transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-[6px] border border-border bg-background shadow-md flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative flex items-center">
              <Search
                size={13}
                className="absolute left-2.5 text-muted-foreground pointer-events-none"
              />
              <Input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm danh mục..."
                className="h-8 w-full rounded-[6px] pl-8 pr-7 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
          {/* Tree */}
          <div className="max-h-56 overflow-y-auto p-1">
            {!hasResults ? (
              <p className="px-3 py-3 text-xs text-center text-muted-foreground">
                Không tìm thấy kết quả
              </p>
            ) : tree.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">Không có danh mục</p>
            ) : (
              tree.map((node) => renderNode(node))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
