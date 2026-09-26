import React, { useState, useEffect, useCallback } from 'react';
import {
  History, SearchIcon as Search, RotateCcw, Eye, Calendar, UsersIcon as User,
  Activity, CheckCircle, AlertTriangle, Clock, Shield, FileText, ExternalLink,
} from '@/components/ui/Icons';
import auditLogService from '../../services/auditLog.service';
import SearchableSelect from '../../components/ui/SearchableSelect';
import DataTablePagination from '../../components/ui/DataTablePagination';
import { toast } from '@/providers/ToastProvider';

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
    return <span className="text-slate-400 font-italic">(Không có)</span>;
  }
  if (typeof val === 'boolean') {
    return val ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Bật (Hoạt động)
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        Tắt (Tạm ẩn)
      </span>
    );
  }
  if (typeof val === 'number' && (field.toLowerCase().includes('price') || field.toLowerCase().includes('value') || field.toLowerCase().includes('discount'))) {
    return `${val.toLocaleString('vi-VN')} đ`;
  }
  if (typeof val === 'object') {
    if (val.url) {
      return (
        <div className="flex items-center gap-2">
          <img src={val.url} alt="" className="w-8 h-8 rounded object-cover border border-slate-200" />
          <span className="text-xs text-slate-600 truncate max-w-[150px]">{val.url}</span>
        </div>
      );
    }
    return <span className="text-xs font-mono text-slate-600">{JSON.stringify(val)}</span>;
  }
  return String(val);
};

