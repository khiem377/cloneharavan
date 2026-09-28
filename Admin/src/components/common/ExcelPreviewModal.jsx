import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  X, Download, FileSpreadsheet, RefreshCw, Printer, Maximize2, Minimize2,
  ZoomIn, ZoomOut, RotateCcw,
} from '@/components/ui/Icons';
import { toast } from '@/providers/ToastProvider';
import api from '@/lib/axios';

export default function ExcelPreviewModal({
  isOpen,
  onClose,
  title = 'Xem Trước File Excel (.xlsx)',
  downloadUrl,
  buffer,
}) {
  const [htmlContent, setHtmlContent] = useState('');
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
        const html = XLSX.utils.sheet_to_html(worksheet, { id: 'excel-preview-table' });
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
      // Luon dung axios api de dam bao Bearer token duoc gui kem (ca full URL lan relative URL)
      const isFullUrl = downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://');
      if (isFullUrl) {
        // Voi full URL, vẫn dung api.get voi responseType arraybuffer
        api
          .get(downloadUrl, { responseType: 'arraybuffer' })
          .then((res) => parseBuffer(res.data))
          .catch((err) => {
            toast.error('Loi tai file Excel: ' + (err.response?.data?.message || err.message));
            setLoading(false);
          });
      } else {
        api
          .get(downloadUrl, { responseType: 'arraybuffer' })
          .then((res) => parseBuffer(res.data))
          .catch((err) => {
            toast.error(
              'Loi tai file Excel tu may chu: ' + (err.response?.data?.message || err.message)
            );
            setLoading(false);
          });
      }
    }
  }, [isOpen, downloadUrl, buffer]);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; color: #000; }
            table { border-collapse: collapse; width: 100%; margin-top: 15px; }
            td, th { border: 1px solid #666; padding: 6px 10px; text-align: left; font-size: 12px; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
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
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs transition-all ${
        isFullscreen ? 'p-0' : 'p-4'
      }`}
    >
      <div
        className={`flex flex-col border border-border bg-card shadow-2xl overflow-hidden transition-all ${
          isFullscreen
            ? 'w-screen h-screen rounded-none border-none'
            : 'w-full max-w-6xl h-[92vh] rounded-2xl'
        }`}
      >
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3.5 bg-muted/40 shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">{title}</h2>
              <p className="text-xs text-muted-foreground">
                Trình xem trước Excel Web (.xlsx) — Hỗ trợ Phóng to / Thu nhỏ & Toàn màn hình
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-background border border-input rounded-lg p-1 mr-2 text-xs">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="Thu nhỏ (-)"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-xs px-1.5 min-w-[42px] text-center font-bold text-foreground">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="Phóng to (+)"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              {zoomScale !== 1 && (
                <button
                  onClick={handleResetZoom}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Đặt lại 100%"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" /> In Phiếu
            </button>

            {/* Download raw Excel via authorized axios blob */}
            {downloadUrl && (
              <button
                onClick={handleDownloadRaw}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
              >
                <Download className="h-4 w-4" /> Tải File Gốc
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-auto p-6 bg-background/50">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span>Đang đọc và dựng giao diện file Excel...</span>
            </div>
          ) : (
            <div className="w-full h-full overflow-auto p-2">
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.15s ease-out',
                }}
                className="excel-web-preview border border-border rounded-xl p-6 bg-card shadow-sm text-foreground inline-block min-w-full"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .excel-web-preview table {
          border-collapse: collapse;
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          margin: 0 auto;
        }
        .excel-web-preview td, .excel-web-preview th {
          border: 1px solid var(--border, #cbd5e1);
          padding: 6px 10px;
          min-width: 60px;
          white-space: pre-wrap;
          vertical-align: middle;
        }
        .excel-web-preview tr:nth-child(even) {
          background-color: rgba(0,0,0, 0.02);
        }
        .excel-web-preview tr:hover {
          background-color: rgba(0,0,0, 0.04);
        }
      `}</style>
    </div>
  );
}
