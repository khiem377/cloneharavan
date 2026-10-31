import { RefreshCwIcon, PlusIcon } from '@/components/ui/Icons';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DashboardHeader({ period, setPeriod, onRefresh, isFetching }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Tổng quan Kinh doanh</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold font-mono">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            TRỰC TUYẾN
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Trung tâm điều hành và phân tích số liệu thời gian thực
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center border border-border bg-secondary/60 rounded-[6px] p-0.5 gap-0.5">
          {[
            { v: '7days', l: '7 Ngày' },
            { v: '30days', l: '30 Ngày' },
            { v: '90days', l: '90 Ngày' },
            { v: '6months', l: '6 Tháng' },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setPeriod(opt.v)}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold font-mono transition-colors active:scale-[0.98] cursor-pointer ${
                period === opt.v
                  ? 'bg-background text-foreground shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-8 px-2.5 text-xs font-medium gap-1.5 rounded-[6px] cursor-pointer active:scale-[0.98]"
        >
          <RefreshCwIcon className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </Button>

        {/* Primary Action Button */}
        <Button
          size="sm"
          onClick={() => navigate('/products/new')}
          className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-[6px] cursor-pointer active:scale-[0.98] bg-foreground text-background hover:bg-foreground/90"
        >
          <PlusIcon className="size-3.5" />
          <span>Thêm sản phẩm</span>
        </Button>
      </div>
    </div>
  );
}
