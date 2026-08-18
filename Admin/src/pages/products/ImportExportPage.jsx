import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, RefreshCw, CheckCircle, XCircle, Loader2, FileSpreadsheet, ImageIcon } from 'lucide-react';
import { toast } from '@/providers/ToastProvider';
import { productService } from '@/services/product.service';

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function ImportExportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tab, setTab] = useState('import');
  const [importing, setImporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);

  const handleDownloadTemplate = async () => {
    setTemplateLoading(true);
    try {
      const res = await productService.downloadTemplate();
      downloadBlob(res.data, 'product-template.xlsx');
      toast.success('Đã tải template');
    } catch { toast.error('Lỗi tải template'); }
    finally { setTemplateLoading(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await productService.exportProducts();
      downloadBlob(res.data, `products-export-${Date.now()}.xlsx`);
      toast.success('Đã xuất danh sách sản phẩm');
    } catch { toast.error('Lỗi xuất file'); }
    finally { setExporting(false); }
  };

  const handleImportFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Chỉ chấp nhận file Excel (.xlsx, .xls)');
      return;
    }
    setImporting(true);
    setResult(null);
    try {
      const res = await productService.importProducts(file);
      setResult(res.data.data);
      const { inserted, updated, skipped } = res.data.data;
      toast.success(`Import xong: +${inserted} mới, ~${updated} cập nhật, ${skipped} bỏ qua`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi import');
    } finally { setImporting(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImportFile(file);
  };

  const handleSyncImages = async () => {
    setSyncing(true);
    try {
      const res = await productService.syncImages();
      const { synced, total } = res.data.data;
      toast.success(`Đã sync ${synced}/${total} ảnh vào Media Library`);
    } catch { toast.error('Lỗi sync ảnh'); }
    finally { setSyncing(false); }
  };

  return (
    <div className="p-6 flex flex-col gap-6 w-full max-w-4xl mx-auto min-h-full bg-background text-foreground">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer" onClick={() => navigate('/products')}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Import / Export Sản phẩm</h1>
      </div>

      <div className="flex border-b border-border gap-2">
        <button
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === 'import' ? 'border-primary text-foreground font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setTab('import')}
        >
          <Upload size={14} /> Import
        </button>
        <button
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${tab === 'export' ? 'border-primary text-foreground font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setTab('export')}
        >
          <Download size={14} /> Export
        </button>
      </div>

      {tab === 'import' && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xs flex flex-col gap-3">
            <h3 className="text-base font-semibold text-foreground pb-2 border-b border-border">Bước 1 — Tải template</h3>
            <p className="text-xs text-muted-foreground">Tải file Excel mẫu có sẵn dropdown cho Danh mục, Thương hiệu, Trạng thái.</p>
            <button
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent cursor-pointer w-fit"
              onClick={handleDownloadTemplate}
              disabled={templateLoading}
            >
              {templateLoading ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
              Tải template (.xlsx)
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xs flex flex-col gap-3">
            <h3 className="text-base font-semibold text-foreground pb-2 border-b border-border">Bước 2 — Upload file</h3>
            <p className="text-xs text-muted-foreground">Điền dữ liệu vào template rồi upload lên. SKU đã tồn tại sẽ được cập nhật, SKU mới sẽ được tạo mới.</p>

            <div
              className={`flex flex-col items-center justify-center p-10 rounded-xl border-2 border-dashed transition-colors cursor-pointer text-center ${dragOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/20 hover:border-primary/50'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {importing ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                  <Loader2 size={32} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
                  <Upload size={32} />
                  <span>Kéo thả file vào đây hoặc <strong className="text-foreground">click để chọn</strong></span>
                  <span className="text-xs text-muted-foreground/70">.xlsx, .xls — tối đa 20MB</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleImportFile(e.target.files?.[0])}
            />
          </div>

          {result && (
            <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xs flex flex-col gap-3">
              <h3 className="text-base font-semibold text-foreground pb-2 border-b border-border">Kết quả import</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                  <CheckCircle size={18} />
                  <span><strong>{result.inserted}</strong> sản phẩm mới</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-sm font-medium">
                  <RefreshCw size={18} />
                  <span><strong>{result.updated}</strong> cập nhật</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-sm font-medium">
                  <XCircle size={18} />
                  <span><strong>{result.skipped}</strong> bỏ qua</span>
                </div>
              </div>

              {result.errors?.length > 0 && (
                <div className="mt-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-xs">
                  <p className="font-semibold text-destructive mb-2">Dòng lỗi:</p>
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    {result.errors.map((e, i) => (
                      <div key={i} className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-mono font-semibold text-foreground">Dòng {e.row}</span>
                        <span>{e.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(result.inserted > 0 || result.updated > 0) && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 mt-2 rounded-lg border border-blue-500/20 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    <span>Có sản phẩm dùng URL ảnh chưa đồng bộ vào Media Library</span>
                  </div>
                  <button className="inline-flex h-7 items-center justify-center gap-1 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground hover:bg-accent cursor-pointer" onClick={handleSyncImages} disabled={syncing}>
                    {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    Sync ảnh ngay
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'export' && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-2xs flex flex-col gap-3">
            <h3 className="text-base font-semibold text-foreground pb-2 border-b border-border">Xuất danh sách sản phẩm</h3>
            <p className="text-xs text-muted-foreground">Tải toàn bộ sản phẩm hiện tại ra file Excel với đầy đủ thông tin.</p>
            <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors cursor-pointer w-fit" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Xuất Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
