import React from 'react';
import { SearchIcon as Search, RefreshCw } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const MODULE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả phân hệ' },
  { value: 'PRODUCT', label: 'Sản phẩm' },
  { value: 'CATEGORY', label: 'Danh mục' },
  { value: 'BRAND', label: 'Thương hiệu' },
  { value: 'COUPON', label: 'Mã giảm giá' },
  { value: 'PROMOTION', label: 'Khuyến mãi' },
  { value: 'GIFT_PROGRAM', label: 'Tặng kèm quà' },
  { value: 'FLASH_SALE', label: 'Flash Sale' },
  { value: 'USER', label: 'Người dùng' },
  { value: 'ROLE', label: 'Phân quyền' },
  { value: 'SUPPLIER', label: 'Nhà cung cấp' },
  { value: 'BANNER', label: 'Banner' },
  { value: 'MENU', label: 'Menu' },
  { value: 'TAG', label: 'Thẻ tag' },
  { value: 'BLOG', label: 'Bài viết' },
];

const ACTION_OPTIONS = [
  { value: 'ALL', label: 'Tất cả hành động' },
  { value: 'CREATE', label: 'Thêm mới' },
  { value: 'UPDATE', label: 'Chỉnh sửa' },
  { value: 'DELETE', label: 'Xóa' },
  { value: 'ROLLBACK', label: 'Khôi phục' },
];

export default function AuditLogToolbar({
  search,
  setSearch,
  moduleVal,
  setModuleVal,
  actionVal,
  setActionVal,
  onRefresh,
  loading,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardContent className="p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Tìm theo người thực hiện, đối tượng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 rounded-[6px] text-xs"
            />
          </div>

          {/* Module Select */}
          <Select value={moduleVal} onValueChange={setModuleVal}>
            <SelectTrigger className="h-8 w-44 rounded-[6px] text-xs">
              <SelectValue placeholder="Phân hệ" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              {MODULE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action Select */}
          <Select value={actionVal} onValueChange={setActionVal}>
            <SelectTrigger className="h-8 w-40 rounded-[6px] text-xs">
              <SelectValue placeholder="Hành động" />
            </SelectTrigger>
            <SelectContent className="rounded-[6px]">
              {ACTION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 rounded-[6px] gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </CardContent>
    </Card>
  );
}
