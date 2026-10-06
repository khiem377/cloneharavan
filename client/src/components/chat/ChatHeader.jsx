'use client';

import React from 'react';
import { Minus, X, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

import MascotBot from './MascotBot';

export default function ChatHeader({
  soundEnabled,
  onToggleSound,
  onResetSession,
  onClose,
  loading,
}) {
  return (
    <div className="bg-[#284ea1] text-white px-4 py-3 flex items-center justify-between shrink-0 select-none shadow-xs">
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white/30 bg-slate-900 shrink-0 flex items-center justify-center">
          <MascotBot size={34} isWaving={false} />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#284ea1]" />
        </div>
        <div>
          <h3 className="text-xs sm:text-[13px] font-bold text-white tracking-wide">
            Trò chuyện với chuyên viên SHOP
          </h3>
          <p className="text-[11px] text-white/80 font-normal flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sẵn sàng hỗ trợ trực tuyến 24/7</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Nút bật/tắt âm thanh */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSound}
          className="text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title={soundEnabled ? 'Tắt âm báo tin nhắn' : 'Bật âm báo tin nhắn'}
        >
          {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </Button>

        {/* Nút làm mới đoạn chat */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onResetSession}
          disabled={loading}
          className="text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title="Làm mới cuộc trò chuyện"
        >
          <RotateCcw className="size-3.5" />
        </Button>

        {/* Nút thu nhỏ / đóng */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title="Đóng cửa sổ chat"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
