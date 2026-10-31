import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronRight, ChevronDown, Plus, Trash2,
  GripVertical, Eye, EyeOff,
} from '@/components/ui/Icons';
import { LINK_TYPE_LABELS } from './menuEditorConstants';

export default function SortableItemRow({
  item,
  depth,
  isSelected,
  onSelect,
  onAdd,
  onDelete,
  onToggleActive,
  expanded,
  onToggle,
  hasChildren,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const depthColors = [
    'text-primary bg-primary/10 border-primary/20',
    'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
  ];

  const isHidden = item.isActive === false;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, paddingLeft: depth * 24 + 8 }}
      className={`flex items-center gap-2 py-2 pr-3 border-b border-border/60 hover:bg-muted/40 transition-colors cursor-default
        ${isSelected ? 'bg-primary/8 ring-1 ring-inset ring-primary/30' : ''}
        ${isHidden ? 'bg-muted/20' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="shrink-0 p-0.5 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={15} />
      </button>

      {hasChildren ? (
        <button
          type="button"
          className="shrink-0 inline-flex size-5 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-accent active:scale-[0.98] transition-all"
          onClick={() => onToggle(item._id)}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      ) : (
        <span className="size-5 shrink-0" />
      )}

      <div
        className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer"
        onClick={() => onSelect(item)}
      >
        <span
          className={`text-sm truncate font-medium ${
            !item.label
              ? 'text-muted-foreground italic'
              : isHidden
              ? 'text-muted-foreground line-through opacity-70'
              : 'text-foreground'
          }`}
        >
          {item.label || 'Chưa đặt tên'}
        </span>
        {item.badge && (
          <span
            className="inline-flex items-center rounded-[6px] px-1.5 py-0.5 text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: item.badgeColor || '#ef4444' }}
          >
            {item.badge}
          </span>
        )}
        {isHidden && (
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-[6px] px-1.5 py-0.5 shrink-0">
            Tạm ẩn
          </span>
        )}
      </div>

      <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-[6px] border ${depthColors[Math.min(depth, 2)]}`}>
        {LINK_TYPE_LABELS[item.linkType] ?? item.linkType}
      </span>

      <button
        type="button"
        className={`shrink-0 inline-flex size-6 items-center justify-center rounded-[6px] transition-all active:scale-[0.98] ${
          !isHidden
            ? 'text-muted-foreground hover:bg-accent hover:text-foreground'
            : 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
        }`}
        title={!isHidden ? 'Tạm ẩn mục này (không hiển thị trên web)' : 'Hiện lại mục này'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleActive(item._id);
        }}
      >
        {!isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>

      {depth < 2 && (
        <button
          type="button"
          className="shrink-0 inline-flex size-6 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-accent hover:text-foreground transition-all active:scale-[0.98]"
          title="Thêm mục con"
          onClick={() => onAdd(item._id)}
        >
          <Plus size={13} />
        </button>
      )}

      <button
        type="button"
        className="shrink-0 inline-flex size-6 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all active:scale-[0.98]"
        title="Xóa"
        onClick={() => onDelete(item._id)}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
