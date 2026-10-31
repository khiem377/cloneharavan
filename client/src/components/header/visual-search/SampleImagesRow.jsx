import React, { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

const SAMPLES = [
  {
    id: 'tivi',
    title: 'Smart Tivi',
    src: '/images/categories/tivi.jpg',
    fileName: 'sample-tivi.jpg',
    preset: {
      category: 'Tivi',
      productType: 'Smart Tivi',
      brand: 'Samsung',
      detectedText: 'Smart Tivi',
      searchKeywords: ['Tivi', 'Smart Tivi'],
    },
  },
  {
    id: 'loa',
    title: 'Loa Bluetooth',
    src: '/images/categories/loa-am-thanh.jpg',
    fileName: 'sample-loa.jpg',
    preset: {
      category: 'Loa - Âm thanh',
      productType: 'Loa Bluetooth',
      brand: 'Marshall',
      detectedText: 'Loa Bluetooth',
      searchKeywords: ['Loa', 'Loa Bluetooth'],
    },
  },
  {
    id: 'tulanh',
    title: 'Tủ Lạnh',
    src: '/images/categories/tu-lanh.jpg',
    fileName: 'sample-tulanh.jpg',
    preset: {
      category: 'Tủ Lạnh',
      productType: 'Tủ Lạnh Inverter',
      brand: 'Panasonic',
      detectedText: 'Tủ Lạnh',
      searchKeywords: ['Tủ Lạnh'],
    },
  },
  {
    id: 'maygiat',
    title: 'Máy Giặt',
    src: '/images/categories/may-giat.jpg',
    fileName: 'sample-maygiat.jpg',
    preset: {
      category: 'Máy Giặt',
      productType: 'Máy Giặt lồng ngang',
      brand: 'LG',
      detectedText: 'Máy Giặt',
      searchKeywords: ['Máy Giặt'],
    },
  },
];

export default function SampleImagesRow({ onSelectSample, disabled = false }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleClick = async (sample) => {
    if (disabled || loadingId) return;
    try {
      setLoadingId(sample.id);
      const res = await fetch(sample.src);
      const blob = await res.blob();
      const file = new File([blob], sample.fileName, { type: blob.type || 'image/jpeg' });
      onSelectSample(file, sample.preset);
    } catch (err) {
      console.error('Không thể tải ảnh mẫu:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>Thử nhanh với ảnh mẫu:</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SAMPLES.map((sample) => {
          const isLoading = loadingId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              disabled={disabled || isLoading}
              onClick={() => handleClick(sample)}
              className="group flex items-center gap-2 p-1.5 rounded-[6px] border border-slate-200 dark:border-border bg-white dark:bg-card hover:border-red-500/50 hover:bg-slate-50 dark:hover:bg-muted/50 transition-all text-left cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed select-none"
              title={`Tìm kiếm bằng ảnh: ${sample.title}`}
            >
              <div className="relative size-10 shrink-0 rounded-[4px] overflow-hidden bg-slate-100 border border-slate-100 dark:border-border/60">
                <Image
                  src={sample.src}
                  alt={sample.title}
                  fill
                  sizes="40px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {isLoading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="size-3.5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-red-600 transition-colors">
                  {sample.title}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">Bấm thử</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
