import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Layers, Trash2, ToggleLeft, ToggleRight } from '@/components/ui/Icons';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function ProductGrid({
  products = [],
  selected = [],
  onToggleSelect,
  onViewFrontend,
  onToggleStatus,
  onDeleteProduct,
}) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => {
        const isSelected = selected.includes(p._id);
        const thumbSrc = (typeof p.thumbnail === 'string' ? p.thumbnail : p.thumbnail?.url) || 'https://placehold.co/200x200/1e293b/fff?text=?';
        const displayPrice = p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price;

        return (
          <Card
            key={p._id}
            className={`rounded-[6px] border border-border overflow-hidden transition-all hover:border-primary/50 relative ${
              isSelected ? 'border-primary ring-2 ring-primary/30' : ''
            }`}
          >
            <div className="absolute top-2 left-2 z-10 bg-background/90 rounded-[4px] p-0.5 border border-border">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(p._id)}
                aria-label={`Chọn sản phẩm ${p.name}`}
              />
            </div>
            <img src={thumbSrc} alt={p.name} className="aspect-square w-full object-cover bg-muted" />
            <div className="p-3 flex flex-col gap-1.5">
              <Badge variant="outline" className={`w-fit rounded-[6px] px-2 py-0.5 text-xs font-medium border ${STATUS_BADGE[p.status]}`}>
                {STATUS_LABELS[p.status]}
              </Badge>
              <p className="font-semibold text-sm text-foreground line-clamp-1">{p.name}</p>
              <p className="text-xs text-muted-foreground font-mono tabular-nums">{p.sku}</p>
              <p className="font-bold text-sm text-foreground font-mono tabular-nums">{formatPrice(displayPrice)}</p>
            </div>
            <div className="flex items-center justify-end gap-1 p-2 border-t border-border bg-muted/30">
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
                  title="Biến thể"
                  onClick={() => navigate(`/products/${p._id}/variants`)}
                >
                  <Layers size={14} />
                </Button>
              </Can>
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
          </Card>
        );
      })}
    </div>
  );
}
