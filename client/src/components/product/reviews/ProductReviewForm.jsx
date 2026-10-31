'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ProductReviewForm({
  rating = 5,
  setRating,
  content = '',
  setContent,
  submitting = false,
  onSubmit,
  mounted = true,
  isAuthenticated = false,
  hasPurchased = false,
  userRole = 'customer',
}) {
  const ratingLabels = {
    5: 'Tuyệt vời',
    4: 'Hài lòng',
    3: 'Bình thường',
    2: 'Không hài lòng',
    1: 'Rất tệ',
  };

  return (
    <Card className="rounded-[6px] border-slate-200 bg-white shadow-2xs">
      <CardHeader className="border-b border-slate-100 p-4 pb-2.5">
        <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wide">
          Gửi đánh giá của bạn
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-3">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50/70 p-2.5 rounded-[6px] border border-slate-200">
            <span className="font-semibold text-slate-700">Chất lượng sản phẩm:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setRating(star)}
                  className={`h-7 w-7 rounded-[4px] p-0 active:scale-[0.98] ${
                    star <= rating ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-amber-300'
                  }`}
                  aria-label={`${star} sao`}
                >
                  <Star size={16} className={star <= rating ? 'fill-amber-400' : ''} />
                </Button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 ml-1">
              {ratingLabels[rating] || ''}
            </span>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ cảm nhận chân thực về chất lượng sản phẩm, dịch vụ giao hàng..."
            rows={3}
            className="text-xs sm:text-sm rounded-[6px] border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 bg-white"
          />

          <div className="flex items-center justify-between min-h-[32px]">
            <span className="text-[11px] text-slate-400" suppressHydrationWarning>
              {mounted ? (
                !isAuthenticated
                  ? 'Vui lòng đăng nhập để gửi đánh giá.'
                  : !hasPurchased && userRole !== 'admin'
                  ? 'Chỉ khách hàng đã mua sản phẩm mới có quyền đánh giá.'
                  : 'Đánh giá của bạn sẽ được hiển thị công khai.'
              ) : (
                'Đánh giá của bạn sẽ được hiển thị công khai.'
              )}
            </span>

            <Button
              type="submit"
              variant="default"
              disabled={!mounted || submitting || !content.trim() || (!hasPurchased && userRole !== 'admin')}
              className="rounded-[6px] px-5 h-8 text-xs font-bold active:scale-[0.98]"
            >
              {submitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
