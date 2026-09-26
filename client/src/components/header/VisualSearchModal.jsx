'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../common/Icon';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose,
} from '../ui/dialog';
import { searchService } from '../../services/search.service';

export const VisualSearchModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await searchService.searchByImage(file);
      if (typeof window !== 'undefined') {
        const preview = URL.createObjectURL(file);
        sessionStorage.setItem(
          'visual_search_data',
          JSON.stringify({
            imageUrl: preview,
            metadata: data?.metadata || {},
          })
        );
      }

      onClose();
      const detectedQuery =
        data?.metadata?.category ||
        data?.metadata?.searchKeywords?.[0] ||
        'Tivi';

      router.push(`/search?q=${encodeURIComponent(detectedQuery)}&visual=1`);
    } catch (err) {
      console.error('Image search failed:', err);
      setError(
        err?.response?.data?.message ||
          'Không thể nhận diện hình ảnh này. Vui lòng thử lại với ảnh khác.'
      );
    } finally {
      setLoading(false);
    }
  };

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Icon name="camera" size={18} className="text-gray-700" />
          <DialogTitle>Tìm kiếm bằng hình ảnh</DialogTitle>
        </div>
        <DialogClose onClick={onClose} />
      </DialogHeader>

      <DialogContent>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-red-600 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-900">
              Đang nhận diện sản phẩm...
            </p>
            <p className="text-xs text-gray-500">
              Hệ thống đang tìm kiếm các sản phẩm tương đồng
            </p>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl py-10 px-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? 'border-red-600 bg-red-50/50'
                : 'border-gray-200 hover:border-red-500 hover:bg-gray-50'
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

            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <Icon name="cloud-upload" size={24} />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-800">
                Kéo thả ảnh vào đây hoặc{' '}
                <span className="text-red-600 underline">tải ảnh từ máy</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Hỗ trợ định dạng PNG, JPG, WEBP (tối đa 5MB)
              </p>
            </div>

            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                {error}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VisualSearchModal;
