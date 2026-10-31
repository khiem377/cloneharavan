'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { NavWarrantyIcon, StatWarrantyIcon } from './AccountIcons';

export default function AccountWarrantyTab({
  warrantySearch,
  setWarrantySearch,
}) {
  return (
    <Card className="animate-fadeIn shadow-none border-slate-200">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <CardTitle>Thông tin bảo hành & Thiết bị</CardTitle>
          <CardDescription className="mt-0.5">
            Tra cứu thời hạn bảo hành chính hãng theo IMEI hoặc số Serial
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              type="text"
              value={warrantySearch}
              onChange={(e) => setWarrantySearch(e.target.value)}
              placeholder="Nhập số IMEI / Serial..."
              className="h-8 pl-8 text-xs font-mono rounded-[6px]"
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 rounded-[6px]"
          >
            Tra cứu
          </Button>
        </div>
      </CardHeader>
      <Separator className="mb-4" />

      <CardContent className="space-y-5">
        <Alert variant="default" className="bg-slate-50 border-slate-200">
          <NavWarrantyIcon size={16} className="text-emerald-600 shrink-0" />
          <AlertTitle className="font-bold text-slate-800 text-xs">
            Chính sách bảo hành chính hãng SHOP
          </AlertTitle>
          <AlertDescription className="text-[11px] text-slate-500">
            Toàn bộ thiết bị điện máy và công nghệ mua tại hệ thống được bảo hành điện tử tự động qua số điện thoại hoặc mã IMEI/Serial.
          </AlertDescription>
        </Alert>

        <div className="py-12 text-center text-slate-400 space-y-2">
          <div className="w-12 h-12 rounded-[6px] bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-300">
            <StatWarrantyIcon size={22} className="text-slate-400" />
          </div>
          <p className="text-xs text-slate-500">
            Chưa có thiết bị nào được kích hoạt bảo hành theo tài khoản này.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
