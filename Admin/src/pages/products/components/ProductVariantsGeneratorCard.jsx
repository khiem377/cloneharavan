import React from 'react';
import { Plus, Trash2, Layers, X } from '@/components/ui/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import PriceInput from '@/components/ui/PriceInput';
import { toast } from '@/providers/ToastProvider';

/**
 * On-the-fly Variant & Attribute Matrix Generator for Product Creation
 */
export default function ProductVariantsGeneratorCard({
  hasVariants,
  setHasVariants,
  options,
  setOptions,
  optionInputs,
  setOptionInputs,
  generatedVariants,
  setGeneratedVariants,
  bulkPrice,
  setBulkPrice,
  bulkSalePrice,
  setBulkSalePrice,
  bulkStock,
  setBulkStock,
  generateCartesianVariants,
  form,
}) {
  return (
    <Card className="rounded-[6px] border border-border shadow-none">
      <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">Biến thể & Phiên bản</CardTitle>
          <p className="text-[11px] text-muted-foreground">Tùy chọn tạo nhiều kích thước, màu sắc cùng lúc</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer bg-muted/50 px-2.5 py-1 rounded-[6px] border border-border hover:bg-muted transition-colors">
          <input
            type="checkbox"
            className="size-3.5 rounded-[4px] border-input text-primary focus:ring-ring cursor-pointer"
            checked={hasVariants}
            onChange={(e) => {
              const enabled = e.target.checked;
              setHasVariants(enabled);
              if (enabled && options.length === 0) {
                setOptions([{ name: 'Kích thước', values: [] }]);
              }
            }}
          />
          <span>Có nhiều phiên bản</span>
        </label>
      </CardHeader>

      {hasVariants && (
        <CardContent className="pt-4 space-y-4">
          {/* Attributes List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">1. Danh sách thuộc tính</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-[6px] cursor-pointer"
                onClick={() => setOptions([...options, { name: '', values: [] }])}
              >
                <Plus size={12} className="mr-1" /> Thêm thuộc tính
              </Button>
            </div>

            {options.map((opt, optIdx) => (
              <div key={optIdx} className="p-3 rounded-[6px] border border-border bg-muted/20 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-8 max-w-xs rounded-[6px] text-xs font-sans"
                    placeholder="Tên thuộc tính (VD: Kích thước)"
                    value={opt.name}
                    onChange={(e) => {
                      const copy = [...options];
                      copy[optIdx].name = e.target.value;
                      setOptions(copy);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-[6px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive ml-auto cursor-pointer"
                    onClick={() => {
                      const copy = options.filter((_, i) => i !== optIdx);
                      setOptions(copy);
                    }}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>

                {/* Values chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {opt.values.map((val, valIdx) => {
                    const valStr =
                      typeof val === 'object' && val !== null ? val.value || '' : String(val || '');
                    return (
                      <span
                        key={valIdx}
                        className="inline-flex items-center gap-1 rounded-[4px] bg-background border border-border px-2 py-0.5 text-xs font-medium text-foreground"
                      >
                        {valStr}
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive cursor-pointer ml-0.5"
                          onClick={() => {
                            const copy = [...options];
                            copy[optIdx].values = copy[optIdx].values.filter((_, i) => i !== valIdx);
                            setOptions(copy);
                          }}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    );
                  })}

                  <div className="flex items-center gap-1 flex-1 min-w-[180px]">
                    <Input
                      className="h-7 rounded-[4px] border-dashed text-xs font-sans"
                      placeholder="Nhập giá trị (VD: Đỏ, Xanh)..."
                      value={optionInputs[optIdx] || ''}
                      onChange={(e) => setOptionInputs({ ...optionInputs, [optIdx]: e.target.value })}
                      onBlur={() => {
                        const val = (optionInputs[optIdx] || '').trim();
                        if (val && !opt.values.includes(val)) {
                          const copy = [...options];
                          copy[optIdx].values.push(val);
                          setOptions(copy);
                          setOptionInputs({ ...optionInputs, [optIdx]: '' });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const val = (optionInputs[optIdx] || '').trim();
                          if (val && !opt.values.includes(val)) {
                            const copy = [...options];
                            copy[optIdx].values.push(val);
                            setOptions(copy);
                            setOptionInputs({ ...optionInputs, [optIdx]: '' });
                          }
                        }
                      }}
                    />
                    {optionInputs[optIdx]?.trim() && (
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 px-2 text-xs rounded-[4px] cursor-pointer"
                        onClick={() => {
                          const val = (optionInputs[optIdx] || '').trim();
                          if (val && !opt.values.includes(val)) {
                            const copy = [...options];
                            copy[optIdx].values.push(val);
                            setOptions(copy);
                            setOptionInputs({ ...optionInputs, [optIdx]: '' });
                          }
                        }}
                      >
                        + Thêm
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Matrix Generator Button */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs font-semibold text-foreground">
              2. Ma trận phiên bản ({generatedVariants.length} loại)
            </span>
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98] cursor-pointer"
              onClick={() => {
                const latestOpts = options.map((opt, optIdx) => {
                  const pendingVal = (optionInputs[optIdx] || '').trim();
                  if (pendingVal && !opt.values.includes(pendingVal)) {
                    return { ...opt, values: [...opt.values, pendingVal] };
                  }
                  return opt;
                });
                setOptions(latestOpts);
                setOptionInputs({});

                const vars = generateCartesianVariants(
                  latestOpts,
                  form.sku,
                  form.price,
                  form.salePrice,
                  form.stock
                );
                setGeneratedVariants(vars);
                if (vars.length > 0) toast.success(`Đã tự động sinh ${vars.length} biến thể`);
                else toast.error('Vui lòng nhập ít nhất 1 tên thuộc tính và 1 giá trị');
              }}
            >
              <Layers size={13} className="mr-1.5" /> Sinh ma trận biến thể
            </Button>
          </div>

          {/* Matrix Table */}
          {generatedVariants.length > 0 && (
            <div className="flex flex-col gap-3">
              {/* Bulk Edit Bar */}
              <div className="p-3 rounded-[6px] bg-muted/40 border border-border flex flex-wrap items-center gap-3 text-xs">
                <span className="font-semibold text-foreground shrink-0">Áp dụng cho tất cả:</span>
                <div className="flex items-center gap-1.5">
                  <PriceInput
                    value={bulkPrice}
                    onChange={(v) => setBulkPrice(v)}
                    placeholder="Giá niêm yết"
                    className="h-8 w-28 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-[6px] text-xs cursor-pointer"
                    onClick={() => {
                      if (!bulkPrice) return;
                      setGeneratedVariants(generatedVariants.map((v) => ({ ...v, price: Number(bulkPrice) })));
                      toast.success('Đã áp dụng Giá niêm yết cho tất cả');
                    }}
                  >
                    Áp dụng
                  </Button>
                </div>

                <div className="flex items-center gap-1.5">
                  <PriceInput
                    value={bulkSalePrice}
                    onChange={(v) => setBulkSalePrice(v)}
                    placeholder="Giá KM"
                    className="h-8 w-28 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-[6px] text-xs cursor-pointer"
                    onClick={() => {
                      setGeneratedVariants(
                        generatedVariants.map((v) => ({ ...v, salePrice: Number(bulkSalePrice || 0) }))
                      );
                      toast.success('Đã áp dụng Giá KM cho tất cả');
                    }}
                  >
                    Áp dụng
                  </Button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    value={bulkStock}
                    onChange={(e) => setBulkStock(e.target.value)}
                    placeholder="Tồn kho"
                    className="h-8 w-20 rounded-[6px] text-xs font-mono tabular-nums"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-[6px] text-xs cursor-pointer"
                    onClick={() => {
                      setGeneratedVariants(
                        generatedVariants.map((v) => ({ ...v, stock: Number(bulkStock || 0) }))
                      );
                      toast.success('Đã áp dụng Tồn kho cho tất cả');
                    }}
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-[6px] border border-border">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="py-2 text-xs w-10">#</TableHead>
                      <TableHead className="py-2 text-xs">Tên phiên bản</TableHead>
                      <TableHead className="py-2 text-xs">Mã SKU</TableHead>
                      <TableHead className="py-2 text-xs">Giá niêm yết</TableHead>
                      <TableHead className="py-2 text-xs">Giá KM</TableHead>
                      <TableHead className="py-2 text-xs">Tồn kho</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedVariants.map((v, vIdx) => (
                      <TableRow key={vIdx} className="hover:bg-muted/20">
                        <TableCell className="py-1.5 font-mono text-muted-foreground text-xs tabular-nums">
                          {vIdx + 1}
                        </TableCell>
                        <TableCell className="py-1.5 font-medium text-foreground text-xs">
                          {v.displayName}
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Input
                            className="h-7 w-28 rounded-[4px] text-xs font-mono uppercase"
                            value={v.sku}
                            onChange={(e) => {
                              const copy = [...generatedVariants];
                              copy[vIdx].sku = e.target.value;
                              setGeneratedVariants(copy);
                            }}
                          />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <PriceInput
                            value={v.price}
                            onChange={(val) => {
                              const copy = [...generatedVariants];
                              copy[vIdx].price = val;
                              setGeneratedVariants(copy);
                            }}
                            className="h-7 w-28 text-xs"
                          />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <PriceInput
                            value={v.salePrice}
                            onChange={(val) => {
                              const copy = [...generatedVariants];
                              copy[vIdx].salePrice = val;
                              setGeneratedVariants(copy);
                            }}
                            className="h-7 w-28 text-xs"
                          />
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Input
                            type="number"
                            min="0"
                            className="h-7 w-20 rounded-[4px] text-xs font-mono font-bold tabular-nums"
                            value={v.stock}
                            onChange={(e) => {
                              const copy = [...generatedVariants];
                              copy[vIdx].stock = Number(e.target.value);
                              setGeneratedVariants(copy);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
