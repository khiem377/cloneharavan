'use client';

import React from 'react';
import { Plus, MapPin, Edit3, Trash2, Loader2, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

export default function AccountAddressesTab({
  addresses = [],
  addressLoading,
  handleOpenAddAddress,
  handleOpenEditAddress,
  handleDeleteAddress,
  handleSetDefaultAddress,
}) {
  return (
    <Card className="animate-fadeIn">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle>Địa chỉ nhận hàng</CardTitle>
          <CardDescription className="mt-0.5">
            Quản lý danh sách địa chỉ giao hàng đồng bộ với Giao Hàng Nhanh
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleOpenAddAddress}
          className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 px-3.5 shadow-xs active:scale-[0.98]"
        >
          <Plus size={14} className="mr-1.5" />
          <span>Thêm địa chỉ mới</span>
        </Button>
      </CardHeader>
      <Separator className="mb-5" />

      <CardContent>
        {addressLoading ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 size={22} className="animate-spin text-[#e30019]" />
            <span className="text-xs">Đang tải danh sách địa chỉ...</span>
          </div>
        ) : addresses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-[6px] bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-300">
              <MapPin size={22} />
            </div>
            <p className="text-xs text-slate-500">
              Bạn chưa lưu địa chỉ nhận hàng nào.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={handleOpenAddAddress}
              className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs font-semibold rounded-[6px] h-9 px-4 active:scale-[0.98]"
            >
              + Thêm địa chỉ đầu tiên
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <Card
                key={addr._id}
                className={`p-4 transition ${
                  addr.isDefault
                    ? 'bg-slate-50/60 border-slate-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">
                        {addr.fullName}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="font-mono text-slate-600 text-xs">
                        {addr.phone}
                      </span>
                      {addr.isDefault && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-[4px]"
                        >
                          Mặc định
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {!addr.isDefault && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultAddress(addr._id)}
                        className="h-8 text-xs text-slate-700 rounded-[6px] px-2.5 active:scale-[0.98]"
                      >
                        Thiết lập mặc định
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleOpenEditAddress(addr)}
                      className="h-8 w-8 text-slate-500 hover:text-[#e30019] hover:bg-slate-100 rounded-[6px] active:scale-[0.98]"
                      title="Chỉnh sửa địa chỉ"
                    >
                      <Edit3 size={15} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[6px] active:scale-[0.98]"
                      title="Xóa địa chỉ"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
