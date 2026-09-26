'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../../../components/common/Icon';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { searchService } from '../../../services/search.service';

export default function VisualSearchBanner({ visualInfo = null, onClear }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  if (!visualInfo) return null;

  const { imageUrl, metadata } = visualInfo;
  const category = metadata?.category;
  const brand = metadata?.brand;
  const color = metadata?.color;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await searchService.searchByImage(file);
      if (typeof window !== 'undefined') {
        const preview = URL.createObjectURL(file);
        sessionStorage.setItem(
          'visual_search_data',
          JSON.stringify({
            imageUrl: preview,
            metadata: data.metadata,
          })
        );
      }
      const q = data.metadata?.category || data.metadata?.searchKeywords?.[0] || 'Tivi';
      router.push(`/search?q=${encodeURIComponent(q)}&visual=1`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Ảnh tìm kiếm"
            className="w-12 h-12 object-cover rounded-md border border-gray-200 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <Icon name="camera" size={20} />
          </div>
        )}

        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-900">
              Tìm kiếm bằng hình ảnh
            </span>
            <Badge variant="destructive" className="text-[10px] font-semibold px-1.5 py-0">
              AI Vision
            </Badge>
          </div>

          <p className="text-xs text-gray-500 mt-0.5">
            Nhận diện:{' '}
            <strong className="text-gray-800">
              {[category, brand, color].filter(Boolean).join(' • ') || 'Sản phẩm tương đồng'}
            </strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-medium"
        >
          Đổi ảnh khác
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs font-medium text-gray-400 hover:text-red-600"
        >
          Xóa
        </Button>
      </div>
    </Card>
  );
}
