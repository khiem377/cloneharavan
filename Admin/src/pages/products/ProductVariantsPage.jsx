import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Layers } from '@/components/ui/Icons';
import { useProduct } from '@/hooks/useProducts';
import { useState } from 'react';
import VariantManager from '@/components/products/VariantManager';
import { useUpdateProduct } from '@/hooks/useProducts';
import { toast } from '@/providers/ToastProvider';
import { Loader2 } from '@/components/ui/Icons';

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
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground text-sm">
        Không tìm thấy sản phẩm
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 w-full max-w-6xl mx-auto min-h-full bg-background text-foreground">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs py-3 border-b border-border flex items-center gap-4">
        <button
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          onClick={() => navigate(`/products/${id}/edit`)}
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <Layers size={18} className="text-primary shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-tight truncate">
              Biến thể — {product.name}
            </h1>
            <p className="text-xs text-muted-foreground">SKU gốc: {product.sku}</p>
          </div>
        </div>
        <button
          className="ml-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-foreground hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
          onClick={handleSaveOptions}
          disabled={updateMut.isPending}
        >
          {updateMut.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          Lưu thuộc tính
        </button>
      </div>

      <div className="rounded-xl border border-border/50 bg-muted/20 p-4 flex items-center gap-4">
        <img
          src={product.thumbnail?.url || 'https://placehold.co/56x56/1e293b/fff?text=?'}
          alt={product.name}
          className="size-14 rounded-lg object-cover border border-border bg-muted shrink-0"
        />
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Giá gốc: <span className="text-foreground font-medium">{product.price?.toLocaleString('vi-VN')}đ</span>
            {product.salePrice > 0 && (
              <> &nbsp;·&nbsp; Giá KM: <span className="text-primary font-medium">{product.salePrice?.toLocaleString('vi-VN')}đ</span></>
            )}
          </p>
        </div>
      </div>

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
