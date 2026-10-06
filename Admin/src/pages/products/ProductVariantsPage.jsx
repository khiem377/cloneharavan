import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Layers, Loader2 } from '@/components/ui/Icons';
import { useProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useState } from 'react';
import VariantManager from '@/components/products/VariantManager';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProductVariantsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: productData, isLoading } = useProduct(id);
  const updateMut = useUpdateProduct();

  const product = productData;
  const [options, setOptions] = useState(null);

  const resolvedOptions = options ?? product?.options ?? [];

  const handleSaveOptions = () => {
    if (!product) return;
    updateMut.mutate(
      { id, data: { options: resolvedOptions } },
      {
        onSuccess: () => toast.success('Đã lưu thuộc tính'),
        onError: (e) => toast.error(e.response?.data?.message || 'Lỗi lưu thuộc tính'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground gap-2">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground text-xs">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 w-full max-w-6xl mx-auto min-h-full bg-background text-foreground">
      <div className="sticky top-0 z-20 bg-background/95 py-3 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-[6px] text-xs"
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            <ArrowLeft size={14} className="mr-1.5" /> Quay lại
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <Layers size={18} className="text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-foreground leading-tight truncate">
                Biến thể — {product.name}
              </h1>
              <p className="text-[11px] text-muted-foreground font-mono tabular-nums">SKU gốc: {product.sku}</p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-[6px] text-xs font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
          onClick={handleSaveOptions}
          disabled={updateMut.isPending}
        >
          {updateMut.isPending ? <Loader2 size={13} className="animate-spin mr-1.5" /> : null}
          Lưu thuộc tính
        </Button>
      </div>

      <Card className="rounded-[6px] border border-border shadow-none bg-muted/20">
        <CardContent className="p-4 flex items-center gap-4">
          <img
            src={product.thumbnail?.url || 'https://placehold.co/56x56/1e293b/fff?text=?'}
            alt={product.name}
            className="size-14 rounded-[6px] object-cover border border-border bg-muted shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono tabular-nums">
              Giá gốc: <span className="text-foreground font-semibold">{product.price?.toLocaleString('vi-VN')}đ</span>
              {product.salePrice > 0 && (
                <> &nbsp;·&nbsp; Giá KM: <span className="text-primary font-bold">{product.salePrice?.toLocaleString('vi-VN')}đ</span></>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <VariantManager
        productId={id}
        product={product}
        options={resolvedOptions}
        onOptionsChange={(opts) => setOptions(opts)}
        basePrice={product.price ?? 0}
        baseSalePrice={product.salePrice ?? 0}
        parentSku={product.sku || ''}
      />
    </div>
  );
}
