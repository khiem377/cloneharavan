import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Printer,
  Barcode,
  Search,
  Plus,
  Trash2,
  Copy,
  Settings2,
  CheckSquare,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/providers/ToastProvider';
import { useSearchInventoryProducts } from '@/hooks/useProducts';

// Generate visual Code 128 / Barcode bars pattern
function BarcodeSVG({ code = '893000000001', height = 36 }) {
  // Deterministic bar widths pattern based on string characters
  const cleanCode = (code || '00000000').toUpperCase();
  const bars = useMemo(() => {
    let pattern = [2, 1, 1, 2, 3, 1, 1]; // Start guard
    for (let i = 0; i < cleanCode.length; i++) {
      const charCode = cleanCode.charCodeAt(i);
      const b1 = (charCode % 3) + 1;
      const b2 = ((charCode >> 1) % 3) + 1;
      const b3 = ((charCode >> 2) % 3) + 1;
      const b4 = ((charCode >> 3) % 2) + 1;
      pattern.push(b1, b2, b3, b4);
    }
    pattern.push(2, 3, 1, 1, 1, 2); // Stop guard
    return pattern;
  }, [cleanCode]);

  let totalUnits = bars.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col items-center justify-center w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${totalUnits} ${height}`}
        className="w-full max-h-10 text-foreground fill-current"
        preserveAspectRatio="none"
      >
        {bars.map((w, idx) => {
          if (idx % 2 === 1) return null; // white space
          const x = bars.slice(0, idx).reduce((a, b) => a + b, 0);
          return <rect key={idx} x={x} y="0" width={w} height={height} fill="currentColor" />;
        })}
      </svg>
      <span className="text-[10px] font-mono tracking-wider font-semibold text-foreground/80 mt-0.5">
        {cleanCode}
      </span>
    </div>
  );
}

const TEMPLATES = [
  {
    id: 'thermal_2_labels',
    name: 'Khổ 2 tem nhiệt (72 × 22 mm)',
    desc: 'Máy in nhiệt mini Xprinter, Bixolon, tem phụ thời trang',
    widthMm: 72,
    heightMm: 22,
    columns: 2,
  },
  {
    id: 'thermal_3_labels',
    name: 'Khổ 3 tem nhiệt (105 × 22 mm)',
    desc: 'Chuẩn tem giá siêu thị, cửa hàng tiện lợi',
    widthMm: 105,
    heightMm: 22,
    columns: 3,
  },
  {
    id: 'tomy_a4_65',
    name: 'Giấy Tomy A4 (65 tem / tờ 38 × 21 mm)',
    desc: 'In bằng máy in văn phòng Canon, HP (Decal Tomy 145)',
    widthMm: 38.1,
    heightMm: 21.2,
    columns: 5,
  },
  {
    id: 'shipping_100x150',
    name: 'Tem đơn lớn (100 × 150 mm)',
    desc: 'Tem dán thùng hàng, kiện pallet kho vận',
    widthMm: 100,
    heightMm: 150,
    columns: 1,
  },
];

export default function BarcodePrintModal({ isOpen, onClose, initialProducts = [] }) {
  if (!isOpen) return null;

  // Selected products to print: [{ id, name, sku, barcode, price, stock, copies }]
  const [printItems, setPrintItems] = useState(() => {
    return initialProducts.map((p) => ({
      id: p._id,
      name: p.name,
      sku: p.sku || p.productCode || '',
      barcode: p.sku || p.productCode || p._id.slice(-8).toUpperCase(),
      price: p.cachedPrice ?? p.price ?? 0,
      stock: p.stock ?? 1,
      copies: 1,
    }));
  });

  const [selectedTemplate, setSelectedTemplate] = useState('thermal_2_labels');
  const [storeName, setStoreName] = useState('HARAVAN STORE');
  const [showStoreName, setShowStoreName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showSkuText, setShowSkuText] = useState(true);

  // Search product to add
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: searchResults = [], isLoading: isSearching } = useSearchInventoryProducts(searchQuery);

  const handleAddProduct = (prod) => {
    const existingIndex = printItems.findIndex((it) => it.id === prod._id);
    if (existingIndex > -1) {
      setPrintItems((prev) =>
        prev.map((it, idx) => (idx === existingIndex ? { ...it, copies: it.copies + 1 } : it))
      );
      toast.info(`Tăng số tem in cho ${prod.name}`);
    } else {
      setPrintItems((prev) => [
        ...prev,
        {
          id: prod._id,
          name: prod.name,
          sku: prod.sku || '',
          barcode: prod.sku || prod._id.slice(-8).toUpperCase(),
          price: prod.cachedPrice ?? prod.price ?? 0,
          stock: prod.stock ?? 1,
          copies: 1,
        },
      ]);
      toast.success(`Đã thêm ${prod.name} vào danh sách in tem`);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleUpdateCopies = (index, val) => {
    setPrintItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, copies: Math.max(1, parseInt(val, 10) || 1) } : it))
    );
  };

  const handleRemoveItem = (index) => {
    setPrintItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSetAllCopies = (num) => {
    setPrintItems((prev) => prev.map((it) => ({ ...it, copies: num })));
    toast.success(`Đã đặt số lượng in = ${num} cho tất cả sản phẩm`);
  };

  const handleSetCopiesToStock = () => {
    setPrintItems((prev) => prev.map((it) => ({ ...it, copies: Math.max(1, it.stock || 1) })));
    toast.success('Đã đặt số tem in bằng số lượng tồn kho thực tế');
  };

  // Flatten items by copies for live preview and printing
  const flattenedLabels = useMemo(() => {
    const list = [];
    printItems.forEach((item) => {
      const copies = Number(item.copies) || 1;
      for (let i = 0; i < copies; i++) {
        list.push({ ...item, labelIndex: i + 1 });
      }
    });
    return list;
  }, [printItems]);

  const activeTemplate = useMemo(() => {
    return TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
  }, [selectedTemplate]);

  const handlePrint = () => {
    if (flattenedLabels.length === 0) {
      return toast.warning('Chưa có tem nào để in');
    }
    window.print();
  };

  return (
    <>
      {/* Stylesheet specifically for printing labels */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #barcode-print-zone, #barcode-print-zone * {
            visibility: visible !important;
          }
          #barcode-print-zone {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          @page {
            size: auto;
            margin: 2mm;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto animate-in fade-in duration-150">
        <div className="w-full max-w-5xl rounded-[6px] border border-border bg-card text-card-foreground shadow-xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Barcode size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  In Tem Mã Vạch Barcode Hàng Loạt
                </h2>
                <p className="text-xs text-muted-foreground">
                  Chuẩn hóa mã vạch hàng hóa cho máy quét POS & dán nhãn quản lý kho hàng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-[4px] text-xs font-mono">
                Tổng số tem: <strong>{flattenedLabels.length}</strong>
              </Badge>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CỘT TRÁI (5 Cột): THIẾT LẬP MẪU IN & DANH SÁCH SẢN PHẨM */}
            <div className="lg:col-span-5 space-y-5 border-r border-border pr-0 lg:pr-5">
              {/* Chọn khổ giấy / Mẫu in */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Printer size={13} className="text-primary" /> Mẫu khổ tem in nhiệt
                </label>
                <div className="space-y-1.5">
                  {TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`p-2.5 rounded-[6px] border cursor-pointer transition-all ${
                        selectedTemplate === tmpl.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                          : 'border-border bg-background hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{tmpl.name}</span>
                        {selectedTemplate === tmpl.id && (
                          <Badge variant="default" className="text-[10px] rounded-[4px] px-1.5 py-0">
                            Đang chọn
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{tmpl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tùy chỉnh thông tin trên tem */}
              <div className="space-y-2.5 rounded-[6px] border border-border p-3 bg-muted/20">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Settings2 size={13} className="text-primary" /> Tùy chỉnh nội dung nhãn
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="opt-store"
                      checked={showStoreName}
                      onCheckedChange={(checked) => setShowStoreName(checked)}
                    />
                    <label htmlFor="opt-store" className="text-xs text-foreground cursor-pointer select-none">
                      Tên cửa hàng / Brand
                    </label>
                  </div>
                  {showStoreName && (
                    <Input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Tên shop in trên đầu tem..."
                      className="h-7 text-xs rounded-[4px]"
                    />
                  )}

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="opt-pname"
                      checked={showProductName}
                      onCheckedChange={(checked) => setShowProductName(checked)}
                    />
                    <label htmlFor="opt-pname" className="text-xs text-foreground cursor-pointer select-none">
                      Tên sản phẩm (tự động ngắt dòng)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="opt-price"
                      checked={showPrice}
                      onCheckedChange={(checked) => setShowPrice(checked)}
                    />
                    <label htmlFor="opt-price" className="text-xs text-foreground cursor-pointer select-none">
                      Giá bán (in đậm, to, rõ)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="opt-sku"
                      checked={showSkuText}
                      onCheckedChange={(checked) => setShowSkuText(checked)}
                    />
                    <label htmlFor="opt-sku" className="text-xs text-foreground cursor-pointer select-none">
                      Mã SKU / Barcode text dưới vạch
                    </label>
                  </div>
                </div>
              </div>

              {/* Tìm & thêm sản phẩm vào danh sách in */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers size={13} className="text-primary" /> Sản phẩm cần in ({printItems.length})
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetAllCopies(1)}
                      className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded-[4px] border border-border"
                    >
                      SL = 1
                    </button>
                    <button
                      type="button"
                      onClick={handleSetCopiesToStock}
                      className="text-[10px] text-primary hover:underline px-1.5 py-0.5 rounded-[4px] border border-primary/20 bg-primary/5"
                    >
                      Theo tồn kho
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Thêm sản phẩm khác để in tem..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    className="pl-8 h-8 rounded-[6px] text-xs"
                  />
                  {isSearchOpen && searchQuery.trim() && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-[6px] border border-border bg-popover shadow-md divide-y divide-border">
                      {searchResults.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleAddProduct(product)}
                          className="p-2 hover:bg-muted/60 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-semibold text-foreground truncate">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              SKU: {product.sku || '—'} • Tồn: {product.stock || 0}
                            </p>
                          </div>
                          <span className="font-mono font-bold shrink-0">
                            {Number(product.cachedPrice ?? product.price ?? 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Danh sách các sản phẩm và số lượng tem */}
                <div className="max-h-56 overflow-y-auto rounded-[6px] border border-border divide-y divide-border bg-background">
                  {printItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      Chưa có sản phẩm nào trong danh sách in.
                    </div>
                  ) : (
                    printItems.map((item, idx) => (
                      <div key={item.id || idx} className="p-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                            <span>Mã: {item.sku || item.barcode}</span>
                            <span>•</span>
                            <span>{Number(item.price).toLocaleString('vi-VN')} đ</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-muted-foreground">Số tem:</span>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={item.copies}
                            onChange={(e) => handleUpdateCopies(idx, e.target.value)}
                            className="w-12 h-6 text-center text-xs font-mono font-bold rounded-[4px] border border-input bg-background"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                            title="Xóa"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (7 Cột): BẢN XEM TRƯỚC TRỰC QUAN (LIVE PREVIEW) */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles size={13} className="text-primary" /> Bản xem trước trang in ({flattenedLabels.length} tem)
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Khổ: {activeTemplate.name}
                </span>
              </div>

              {/* KHU VỰC HIỂN THỊ TEM (CŨNG LÀ VÙNG IN KHI WINDOW.PRINT) */}
              <div
                id="barcode-print-zone"
                className="flex-1 overflow-y-auto rounded-[6px] border border-border bg-muted/20 p-4 max-h-[550px]"
              >
                <div
                  className="grid gap-2 mx-auto justify-center"
                  style={{
                    gridTemplateColumns: `repeat(${activeTemplate.columns}, minmax(0, 1fr))`,
                  }}
                >
                  {flattenedLabels.map((lbl, i) => (
                    <div
                      key={i}
                      className="border border-slate-300 dark:border-border bg-white text-black p-2 rounded-[4px] flex flex-col justify-between items-center text-center shadow-xs"
                      style={{
                        minHeight: activeTemplate.id === 'shipping_100x150' ? '240px' : '90px',
                      }}
                    >
                      {/* Tiêu đề shop */}
                      {showStoreName && (
                        <div className="text-[9px] font-bold tracking-wider text-slate-800 uppercase line-clamp-1 border-b border-slate-200 w-full pb-0.5 mb-1">
                          {storeName || 'CỬA HÀNG'}
                        </div>
                      )}

                      {/* Tên sản phẩm */}
                      {showProductName && (
                        <div className="text-[10px] font-semibold text-slate-900 leading-tight line-clamp-2 w-full">
                          {lbl.name}
                        </div>
                      )}

                      {/* Mã vạch SVG */}
                      <div className="w-full my-1">
                        <BarcodeSVG
                          code={lbl.barcode}
                          height={activeTemplate.id === 'shipping_100x150' ? 60 : 30}
                        />
                      </div>

                      {/* Đơn giá */}
                      {showPrice && (
                        <div className="text-xs font-mono font-bold text-black border-t border-slate-200 w-full pt-0.5 mt-0.5">
                          {Number(lbl.price).toLocaleString('vi-VN')} đ
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3.5 bg-muted/20">
            <span className="text-xs text-muted-foreground">
              💡 Hỗ trợ in trực tiếp tới mọi máy in mã vạch nhiệt qua hộp thoại in của trình duyệt.
            </span>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-[6px] text-xs h-8"
              >
                Đóng
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handlePrint}
                disabled={flattenedLabels.length === 0}
                className="rounded-[6px] text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform font-semibold flex items-center gap-1.5"
              >
                <Printer size={14} />
                In {flattenedLabels.length} tem mã vạch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
