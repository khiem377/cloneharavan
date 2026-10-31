import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import ScannerBotMascot from './ScannerBotMascot';

export default function ScanningPreview({ previewUrl, onCancel }) {
  return (
    <div className="py-6 px-4 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-200">
      <style>{`
        @keyframes scanBeamSweep {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 96%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        .anim-scan-beam {
          animation: scanBeamSweep 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* Robot Mascot in Scanning Mode */}
      <ScannerBotMascot state="scanning" size={130} />

      {/* Image Preview with HUD Scanner Laser Overlay */}
      <div className="relative size-44 rounded-[6px] overflow-hidden border border-slate-200 dark:border-border bg-slate-900 shadow-sm">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Đang quét"
            fill
            sizes="176px"
            className="object-cover opacity-85"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
            Ảnh tải lên
          </div>
        )}

        {/* HUD Targeting Corners */}
        <div className="absolute top-2 left-2 size-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
        <div className="absolute top-2 right-2 size-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
        <div className="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
        <div className="absolute bottom-2 right-2 size-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

        {/* Moving Laser Beam Sweep Line */}
        <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] anim-scan-beam pointer-events-none" />

        {/* Center Crosshair Target */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="size-8 rounded-full border border-dashed border-emerald-300 flex items-center justify-center">
            <div className="size-1 bg-emerald-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Progress Copy */}
      <div className="space-y-1">
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
          <span>Đang tìm kiếm sản phẩm...</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Đang so khớp ảnh với các sản phẩm tương tự trong cửa hàng
        </p>
      </div>

      {/* Cancel button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCancel}
        className="h-8 px-3 rounded-[6px] text-xs font-medium text-slate-600 hover:text-slate-900 border-slate-200 active:scale-[0.98]"
      >
        <X className="size-3.5 mr-1" />
        Hủy tìm kiếm
      </Button>
    </div>
  );
}
