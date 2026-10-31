'use client';

import React from 'react';
import { ArrowLeftRight, Share2, Sparkles, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function CompareHeaderBar({
  productCount = 0,
  highlightDiff,
  onToggleHighlightDiff,
  onShareLink,
  copiedLink,
  onClearAll,
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Card className="rounded-[6px] border border-slate-200 bg-white shadow-2xs">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-red-50 text-[#e30019]">
                <ArrowLeftRight size={16} />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Bảng so sánh thông số kỹ thuật</span>
                <Badge variant="secondary" className="font-mono tabular-nums text-xs px-2 py-0.5 rounded-[4px] border border-slate-200 font-bold bg-slate-100 text-slate-700">
                  {productCount} sản phẩm
                </Badge>
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-9">
              Đối chiếu trực quan chi tiết cấu hình, tính năng công nghệ và mức giá ưu đãi
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Toggle Switch shadcn: Lọc điểm khác nhau */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-slate-200 bg-slate-50/50">
              <Sparkles size={14} className={highlightDiff ? 'text-amber-500' : 'text-slate-400'} />
              <label
                htmlFor="highlight-diff-switch"
                className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
              >
                Chỉ xem điểm khác nhau
              </label>
              <Switch
                id="highlight-diff-switch"
                checked={highlightDiff}
                onCheckedChange={onToggleHighlightDiff}
                className="scale-75 origin-right data-[state=checked]:bg-amber-500"
              />
            </div>

            {/* Nút chia sẻ liên kết */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onShareLink}
                  className="gap-1.5 text-xs font-semibold h-8 rounded-[6px]"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-700">Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Chia sẻ link</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sao chép liên kết so sánh vào bộ nhớ tạm</p>
              </TooltipContent>
            </Tooltip>

            {/* Nút xóa tất cả */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="gap-1 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 h-8 rounded-[6px]"
                >
                  <Trash2 size={14} />
                  <span>Xóa tất cả</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xóa toàn bộ sản phẩm khỏi danh sách so sánh</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
