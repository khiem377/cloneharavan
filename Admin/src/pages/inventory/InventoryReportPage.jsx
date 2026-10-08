import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3, Calendar, Filter, Printer, Download, Building2, RefreshCw,
  TrendingUp, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown, Layers, Boxes, HelpCircle,
} from '@/components/ui/Icons';
import { usePurchaseOrders, usePurchaseReturns } from '@/hooks/useInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import { inventoryReportService } from '@/services/inventoryReport.service';
import { toast } from '@/providers/ToastProvider';
import SearchableSelect from '@/components/ui/SearchableSelect';
import DateTimePicker from '@/components/ui/DateTimePicker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function HelpTooltip({ title, content }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-flex items-center cursor-help ml-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      title={title}
    >
      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors shrink-0" />
      {show && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-[6px] bg-slate-900 border border-slate-700 p-2.5 text-[11px] font-medium text-slate-100 shadow-md z-[99999] leading-relaxed text-left pointer-events-none">
          <p className="font-bold text-amber-400 mb-1">{title}:</p>
          <div>{content}</div>
        </div>
      )}
    </div>
  );
}

export default function InventoryReportPage() {
  const [activeTab, setActiveTab] = useState('nxt'); // 'nxt' | 'supplier'
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Balance N-X-T report state
  const [balanceData, setBalanceData] = useState(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Sorting state for N-X-T
  const [nxtSortField, setNxtSortField] = useState('sku');
  const [nxtSortOrder, setNxtSortOrder] = useState('asc');

  // Supplier report hook data
  const { data: poData, isLoading: isPoLoading, refetch: refetchPo } = usePurchaseOrders({ limit: 100 });
  const { data: prData, isLoading: isPrLoading, refetch: refetchPr } = usePurchaseReturns({ limit: 100 });
  const { data: supplierData } = useSuppliers({ limit: 100 });

  const suppliers = supplierData?.data || supplierData?.suppliers || [];
  const orders = poData?.orders || poData?.data || [];
  const returns = prData?.returns || prData?.data || [];

  // Fetch Balance N-X-T Report
  const fetchBalanceReport = async () => {
    try {
      setIsBalanceLoading(true);
      const res = await inventoryReportService.getBalanceReport({ startDate, endDate });
      setBalanceData(res.data);
    } catch (err) {
      toast.error('Lỗi khi tải Bảng Tổng hợp Nhập-Xuất-Tồn');
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'nxt') {
      fetchBalanceReport();
    }
  }, [activeTab, startDate, endDate]);

  // Handle Export Excel
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      toast.info('Đang khởi tạo & tải file Excel Bảng N-X-T...');
      await inventoryReportService.downloadExcel({ startDate, endDate });
      toast.success('Đã xuất file Excel Nhập-Xuất-Tồn thành công!');
    } catch (err) {
      toast.error('Không thể xuất file Excel Báo cáo');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Group report data for Supplier Tab
  const reportRows = [];
  let grandImportQty = 0;
  let grandImportSubtotal = 0;
  let grandImportTotal = 0;

  orders.forEach((po) => {
    if (selectedSupplierId && po.supplierId?._id !== selectedSupplierId && po.supplierId !== selectedSupplierId) {
      return;
    }

    po.items?.forEach((item) => {
      const qty = item.expectedQty || item.quantity || 0;
      const subtotal = item.subtotal || qty * (item.importPrice || 0);
      const discount = item.discountAmount || 0;
      const total = Math.max(0, subtotal - discount);

      grandImportQty += qty;
      grandImportSubtotal += subtotal;
      grandImportTotal += total;

      reportRows.push({
        id: `${po._id}-${item.productId}`,
        poNumber: po.poNumber,
        productName: item.productName,
        variantName: item.variantName || 'Mặc định',
        supplierName: po.supplierId?.name || po.supplierName || 'Nhà cung cấp',
        importQty: qty,
        importSubtotal: subtotal,
        discountAmount: discount,
        importTotal: total,
      });
    });
  });

  const handlePrint = () => {
    window.print();
  };

  const sortedNxtItems = useMemo(() => {
    if (!balanceData?.items) return [];
    return [...balanceData.items].sort((a, b) => {
      let valA = a[nxtSortField];
      let valB = b[nxtSortField];

      if (typeof valA === 'string') {
        const cmp = String(valA || '').localeCompare(String(valB || ''), 'vi', { sensitivity: 'base' });
        return nxtSortOrder === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return nxtSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return nxtSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [balanceData, nxtSortField, nxtSortOrder]);

  const toggleNxtSort = (field) => {
    if (nxtSortField === field) {
      setNxtSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setNxtSortField(field);
      setNxtSortOrder('asc');
    }
  };

  // Supplier chart calculations
  const supplierChartData = suppliers.map((sup) => {
    const supOrders = orders.filter((o) => (o.supplierId?._id || o.supplierId) === sup._id);
    const supReturns = returns.filter((r) => (r.supplierId?._id || r.supplierId) === sup._id);

    const importSum = supOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const returnSum = supReturns.reduce((acc, r) => acc + (r.totalAmount || 0), 0);

    return {
      supplierName: sup.name,
      importAmount: importSum,
      returnAmount: returnSum,
    };
  });

  const maxVal = Math.max(1, ...supplierChartData.map((d) => Math.max(d.importAmount, d.returnAmount)));

  return (
    <div className="space-y-6 p-6 antialiased">
      {/* Header Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Báo Cáo Quản Lý Tồn Kho & Công Nợ NCC
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bảng tổng hợp Nhập - Xuất - Tồn chuẩn Kế toán & Xuất file Excel đối soát chi tiết
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="rounded-[6px] text-xs font-semibold shadow-xs active:scale-[0.98]"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />
            {isExportingExcel ? 'Đang tạo Excel...' : 'Xuất File Excel N-X-T'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-[6px] text-xs font-semibold"
          >
            <Printer className="h-4 w-4 mr-1.5" /> In Báo Cáo
          </Button>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'nxt' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('nxt')}
            className="rounded-[6px] text-xs font-bold active:scale-[0.98]"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Bảng Nhập - Xuất - Tồn (Kế Toán)
          </Button>

          <Button
            variant={activeTab === 'supplier' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('supplier')}
            className="rounded-[6px] text-xs font-bold active:scale-[0.98]"
          >
            <BarChart3 className="h-4 w-4 mr-1.5" /> Nhập Trả Hàng Theo NCC
          </Button>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <DateTimePicker
            value={startDate}
            onChange={(val) => setStartDate(val)}
            showTime={false}
            placeholder="Từ ngày..."
            className="w-36"
          />
          <span className="text-xs text-muted-foreground">-</span>
          <DateTimePicker
            value={endDate}
            onChange={(val) => setEndDate(val)}
            showTime={false}
            placeholder="Đến ngày..."
            align="right"
            className="w-36"
          />
        </div>
      </div>

      {/* TAB 1: BẢNG NHẬP XUẤT TỒN KẾ TOÁN (8 CỘT) */}
      {activeTab === 'nxt' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="rounded-[6px] border border-border p-4 shadow-xs relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Tồn Đầu Kỳ (Tiền)</span>
                <HelpTooltip
                  title="Tồn Đầu Kỳ"
                  content="Tổng giá trị tồn kho tại thời điểm bắt đầu kỳ (00:00:00 ngày đầu kỳ). Là tồn dư cuối ngày trước đó chuyển sang."
                />
              </div>
              <p className="mt-2 text-lg font-bold font-mono text-foreground tracking-tight tabular-nums">
                {(balanceData?.totals?.grandOpeningAmount || 0).toLocaleString('vi-VN')} đ
              </p>
            </Card>

            <Card className="rounded-[6px] border border-border p-4 shadow-xs relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Nhập Trong Kỳ (Tiền)</span>
                <HelpTooltip
                  title="Nhập Trong Kỳ"
                  content="Tổng giá trị hàng hóa thực nhập thêm vào kho từ các Phiếu Nhập Kho (PNK) hoàn thành trong kỳ."
                />
              </div>
              <p className="mt-2 text-lg font-bold font-mono text-blue-600 dark:text-blue-400 tracking-tight tabular-nums">
                +{(balanceData?.totals?.grandInAmount || 0).toLocaleString('vi-VN')} đ
              </p>
            </Card>

            <Card className="rounded-[6px] border border-border p-4 shadow-xs relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Xuất Trong Kỳ (Tiền)</span>
                <HelpTooltip
                  title="Xuất Trong Kỳ"
                  content="Tổng giá trị hàng hóa thực xuất khỏi kho từ các Lệnh Xuất Kho (EX) đã xuất xưởng trong kỳ."
                />
              </div>
              <p className="mt-2 text-lg font-bold font-mono text-amber-600 dark:text-amber-400 tracking-tight tabular-nums">
                -{(balanceData?.totals?.grandOutAmount || 0).toLocaleString('vi-VN')} đ
              </p>
            </Card>

            <Card className="rounded-[6px] border border-border p-4 shadow-xs relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Tồn Cuối Kỳ (Tiền)</span>
                <HelpTooltip
                  title="Tồn Cuối Kỳ"
                  content={
                    <>
                      Giá trị tồn kho còn lại tại thời điểm kết thúc kỳ.<br />
                      <span className="font-mono text-amber-300 text-[10px]">Tồn cuối = Tồn đầu + Nhập - Xuất</span>
                    </>
                  }
                />
              </div>
              <p className="mt-2 text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
                {(balanceData?.totals?.grandClosingAmount || 0).toLocaleString('vi-VN')} đ
              </p>
            </Card>
          </div>

          {/* 8-Column Accounting Table */}
          <Card className="rounded-[6px] border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                Bảng Tổng Hợp Vật Tư Nhập Xuất Tồn Kế Toán
              </h3>
              <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-[4px] border border-border font-mono tabular-nums">
                Tổng số: {balanceData?.items?.length || 0} biến thể vật tư
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/60 text-foreground font-bold text-[11px]">
                    <th rowSpan={2} className="px-3 py-3 text-center border-r border-border/60 w-10">STT</th>
                    <th rowSpan={2} onClick={() => toggleNxtSort('sku')} className="px-3 py-3 text-center border-r border-border/60 cursor-pointer whitespace-nowrap hover:bg-muted/80 transition-colors">Mã VT</th>
                    <th rowSpan={2} onClick={() => toggleNxtSort('name')} className="px-4 py-3 text-left border-r border-border/60 cursor-pointer min-w-[200px] hover:bg-muted/80 transition-colors">Tên vật tư</th>
                    <th rowSpan={2} className="px-3 py-3 text-center border-r border-border/60 whitespace-nowrap">ĐVT</th>

                    <th colSpan={2} className="px-3 py-2 text-center border-r border-border/60 bg-muted/40">
                      <div className="inline-flex items-center gap-1 justify-center">
                        <span>Tồn đầu kỳ</span>
                        <HelpTooltip
                          title="Tồn Đầu Kỳ"
                          content="Số lượng & giá trị vật tư tồn sẵn ở đầu ngày mở kỳ báo cáo."
                        />
                      </div>
                    </th>
                    <th colSpan={2} className="px-3 py-2 text-center border-r border-border/60 bg-muted/40">
                      <div className="inline-flex items-center gap-1 justify-center">
                        <span>Nhập trong kỳ</span>
                        <HelpTooltip
                          title="Nhập Trong Kỳ"
                          content="Số lượng & giá trị hàng mới thực nhập từ Phiếu Nhập Kho (PNK)."
                        />
                      </div>
                    </th>
                    <th colSpan={2} className="px-3 py-2 text-center border-r border-border/60 bg-muted/40">
                      <div className="inline-flex items-center gap-1 justify-center">
                        <span>Xuất trong kỳ</span>
                        <HelpTooltip
                          title="Xuất Trong Kỳ"
                          content="Số lượng & giá trị hàng xuất khỏi kho từ Lệnh Xuất Kho (EX)."
                        />
                      </div>
                    </th>
                    <th colSpan={2} className="px-3 py-2 text-center bg-muted/40">
                      <div className="inline-flex items-center gap-1 justify-center">
                        <span>Tồn cuối kỳ</span>
                        <HelpTooltip
                          title="Tồn Cuối Kỳ"
                          content="Số lượng & giá trị tồn kho thực tế cuối kỳ = (Đầu + Nhập - Xuất)."
                        />
                      </div>
                    </th>
                  </tr>
                  <tr className="border-b border-border bg-muted/30 font-semibold text-muted-foreground text-[11px]">
                    <th className="px-3 py-2 text-right border-r border-border/60">SL</th>
                    <th className="px-3 py-2 text-right border-r border-border/60">Thành tiền</th>

                    <th className="px-3 py-2 text-right border-r border-border/60">SL</th>
                    <th className="px-3 py-2 text-right border-r border-border/60">Thành tiền</th>

                    <th className="px-3 py-2 text-right border-r border-border/60">SL</th>
                    <th className="px-3 py-2 text-right border-r border-border/60">Thành tiền</th>

                    <th className="px-3 py-2 text-right border-r border-border/60">SL</th>
                    <th className="px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {isBalanceLoading ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground font-sans">
                        Đang tính toán cân đối kho Nhập - Xuất - Tồn...
                      </td>
                    </tr>
                  ) : sortedNxtItems.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground font-sans">
                        Không có dữ liệu tồn kho trong khoảng thời gian này.
                      </td>
                    </tr>
                  ) : (
                    sortedNxtItems.map((item, idx) => (
                      <tr key={item.variantId} className="hover:bg-muted/30 transition-colors align-middle">
                        <td className="px-3 py-2.5 text-center text-muted-foreground font-mono">{idx + 1}</td>
                        <td className="px-3 py-2.5 text-center font-bold text-foreground">{item.sku}</td>
                        <td className="px-4 py-2.5 font-sans font-medium text-foreground">{item.name}</td>
                        <td className="px-3 py-2.5 text-center text-muted-foreground font-sans">{item.unit}</td>

                        <td className="px-3 py-2.5 text-right font-medium">{item.openingQty}</td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground">{item.openingAmount.toLocaleString('vi-VN')} đ</td>

                        <td className="px-3 py-2.5 text-right font-bold text-blue-600">{item.inQty}</td>
                        <td className="px-3 py-2.5 text-right text-blue-600">{item.inAmount.toLocaleString('vi-VN')} đ</td>

                        <td className="px-3 py-2.5 text-right font-bold text-amber-600">{item.outQty}</td>
                        <td className="px-3 py-2.5 text-right text-amber-600">{item.outAmount.toLocaleString('vi-VN')} đ</td>

                        <td className="px-3 py-2.5 text-right font-extrabold text-emerald-600">{item.closingQty}</td>
                        <td className="px-3 py-2.5 text-right font-extrabold text-emerald-600">{item.closingAmount.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))
                  )}

                  {/* Total Summary Row */}
                  {sortedNxtItems.length > 0 && (
                    <tr className="bg-amber-500/10 font-bold border-t-2 border-border text-foreground font-sans">
                      <td colSpan={4} className="px-4 py-3.5 text-right font-bold">
                        TỔNG CỘNG HỆ THỐNG:
                      </td>
                      <td colSpan={2} className="px-3 py-3.5 text-right font-mono font-extrabold">
                        {(balanceData?.totals?.grandOpeningAmount || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td colSpan={2} className="px-3 py-3.5 text-right font-mono font-extrabold text-blue-600">
                        {(balanceData?.totals?.grandInAmount || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td colSpan={2} className="px-3 py-3.5 text-right font-mono font-extrabold text-amber-600">
                        {(balanceData?.totals?.grandOutAmount || 0).toLocaleString('vi-VN')} đ
                      </td>
                      <td colSpan={2} className="px-3 py-3.5 text-right font-mono font-extrabold text-emerald-600 text-sm">
                        {(balanceData?.totals?.grandClosingAmount || 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: NHẬP TRẢ HÀNG THEO NHÀ CUNG CẤP */}
      {activeTab === 'supplier' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <SearchableSelect
              className="w-64"
              options={[
                { label: 'Tất cả Nhà cung cấp', value: '' },
                ...suppliers.map((s) => ({ label: s.name, value: s._id })),
              ]}
              value={selectedSupplierId}
              onChange={(val) => setSelectedSupplierId(val)}
              creatable={false}
              placeholder="Tất cả Nhà cung cấp"
            />
          </div>

          <div className="rounded-[6px] border border-border bg-card p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground">
              Biểu Đồ So Sánh Giá Trị Nhập Hàng Vs Trả Hàng (VND)
            </h3>

            <div className="space-y-4 pt-2">
              {supplierChartData.map((item, index) => {
                const importPercent = Math.round((item.importAmount / maxVal) * 100) || 5;
                const returnPercent = Math.round((item.returnAmount / maxVal) * 100) || 0;

                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <span>{item.supplierName}</span>
                      <span className="font-mono text-muted-foreground">
                        Nhập: {item.importAmount.toLocaleString('vi-VN')} đ | Trả:{' '}
                        {item.returnAmount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <div className="h-4 w-full bg-muted/40 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${importPercent}%` }}
                        className="bg-blue-600 h-full transition-all duration-500 rounded-l-full"
                      />
                      {returnPercent > 0 && (
                        <div
                          style={{ width: `${returnPercent}%` }}
                          className="bg-amber-500 h-full transition-all duration-500 rounded-r-full"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
