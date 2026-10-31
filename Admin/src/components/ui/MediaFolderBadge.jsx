import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, ExternalLink } from '@/components/ui/Icons';
import { useMediaUsage } from '@/hooks/useMedia';

function getFolderInfo(media) {
  if (!media?.folderId) return null;
  const folder = media.folderId;
  if (typeof folder === 'string') return null;
  const parent = folder.parentId;
  const path = parent && typeof parent === 'object'
    ? `${parent.name} / ${folder.name}`
    : folder.name;
  return { path, id: folder._id };
}

export function MediaUsageList({ mediaId }) {
  const { data: usages = [], isLoading } = useMediaUsage(mediaId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground animate-pulse">
        <div className="h-2 w-24 rounded-[4px] bg-muted" />
      </div>
    );
  }

  if (!usages.length) {
    return (
      <span className="inline-flex items-center gap-1 rounded-[4px] bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
        Chưa sử dụng
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
          className="inline-flex items-center gap-1.5 rounded-[6px] bg-primary/5 border border-primary/15 px-2 py-1 text-[10px] text-primary font-medium hover:bg-primary/10 transition-colors"
        >
          <span className="truncate flex-1">{u.displayName}: {u.entityName}</span>
          <ExternalLink size={9} className="shrink-0" />
        </a>
      ))}
    </div>
  );
}

export function MediaFolderTag({ media }) {
  const info = getFolderInfo(media);
  if (!info) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-black/60 px-1.5 py-0.5 text-[10px] text-white font-medium">
      <Folder size={9} className="shrink-0" />
      <span className="truncate max-w-[120px]">{info.path}</span>
    </span>
  );
}

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
          className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-1 bg-black/75 hover:bg-black/90 px-1.5 py-1 rounded-b-[6px] transition-colors w-full text-left"
          title={`Mở thư mục: ${folderInfo.path}`}
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
