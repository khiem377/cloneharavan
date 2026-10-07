'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
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

  const detectedInfo = [category, brand, color].filter(Boolean).join(' • ') || 'Sản phẩm tương đồng';

  return (
    <Card className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-200 bg-white rounded-[6px]">
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Ảnh tìm kiếm"
            className="w-12 h-12 object-cover rounded-[6px] border border-slate-200 shrink-0 bg-slate-50"
          />
        ) : (
          <div className="w-12 h-12 rounded-[6px] bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-medium shrink-0">
            Chưa có ảnh
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              Tìm kiếm bằng hình ảnh
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5">
            Nhận diện:{' '}
            <strong className="text-slate-800 font-semibold">
              {detectedInfo}
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
          variant="outline"
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
          className="text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50"
        >
          Xóa
        </Button>
      </div>
    </Card>
  );
}

