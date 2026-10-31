import React from 'react';
import { FileSpreadsheet, ArrowLeft, ArrowRight, RefreshCw } from '@/components/ui/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

export default function POExcelPreviewCard({
  excelHtml,
  loadingExcel,
  onBackToStep1,
  onGoToStep3,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-emerald-500/10 text-emerald-600">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              BƯỚC 2: Xem Trước Phân Tích Bảng Excel (.xlsx)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              File Excel Mẫu 01-VT được điền dữ liệu tự động cho Nhà cung cấp và các mặt hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToStep1}
            className="h-8 rounded-[6px] text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Quay Lại Chỉnh Sửa
          </Button>
          <Button
            size="sm"
            onClick={onGoToStep3}
            className="h-8 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-[0.98]"
          >
            <span>Tiếp Theo: Chốt Đơn (Bước 3)</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="overflow-auto p-4 bg-background border border-border rounded-[6px]">
          {loadingExcel ? (
            <div className="flex py-12 items-center justify-center gap-2 text-muted-foreground text-xs">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Đang dựng dữ liệu vào mẫu file Excel...</span>
            </div>
          ) : (
            <div
              className="excel-wizard-preview border border-border rounded-[6px] p-4 bg-card text-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(excelHtml) }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
