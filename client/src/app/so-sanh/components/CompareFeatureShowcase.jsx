'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

export default function CompareFeatureShowcase({
  products = [],
  productSpecsList = [],
}) {
  return (
    <Card className="rounded-[6px] border border-slate-200 bg-white shadow-2xs">
      <CardHeader className="border-b border-slate-100 p-5 pb-4">
        <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles size={18} className="text-red-600" />
          <span>Đặc điểm nổi bật & Công nghệ so sánh chi tiết</span>
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Khám phá sâu hơn về công nghệ hiển thị, thiết kế và trải nghiệm sử dụng thực tế giữa các sản phẩm
        </p>
      </CardHeader>

      <CardContent className="p-5 sm:p-7">
        <div className={`grid grid-cols-1 md:grid-cols-${products.length > 2 ? products.length : 2} gap-5 sm:gap-6 items-start`}>
          {products.map((p, idx) => {
            const specs = productSpecsList[idx] || { featuresHighlights: [] };
            const gallery = (p.images && p.images.length > 0)
              ? p.images.map((img) => typeof img === 'string' ? img : img.url).filter(Boolean)
              : [(typeof p.thumbnail === 'string' ? p.thumbnail : p.thumbnail?.url) || '/logo-shop.jpg'];

            return (
              <div key={p._id || idx} className="space-y-5 bg-slate-50/60 p-4 sm:p-5 rounded-[6px] border border-slate-200/80">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div>
                    <Badge variant="outline" className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 border-red-200 rounded-[4px] px-2 py-0.5">
                      Lựa chọn #{idx + 1}
                    </Badge>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1.5 line-clamp-1">
                      {p.name}
                    </h3>
                  </div>
                  <span className="text-sm font-bold text-red-600 font-mono tabular-nums">
                    {(p.salePrice || p.price || 0) > 0 ? `${(p.salePrice || p.price).toLocaleString('vi-VN')}₫` : ''}
                  </span>
                </div>

                <div className="space-y-4">
                  {specs.featuresHighlights.map((feat, fIdx) => {
                    const featImg = gallery[fIdx % gallery.length];

                    return (
                      <div key={fIdx} className="space-y-2">
                        <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 leading-snug">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                          <span>{feat.title}</span>
                        </h4>

                        {featImg && (
                          <div className="w-full aspect-16/9 bg-white rounded-[6px] border border-slate-200 overflow-hidden shadow-2xs">
                            <img
                              src={featImg}
                              alt={feat.title}
                              className="w-full h-full object-contain p-2 hover:scale-102 transition duration-200"
                            />
                          </div>
                        )}

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {p.description && (
                  <div className="border-t border-slate-200 pt-3.5 space-y-1.5">
                    <h5 className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">
                      Mô tả chi tiết từ nhà sản xuất:
                    </h5>
                    <div
                      className="text-xs text-slate-600 leading-relaxed prose prose-sm max-w-none line-clamp-5"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.description) }}
                    />
                  </div>
                )}

                <div className="bg-amber-50/70 border border-amber-200 rounded-[6px] p-3 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <ShieldCheck size={14} className="text-amber-600" />
                    <span>Cam kết tại SHOP:</span>
                  </div>
                  <ul className="space-y-0.5 text-[11px] text-amber-800 list-disc list-inside">
                    <li>Bảo hành chính hãng 24 tháng tận nơi</li>
                    <li>Miễn phí vận chuyển và lắp đặt trong 2H</li>
                    <li>Hỗ trợ đổi mới trong 7 ngày nếu lỗi phần cứng</li>
                  </ul>
                </div>

                <Button asChild variant="default" size="default" className="w-full text-xs font-semibold rounded-[6px]">
                  <Link href={`/products/${p.slug || p._id}`}>
                    Xem chi tiết sản phẩm
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
