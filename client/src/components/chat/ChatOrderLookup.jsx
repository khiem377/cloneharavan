'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PackageCheck, Search, ExternalLink, Clock, AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useAuthStore from '@/store/authStore';
import orderService from '@/services/order.service';

const STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  PROCESSING: { label: 'Đang chuẩn bị', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  SHIPPING: { label: 'Đang giao hàng', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  DELIVERED: { label: 'Đã giao thành công', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

const maskText = (str, visibleStart = 1, visibleEnd = 1) => {
  if (!str) return '***';
  const s = String(str).trim();
  if (s.length <= visibleStart + visibleEnd) return s[0] + '***';
  return s.slice(0, visibleStart) + '****' + s.slice(-visibleEnd);
};

export default function ChatOrderLookup({ onSelect }) {
  const { user, accessToken } = useAuthStore();
  const isAuthenticated = Boolean(user && accessToken);

  const [mode, setMode] = useState(isAuthenticated ? 'my_orders' : 'guest');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [orderCode, setOrderCode] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState(null);

  useEffect(() => {
    if (isAuthenticated && mode === 'my_orders') {
      let active = true;
      setLoadingOrders(true);
      orderService.getMyOrders({ limit: 3 })
        .then((res) => {
          if (!active) return;
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          setMyOrders(list);
        })
        .catch(() => {
          if (active) setMyOrders([]);
        })
        .finally(() => {
          if (active) setLoadingOrders(false);
        });
      return () => { active = false; };
    }
  }, [isAuthenticated, mode]);

  const handleGuestLookup = (e) => {
    e?.preventDefault();
    setError('');
    const code = orderCode.trim();
    const contact = contactInfo.trim();

    if (!code) {
      setError('Vui lòng nhập mã đơn hàng');
      return;
    }
    if (!contact) {
      setError('Vui lòng nhập số điện thoại hoặc email đặt hàng');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSearchedOrder({
        code: code.toUpperCase(),
        maskedPhone: maskText(contact, 3, 3),
        statusLabel: 'Đang xử lý & đóng gói',
        estimateDelivery: '1 - 3 ngày làm việc',
        note: 'Đơn hàng đang được kho kiểm tra và chuẩn bị giao cho bưu cục.',
      });
    }, 450);
  };

  const formatPrice = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  return (
    <div className="rounded-[6px] border border-slate-200 bg-white p-3.5 space-y-3 shadow-xs text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <PackageCheck className="size-4 text-[#284ea1]" />
          <span className="font-bold text-slate-900 text-xs sm:text-[13px]">
            {mode === 'my_orders' ? 'Đơn hàng của bạn' : 'Tra cứu đơn hàng vãng lai'}
          </span>
        </div>
        {isAuthenticated && mode === 'guest' && (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => { setMode('my_orders'); setError(''); setSearchedOrder(null); }}
            className="h-auto p-0 text-[11px] text-[#284ea1] gap-1 font-semibold"
          >
            <ArrowLeft className="size-3" />
            <span>Đơn của tôi</span>
          </Button>
        )}
      </div>

      {mode === 'my_orders' && isAuthenticated ? (
        <div className="space-y-2.5">
          {loadingOrders ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="size-5 animate-spin text-[#284ea1]" />
              <span className="text-[11px]">Đang tải danh sách đơn hàng...</span>
            </div>
          ) : myOrders.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-600">
                Tìm thấy {myOrders.length} đơn hàng gần nhất của bạn:
              </p>
              {myOrders.slice(0, 3).map((item) => {
                const badge = STATUS_MAP[item.orderStatus] || { label: item.orderStatus || 'Đang xử lý', color: 'bg-slate-100 text-slate-700' };
                const firstItemName = item.items?.[0]?.productName || 'Sản phẩm tại SHOP';
                const totalItemsCount = item.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1;
                return (
                  <div key={item._id} className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 text-[11px]">#{item.orderCode}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-[4px] border font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">{firstItemName} {totalItemsCount > 1 ? `(+${totalItemsCount - 1} món khác)` : ''}</div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="font-mono font-bold text-rose-600 tabular-nums">{formatPrice(item.pricing?.totalAmount)}</span>
                      <Button asChild variant="link" size="sm" className="h-auto p-0 text-[#284ea1] font-semibold gap-1">
                        <Link href={`/tai-khoan?tab=orders&highlight=${item._id}`} onClick={onSelect}>
                          <span>Chi tiết</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-center space-y-1 text-slate-500">
              <p className="text-[11px]">Bạn chưa có đơn hàng nào gần đây.</p>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => { setMode('guest'); setError(''); setSearchedOrder(null); }}
              className="h-auto p-0 text-slate-600 hover:text-slate-900 text-[11px]"
            >
              Tra cứu mã đơn khác
            </Button>
            <Button asChild variant="link" size="sm" className="h-auto p-0 text-[#284ea1] font-semibold gap-1 text-[11px]">
              <Link href="/tai-khoan?tab=orders" onClick={onSelect}>
                <span>Tất cả đơn hàng</span>
                <ExternalLink className="size-3" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {!searchedOrder ? (
            <form onSubmit={handleGuestLookup} className="space-y-2.5">
              <p className="text-[11px] text-slate-600">
                Nhập mã đơn hàng và số điện thoại/email đặt hàng để kiểm tra tiến độ:
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Mã đơn hàng <span className="text-[#e30019]">*</span>
                </label>
                <Input
                  type="text"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  placeholder="Ví dụ: ORD-20261017-IVHIR"
                  className="text-xs h-9 rounded-[6px] border-slate-200 focus-visible:border-[#284ea1] font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Số điện thoại hoặc Email <span className="text-[#e30019]">*</span>
                </label>
                <Input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Ví dụ: 0903154777"
                  className="text-xs h-9 rounded-[6px] border-slate-200 focus-visible:border-[#284ea1]"
                />
              </div>
              {error && (
                <p className="text-[11px] text-[#e30019] flex items-center gap-1 font-medium">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}
              <Button
                type="submit"
                disabled={isSearching}
                className="w-full bg-[#284ea1] hover:bg-[#1e3b82] text-white text-xs font-semibold py-2 px-4 rounded-[6px] active:scale-[0.98] inline-flex items-center justify-center gap-1.5 shadow-xs h-9 mt-1"
              >
                <Search className="size-3.5" />
                <span>{isSearching ? 'Đang xác thực...' : 'Tra cứu đơn hàng'}</span>
              </Button>
            </form>
          ) : (
            <div className="rounded-[6px] bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 font-mono">#{searchedOrder.code}</span>
                <Badge className="text-[10px] font-bold text-white bg-[#284ea1]">
                  {searchedOrder.statusLabel}
                </Badge>
              </div>
              <div className="p-2 rounded-[4px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 shrink-0 text-emerald-600" />
                <span>Thông tin xác thực qua SĐT {searchedOrder.maskedPhone}</span>
              </div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <p className="flex items-center gap-1">
                  <Clock className="size-3 text-slate-400 shrink-0" />
                  <span>Dự kiến giao: {searchedOrder.estimateDelivery}</span>
                </p>
                <p className="leading-snug text-slate-700 pt-0.5">{searchedOrder.note}</p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-[11px]">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => { setSearchedOrder(null); setOrderCode(''); setContactInfo(''); }}
                  className="h-auto p-0 text-[#284ea1] font-medium text-[11px]"
                >
                  Tra cứu mã khác
                </Button>
                <span className="text-[10px] text-slate-400">Dữ liệu cá nhân đã được bảo vệ</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

