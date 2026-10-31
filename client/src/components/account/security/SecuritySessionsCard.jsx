'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SecurityDevicesIcon } from '../AccountIcons';

export default function SecuritySessionsCard({
  sessions = [],
  onOpenSessionsModal,
  onManageSessions,
}) {
  const handleOpen = onOpenSessionsModal || onManageSessions;

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <h2 className="text-sm font-bold text-slate-900">Kiểm tra bảo mật</h2>
        <p className="text-xs text-slate-500">
          Quản lý phiên đăng nhập trên các thiết bị.
        </p>
      </div>

      <Card className="rounded-[6px] border border-slate-200 bg-white overflow-hidden shadow-none divide-y divide-slate-100">
        <div
          onClick={handleOpen}
          className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-[6px] bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <SecurityDevicesIcon size={15} />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-semibold text-slate-900">Nơi bạn đã đăng nhập</h3>
              <p className="text-[11px] text-slate-500">
                {sessions.length > 0 ? `${sessions.length} phiên đang hoạt động` : '1 phiên đang hoạt động'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Xem chi tiết
            </span>
            <ChevronRight size={16} className="text-slate-400" />
          </div>
        </div>
      </Card>
    </div>
  );
}
