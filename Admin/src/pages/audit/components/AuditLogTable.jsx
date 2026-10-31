import React from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Eye,
  CheckCircle,
  ExternalLink,
} from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DataTablePagination from '@/components/ui/DataTablePagination';

const TARGET_MODULE_URL_MAP = {
  PRODUCT: (id) => (id ? `/products?highlight=${id}` : '/products'),
  CATEGORY: (id) => (id ? `/categories?highlight=${id}` : '/categories'),
  BRAND: (id) => (id ? `/brands?highlight=${id}` : '/brands'),
  COUPON: () => '/promotions/coupons',
  PROMOTION: () => '/promotions/discounts',
  GIFT_PROGRAM: () => '/promotions/gifts',
  FLASH_SALE: () => '/promotions/flash-sales',
  USER: () => '/customers',
  ROLE: () => '/roles',
  SUPPLIER: () => '/suppliers',
  BANNER: (id) => (id ? `/banners?highlight=${id}` : '/banners'),
  MENU: () => '/menus',
  TAG: () => '/blog/tags',
  BLOG: (id) => (id ? `/blog/posts?highlight=${id}` : '/blog/posts'),
};

const getActionBadge = (action) => {
  switch (action) {
    case 'CREATE':
      return (
        <Badge variant="outline" className="rounded-[4px] px-2 py-0 text-xs font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          Tạo mới
        </Badge>
      );
    case 'UPDATE':
      return (
        <Badge variant="outline" className="rounded-[4px] px-2 py-0 text-xs font-semibold bg-blue-500/10 text-blue-600 border-blue-500/20">
          Cập nhật
        </Badge>
      );
    case 'DELETE':
      return (
        <Badge variant="outline" className="rounded-[4px] px-2 py-0 text-xs font-semibold bg-rose-500/10 text-rose-600 border-rose-500/20">
          Đã xóa
        </Badge>
      );
    case 'ROLLBACK':
      return (
        <Badge variant="outline" className="rounded-[4px] px-2 py-0 text-xs font-semibold bg-purple-500/10 text-purple-600 border-purple-500/20">
          Khôi phục
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="rounded-[4px] text-xs">{action}</Badge>;
  }
};

export default function AuditLogTable({
  logs = [],
  loading = false,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  onPageSizeChange,
  onSelectLog,
  onStartRollback,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40">
              <TableHead className="px-4 py-3 text-xs font-semibold">Thời gian</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold">Người thực hiện</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold">Hành động</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold">Phân hệ</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold">Đối tượng tác động</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold">Địa chỉ IP</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-4 py-3"><Skeleton className="h-4 w-28 rounded-[4px]" /></TableCell>
                  <TableCell className="px-4 py-3"><Skeleton className="h-4 w-32 rounded-[4px]" /></TableCell>
                  <TableCell className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-[4px]" /></TableCell>
                  <TableCell className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-[4px]" /></TableCell>
                  <TableCell className="px-4 py-3"><Skeleton className="h-4 w-36 rounded-[4px]" /></TableCell>
                  <TableCell className="px-4 py-3"><Skeleton className="h-4 w-24 rounded-[4px]" /></TableCell>
                  <TableCell className="px-4 py-3 text-right"><Skeleton className="h-7 w-20 ml-auto rounded-[4px]" /></TableCell>
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground font-mono">
                  Không tìm thấy bản ghi nhật ký kiểm toán nào
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const targetResolver = TARGET_MODULE_URL_MAP[log.module];
                const targetLink = targetResolver ? targetResolver(log.targetId) : null;
                const isClickable = Boolean(targetLink && !log.isDeleted && log.action !== 'DELETE');

                return (
                  <TableRow key={log._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap font-mono tabular-nums">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-foreground text-xs">{log.userName || 'Hệ thống'}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{log.userEmail}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">{getActionBadge(log.action)}</TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="outline" className="rounded-[4px] text-[11px] font-mono bg-muted">
                        {log.module}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {isClickable ? (
                        <Link
                          to={targetLink}
                          className="inline-flex items-center gap-1 font-medium text-xs text-primary hover:underline line-clamp-1 max-w-[220px]"
                          title="Bấm để chuyển tới trang quản lý mục này"
                        >
                          {log.targetName || log.targetId || '-'}
                          <ExternalLink className="size-3 shrink-0" />
                        </Link>
                      ) : (
                        <div className="font-medium text-foreground text-xs line-clamp-1 max-w-[220px]">
                          {log.targetName || log.targetId || '-'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap font-mono tabular-nums">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectLog(log)}
                        className="h-7 px-2 text-xs rounded-[4px]"
                      >
                        <Eye className="size-3 mr-1" /> Chi tiết
                      </Button>

                      {log.isRollbacked ? (
                        <Badge variant="outline" className="rounded-[4px] text-[11px] bg-purple-500/10 text-purple-600 border-purple-500/20">
                          <CheckCircle className="size-3 mr-1" /> Đã khôi phục
                        </Badge>
                      ) : (log.action === 'DELETE' || log.action === 'UPDATE') && log.oldData ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStartRollback(log)}
                          className="h-7 px-2 text-xs rounded-[4px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                        >
                          <RotateCcw className="size-3 mr-1" /> Khôi phục
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={page}
        pageSize={limit}
        totalItems={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </Card>
  );
}
