import React, { useState } from 'react';
import {
  FileText, SearchIcon as Search, RefreshCw, Eye, FileCheck, RotateCcw,
  Package, Layers, ArrowUpRight, ArrowDownLeft, Scale,
} from '@/components/ui/Icons';
import { useStockDocuments } from '@/hooks/useInventory';
import ExcelPreviewModal from '@/components/common/ExcelPreviewModal';
import DataTablePagination from '@/components/ui/DataTablePagination';

export default function StockDocumentListPage() {
  const [docType, setDocType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Excel Preview Modal State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const { data: resData, isLoading, refetch } = useStockDocuments({
    docType,
    search,
    page,
    limit: pageSize,
  });

  const docs = resData?.data || resData?.items || [];
  const summary = resData?.summary || {
    totalDocuments: 0,
    totalPO: 0,
    totalPR: 0,
    totalExport: 0,
    totalAudit: 0,
  };
  const pagination = resData?.pagination;

  const handleOpenPreview = (doc) => {
    setPreviewTitle(`Xem Truoc Chung Tu Excel (${doc.code})`);
    setPreviewUrl(doc.previewUrl || '');
    setPreviewOpen(true);
  };

  const getDocBadge = (type) => {
    switch (type) {
      case 'PO':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><ArrowDownLeft className="h-3 w-3" /> Đơn Nhập PO</span>;
      case 'PR':
        return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive border border-destructive/20"><RotateCcw className="h-3 w-3" /> Trả Hàng NCC</span>;
      case 'EX':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20"><ArrowUpRight className="h-3 w-3" /> Xuất Bán Hàng</span>;
      case 'AUD':
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20"><Scale className="h-3 w-3" /> Kiểm Kê Kho</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">Chứng từ</span>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Quản Lý Tất Cả Đơn & Phiếu Kho
            </h1>
            <p className="text-xs text-muted-foreground">
              Tổng hợp toàn bộ chứng từ Nhập kho PO, Trả hàng NCC, Xuất bán kho & Kiểm kê đã khởi tạo
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Tổng chứng từ</span>
            <div className="text-xl font-extrabold text-foreground">
              {summary.totalDocuments} <span className="text-xs font-normal text-muted-foreground">phiếu</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Đơn nhập kho (PO)</span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {summary.totalPO} <span className="text-xs font-normal text-muted-foreground">đơn</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Trả hàng NCC (PR)</span>
            <div className="text-xl font-extrabold text-destructive">
              {summary.totalPR} <span className="text-xs font-normal text-muted-foreground">phiếu</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Xuất kho & Kiểm kê</span>
            <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
              {summary.totalExport + summary.totalAudit} <span className="text-xs font-normal text-muted-foreground">phiếu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo mã chứng từ (PO..., PR..., EX...), tên đối tác..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setDocType('ALL'); setPage(1); }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              docType === 'ALL' ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Tất cả chứng từ
          </button>
          <button
            onClick={() => { setDocType('PO'); setPage(1); }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              docType === 'PO' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Nhập kho (PO)
          </button>
          <button
            onClick={() => { setDocType('PR'); setPage(1); }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              docType === 'PR' ? 'bg-destructive text-destructive-foreground shadow-xs' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Trả hàng (PR)
          </button>
          <button
            onClick={() => { setDocType('EX'); setPage(1); }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              docType === 'EX' ? 'bg-amber-600 text-white shadow-xs' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Xuất kho
          </button>
          <button
            onClick={() => { setDocType('AUD'); setPage(1); }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              docType === 'AUD' ? 'bg-purple-600 text-white shadow-xs' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Kiểm kê
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <th className="px-4 py-3.5 whitespace-nowrap">Mã chứng từ</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Loại phiếu</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Thời gian khởi tạo</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Đối tác / Người thực hiện</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Tổng số lượng</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Tổng giá trị (VND)</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Trạng thái</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span>Đang tải danh sách tất cả chứng từ...</span>
                    </div>
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    Không tìm thấy chứng từ nào phù hợp.
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors align-middle">
                    <td className="px-4 py-3 font-mono font-bold text-primary whitespace-nowrap">
                      {doc.code}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getDocBadge(doc.docType)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(doc.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      {doc.partnerName}
                    </td>
                    <td className="px-4 py-3 text-center font-bold whitespace-nowrap">
                      {doc.totalQty} cái
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {doc.totalAmount > 0 ? `${doc.totalAmount.toLocaleString('vi-VN')} đ` : '---'}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {doc.statusName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenPreview(doc)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" /> Xem Excel
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Component DataTablePagination Integration */}
        {pagination && (
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        )}
      </div>

      {/* Excel Preview Modal (Fix 401 authorized blob download) */}
      <ExcelPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        downloadUrl={previewUrl}
      />
    </div>
  );
}
