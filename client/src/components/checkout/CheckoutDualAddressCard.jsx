'use client';

import React from 'react';
import { MapPin, Loader2, Building2 } from 'lucide-react';

export default function CheckoutDualAddressCard({
  customAddress = {},
  mergerData = null,
  loadingMerger = false,
}) {
  if (!customAddress.province || !customAddress.ward) {
    return null;
  }

  const cleanDetail = customAddress.detailAddress ? customAddress.detailAddress.trim() : '';
  const preMergerAddress = mergerData?.preMergerFullAddress || [
    cleanDetail,
    customAddress.ward,
    customAddress.district,
    customAddress.province,
  ].filter(Boolean).join(', ');

  const postMergerAddress = mergerData?.postMergerFullAddress || [
    cleanDetail,
    mergerData?.newWard || customAddress.ward,
    customAddress.province,
  ].filter(Boolean).join(', ');

  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[6px] text-xs space-y-2.5 animate-fadeIn">
      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
        <Building2 size={14} className="text-[#0088ff]" />
        <span>Đối soát địa chỉ hành chính (Đồng bộ GHN):</span>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-200/70">
        {/* Địa chỉ sau sáp nhập (2 cấp mới) */}
        <div className="flex items-start gap-2">
          <MapPin size={13} className="text-[#e30019] shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="text-slate-500 font-medium mr-1">
              Địa chỉ sau sáp nhập (2 cấp mới):
            </span>
            {loadingMerger && !mergerData ? (
              <span className="text-slate-400 inline-flex items-center gap-1">
                <Loader2 size={11} className="animate-spin text-[#0088ff]" />
                Đang đối soát chuẩn hóa...
              </span>
            ) : (
              <span className="text-slate-900 font-bold">
                {postMergerAddress}
              </span>
            )}
          </div>
        </div>

        {/* Địa chỉ trước sáp nhập (3 cấp truyền thống) */}
        <div className="flex items-start gap-2 text-slate-600">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5 ml-1" />
          <div className="flex-1 leading-relaxed text-[11.5px]">
            <span className="text-slate-500 font-medium mr-1">
              Địa chỉ trước sáp nhập (3 cấp cũ):
            </span>
            <span className="text-slate-700">
              {preMergerAddress}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
