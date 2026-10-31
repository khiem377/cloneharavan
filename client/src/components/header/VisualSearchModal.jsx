'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose,
} from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { searchService } from '../../services/search.service';

import ScannerBotMascot from './visual-search/ScannerBotMascot';
import SampleImagesRow from './visual-search/SampleImagesRow';
import ScanningPreview from './visual-search/ScanningPreview';

export const VisualSearchModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const resetState = () => {
    setError(null);
    setLoading(false);
    setPreviewUrl(null);
    setDragActive(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFile = useCallback(
    async (file, presetInfo = null) => {
      if (!file || !file.type.startsWith('image/')) {
        setError('Vui lòng chọn hoặc kéo thả tệp hình ảnh hợp lệ (PNG, JPG, WEBP).');
        return;
      }

      // Giới hạn 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError('Dung lượng hình ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
        return;
      }

      setError(null);
      setLoading(true);

      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      try {
        let detectedInfo = presetInfo;
        if (!detectedInfo) {
          const data = await searchService.searchByImage(file);
          detectedInfo = data?.detected || data?.metadata || {};
        }

        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'visual_search_data',
            JSON.stringify({
              imageUrl: localPreview,
              metadata: detectedInfo,
              detected: detectedInfo,
            })
          );
        }

        handleClose();

        const detectedQuery =
          detectedInfo.category ||
          detectedInfo.productType ||
          detectedInfo.detectedText ||
          detectedInfo.brand ||
          detectedInfo.searchKeywords?.[0] ||
          '';

        if (detectedQuery) {
          router.push(`/search?q=${encodeURIComponent(detectedQuery)}&visual=1`);
        } else {
          router.push(`/search?visual=1`);
        }
      } catch (err) {
        console.error('Lỗi tìm kiếm bằng hình ảnh:', err);
        setError(
          err?.response?.data?.message ||
            'Không thể nhận diện sản phẩm trong ảnh này. Vui lòng thử lại với góc chụp rõ hơn hoặc ảnh khác.'
        );
      } finally {
        setLoading(false);
      }
    },
    [router, onClose]
  );

  // Lắng nghe sự kiện Paste (Ctrl + V / Cmd + V) khi modal đang mở
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, handleFile]);

  // Drag & drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogHeader>
        <div>
          <DialogTitle>Tìm kiếm bằng hình ảnh</DialogTitle>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Tìm kiếm nhanh sản phẩm tương tự từ ảnh chụp hoặc ảnh tải lên
          </p>
        </div>
        <DialogClose onClick={handleClose} />
      </DialogHeader>

      <DialogContent className="p-4 sm:p-5 space-y-4">
        {loading ? (
          <ScanningPreview
            previewUrl={previewUrl}
            onCancel={() => {
              resetState();
            }}
          />
        ) : (
          <>
            {/* Dropzone Container */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-[6px] py-6 px-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 select-none ${
                dragActive
                  ? 'border-red-500 bg-red-50/60 dark:bg-red-950/20 scale-[1.01]'
                  : 'border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card/50 hover:border-red-500/60 hover:bg-slate-50 dark:hover:bg-muted/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {/* Animated Computer on Desk with Mascot Reaching Into Screen to Toss Photo */}
              <ScannerBotMascot state={dragActive ? 'drag' : 'idle'} size={290} />

              {/* Upload Copy & CTA */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {dragActive ? (
                    <span className="text-red-600 font-bold">Thả ảnh vào đây để nhận diện ngay!</span>
                  ) : (
                    <>
                      Kéo thả ảnh vào đây hoặc{' '}
                      <span className="text-red-600 hover:underline font-bold">tải ảnh từ máy</span>
                    </>
                  )}
                </p>
                <p className="text-[11px] text-slate-400">
                  Hỗ trợ PNG, JPG, WEBP (tối đa 5MB) • Dán ảnh Ctrl + V
                </p>
              </div>
            </div>

            {/* Error Message with Retry */}
            {error && (
              <div className="p-3 rounded-[6px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs flex items-start justify-between gap-2 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                    fileInputRef.current?.click();
                  }}
                  className="h-6 px-2 text-[11px] rounded-[4px] border-red-200 hover:bg-red-100 text-red-700 active:scale-[0.98]"
                >
                  <RefreshCw className="size-3 mr-1" /> Thử lại
                </Button>
              </div>
            )}

            {/* Quick Test Sample Images */}
            <SampleImagesRow
              onSelectSample={(file, preset) => handleFile(file, preset)}
              disabled={loading}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VisualSearchModal;
