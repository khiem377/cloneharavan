'use client';

import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export default function AddressMergerPreview({
  preMergerAddress,
  postMergerAddress,
  loadingMerger,
  mergerData,
}) {
  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[6px] text-xs space-y-2.5 animate-fadeIn">
      <div className="flex items-start gap-2.5">
        <div className="size-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
        <div className="flex-1 leading-relaxed">
          <span className="text-slate-500 font-medium mr-1.5">
            Địa chỉ trước sáp nhập:
          </span>
          <span className="text-slate-700 font-medium">
            {preMergerAddress}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-200/80" />

      <div className="flex items-start gap-2.5">
        <MapPin size={14} className="text-[#e30019] shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">
          <span className="text-slate-500 font-medium mr-1.5">
            Địa chỉ sau sáp nhập:
          </span>
          {loadingMerger && !mergerData ? (
            <span className="text-slate-400 inline-flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin text-[#e30019]" />
              Đang tra cứu...
            </span>
          ) : (
            <span className="text-slate-900 font-semibold">
              {postMergerAddress}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
