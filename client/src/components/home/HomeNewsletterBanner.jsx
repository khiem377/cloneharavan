'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * HomeNewsletterBanner - Khối Bản Tin Ưu Đãi & Cam Kết Vàng Dịch Vụ
 * Tuân thủ quy tắc Evondev UI/UX: Flat, 1px border, 6px rounded, zero emoji.
 */
export default function HomeNewsletterBanner() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 my-6" aria-label="Bản tin khuyến mãi & Cam kết dịch vụ">
      <div className="bg-white rounded-[6px] border border-slate-200 p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* CỘT TRÁI: Form đăng ký nhận tin ưu đãi */}
          <div className="lg:col-span-6 space-y-2">
            <Badge variant="secondary" className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5">
              ƯU ĐÃI THÀNH VIÊN
            </Badge>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Đăng ký nhận tin khuyến mãi & Voucher 500K
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Nhận thông báo sớm nhất về các đợt Flash Sale, mã giảm giá độc quyền và kinh nghiệm chọn mua thiết bị điện máy chính hãng.
            </p>

            <form onSubmit={handleSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email của bạn..."
                  required
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Button
                type="submit"
                variant="default"
                size="default"
                className="bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold shrink-0 h-9 px-5"
              >
                {submitted ? 'Đã đăng ký!' : 'Đăng ký ngay'}
              </Button>
            </form>

            {submitted && (
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cảm ơn bạn! Mã voucher đã được gửi tới hộp thư của bạn.</span>
              </p>
            )}
          </div>

          {/* CỘT PHẢI: 4 Cam Kết Vàng Dịch Vụ */}
          <div className="lg:col-span-6 lg:border-l lg:border-slate-100 lg:pl-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              
              <div className="p-3 rounded-[6px] border border-slate-100 bg-slate-50/60 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">100% Chính Hãng</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-normal">
                    Cam kết hoàn tiền 200% nếu phát hiện hàng giả
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-[6px] border border-slate-100 bg-slate-50/60 flex items-start gap-2.5">
                <Truck className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Giao Toàn Quốc</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-normal">
                    Miễn phí vận chuyển cho đơn hàng từ 500K
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-[6px] border border-slate-100 bg-slate-50/60 flex items-start gap-2.5">
                <RefreshCw className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Đổi Mới 30 Ngày</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-normal">
                    Lỗi 1 đổi 1 tận nơi nếu sản phẩm có lỗi từ NSX
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-[6px] border border-slate-100 bg-slate-50/60 flex items-start gap-2.5">
                <CreditCard className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Trả Góp 0%</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-normal">
                    Thủ tục duyệt nhanh trong 5 phút qua thẻ tín dụng
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
