import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  X, Download, FileSpreadsheet, RefreshCw, Printer, Maximize2, Minimize2,
  ZoomIn, ZoomOut, RotateCcw,
} from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import api from '@/lib/axios';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

export default function ExcelPreviewModal({
  isOpen,
  onClose,
  title = 'Xem Trước File Excel (.xlsx)',
  downloadUrl,
  buffer,
}) {
  const [htmlContent, setHtmlContent] = useState('');
  const [isLandscape, setIsLandscape] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    setZoomScale(1);

    const parseBuffer = (arrayBuf) => {
      try {
        const workbook = XLSX.read(arrayBuf, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (worksheet && worksheet['!ref']) {
          const range = XLSX.utils.decode_range(worksheet['!ref']);
          let minR = range.s.r;
          let maxR = range.s.r;
          let minC = range.s.c;
          let maxC = range.s.c;
          let hasContent = false;

          // Quét và tìm đúng biên giới dữ liệu thực tế (bỏ qua cột/hàng rỗng thừa)
          for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
              const cell = worksheet[cellAddress];
              if (
                cell &&
                cell.v !== undefined &&
                cell.v !== null &&
                String(cell.v).trim() !== ''
              ) {
                if (!hasContent) {
                  minR = maxR = R;
                  minC = maxC = C;
                  hasContent = true;
                } else {
                  if (R < minR) minR = R;
                  if (R > maxR) maxR = R;
                  if (C < minC) minC = C;
                  if (C > maxC) maxC = C;
                }
              }
            }
          }

          if (hasContent) {
            // Giới hạn số cột tối đa thực tế
            worksheet['!ref'] = XLSX.utils.encode_range({
              s: { r: minR, c: minC },
              e: { r: maxR, c: maxC },
            });
            setIsLandscape(maxC - minC >= 10);
          }
        }

        const html = XLSX.utils.sheet_to_html(worksheet, {
          id: 'excel-preview-table',
          editable: false,
        });
        setHtmlContent(html);
      } catch (err) {
        toast.error('Không thể đọc dữ liệu file Excel: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (buffer) {
      setLoading(true);
      parseBuffer(buffer);
    } else if (downloadUrl) {
      setLoading(true);
      const isFullUrl = downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://');
      if (isFullUrl) {
        api
          .get(downloadUrl, { responseType: 'arraybuffer' })
          .then((res) => parseBuffer(res.data))
          .catch((err) => {
            toast.error('Lỗi tải file Excel: ' + (err.response?.data?.message || err.message));
            setLoading(false);
          });
      } else {
        api
          .get(downloadUrl, { responseType: 'arraybuffer' })
          .then((res) => parseBuffer(res.data))
          .catch((err) => {
            toast.error(
              'Lỗi tải file Excel từ máy chủ: ' + (err.response?.data?.message || err.message)
            );
            setLoading(false);
          });
      }
    }
  }, [isOpen, downloadUrl, buffer]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cho phép popup để in phiếu.');
      return;
    }

    const orientation = isLandscape ? 'landscape' : 'portrait';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            @page {
              size: A4 ${orientation};
              margin: 12mm 10mm 12mm 10mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #000;
              margin: 0;
              padding: 0;
              background: #fff;
              font-size: 13px;
              line-height: 1.35;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-container {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              table-layout: auto;
              margin: 0 auto;
            }
            td, th {
              padding: 4px 6px;
              font-size: 12px;
              vertical-align: middle;
              word-break: break-word;
            }
            /* Bảng dữ liệu có viền rõ ràng */
            #excel-preview-table tr td {
              border: 1px solid #1e293b;
            }
            /* Các dòng tiêu đề & thông tin phiếu không viền hoặc viền ngầm */
            #excel-preview-table tr:nth-child(-n+13) td:empty {
              border: none !important;
            }
            #excel-preview-table tr:nth-child(-n+13) td {
              border-color: transparent;
            }
            /* Footer ghi chú & chữ ký không đóng khung */
            #excel-preview-table tr:nth-last-child(-n+10) td {
              border-color: transparent;
            }
            /* Bắt buộc hiển thị đường kẻ bảng dữ liệu chính */
            #excel-preview-table tr td[id*="sjs-"] {
              border: 1px solid #334155;
            }
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${htmlContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const handleDownloadRaw = async () => {
    if (!downloadUrl) return;
    try {
      const res = await api.get(downloadUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9_\-\(\)]/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Tải file Excel thành công!');
    } catch (err) {
      toast.error('Không thể tải file Excel: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setZoomScale(1);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 transition-all ${
        isFullscreen ? 'p-0' : 'p-4'
      }`}
    >
      <div
        className={`flex flex-col border border-border bg-card shadow-sm overflow-hidden transition-all ${
          isFullscreen
            ? 'w-screen h-screen rounded-none border-none'
            : 'w-full max-w-6xl h-[92vh] rounded-[6px]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-3.5 bg-muted/40 shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">{title}</h2>
              <p className="text-xs text-muted-foreground">
                Xem trước phiếu chuẩn kế toán — Định dạng A4 ({isLandscape ? 'Khổ ngang' : 'Khổ dọc'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-background border border-input rounded-[6px] p-1 mr-2 text-xs">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded-[4px] hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all cursor-pointer"
                title="Thu nhỏ (-)"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono tabular-nums text-xs px-1.5 min-w-[42px] text-center font-bold text-foreground">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded-[4px] hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all cursor-pointer"
                title="Phóng to (+)"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              {zoomScale !== 1 && (
                <button
                  onClick={handleResetZoom}
                  className="p-1 rounded-[4px] hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all cursor-pointer"
                  title="Đặt lại 100%"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" /> In Phiếu
            </button>

            {downloadUrl && (
              <button
                onClick={handleDownloadRaw}
                className="inline-flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" /> Tải File Gốc
              </button>
            )}

            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all cursor-pointer"
              title={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>

            <button
              onClick={onClose}
              className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100 dark:bg-slate-900/50 flex items-start justify-center">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span>Đang đọc và dựng giao diện file Excel...</span>
            </div>
          ) : (
            <div className="w-full flex justify-center p-2">
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="excel-web-paper border border-border rounded-[6px] p-8 sm:p-10 bg-white text-slate-900 shadow-sm max-w-4xl w-full overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .excel-web-paper {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13px;
          line-height: 1.4;
        }
        .excel-web-paper table {
          border-collapse: collapse;
          width: 100%;
          margin: 0 auto;
        }
        .excel-web-paper td, .excel-web-paper th {
          padding: 6px 8px;
          min-width: 40px;
          vertical-align: middle;
        }
        .excel-web-paper tr td {
          border: 1px solid #cbd5e1;
        }
        .excel-web-paper tr:hover {
          background-color: rgba(59, 130, 246, 0.03);
        }
      `}</style>
    </div>
  );
}
