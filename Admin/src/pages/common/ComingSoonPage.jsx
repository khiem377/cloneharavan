import { Clock, ArrowLeft } from '@/components/ui/Icons';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function ComingSoonPage({ title = 'Trang đang phát triển' }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[450px] antialiased">
      <div className="size-14 rounded-[6px] bg-secondary border border-border flex items-center justify-center text-muted-foreground mb-4">
        <Clock className="size-7" />
      </div>

      <h2 className="text-lg font-bold text-foreground mb-1 tracking-tight">
        {title}
      </h2>

      <p className="text-xs text-muted-foreground max-w-sm mb-6">
        Tính năng này đang được phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo.
      </p>

      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="gap-2 rounded-[6px] text-xs font-semibold h-8 px-3 active:scale-[0.98]"
      >
        <ArrowLeft className="size-3.5" />
        <span>Quay lại</span>
      </Button>
    </div>
  );
}

