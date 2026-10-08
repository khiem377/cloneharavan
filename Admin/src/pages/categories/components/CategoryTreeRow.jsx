import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Eye,
  Check,
  ToggleLeft,
  ToggleRight,
} from '@/components/ui/Icons';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const CLIENT_STORE_URL =
  import.meta.env.VITE_STORE_FRONTEND_URL ||
  import.meta.env.VITE_CLIENT_URL ||
  'http://localhost:3000';

const LEVEL_LABELS = ['Cấp 1', 'Cấp 2', 'Cấp 3'];
const CONNECTORS = ['', '└─', '└──'];

export default function CategoryTreeRow({
  cat,
  level = 0,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onToggle,
  highlightId,
}) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = cat.children?.length > 0;
  const isSelected = selected.includes(cat._id);
  const isHighlighted = cat._id === highlightId;

  const rowRef = (el) => {
    if (el && isHighlighted) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const levelBadges = [
    'inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold font-mono bg-primary/10 text-primary border border-primary/20',
    'inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    'inline-flex items-center rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  ];

  return (
    <>
      <TableRow
        ref={rowRef}
        className={`transition-colors hover:bg-muted/40 ${
          isSelected || isHighlighted ? 'bg-primary/5 ring-1 ring-inset ring-primary/30' : ''
        }`}
      >
        {/* Checkbox */}
        <TableCell className="w-10 px-3 py-2 text-center">
          <button
            type="button"
            className={`flex size-4 items-center justify-center rounded-[3px] border border-input bg-background transition-colors cursor-pointer mx-auto ${
              isSelected ? 'bg-primary border-primary text-primary-foreground' : ''
            }`}
            onClick={() => onSelect(cat._id)}
          >
            {isSelected && <Check className="size-3" />}
          </button>
        </TableCell>

        {/* Name & Tree Structure */}
        <TableCell className="px-3 py-2">
          <div className="flex items-center gap-2" style={{ paddingLeft: level * 20 }}>
            {level > 0 && (
              <span className="font-mono text-xs text-muted-foreground/60 select-none mr-1">
                {CONNECTORS[level]}
              </span>
            )}
            {hasChildren ? (
              <button
                type="button"
                className="inline-flex size-5 items-center justify-center rounded-[4px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
              </button>
            ) : (
              <span className="w-5 shrink-0" />
            )}
            {cat.icon?.url ? (
              <img
                src={cat.icon.url}
                alt="icon"
                className="size-7 rounded-[4px] object-cover border border-border bg-muted shrink-0"
              />
            ) : cat.image?.url ? (
              <img
                src={cat.image.url}
                alt={cat.name}
                className="size-7 rounded-[4px] object-cover border border-border bg-muted shrink-0"
              />
            ) : (
              <div className="size-7 rounded-[4px] border border-border bg-muted/60 shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-xs truncate">{cat.name}</span>
              {cat.brandId && (
                <span className="text-[10px] text-muted-foreground truncate font-mono">Brand: {cat.brandId.name}</span>
              )}
              {cat.link && !cat.brandId && (
                <span className="text-[10px] text-muted-foreground truncate font-mono">{cat.link}</span>
              )}
            </div>
          </div>
        </TableCell>

        {/* Level */}
        <TableCell className="px-3 py-2 w-20">
          <span className={levelBadges[level] || levelBadges[2]}>
            {LEVEL_LABELS[level] || `Cấp ${level + 1}`}
          </span>
        </TableCell>

        {/* Slug */}
        <TableCell className="px-3 py-2">
          <code className="inline-flex items-center rounded-[4px] bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground border border-border">
            {cat.slug}
          </code>
        </TableCell>

        {/* Show On Menu */}
        <TableCell className="px-3 py-2">
          <span
            className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-medium border ${
              cat.showOnMenu
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {cat.showOnMenu ? 'Menu' : 'Ẩn'}
          </span>
        </TableCell>

        {/* Status */}
        <TableCell className="px-3 py-2">
          <button
            type="button"
            onClick={() => onToggle(cat)}
            className="cursor-pointer inline-flex items-center gap-1"
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[11px] font-medium border ${
                cat.isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              <span className={`size-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
              {cat.isActive ? 'Hoạt động' : 'Đang ẩn'}
            </span>
          </button>
        </TableCell>

        {/* Order */}
        <TableCell className="px-3 py-2 text-muted-foreground font-mono text-xs tabular-nums text-center">
          {cat.order}
        </TableCell>

        {/* Actions */}
        <TableCell className="px-3 py-2 text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              title="Xem trên Cửa hàng"
              onClick={() => window.open(`${CLIENT_STORE_URL}/collections/${cat.slug}`, '_blank')}
              className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
            >
              <Eye className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Sửa danh mục"
              onClick={() => onEdit(cat)}
              className="size-7 rounded-[4px] text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Xóa danh mục"
              onClick={() => onDelete(cat)}
              className="size-7 rounded-[4px] text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Children recursive render */}
      {expanded &&
        hasChildren &&
        cat.children.map((child) => (
          <CategoryTreeRow
            key={child._id}
            cat={child}
            level={level + 1}
            selected={selected}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            highlightId={highlightId}
          />
        ))}
    </>
  );
}
