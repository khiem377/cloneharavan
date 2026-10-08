import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History, SearchIcon as Search, RotateCcw, Eye,
  CheckCircle, AlertTriangle, Clock, FileText, ExternalLink,
} from '@/components/ui/Icons';
import auditLogService from '../../services/auditLog.service';
import SearchableSelect from '../../components/ui/SearchableSelect';
import DataTablePagination from '../../components/ui/DataTablePagination';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const MODULE_OPTIONS = [
  { value: '', label: 'Tất cả phân hệ' },
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
  { value: '', label: 'Tất cả hành động' },
  { value: 'CREATE', label: 'Thêm mới' },
  { value: 'UPDATE', label: 'Chỉnh sửa' },
  { value: 'DELETE', label: 'Xóa' },
  { value: 'ROLLBACK', label: 'Khôi phục' },
];

const FIELD_NAME_MAP = {
  name: 'Tên đối tượng',
  description: 'Mô tả',
  slug: 'Đường dẫn (Slug)',
  price: 'Giá niêm yết',
  costPrice: 'Giá vốn nhập hàng',
  salePrice: 'Giá khuyến mãi',
  stock: 'Số lượng tồn kho',
  unit: 'Đơn vị tính',
  isActive: 'Trạng thái hoạt động',
  status: 'Trạng thái xuất bản',
  sku: 'Mã quản lý (SKU)',
  code: 'Mã giảm giá/mã định danh',
  productCode: 'Mã sản phẩm',
  isDefault: 'Biến thể mặc định',
  isFeatured: 'Sản phẩm nổi bật',
  isHot: 'Sản phẩm bán chạy',
  value: 'Giá trị giảm',
  type: 'Loại hình áp dụng',
  minOrderValue: 'Đơn hàng tối thiểu',
  maxDiscount: 'Mức giảm tối đa',
  usedCount: 'Lượt đã dùng',
  usageLimit: 'Giới hạn tổng lượt dùng',
  giftLimit: 'Giới hạn quà tặng',
  giftUsedCount: 'Số quà đã trao',
  postCount: 'Số bài viết đính kèm',
};

const getFriendlyFieldName = (field) => {
  return FIELD_NAME_MAP[field] || field;
};

const formatFriendlyValue = (field, val) => {
  if (val === null || val === undefined || val === '') {
    return <span className="text-muted-foreground italic">(Không có)</span>;
  }
  if (typeof val === 'boolean') {
    return val ? (
      <Badge variant="outline" className="rounded-[4px] px-2 py-0 text-xs font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
        Bật (Hoạt động)
      </Badge>
    ) : (
      <Badge variant="outline" className="rounded-[4px] px-2 py-0 text-xs font-semibold bg-rose-500/10 text-rose-600 border-rose-500/20">
        Tắt (Tạm ẩn)
      </Badge>
    );
  }
  if (typeof val === 'number' && (field.toLowerCase().includes('price') || field.toLowerCase().includes('value') || field.toLowerCase().includes('discount'))) {
    return `${val.toLocaleString('vi-VN')} đ`;
  }
  if (typeof val === 'object') {
    if (val.url) {
      return (
        <div className="flex items-center gap-2">
          <img src={val.url} alt="" className="size-8 rounded-[4px] object-cover border border-border" />
          <span className="text-xs text-muted-foreground truncate max-w-[150px]">{val.url}</span>
        </div>
      );
    }
    return <span className="text-xs font-mono text-muted-foreground">{JSON.stringify(val)}</span>;
  }
  return String(val);
};

const getModuleTargetLink = (module, targetId, targetName) => {
  const searchQuery = targetName ? `?search=${encodeURIComponent(targetName)}` : '';
  switch (module) {
    case 'PRODUCT':
      return targetId ? `/products/${targetId}/edit` : `/products${searchQuery}`;
    case 'BLOG':
      return targetId ? `/blog/posts/${targetId}/edit` : `/blog/posts${searchQuery}`;
    case 'MENU':
      return targetId ? `/menus/${targetId}/edit` : `/menus${searchQuery}`;
    case 'CATEGORY':
      return `/categories${searchQuery}`;
    case 'BRAND':
      return `/brands${searchQuery}`;
    case 'COUPON':
      return `/promotions/coupons${searchQuery}`;
    case 'PROMOTION':
      return `/promotions/discounts${searchQuery}`;
    case 'GIFT_PROGRAM':
      return `/promotions/gifts${searchQuery}`;
    case 'FLASH_SALE':
      return `/promotions/flash-sales${searchQuery}`;
    case 'TAG':
      return `/blog/tags${searchQuery}`;
    case 'BLOG_CATEGORY':
      return `/blog/categories${searchQuery}`;
    case 'ROLE':
      return `/roles${searchQuery}`;
    case 'BANNER':
      return `/banners${searchQuery}`;
    case 'SUPPLIER':
      return `/suppliers${searchQuery}`;
    case 'STOCK_AUDIT':
      return `/stock-audits${searchQuery}`;
    case 'STOCK_EXPORT':
      return `/stock-exports${searchQuery}`;
    case 'STOCK_RECEIVING':
      return `/stock-receivings${searchQuery}`;
    case 'PURCHASE_ORDER':
      return `/purchase-orders${searchQuery}`;
    default:
      return null;
  }
};

