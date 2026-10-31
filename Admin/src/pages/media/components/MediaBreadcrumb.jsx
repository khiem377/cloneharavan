import React from 'react';
import { ChevronRight } from '@/components/ui/Icons';

export function flattenFolders(folders, level = 0) {
  const result = [];
  for (const f of folders) {
    result.push({ _id: f._id, name: f.name, level });
    if (f.children?.length) result.push(...flattenFolders(f.children, level + 1));
  }
  return result;
}

function buildBreadcrumb(folders, targetId) {
  const map = {};
  const flatten = (items) => items.forEach((f) => {
    map[f._id] = f;
    if (f.children) flatten(f.children);
  });
  flatten(folders);
  const crumbs = [];
  let current = map[targetId];
  while (current) {
    crumbs.unshift(current);
    current = current.parentId ? map[current.parentId] : null;
  }
  return crumbs;
}

export default function MediaBreadcrumb({ folders, selectedFolder, onSelect }) {
  if (!selectedFolder) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Media</span>
      </div>
    );
  }
  const crumbs = buildBreadcrumb(folders, selectedFolder);
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <button className="hover:text-foreground transition-colors cursor-pointer" onClick={() => onSelect(null)}>
        Media
      </button>
      {crumbs.map((c, i) => (
        <span key={c._id} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-muted-foreground/50" />
          {i === crumbs.length - 1 ? (
            <span className="font-semibold text-foreground">{c.name}</span>
          ) : (
            <button className="hover:text-foreground transition-colors cursor-pointer" onClick={() => onSelect(c._id)}>
              {c.name}
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
