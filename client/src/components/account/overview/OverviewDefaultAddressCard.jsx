'use client';

import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OverviewPinIcon } from '../AccountIcons';

export default function OverviewDefaultAddressCard({
  defaultAddress,
  handleTabChange,
  handleOpenAddAddress,
}) {
  return (
    <Card className="md:col-span-1 p-4 flex flex-col justify-between shadow-none border-slate-200">
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <CardTitle className="text-xs flex items-center gap-1.5 font-bold text-slate-800">
            <OverviewPinIcon size={14} className="text-[#e30019]" />
            <span>Địa chỉ mặc định</span>
          </CardTitle>
          <Button
            variant="link"
            size="sm"
            onClick={() => handleTabChange('addresses')}
            className="text-[11px] text-[#e30019] h-auto p-0 hover:underline"
          >
            Thay đổi
          </Button>
        </div>

        {defaultAddress ? (
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span>{defaultAddress.fullName}</span>
              <span className="text-slate-300 font-normal">|</span>
              <span className="font-mono text-slate-600 font-normal">
                {defaultAddress.phone}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {defaultAddress.detailAddress}, {defaultAddress.ward},{' '}
              {defaultAddress.district}, {defaultAddress.province}
            </p>
          </div>
        ) : (
          <div className="mt-4 text-center py-4 text-slate-400 text-xs">
            <p>Chưa có địa chỉ mặc định.</p>
            <Button
              variant="link"
              size="sm"
              onClick={handleOpenAddAddress}
              className="mt-1 text-[#e30019] text-xs h-auto p-0 hover:underline"
            >
              + Thêm địa chỉ mới
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
