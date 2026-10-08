import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@/components/ui/Icons';

export default function DashboardTopProducts({ topProducts = [] }) {
  return (
    <div className="border border-border bg-card rounded-[6px] p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Sản phẩm xem nhiều nhất</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Xếp hạng theo mức độ quan tâm của khách hàng</p>
        </div>
        <Link
          to="/products"
          className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium font-mono"
        >
          Tất cả <ChevronRightIcon className="size-3" />
        </Link>
      </div>
      <div className="divide-y divide-border/60">
        {topProducts.length > 0 ? (
          topProducts.slice(0, 5).map((p, i) => {
            const img = typeof p.thumbnail === 'string' ? p.thumbnail : p.thumbnail?.url || '';
            return (
              <Link
                key={p._id}
                to={`/products/${p._id}/edit`}
                className="group py-2 flex items-center gap-3 hover:bg-accent/40 px-1 rounded-[4px] transition-colors"
              >
                <span className="text-[11px] font-bold font-mono text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                {img ? (
                  <img
                    src={img}
                    alt={p.name}
                    className="size-9 rounded-[4px] object-cover border border-border shrink-0 bg-muted"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/100x100?text=SP';
                    }}
                  />
                ) : (
                  <div className="size-9 rounded-[4px] bg-secondary border border-border shrink-0 flex items-center justify-center text-[11px] font-bold font-mono text-muted-foreground">
                    {p.name?.charAt(0) || 'P'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {p.brand?.name || 'Chính hãng'} • Tồn: {p.stock}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold font-mono tabular-nums text-foreground">
                    {(p.salePrice || p.price)?.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    {(p.viewsCount || 0).toLocaleString()} lượt xem
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8 font-mono">Chưa có dữ liệu sản phẩm</p>
        )}
      </div>
    </div>
  );
}
