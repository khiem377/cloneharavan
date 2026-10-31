import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Search,
  Globe,
  Bot,
  Scale,
  Package,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  FileText,
  DollarSign,
  Tag,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/providers/ToastProvider';
import { productService } from '@/services/product.service';

export default function ProductAiSpecsModal({
  isOpen,
  onClose,
  productName = '',
  brandName = '',
  onApply,
}) {
  const [pName, setPName] = useState(productName);
  const [pBrand, setPBrand] = useState(brandName);
  const [modelCode, setModelCode] = useState('');
  const [productUrl, setProductUrl] = useState('');

  // Tùy chọn áp dụng dữ liệu
  const [applySpecs, setApplySpecs] = useState(true);
  const [applyDescription, setApplyDescription] = useState(true);
  const [applyPrice, setApplyPrice] = useState(true);
  const [applySku, setApplySku] = useState(true);
  const [applyOptions, setApplyOptions] = useState(true);

  // Dữ liệu có thể tinh chỉnh trước khi áp dụng
  const [editablePrice, setEditablePrice] = useState(0);
  const [editableSku, setEditableSku] = useState('');
  const [optionState, setOptionState] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Cập nhật giá trị khi mở modal
  useEffect(() => {
    if (isOpen) {
      setPName(productName || '');
      setPBrand(brandName || '');
      setErrorMsg('');
    }
  }, [isOpen, productName, brandName]);

  if (!isOpen) return null;

  const handleStartExtraction = async () => {
    if (!pName.trim() && !productUrl.trim()) {
      return toast.warning('Vui lòng nhập Tên sản phẩm hoặc dán Link trang web sản phẩm');
    }

    setIsLoading(true);
    setErrorMsg('');
    setResult(null);

    // Hiệu ứng các bước thực thi
    setLoadingStep(productUrl ? 'Đang đọc trang qua Jina Reader...' : 'Đang tìm kiếm qua SearXNG / Bing / Google...');
    const timer1 = setTimeout(() => {
      setLoadingStep('Đang phân tích thông số, giá bán & biến thể qua AI...');
    }, 2500);

    try {
      const res = await productService.aiExtractSpecs({
        productName: pName.trim(),
        brand: pBrand.trim(),
        modelCode: modelCode.trim(),
        productUrl: productUrl.trim(),
      });

      clearTimeout(timer1);

      if (res.data?.data) {
        const data = res.data.data;
        setResult(data);

        // Khởi tạo các trường chỉnh sửa
        if (data.marketPrice && data.marketPrice > 0) {
          setEditablePrice(data.marketPrice);
          setApplyPrice(true);
        } else {
          setEditablePrice(0);
          setApplyPrice(false);
        }

        if (data.modelCode) {
          setEditableSku(data.modelCode);
          setApplySku(true);
        } else {
          setEditableSku('');
          setApplySku(false);
        }

        if (Array.isArray(data.suggestedOptions) && data.suggestedOptions.length > 0) {
          setOptionState(
            data.suggestedOptions.map((opt) => ({
              name: opt.name,
              values: [...opt.values],
              allValues: [...opt.values],
              enabled: true,
              newValueInput: '',
            }))
          );
          setApplyOptions(true);
        } else {
          setOptionState([]);
          setApplyOptions(false);
        }

        toast.success('AI trích xuất thông số thành công!');
      } else {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }
    } catch (err) {
      clearTimeout(timer1);
      const msg = err.response?.data?.message || err.message || 'Không thể trích xuất thông số sản phẩm';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Toggle chọn/bỏ chọn 1 giá trị của biến thể
  const handleToggleOptionValue = (optIdx, val) => {
    setOptionState((prev) => {
      const copy = [...prev];
      const opt = { ...copy[optIdx] };
      const currentValues = opt.values || [];
      if (currentValues.includes(val)) {
        opt.values = currentValues.filter((v) => v !== val);
      } else {
        opt.values = [...currentValues, val];
      }
      copy[optIdx] = opt;
      return copy;
    });
  };

  // Thêm giá trị mới vào biến thể
  const handleAddOptionValue = (optIdx) => {
    const opt = optionState[optIdx];
    const val = (opt.newValueInput || '').trim();
    if (!val) return;

    setOptionState((prev) => {
      const copy = [...prev];
      const target = { ...copy[optIdx] };
      if (!target.allValues.includes(val)) {
        target.allValues = [...target.allValues, val];
      }
      if (!target.values.includes(val)) {
        target.values = [...target.values, val];
      }
      target.newValueInput = '';
      copy[optIdx] = target;
      return copy;
    });
  };

  const handleApplyToForm = () => {
    if (!result) return;

    // Lọc biến thể hợp lệ đã được bật
    const filteredOptions = applyOptions
      ? optionState
          .filter((opt) => opt.enabled && opt.values.length > 0)
          .map((opt) => ({
            name: opt.name.trim(),
            values: opt.values.map((v) => v.trim()).filter(Boolean),
          }))
      : null;

    onApply({
      // Thông số sản phẩm trần (cho khách xem)
      productWeight: result.productWeight || 0,
      productDimensions: result.productDimensions || { length: 0, width: 0, height: 0 },

      // Thông số kiện hàng đóng gói (chuyên dụng tính cước GHN)
      packageWeight: result.packageWeight || result.weight || 0,
      packageDimensions: result.packageDimensions || result.dimensions || { length: 0, width: 0, height: 0 },
      shippingDataStatus: result.shippingDataStatus || 'estimated',
      shippingDataSource: result.shippingDataSource || result.sourceUrl || '',

      // Đồng bộ tương thích ngược
      weight: result.packageWeight || result.weight || 0,
      dimensions: result.packageDimensions || result.dimensions || { length: 0, width: 0, height: 0 },

      specifications: applySpecs ? result.specifications || [] : null,
      description: applyDescription ? result.description || '' : null,
      price: applyPrice && editablePrice ? Number(editablePrice) : null,
      sku: applySku && editableSku ? String(editableSku).trim() : null,
      options: filteredOptions,
    });

    toast.success('Đã áp dụng thông tin AI vào sản phẩm!');
    onClose();
  };

  // Tính thể tích quy đổi cước kiện hàng (D x R x C / 5000)
  const pkgDims = result?.packageDimensions || result?.dimensions;
  const volumetricWeightKg = pkgDims
    ? ((pkgDims.length * pkgDims.width * pkgDims.height) / 5000).toFixed(2)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-3xl rounded-[8px] border border-border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                AI Auto-Ingestion: Kích thước, Giá, SKU & Biến thể
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
                  Multi-Agent Search
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Tự động tìm kiếm web, trích xuất kích thước, giá thị trường, mã SKU và phân loại sản phẩm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Form Input Query */}
          <div className="p-4 rounded-[6px] border border-border bg-muted/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  Tên sản phẩm <span className="text-destructive">*</span>
                </label>
                <Input
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Ví dụ: Nồi chiên không dầu Philips HD9252, Chuột không dây Rapoo VT9 Pro"
                  className="h-8 rounded-[6px] text-xs"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Thương hiệu</label>
                <Input
                  value={pBrand}
                  onChange={(e) => setPBrand(e.target.value)}
                  placeholder="Ví dụ: Philips, Rapoo, Apple"
                  className="h-8 rounded-[6px] text-xs"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Mã Model (nếu có)</label>
                <Input
                  value={modelCode}
                  onChange={(e) => setModelCode(e.target.value)}
                  placeholder="Ví dụ: HD9252/90, VT9-PRO"
                  className="h-8 rounded-[6px] text-xs font-mono"
                  disabled={isLoading}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Globe className="size-3 text-muted-foreground" /> Hoặc dán Link sản phẩm trực tiếp (Tiki, TGDĐ, Shopee...)
                </label>
                <Input
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://tiki.vn/... hoặc https://www.thegioididong.com/..."
                  className="h-8 rounded-[6px] text-xs font-mono"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="text-[11px] font-medium text-foreground">Tự động lấy:</span>
                <span className="flex items-center gap-1">✓ Đóng gói & Kích thước</span>
                <span className="flex items-center gap-1">✓ Giá & SKU</span>
                <span className="flex items-center gap-1">✓ Biến thể phân loại</span>
                <span className="flex items-center gap-1">✓ Mô tả & Specs</span>
              </div>

              <Button
                type="button"
                onClick={handleStartExtraction}
                disabled={isLoading || (!pName.trim() && !productUrl.trim())}
                size="sm"
                className="h-8 rounded-[6px] text-xs font-medium gap-1.5 cursor-pointer bg-primary text-primary-foreground shadow-xs shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Search className="size-3.5" />
                    <span>Bắt đầu tra cứu</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Loading Animation Status */}
          {isLoading && (
            <div className="p-6 rounded-[6px] border border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-2.5 animate-in fade-in">
              <Loader2 className="size-6 text-primary animate-spin" />
              <p className="text-xs font-medium text-primary">{loadingStep}</p>
              <p className="text-[11px] text-muted-foreground">
                Tự động tìm kiếm Internet $\rightarrow$ Đọc nội dung qua Jina $\rightarrow$ Trích xuất chi tiết bằng AI
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && !isLoading && (
            <div className="p-3 rounded-[6px] border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Lỗi tra cứu thông số</p>
                <p className="text-[11px] mt-0.5 opacity-90">{errorMsg}</p>
                <p className="text-[11px] mt-1 text-muted-foreground">
                  Gợi ý: Thử dán trực tiếp link chi tiết sản phẩm từ Tiki, Shopee hoặc trang web chính thức của hãng.
                </p>
              </div>
            </div>
          )}

          {/* Extracted Results Card */}
          {result && !isLoading && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Meta Engine Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-[6px] bg-muted/30 border border-border text-xs">
                <div className="flex items-center gap-2">
                  <Bot className="size-3.5 text-primary" />
                  <span className="text-[11px] text-muted-foreground">Mô hình AI:</span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {result.aiModel || 'Gemini / Groq'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="size-3.5 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Tìm kiếm:</span>
                  <Badge variant="outline" className="text-[10px]">
                    {result.engineUsed || 'Bing Web Direct'}
                  </Badge>
                  <Badge variant={result.confidence === 'high' ? 'default' : 'secondary'} className="text-[10px]">
                    Độ tin cậy: {result.confidence?.toUpperCase() || 'MEDIUM'}
                  </Badge>
                </div>
              </div>

              {/* 1. Logistics Metrics (Sản phẩm trần vs Kiện hàng bưu điện) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Scale className="size-3.5 text-primary" /> Phân tách Thông số: Sản phẩm trần vs Kiện hàng đóng gói
                  </p>
                  {result.shippingDataStatus === 'verified' && (
                    <Badge variant="outline" className="text-[10px] font-medium border-emerald-500/40 text-emerald-600 bg-emerald-500/10">
                      ✓ Đã xác minh từ hộp hãng
                    </Badge>
                  )}
                  {result.shippingDataStatus === 'estimated' && (
                    <Badge variant="outline" className="text-[10px] font-medium border-amber-500/40 text-amber-600 bg-amber-500/10">
                      ⚡ Quy đổi đóng gói E-commerce (Gập túi/Xốp)
                    </Badge>
                  )}
                  {result.shippingDataStatus === 'missing' && (
                    <Badge variant="secondary" className="text-[10px]">
                      ? Chưa có dữ liệu đóng gói
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Cột 1: Thông số sản phẩm trần (Khách xem trên web) */}
                  <div className="p-3 rounded-[6px] border border-border bg-muted/15 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                        📦 Sản phẩm trần (Hiển thị ngoài Web)
                      </span>
                      <span className="text-[10px] text-muted-foreground">Kích thước thật</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-1.5 rounded bg-background border border-border">
                        <div className="text-[10px] text-muted-foreground">Nặng</div>
                        <div className="text-xs font-bold font-mono text-primary">{result.productWeight || result.weight || 0}g</div>
                      </div>
                      <div className="p-1.5 rounded bg-background border border-border">
                        <div className="text-[10px] text-muted-foreground">Dài</div>
                        <div className="text-xs font-mono font-semibold">{result.productDimensions?.length || result.dimensions?.length || 0}</div>
                      </div>
                      <div className="p-1.5 rounded bg-background border border-border">
                        <div className="text-[10px] text-muted-foreground">Rộng</div>
                        <div className="text-xs font-mono font-semibold">{result.productDimensions?.width || result.dimensions?.width || 0}</div>
                      </div>
                      <div className="p-1.5 rounded bg-background border border-border">
                        <div className="text-[10px] text-muted-foreground">Cao</div>
                        <div className="text-xs font-mono font-semibold">{result.productDimensions?.height || result.dimensions?.height || 0}</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Dùng làm thông số kỹ thuật (Dài áo, kích thước thân máy) cho người mua đọc.
                    </p>
                  </div>

                  {/* Cột 2: Kiện hàng đóng gói (Dùng ngầm tính cước GHN) */}
                  <div className="p-3 rounded-[6px] border border-primary/30 bg-primary/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                        🚚 Kiện hàng đóng gói (Tính tiền ship GHN)
                      </span>
                      <span className="text-[10px] font-mono text-primary font-bold">
                        Quy đổi: {volumetricWeightKg} kg
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-1.5 rounded bg-background border border-border">
                        <div className="text-[10px] text-muted-foreground">Cả gói</div>
                        <div className="text-xs font-bold font-mono text-primary">{result.packageWeight || result.weight || 0}g</div>
                      </div>
                      <div className="p-1.5 rounded bg-background border border-border">
                        <div className="text-[10px] text-muted-foreground">Dài</div>
                        <div className="text-xs font-mono font-semibold text-foreground">{result.packageDimensions?.length || result.dimensions?.length || 0}</div>
                      </div>
                      <div className="p-1.5 rounded bg-background border border-border">
                        <div className="text-[10px] text-muted-foreground">Rộng</div>
                        <div className="text-xs font-mono font-semibold text-foreground">{result.packageDimensions?.width || result.dimensions?.width || 0}</div>
                      </div>
                      <div className="p-1.5 rounded bg-background border border-border">
                        <div className="text-[10px] text-muted-foreground">Cao</div>
                        <div className="text-xs font-mono font-semibold text-foreground">{result.packageDimensions?.height || result.dimensions?.height || 0}</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {result.shippingDataStatus === 'estimated'
                        ? 'Đã tự động tính theo kích thước gập túi ni-lông niêm phong / hộp xốp bảo vệ, tránh bị phạt cước cồng kềnh.'
                        : 'Số liệu nguyên kiện đóng gói từ hãng sản xuất gửi sang API GHN.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Market Price & Model/SKU */}
              <div className="p-3.5 rounded-[6px] border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <DollarSign className="size-3.5 text-emerald-500" /> Giá tham khảo & Mã SKU đề xuất
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    Kiểm soát trước khi áp dụng vào cửa hàng
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Giá bán */}
                  <div className="p-3 rounded-[6px] border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="chk-apply-price" className="text-xs font-medium flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox
                          id="chk-apply-price"
                          checked={applyPrice}
                          onCheckedChange={(c) => setApplyPrice(Boolean(c))}
                        />
                        <span>Giá niêm yết (VNĐ)</span>
                      </label>
                      {result.marketPrice > 0 && (
                        <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 border-emerald-300 bg-emerald-50/50">
                          AI: {Number(result.marketPrice).toLocaleString('vi-VN')} ₫
                        </Badge>
                      )}
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={editablePrice}
                      onChange={(e) => setEditablePrice(Number(e.target.value))}
                      disabled={!applyPrice}
                      placeholder="0"
                      className="h-8 rounded-[6px] text-xs font-mono font-semibold text-foreground tabular-nums"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {applyPrice ? 'Sẽ được điền vào ô Giá bán lẻ của sản phẩm' : 'Không thay đổi giá bán hiện tại'}
                    </p>
                  </div>

                  {/* Mã SKU / Model */}
                  <div className="p-3 rounded-[6px] border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="chk-apply-sku" className="text-xs font-medium flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox
                          id="chk-apply-sku"
                          checked={applySku}
                          onCheckedChange={(c) => setApplySku(Boolean(c))}
                        />
                        <span>Mã Model / SKU</span>
                      </label>
                      {result.modelCode && (
                        <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                          {result.modelCode}
                        </Badge>
                      )}
                    </div>
                    <Input
                      type="text"
                      value={editableSku}
                      onChange={(e) => setEditableSku(e.target.value)}
                      disabled={!applySku}
                      placeholder="VD: VT9-PRO"
                      className="h-8 rounded-[6px] text-xs font-mono uppercase"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {applySku ? 'Dùng làm SKU gốc và tiền tố sinh SKU biến thể' : 'Không thay đổi SKU hiện tại'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Suggested Variants & Options */}
              {optionState.length > 0 && (
                <div className="p-3.5 rounded-[6px] border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="chk-apply-options"
                        checked={applyOptions}
                        onCheckedChange={(c) => setApplyOptions(Boolean(c))}
                      />
                      <label htmlFor="chk-apply-options" className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer select-none">
                        <Layers className="size-3.5 text-primary" /> Phân loại & Biến thể sản phẩm ({optionState.length} nhóm)
                      </label>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Nhấp vào chip để chọn phiên bản cửa hàng thực tế có bán
                    </span>
                  </div>

                  {applyOptions && (
                    <div className="space-y-3 pt-1">
                      {optionState.map((opt, optIdx) => (
                        <div key={optIdx} className="p-3 rounded-[6px] border border-border bg-muted/10 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`opt-chk-${optIdx}`}
                                checked={opt.enabled}
                                onCheckedChange={(c) => {
                                  setOptionState((prev) => {
                                    const copy = [...prev];
                                    copy[optIdx] = { ...copy[optIdx], enabled: Boolean(c) };
                                    return copy;
                                  });
                                }}
                              />
                              <label htmlFor={`opt-chk-${optIdx}`} className="text-xs font-semibold text-foreground cursor-pointer select-none">
                                {opt.name}
                              </label>
                              <span className="text-[11px] text-muted-foreground">
                                ({opt.values.length}/{opt.allValues.length} đã chọn)
                              </span>
                            </div>
                          </div>

                          {opt.enabled && (
                            <div className="space-y-2 pl-6">
                              {/* Chips list */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {opt.allValues.map((val) => {
                                  const isSelected = opt.values.includes(val);
                                  return (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={() => handleToggleOptionValue(optIdx, val)}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-xs transition-colors cursor-pointer border ${
                                        isSelected
                                          ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                                          : 'bg-muted/40 text-muted-foreground/60 border-border line-through hover:border-primary/40'
                                      }`}
                                    >
                                      {isSelected && <Check className="size-3" />}
                                      <span>{val}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Thêm giá trị mới vào nhóm */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <Input
                                  value={opt.newValueInput || ''}
                                  onChange={(e) => {
                                    const text = e.target.value;
                                    setOptionState((prev) => {
                                      const copy = [...prev];
                                      copy[optIdx] = { ...copy[optIdx], newValueInput: text };
                                      return copy;
                                    });
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddOptionValue(optIdx);
                                    }
                                  }}
                                  placeholder={`Thêm giá trị khác cho ${opt.name}...`}
                                  className="h-7 rounded-[4px] text-xs w-56"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddOptionValue(optIdx)}
                                  className="h-7 px-2 text-xs cursor-pointer gap-1"
                                >
                                  <Plus className="size-3" /> Thêm
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Specifications preview */}
              {Array.isArray(result.specifications) && result.specifications.length > 0 && (
                <div className="p-3.5 rounded-[6px] border border-border bg-card space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="chk-specs-toggle"
                        checked={applySpecs}
                        onCheckedChange={(c) => setApplySpecs(Boolean(c))}
                      />
                      <label htmlFor="chk-specs-toggle" className="text-xs font-semibold text-foreground cursor-pointer select-none">
                        Thông số kỹ thuật ({result.specifications.length} mục)
                      </label>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {applySpecs ? 'Sẽ được cập nhật vào bảng specs' : 'Bỏ qua (không ghi đè)'}
                    </span>
                  </div>

                  {applySpecs && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 bg-muted/20 rounded border border-border text-[11px]">
                      {result.specifications.map((spec, idx) => (
                        <div key={idx} className="flex items-baseline justify-between gap-2 border-b border-border/40 pb-1">
                          <span className="text-muted-foreground truncate">{spec.key}:</span>
                          <span className="font-medium text-foreground truncate">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Description preview */}
              {result.description && (
                <div className="p-3.5 rounded-[6px] border border-border bg-card space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="chk-desc-toggle"
                        checked={applyDescription}
                        onCheckedChange={(c) => setApplyDescription(Boolean(c))}
                      />
                      <label htmlFor="chk-desc-toggle" className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer select-none">
                        <FileText className="size-3.5 text-primary" /> Bài viết mô tả sản phẩm (SEO HTML)
                      </label>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {applyDescription ? 'Sẽ được tự động điền vào ô Mô tả' : 'Bỏ qua (không ghi đè)'}
                    </span>
                  </div>

                  {applyDescription && (
                    <div
                      className="max-h-44 overflow-y-auto p-3 bg-muted/20 rounded border border-border text-xs leading-relaxed text-muted-foreground space-y-2 [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:text-xs [&_ul]:list-disc [&_ul]:pl-4 [&_strong]:text-foreground"
                      dangerouslySetInnerHTML={{ __html: result.description }}
                    />
                  )}
                </div>
              )}

              {/* Source URL & Notes */}
              {result.notes && (
                <p className="text-[11px] text-muted-foreground italic bg-muted/10 p-2 rounded border border-border/50">
                  💡 Ghi chú AI: {result.notes}
                </p>
              )}

              {result.sourceUrl && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                  <span>Trang nguồn:</span>
                  <a
                    href={result.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 truncate"
                  >
                    {result.sourceUrl}
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 rounded-[6px] text-xs cursor-pointer"
          >
            Đóng
          </Button>

          <div className="flex items-center gap-2">
            {result && (
              <Button
                type="button"
                onClick={handleApplyToForm}
                size="sm"
                className="h-8 rounded-[6px] text-xs font-semibold gap-1.5 cursor-pointer bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                <Check className="size-3.5" />
                Áp dụng vào sản phẩm
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
