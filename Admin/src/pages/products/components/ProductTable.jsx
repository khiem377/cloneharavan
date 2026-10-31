import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Layers, Trash2, ToggleLeft, ToggleRight } from '@/components/ui/Icons';
import { Barcode, Coins, Cpu } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MediaThumbnailHover } from '@/components/ui/MediaFolderBadge';
import Can from '@/components/auth/Can';

const STATUS_LABELS = { published: 'Công khai', draft: 'Nháp', out_of_stock: 'Hết hàng' };
const STATUS_BADGE = {
  published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  out_of_stock: 'bg-destructive/10 text-destructive border-destructive/20',
};

function formatPrice(n) {
  if (!n) return '0đ';
  return n.toLocaleString('vi-VN') + 'đ';
}

export default function ProductTable({
  products = [],
  selected = [],
  highlightId,
  mediaMap = {},
  isColumnVisible,
  visibleColumnCount,
  rowRefs,
  onToggleSelect,
  onToggleSelectAll,
  onViewFrontend,
  onToggleStatus,
  onDeleteProduct,
  onOpenBarcodeModal,
  onOpenWholesaleModal,
  onOpenBomModal,
}) {
  const navigate = useNavigate();

  const resolveId = (v) => (v && typeof v === 'object' ? v._id : v);

  return (
    <Card className="rounded-[6px] border border-border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow className="border-b border-border text-[11px] font-bold text-foreground">
            <TableHead className="px-3.5 py-3 w-10">
              <div className="flex items-center">
                <Checkbox
                  checked={selected.length === products.length && products.length > 0}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Chọn tất cả sản phẩm"
                />
              </div>
            </TableHead>
            {isColumnVisible('product') && <TableHead className="px-3.5 py-3.5 whitespace-nowrap">Sản phẩm</TableHead>}
            {isColumnVisible('sku') && <TableHead className="px-3.5 py-3.5 whitespace-nowrap">SKU</TableHead>}
            {isColumnVisible('status') && <TableHead className="px-3.5 py-3.5 whitespace-nowrap">Trạng thái</TableHead>}
            {isColumnVisible('category') && <TableHead className="px-3.5 py-3.5 whitespace-nowrap">Danh mục</TableHead>}
            {isColumnVisible('brand') && <TableHead className="px-3.5 py-3.5 whitespace-nowrap">Thương hiệu</TableHead>}
            {isColumnVisible('price') && <TableHead className="px-3.5 py-3.5 whitespace-nowrap">Giá bán</TableHead>}
            {isColumnVisible('variants') && <TableHead className="px-3.5 py-3.5 text-center whitespace-nowrap">Biến thể</TableHead>}
            {isColumnVisible('stock') && <TableHead className="px-3.5 py-3.5 whitespace-nowrap">Tồn kho</TableHead>}
            {isColumnVisible('actions') && (
              <TableHead className="px-3.5 py-3.5 whitespace-nowrap text-right sticky right-0 z-20 bg-muted/95 dark:bg-card shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)] border-l border-border/70">
                Thao tác
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumnCount + 1} className="py-12 text-center text-xs text-muted-foreground">
                Chưa có sản phẩm nào
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => {
              const isSelected = selected.includes(p._id);
              const isHighlight = p._id === highlightId;
              const mid = resolveId(p.thumbnail?.mediaId || p.thumbnail?._id);
              const thumbSrc = (typeof p.thumbnail === 'string' ? p.thumbnail : p.thumbnail?.url) || 'https://placehold.co/40x40/1e293b/fff?text=?';
              const availableStock = p.availableStock !== undefined ? p.availableStock : Math.max(0, (p.stock || 0) - (p.allocated || 0));

              return (
                <TableRow
                  key={p._id}
                  ref={(el) => {
                    if (rowRefs && rowRefs.current) rowRefs.current[p._id] = el;
                  }}
                  className={`group transition-colors hover:bg-muted/40 align-middle ${
                    isSelected || isHighlight ? 'bg-primary/8 ring-1 ring-inset ring-primary/30' : ''
                  }`}
                >
                  <TableCell className="px-3.5 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(p._id)}
                      aria-label={`Chọn sản phẩm ${p.name}`}
                    />
                  </TableCell>

                  {isColumnVisible('product') && (
                    <TableCell className="px-3.5 py-3 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <MediaThumbnailHover media={mid ? mediaMap[mid] : null} className="size-9 shrink-0 rounded-[4px] overflow-hidden border border-border bg-muted">
                          <img src={thumbSrc} alt={p.name} className="size-full object-cover" />
                        </MediaThumbnailHover>
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span className="font-semibold text-foreground text-xs line-clamp-1 max-w-xs">{p.name}</span>
                          {p.itemType === 'combo' && (
                            <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-1 py-0 rounded-[4px]">
                              Combo
                            </Badge>
                          )}
                          {p.allowNegativeStock && (
                            <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 px-1 py-0 rounded-[4px]" title="Cho phép bán tồn kho âm">
                              Bán âm
                            </Badge>
                          )}
                          {p.isComposite && (
                            <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-1 py-0 rounded-[4px]">
                              BOM
                            </Badge>
                          )}
                          {p.wholesaleTiers?.length > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-1 py-0 rounded-[4px]">
                              Sỉ ({p.wholesaleTiers.length})
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {isColumnVisible('sku') && (
                    <TableCell className="px-3.5 py-3 align-middle">
                      <code className="inline-flex items-center rounded-[4px] bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground border border-border/50">
                        {p.sku}
                      </code>
                    </TableCell>
                  )}

                  {isColumnVisible('status') && (
                    <TableCell className="px-3.5 py-3 align-middle">
                      <Badge variant="outline" className={`rounded-[6px] px-2.5 py-0.5 text-xs font-medium border ${STATUS_BADGE[p.status]}`}>
                        {STATUS_LABELS[p.status]}
                      </Badge>
                    </TableCell>
                  )}

                  {isColumnVisible('category') && (
                    <TableCell className="px-3.5 py-3 align-middle text-muted-foreground text-xs">
                      {p.category?.name || (Array.isArray(p.categories) && p.categories[0]?.name) || '—'}
                    </TableCell>
                  )}

                  {isColumnVisible('brand') && (
                    <TableCell className="px-3.5 py-3 align-middle text-muted-foreground text-xs">
                      {p.brand?.name || '—'}
                    </TableCell>
                  )}

                  {isColumnVisible('price') && (
                    <TableCell className="px-3.5 py-3 align-middle">
                      {p.salePrice > 0 && p.salePrice < p.price ? (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-foreground text-sm font-mono tabular-nums">{formatPrice(p.salePrice)}</span>
                          <span className="text-xs text-muted-foreground line-through font-mono tabular-nums">{formatPrice(p.price)}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-foreground font-mono tabular-nums text-sm">{formatPrice(p.price)}</span>
                      )}
                    </TableCell>
                  )}

                  {isColumnVisible('variants') && (
                    <TableCell className="px-3.5 py-3 align-middle text-center">
                      {p.variantCount > 0 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="inline-flex items-center gap-1 rounded-[4px] bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 h-6"
                          title="Quản lý biến thể"
                          onClick={() => navigate(`/products/${p._id}/variants`)}
                        >
                          <Layers size={11} />
                          <span className="font-mono tabular-nums">{p.variantCount}</span>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}

                  {isColumnVisible('stock') && (
                    <TableCell className="px-3.5 py-3 align-middle font-mono text-xs tabular-nums">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-xs ${availableStock > 0 ? 'text-foreground' : 'text-destructive font-semibold'}`}>
                            {availableStock}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-sans font-normal">có thể bán</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-sans">
                          <span>Tổng: <strong className="font-mono font-medium text-foreground">{p.stock || 0}</strong></span>
                          {(p.allocated || 0) > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold" title="Đang nằm trong đơn hàng chờ xuất">
                              • Giữ: {p.allocated}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {isColumnVisible('actions') && (
                    <TableCell className="px-3.5 py-3 align-middle text-right sticky right-0 z-10 bg-background group-hover:bg-muted/70 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.08)] border-l border-border/70">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-[4px] text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Xem trên Cửa hàng"
                          onClick={() => onViewFrontend(p.slug)}
                        >
                          <Eye size={14} />
                        </Button>
                        <Can do="product.edit">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-[4px] text-muted-foreground hover:bg-accent hover:text-foreground"
                            title="Sửa"
                            onClick={() => navigate(`/products/${p._id}/edit`)}
                          >
                            <Pencil size={14} />
                          </Button>
                        </Can>
                        <Can do="product_variant.create">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-[4px] text-muted-foreground hover:bg-violet-500/10 hover:text-violet-500"
                            title="Quản lý biến thể"
                            onClick={() => navigate(`/products/${p._id}/variants`)}
                          >
                            <Layers size={14} />
                          </Button>
                        </Can>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-[4px] text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600"
                          title="Bảng giá bán sỉ theo số lượng"
                          onClick={() => onOpenWholesaleModal(p)}
                        >
                          <Coins size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-[4px] text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600"
                          title="Sản phẩm cấu thành (BOM)"
                          onClick={() => onOpenBomModal(p)}
                        >
                          <Cpu size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-[4px] text-muted-foreground hover:bg-slate-500/10 hover:text-foreground"
                          title="In tem mã vạch"
                          onClick={() => onOpenBarcodeModal(p)}
                        >
                          <Barcode size={14} />
                        </Button>
                        <Can do="product.edit">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-[4px] text-muted-foreground hover:bg-accent hover:text-foreground"
                            title={p.isActive ? 'Ẩn' : 'Hiện'}
                            onClick={() => onToggleStatus(p)}
                          >
                            {p.isActive ? <ToggleRight size={14} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={14} />}
                          </Button>
                        </Can>
                        <Can do="product.delete">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-[4px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Xóa"
                            onClick={() => onDeleteProduct(p)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