export default function AuditLogListPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
    module: '',
    action: '',
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'json'
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [logToRollback, setLogToRollback] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogService.getLogs(query);
      if (res.data?.status === 'success' || res.data?.data) {
        const payload = res.data.data ? res.data : res;
        setLogs(payload.data || []);
        setTotal(payload.pagination?.total || 0);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Lỗi khi tải nhật ký thao tác');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRollback = async () => {
    if (!logToRollback) return;
    setRollbackLoading(true);
    try {
      const res = await auditLogService.rollback(logToRollback._id);
      toast.success(res.data?.message || 'Khôi phục dữ liệu thành công!');
      setShowConfirmModal(false);
      setLogToRollback(null);
      fetchLogs();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Khôi phục thất bại!');
    } finally {
      setRollbackLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="outline" className="rounded-[4px] text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Thêm mới</Badge>;
      case 'UPDATE':
        return <Badge variant="outline" className="rounded-[4px] text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Chỉnh sửa</Badge>;
      case 'DELETE':
        return <Badge variant="outline" className="rounded-[4px] text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">Xóa</Badge>;
      case 'ROLLBACK':
        return <Badge variant="outline" className="rounded-[4px] text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">Khôi phục</Badge>;
      default:
        return <Badge variant="outline" className="rounded-[4px] text-xs font-medium bg-muted text-muted-foreground border-border">{action}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 text-foreground">
      {/* Header */}
      <Card className="rounded-[6px] border border-border shadow-none">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <History className="size-6 text-primary" />
              Nhật Ký Thao Tác (Audit Logs)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono tabular-nums">
              Theo dõi chi tiết lịch sử thay đổi ({total} bản ghi), người thực hiện và khôi phục dữ liệu an toàn.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card className="rounded-[6px] border border-border shadow-none">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm theo đối tượng, user, email..."
                value={query.search}
                onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                className="h-9 pl-8 rounded-[6px] text-xs"
              />
            </div>

            {/* Module Filter */}
            <div>
              <SearchableSelect
                options={MODULE_OPTIONS}
                value={query.module}
                onChange={(val) => setQuery((prev) => ({ ...prev, module: val, page: 1 }))}
                placeholder="Chọn phân hệ"
              />
            </div>

            {/* Action Filter */}
            <div>
              <SearchableSelect
                options={ACTION_OPTIONS}
                value={query.action}
                onChange={(val) => setQuery((prev) => ({ ...prev, action: val, page: 1 }))}
                placeholder="Chọn hành động"
              />
            </div>

            {/* Reset Filters */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuery({ page: 1, limit: 10, search: '', module: '', action: '' })}
              className="h-9 rounded-[6px] text-xs"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="rounded-[6px] border border-border shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border">
                <TableHead className="px-4 py-3 text-xs">Thời gian</TableHead>
                <TableHead className="px-4 py-3 text-xs">Người thực hiện</TableHead>
                <TableHead className="px-4 py-3 text-xs">Hành động</TableHead>
                <TableHead className="px-4 py-3 text-xs">Phân hệ</TableHead>
                <TableHead className="px-4 py-3 text-xs">Mục thay đổi</TableHead>
                <TableHead className="px-4 py-3 text-xs">IP / Trình duyệt</TableHead>
                <TableHead className="px-4 py-3 text-xs text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <Clock className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    Đang tải nhật ký thao tác...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-xs font-mono">
                    Không tìm thấy nhật ký thao tác phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const targetLink = getModuleTargetLink(log.module, log.targetId, log.targetName);
                  const isClickable = targetLink && log.action !== 'DELETE' && !log.isRollbacked;

                  return (
                    <TableRow key={log._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3 text-xs text-muted-foreground font-mono tabular-nums whitespace-nowrap">
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
                          onClick={() => setSelectedLog(log)}
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
                            onClick={() => {
                              setLogToRollback(log);
                              setShowConfirmModal(true);
                            }}
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

        {/* Pagination */}
        <DataTablePagination
          page={query.page}
          pageSize={query.limit}
          totalItems={total}
          onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
          onPageSizeChange={(limit) => setQuery((prev) => ({ ...prev, limit, page: 1 }))}
        />
      </Card>

      {/* Detail / Diff Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => { if (!open) setSelectedLog(null); }}>
        <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-0 rounded-[6px] border border-border">
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <FileText className="size-4 text-primary" />
                Chi Tiết Thao Tác: <span className="font-bold">{selectedLog?.targetName || selectedLog?.module}</span>
              </DialogTitle>
              {selectedLog && getActionBadge(selectedLog.action)}
            </div>

            <div className="flex items-center gap-1 bg-muted p-0.5 rounded-[4px] text-xs font-medium">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-[3px] transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-background text-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Xem dạng Bảng
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-2.5 py-1 rounded-[3px] transition-colors cursor-pointer ${
                  viewMode === 'json' ? 'bg-background text-foreground shadow-2xs font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mã JSON (Dev)
              </button>
            </div>
          </DialogHeader>

          {selectedLog && (
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-[6px] border border-border font-mono tabular-nums">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Thời gian:</span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedLog.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Người thực hiện:</span>
                  <span className="font-medium text-foreground">{selectedLog.userName || 'Hệ thống'}</span>
                  <span className="text-[10px] text-muted-foreground block">{selectedLog.userEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Phân hệ:</span>
                  <span className="font-medium text-foreground">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Địa chỉ IP:</span>
                  <span className="text-foreground">{selectedLog.ipAddress}</span>
                </div>
              </div>

              {viewMode === 'table' ? (
                <div className="space-y-3">
                  {selectedLog.changes && selectedLog.changes.length > 0 ? (
                    <div>
                      <h3 className="font-semibold text-foreground text-xs mb-2">So Sánh Chi Tiết Thuộc Tính Thay Đổi:</h3>
                      <div className="border border-border rounded-[6px] overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="p-2.5 text-xs">Thuộc tính</TableHead>
                              <TableHead className="p-2.5 text-xs text-rose-600 bg-rose-500/5">Giá trị Ban Đầu (Cũ)</TableHead>
                              <TableHead className="p-2.5 text-xs text-emerald-600 bg-emerald-500/5">Giá trị Sau Thay Đổi (Mới)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-border">
                            {selectedLog.changes.map((c, i) => (
                              <TableRow key={i} className="hover:bg-muted/20">
                                <TableCell className="p-2.5 font-medium text-foreground">
                                  {getFriendlyFieldName(c.field)}
                                  <span className="block text-[10px] text-muted-foreground font-mono font-normal">{c.field}</span>
                                </TableCell>
                                <TableCell className="p-2.5 bg-rose-500/5 text-foreground font-mono tabular-nums">
                                  {formatFriendlyValue(c.field, c.oldValue)}
                                </TableCell>
                                <TableCell className="p-2.5 bg-emerald-500/5 text-foreground font-mono tabular-nums">
                                  {formatFriendlyValue(c.field, c.newValue)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : selectedLog.oldData || selectedLog.newData ? (
                    <div>
                      <h3 className="font-semibold text-foreground text-xs mb-2">Thông Tin Chi Tiết Bản Ghi:</h3>
                      <div className="border border-border rounded-[6px] overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="p-2.5 text-xs">Thuộc tính</TableHead>
                              <TableHead className="p-2.5 text-xs">Giá trị</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-border">
                            {Object.entries(selectedLog.newData || selectedLog.oldData || {})
                              .filter(([k]) => !['_id', '__v', 'createdAt', 'updatedAt', 'password'].includes(k))
                              .map(([k, v], i) => (
                                <TableRow key={i} className="hover:bg-muted/20">
                                  <TableCell className="p-2.5 font-medium text-foreground">
                                    {getFriendlyFieldName(k)}
                                    <span className="block text-[10px] text-muted-foreground font-mono font-normal">{k}</span>
                                  </TableCell>
                                  <TableCell className="p-2.5 text-foreground font-mono tabular-nums">{formatFriendlyValue(k, v)}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground font-mono">Không có dữ liệu snapshot</div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                  {selectedLog.oldData && (
                    <div>
                      <h4 className="font-semibold text-foreground text-xs mb-1">Dữ Liệu Ban Đầu (Old Data):</h4>
                      <pre className="bg-muted p-3 rounded-[6px] border border-border text-[11px] overflow-x-auto max-h-60">
                        {JSON.stringify(selectedLog.oldData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.newData && (
                    <div>
                      <h4 className="font-semibold text-foreground text-xs mb-1">Dữ Liệu Mới (New Data):</h4>
                      <pre className="bg-muted p-3 rounded-[6px] border border-border text-[11px] overflow-x-auto max-h-60">
                        {JSON.stringify(selectedLog.newData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLog(null)}
              className="h-8 rounded-[6px] text-xs"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal && !!logToRollback} onOpenChange={(open) => { if (!open) setShowConfirmModal(false); }}>
        <DialogContent className="max-w-md rounded-[6px] border border-border p-6">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2 text-amber-600">
              <AlertTriangle className="size-5" /> Xác Nhận Khôi Phục Dữ Liệu
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground py-2 leading-relaxed">
            Bạn có chắc chắn muốn khôi phục dữ liệu cho đối tượng{' '}
            <strong className="text-foreground">{logToRollback?.targetName || logToRollback?.module}</strong> về trạng thái lúc{' '}
            {logToRollback && new Date(logToRollback.createdAt).toLocaleString('vi-VN')} không?
          </p>

          <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2 bg-transparent">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowConfirmModal(false);
                setLogToRollback(null);
              }}
              disabled={rollbackLoading}
              className="h-8 rounded-[6px] text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              size="sm"
              onClick={handleRollback}
              disabled={rollbackLoading}
              className="h-8 rounded-[6px] text-xs bg-amber-600 hover:bg-amber-700 text-white active:scale-[0.98] transition-transform"
            >
              {rollbackLoading && <Clock className="size-3.5 mr-1.5 animate-spin" />}
              Xác Nhận Khôi Phục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
