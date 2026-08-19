import { Clock, ArrowLeft } from '@/components/ui/Icons';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function ComingSoonPage({ title = 'Trang đang phát triển' }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
        <Clock size={32} />
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h2>

      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Tính năng này đang được phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo.
      </p>

      <Button
        variant="outline"
        onClick={() => navigate('/banners')}
        className="gap-2 rounded-xl"
      >
        <ArrowLeft size={16} />
        Về quản lý Banner
      </Button>
    </div>
  );
}
