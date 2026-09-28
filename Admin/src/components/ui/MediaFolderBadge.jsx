/**
 * MediaFolderBadge — hien thi folder path cua 1 anh khi hover
 *
 * Dung khi da co media object day du (co folderId.name):
 *   <MediaFolderBadge media={mediaObj} />
 /**
 * MediaFolderBadge
 * Click vao folder overlay -> navigate den /media?folder=<id>
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, ExternalLink } from '@/components/ui/Icons';
import { useMediaUsage } from '@/hooks/useMedia';

function getFolderInfo(media) {
  if (!media?.folderId) return null;
  const folder = media.folderId;
  if (typeof folder === 'string') return null; // chua populate
  const parent = folder.parentId;
  const path = parent && typeof parent === 'object'
    ? `${parent.name} / ${folder.name}`
    : folder.name;
  return { path, id: folder._id };
}

// ─── MediaUsageList — danh sach noi dung anh ───────────────────────────────
export function MediaUsageList({ mediaId }) {
  const { data: usages = [], isLoading } = useMediaUsage(mediaId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground animate-pulse">
        <div className="h-2 w-24 rounded bg-muted" />
      </div>
    );
  }

  if (!usages.length) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
        Chua su dung
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {usages.map((u, i) => (
        <a
          key={i}
          href={u.adminUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary/5 border border-primary/15 px-2 py-1 text-[10px] text-primary font-medium hover:bg-primary/10 transition-colors"
        >
          <span className="truncate flex-1">{u.displayName}: {u.entityName}</span>
          <ExternalLink size={9} className="shrink-0" />
        </a>
      ))}
    </div>
  );
}

// ─── MediaFolderTag — badge folder nho hien tren thumbnail ──────────────────
export function MediaFolderTag({ media }) {
  const info = getFolderInfo(media);
  if (!info) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white font-medium">
      <Folder size={9} className="shrink-0" />
      <span className="truncate max-w-[120px]">{info.path}</span>
    </span>
  );
}

// ─── MediaThumbnailHover — wrapper boc ngoai thumbnail, them hover overlay ──
/**
 * @param {object} media    - full media object (co folderId.name)
 * @param {node}   children - thumbnail img element
 * @param {string} className
 *
 * Khi hover: hien overlay bottom voi ten folder
 * Click vao folder badge: navigate den /media?folder=<folderId>
 */
export function MediaThumbnailHover({ media, children, className = '' }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const folderInfo = getFolderInfo(media);

  const handleFolderClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (folderInfo?.id) {
      navigate(`/media?folderId=${folderInfo.id}&mediaId=${media._id}`);
    }
  };

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {folderInfo && hovered && (
        <button
          type="button"
          onClick={handleFolderClick}
          className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-1 bg-black/75 hover:bg-black/90 px-1.5 py-1 rounded-b-md transition-colors w-full text-left"
          title={`Mo thu muc: ${folderInfo.path}`}
        >
          <Folder size={9} className="text-amber-400 shrink-0" />
          <span className="text-[9px] text-white truncate flex-1">{folderInfo.path}</span>
          <ExternalLink size={8} className="text-white/60 shrink-0" />
        </button>
      )}
    </div>
  );
}

export default MediaFolderTag;

