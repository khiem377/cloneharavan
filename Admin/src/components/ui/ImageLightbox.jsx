import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@/components/ui/Icons';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ImageLightbox({ image, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}><X size={18} /></button>
      <img
        src={image.url}
        alt={image.filename}
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="lightbox-info">
        {image.filename}
        {image.width && ` · ${image.width}×${image.height}`}
        {image.size && ` · ${formatSize(image.size)}`}
      </div>
    </div>,
    document.body
  );
}