import { Link } from 'react-router-dom';

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
  const [totalPages, setTotalPages] = useState(1);

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
        setTotalPages(payload.pagination?.totalPages || 1);
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
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Thêm mới</span>;
      case 'UPDATE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Chỉnh sửa</span>;
      case 'DELETE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">Xóa</span>;
      case 'ROLLBACK':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">Khôi phục</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">{action}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <History className="w-6 h-6 text-slate-700" />
            Nhật Ký Thao Tác (Audit Logs)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi chi tiết lịch sử thay đổi, người thực hiện và khôi phục dữ liệu an toàn.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-card p-4 rounded-lg border border-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo đối tượng, user, email..."
              value={query.search}
              onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
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
          <button
            onClick={() => setQuery({ page: 1, limit: 10, search: '', module: '', action: '' })}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-border text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Người thực hiện</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3">Phân hệ</th>
                <th className="px-4 py-3">Mục thay đổi</th>
                <th className="px-4 py-3">IP / Trình duyệt</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Đang tải nhật ký thao tác...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    Không tìm thấy nhật ký thao tác phù hợp
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const targetLink = getModuleTargetLink(log.module, log.targetId, log.targetName);
                  const isClickable = targetLink && log.action !== 'DELETE' && !log.isRollbacked;

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800 text-xs">{log.userName || 'Hệ thống'}</div>
                        <div className="text-[11px] text-slate-400">{log.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{getActionBadge(log.action)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isClickable ? (
                          <Link
                            to={targetLink}
                            className="inline-flex items-center gap-1 font-semibold text-xs text-blue-600 hover:text-blue-800 hover:underline line-clamp-1 max-w-[220px]"
                            title="Bấm để chuyển tới trang quản lý mục này"
                          >
                            {log.targetName || log.targetId || '-'}
                            <ExternalLink className="w-3 h-3 shrink-0 text-blue-500" />
                          </Link>
                        ) : (
                          <div className="font-medium text-slate-800 text-xs line-clamp-1 max-w-[220px]">
                            {log.targetName || log.targetId || '-'}
                          </div>
                        )}
                      </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap font-mono">
                      {log.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                      </button>

                      {log.isRollbacked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded border border-purple-200">
                          <CheckCircle className="w-3 h-3" /> Đã khôi phục
                        </span>
                      ) : (log.action === 'DELETE' || log.action === 'UPDATE') && log.oldData ? (
                        <button
                          onClick={() => {
                            setLogToRollback(log);
                            setShowConfirmModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border">
          <DataTablePagination
            page={query.page}
            pageSize={query.limit}
            totalItems={total}
            onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
            onPageSizeChange={(limit) => setQuery((prev) => ({ ...prev, limit, page: 1 }))}
          />
        </div>
      </div>

      {/* Detail / Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl rounded-lg border border-border shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  Chi Tiết Thao Tác: <span className="font-bold text-slate-900">{selectedLog.targetName || selectedLog.module}</span>
                </h2>
                {getActionBadge(selectedLog.action)}
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-200 p-0.5 rounded-md flex text-xs font-medium">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded-sm transition-colors ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Xem dạng Bảng
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`px-3 py-1 rounded-sm transition-colors ${
                      viewMode === 'json' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mã JSON (Dev)
                  </button>
                </div>

                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg pl-2"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block">Thời gian:</span>
                  <span className="font-medium text-slate-700">
                    {new Date(selectedLog.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Người thực hiện:</span>
                  <span className="font-medium text-slate-700">{selectedLog.userName || 'Hệ thống'}</span>
                  <span className="text-[10px] text-slate-400 block">{selectedLog.userEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phân hệ:</span>
                  <span className="font-medium text-slate-700">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Địa chỉ IP:</span>
                  <span className="font-mono text-slate-700">{selectedLog.ipAddress}</span>
                </div>
              </div>

              {viewMode === 'table' ? (
                /* HUMAN READABLE TABLE VIEW */
                <div className="space-y-4">
                  {selectedLog.changes && selectedLog.changes.length > 0 ? (
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm mb-3">So Sánh Chi Tiết Thuộc Tính Thay Đổi:</h3>
                      <div className="border border-border rounded-lg overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-border">
                            <tr>
                              <th className="p-3">Thuộc tính</th>
                              <th className="p-3 text-rose-700 bg-rose-50/50">Giá trị Ban Đầu (Cũ)</th>
                              <th className="p-3 text-emerald-700 bg-emerald-50/50">Giá trị Sau Thay Đổi (Mới)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-white">
                            {selectedLog.changes.map((c, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="p-3 font-medium text-slate-800">
                                  {getFriendlyFieldName(c.field)}
                                  <span className="block text-[10px] text-slate-400 font-mono font-normal">{c.field}</span>
                                </td>
                                <td className="p-3 bg-rose-50/20 text-slate-700">
                                  {formatFriendlyValue(c.field, c.oldValue)}
                                </td>
                                <td className="p-3 bg-emerald-50/20 text-slate-700">
                                  {formatFriendlyValue(c.field, c.newValue)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : selectedLog.oldData || selectedLog.newData ? (
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm mb-3">Thông Tin Chi Tiết Bản Ghi:</h3>
                      <div className="border border-border rounded-lg overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-border">
                            <tr>
                              <th className="p-3">Thuộc tính</th>
                              <th className="p-3">Giá trị</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-white">
                            {Object.entries(selectedLog.newData || selectedLog.oldData || {})
                              .filter(([k]) => !['_id', '__v', 'createdAt', 'updatedAt', 'password'].includes(k))
                              .map(([k, v], i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="p-3 font-medium text-slate-800">
                                    {getFriendlyFieldName(k)}
                                    <span className="block text-[10px] text-slate-400 font-mono font-normal">{k}</span>
                                  </td>
                                  <td className="p-3 text-slate-700">{formatFriendlyValue(k, v)}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">Không có dữ liệu snapshot</div>
                  )}
                </div>
              ) : (
                /* RAW JSON VIEW FOR DEVS */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLog.oldData && (
                    <div>
                      <h4 className="font-semibold text-slate-700 text-xs mb-1">Dữ Liệu Ban Đầu (Old Data):</h4>
                      <pre className="bg-slate-950 text-slate-200 p-3 rounded text-[11px] overflow-x-auto max-h-60 font-mono">
                        {JSON.stringify(selectedLog.oldData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.newData && (
                    <div>
                      <h4 className="font-semibold text-slate-700 text-xs mb-1">Dữ Liệu Mới (New Data):</h4>
                      <pre className="bg-slate-950 text-slate-200 p-3 rounded text-[11px] overflow-x-auto max-h-60 font-mono">
                        {JSON.stringify(selectedLog.newData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-border bg-slate-50 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && logToRollback && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-lg border border-border shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-slate-800 text-base">Xác Nhận Khôi Phục Dữ Liệu</h3>
            </div>

            <p className="text-sm text-slate-600">
              Bạn có chắc chắn muốn khôi phục dữ liệu cho đối tượng{' '}
              <strong className="text-slate-900">{logToRollback.targetName || logToRollback.module}</strong> về trạng thái lúc{' '}
              {new Date(logToRollback.createdAt).toLocaleString('vi-VN')} không?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setLogToRollback(null);
                }}
                disabled={rollbackLoading}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRollback}
                disabled={rollbackLoading}
                className="px-4 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors flex items-center gap-2"
              >
                {rollbackLoading && <Clock className="w-4 h-4 animate-spin" />}
                Xác Nhận Khôi Phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
