'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Package,
  Ticket,
  Loader2,
  ShoppingBag,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import CartCheckoutSteps from '@/components/cart/CartCheckoutSteps';
import CartVoucherModal from '@/components/cart/CartVoucherModal';

import useAuthStore from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import userService from '@/services/user.service';
import shippingService from '@/services/shipping.service';
import orderService from '@/services/order.service';
import paymentService from '@/services/payment.service';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { cart, items: cartItems, selectedItemIds, fetchCart, applyCoupon, removeCoupon } = useCartStore();

  const [mounted, setMounted] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const [saveToAddressBook, setSaveToAddressBook] = useState(true);
  const [isDefaultNewAddress, setIsDefaultNewAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    fullName: '',
    phone: '',
    province: '',
    provinceId: '',
    district: '',
    districtId: '',
    ward: '',
    wardCode: '',
    detailAddress: '',
  });

  const handleToggleDefaultNewAddress = (e) => {
    const checked = e.target.checked;
    setIsDefaultNewAddress(checked);
    if (checked) {
      setSaveToAddressBook(true);
    }
  };

  const handleToggleSaveToAddressBook = (e) => {
    const checked = e.target.checked;
    setSaveToAddressBook(checked);
    if (!checked) {
      setIsDefaultNewAddress(false);
    }
  };

  const [savingAddressOnly, setSavingAddressOnly] = useState(false);

  const handleSaveCustomAddressNow = async () => {
    if (!customAddress?.fullName?.trim()) {
      toast('Vui lòng nhập họ và tên người nhận', { type: 'warning' });
      return;
    }
    if (!customAddress?.phone?.trim()) {
      toast('Vui lòng nhập số điện thoại người nhận', { type: 'warning' });
      return;
    }
    if (!/^0\d{9}$/.test(customAddress?.phone?.trim())) {
      toast('Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng số 0 (Ví dụ: 0901234567)', { type: 'warning' });
      return;
    }
    if (!customAddress?.province) {
      toast('Vui lòng chọn Tỉnh / Thành phố', { type: 'warning' });
      return;
    }
    if (!customAddress?.district) {
      toast('Vui lòng chọn Quận / Huyện', { type: 'warning' });
      return;
    }
    if (!customAddress?.ward) {
      toast('Vui lòng chọn Phường / Xã', { type: 'warning' });
      return;
    }
    if (!customAddress?.detailAddress?.trim()) {
      toast('Vui lòng nhập địa chỉ chi tiết', { type: 'warning' });
      return;
    }

    setSavingAddressOnly(true);
    try {
      const savePayload = {
        fullName: customAddress.fullName.trim(),
        phone: customAddress.phone.trim(),
        province: customAddress.province,
        provinceId: customAddress.provinceId ? Number(customAddress.provinceId) : undefined,
        district: customAddress.district,
        districtId: customAddress.districtId ? Number(customAddress.districtId) : undefined,
        ward: customAddress.ward,
        wardCode: customAddress.wardCode ? String(customAddress.wardCode) : undefined,
        detailAddress: customAddress.detailAddress.trim(),
        isDefault: Boolean(isDefaultNewAddress),
      };

      const res = await userService.addAddress(savePayload);
      const newAddr = res?.data?.address || res?.data;
      toast('🎉 Đã lưu địa chỉ vào sổ địa chỉ thành công!', { type: 'success' });

      const updatedList = await userService.getAddresses();
      setAddresses(updatedList || []);

      if (newAddr?._id) {
        setSelectedAddressId(newAddr._id);
        if (isDefaultNewAddress) {
          setDefaultAddress(newAddr);
        }
      }
      setIsCustomAddress(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ';
      toast(msg, { type: 'error' });
    } finally {
      setSavingAddressOnly(false);
    }
  };

  // GHN Dropdowns
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Shipping Fee state
  const [shippingFeeData, setShippingFeeData] = useState(null);
  const [calculatingFee, setCalculatingFee] = useState(false);

  // Preview Order state
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Đồng bộ hai chiều mã voucher với cartStore
  useEffect(() => {
    if (cart?.couponCode) {
      setCouponInput(cart.couponCode);
    } else {
      setCouponInput('');
    }
  }, [cart?.couponCode]);

  const appliedCouponCode =
    couponInput !== ''
      ? couponInput
      : previewData?.pricing?.couponCode || cart?.couponCode || null;

  const appliedCouponDiscount =
    previewData?.pricing?.couponDiscount !== undefined
      ? Number(previewData.pricing.couponDiscount) || 0
      : Number(cart?.couponDiscount) || 0;

  const hasAppliedCoupon = Boolean(appliedCouponCode) && appliedCouponDiscount > 0;

  // Payment state
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
  const [orderNote, setOrderNote] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Order Result state
  const [placedOrder, setPlacedOrder] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Tải địa chỉ mặc định & danh sách địa chỉ của khách
  useEffect(() => {
    if (!mounted) return;

    const loadAddresses = async () => {
      try {
        const [defaultRes, listRes, methodsRes] = await Promise.all([
          userService.getDefaultAddress(),
          userService.getAddresses(),
          paymentService.getPaymentMethods(),
        ]);

        if (defaultRes?.hasDefault && defaultRes.address) {
          setDefaultAddress(defaultRes.address);
          setSelectedAddressId(defaultRes.address._id);
          setIsCustomAddress(false);
        } else if (Array.isArray(listRes) && listRes.length > 0) {
          const first = listRes.find((a) => a.isDefault) || listRes[0];
          setDefaultAddress(first);
          setSelectedAddressId(first._id);
          setIsCustomAddress(false);
        } else {
          setIsCustomAddress(true);
          setIsDefaultNewAddress(true);
        }

        setAddresses(listRes || []);
        setPaymentMethods(methodsRes || []);
      } catch (err) {
        console.warn('Lỗi tải dữ liệu thanh toán ban đầu:', err);
      }
    };

    loadAddresses();
  }, [mounted]);

  // 2. Tải danh sách Tỉnh/Thành từ GHN Master Data
  useEffect(() => {
    if (!mounted) return;
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const provs = await shippingService.getProvinces();
        setProvinces(provs || []);
      } finally {
        setLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, [mounted]);

  // 3. Tải Quận/Huyện khi provinceId thay đổi
  const handleProvinceChange = async (e) => {
    const pId = Number(e.target.value);
    const selectedProv = provinces.find((p) => p.ProvinceID === pId);
    setCustomAddress((prev) => ({
      ...prev,
      provinceId: pId || '',
      province: selectedProv?.ProvinceName || '',
      districtId: '',
      district: '',
      wardCode: '',
      ward: '',
    }));
    setDistricts([]);
    setWards([]);
    if (!pId) return;

    setLoadingDistricts(true);
    try {
      const dists = await shippingService.getDistricts(pId);
      setDistricts(dists || []);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // 4. Tải Phường/Xã khi districtId thay đổi
  const handleDistrictChange = async (e) => {
    const dId = Number(e.target.value);
    const selectedDist = districts.find((d) => d.DistrictID === dId);
    setCustomAddress((prev) => ({
      ...prev,
      districtId: dId || '',
      district: selectedDist?.DistrictName || '',
      wardCode: '',
      ward: '',
    }));
    setWards([]);
    if (!dId) return;

    setLoadingWards(true);
    try {
      const wrds = await shippingService.getWards(dId);
      setWards(wrds || []);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleWardChange = (e) => {
    const wCode = e.target.value;
    const selectedW = wards.find((w) => w.WardCode === wCode);
    setCustomAddress((prev) => ({
      ...prev,
      wardCode: wCode,
      ward: selectedW?.WardName || '',
    }));
  };

  // Sắp xếp danh sách địa chỉ: Địa chỉ mặc định luôn ở khung đầu tiên, các địa chỉ phụ ở dưới
  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }, [addresses]);

  // Địa chỉ đang được chọn hiện tại (Địa chỉ lưu sẵn hoặc Địa chỉ tự nhập)
  const currentActiveAddress = useMemo(() => {
    if (isCustomAddress) {
      return customAddress;
    }
    return addresses.find((a) => a._id === selectedAddressId) || defaultAddress;
  }, [isCustomAddress, customAddress, addresses, selectedAddressId, defaultAddress]);

  // 5. Tự động tính phí vận chuyển GHN khi có DistrictId & WardCode
  useEffect(() => {
    if (!currentActiveAddress) return;

    const toDid = currentActiveAddress.districtId || currentActiveAddress.toDistrictId;
    const toWcode = currentActiveAddress.wardCode || currentActiveAddress.toWardCode;

    if (!toDid || !toWcode) return;

    const calcFee = async () => {
      setCalculatingFee(true);
      try {
        const res = await shippingService.calculateFee({
          toDistrictId: toDid,
          toWardCode: toWcode,
          weight: 500,
        });
        setShippingFeeData(res);
      } catch (err) {
        console.warn('Lỗi tính phí ship GHN:', err);
      } finally {
        setCalculatingFee(false);
      }
    };

    calcFee();
  }, [currentActiveAddress]);

  // Lấy danh sách ID sản phẩm được chọn từ sessionStorage hoặc state giỏ hàng
  const getSelectedCheckoutIds = () => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('checkoutItemIds');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return selectedItemIds && selectedItemIds.length > 0 ? selectedItemIds : [];
  };

  // 6. Lấy Preview Đơn hàng
  const triggerOrderPreview = async (couponToApply = undefined) => {
    setLoadingPreview(true);
    try {
      const activeItemIds = getSelectedCheckoutIds();
      const codeToSend =
        couponToApply !== undefined
          ? couponToApply
          : couponInput !== ''
          ? couponInput
          : (cart?.couponCode || '');

      const payload = {
        couponCode: codeToSend,
        shippingAddress: currentActiveAddress || undefined,
        addressId: !isCustomAddress && selectedAddressId ? selectedAddressId : undefined,
        itemIds: activeItemIds.length > 0 ? activeItemIds : undefined,
      };

      const res = await orderService.previewOrder(payload);
      if (res.success && res.data) {
        setPreviewData(res.data);

        // Nếu backend đã tự động phân giải mã GHN (provinceId, districtId, wardCode), đồng bộ vào state
        if (res.data.shippingAddress?.districtId && res.data.shippingAddress?.wardCode) {
          const resolved = res.data.shippingAddress;
          if (!currentActiveAddress?.districtId || !currentActiveAddress?.wardCode) {
            if (defaultAddress && defaultAddress._id === resolved._id) {
              setDefaultAddress((prev) => ({ ...prev, ...resolved }));
            }
            setAddresses((prev) =>
              prev.map((a) => (a._id === resolved._id ? { ...a, ...resolved } : a))
            );
          }
        }
        return { success: true, data: res.data };
      }
      return { success: false, message: res?.message || 'Không thể áp dụng mã giảm giá' };
    } catch (err) {
      console.warn('Lỗi xem trước đơn hàng:', err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Mã giảm giá không hợp lệ',
      };
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleApplyCouponCheckout = async (code) => {
    const trimmed = (code || '').trim().toUpperCase();
    if (!trimmed) {
      return { success: false, message: 'Vui lòng nhập mã giảm giá' };
    }

    // 1. Đồng bộ sang cartStore & Backend Cart DB để trang /cart cũng nhận mã
    const cartRes = await applyCoupon(trimmed);

    // 2. Chạy previewOrder để cập nhật tiền đơn hàng theo các mặt hàng đang chọn
    setCouponInput(trimmed);
    const res = await triggerOrderPreview(trimmed);

    if (res?.success) {
      const discount = Number(res.data?.pricing?.couponDiscount) || 0;
      if (discount > 0) {
        return { success: true, message: `Áp dụng mã ${trimmed} thành công (-${formatPrice(discount)})` };
      }
      return { success: false, message: 'Mã không đủ điều kiện cho đơn hàng này' };
    }
    return { success: false, message: res?.message || cartRes?.message || 'Mã giảm giá không hợp lệ' };
  };

  const handleRemoveCouponCheckout = async () => {
    // 1. Gỡ mã trên cartStore & Backend Cart DB (để trang Cart cũng được gỡ)
    await removeCoupon();

    // 2. Chạy previewOrder với chuỗi rỗng "" để tính lại giá không có coupon
    setCouponInput('');
    await triggerOrderPreview('');
    return { success: true };
  };

  useEffect(() => {
    if (mounted) {
      triggerOrderPreview();
    }
  }, [mounted, currentActiveAddress]);

  // Phí ship hiệu lực (ưu tiên giá từ preview của backend, sau đó tới calculateFee)
  const effectiveShippingFee =
    previewData?.pricing?.shippingFee ?? shippingFeeData?.fee ?? 0;

  // 7. Xử lý đặt hàng COD
  const handlePlaceOrder = async () => {
    if (!currentActiveAddress?.fullName || !currentActiveAddress?.phone) {
      toast('Vui lòng cung cấp đầy đủ họ tên và số điện thoại người nhận', { type: 'warning' });
      return;
    }

    if (!/^0\d{9}$/.test(currentActiveAddress.phone?.trim())) {
      toast('Số điện thoại nhận hàng phải có đúng 10 chữ số và bắt đầu bằng số 0 (Ví dụ: 0901234567)', { type: 'warning' });
      return;
    }

    if (!currentActiveAddress?.detailAddress) {
      toast('Vui lòng cung cấp địa chỉ nhận hàng chi tiết', { type: 'warning' });
      return;
    }

    setSubmittingOrder(true);
    try {
      let finalAddressId = !isCustomAddress && selectedAddressId ? selectedAddressId : undefined;

      // Nếu nhập địa chỉ mới và người dùng đăng nhập có tích "Lưu địa chỉ vào sổ địa chỉ"
      if (isCustomAddress && isAuthenticated && saveToAddressBook) {
        try {
          const savePayload = {
            fullName: currentActiveAddress.fullName?.trim(),
            phone: currentActiveAddress.phone?.trim(),
            province: currentActiveAddress.province,
            provinceId: currentActiveAddress.provinceId ? Number(currentActiveAddress.provinceId) : undefined,
            district: currentActiveAddress.district,
            districtId: currentActiveAddress.districtId ? Number(currentActiveAddress.districtId) : undefined,
            ward: currentActiveAddress.ward,
            wardCode: currentActiveAddress.wardCode ? String(currentActiveAddress.wardCode) : undefined,
            detailAddress: currentActiveAddress.detailAddress?.trim(),
            isDefault: Boolean(isDefaultNewAddress),
          };
          const savedRes = await userService.addAddress(savePayload);
          const newAddrId = savedRes?.data?.address?._id || savedRes?.data?._id;
          if (newAddrId) {
            finalAddressId = newAddrId;
          }
          // Tự động làm mới danh sách địa chỉ cho phiên làm việc
          userService.getAddresses().then((freshList) => {
            if (freshList) setAddresses(freshList);
          }).catch(() => {});
        } catch (saveErr) {
          const msg = saveErr.response?.data?.message || 'Lỗi lưu địa chỉ vào sổ địa chỉ';
          console.warn('Lỗi tự động lưu địa chỉ vào sổ địa chỉ:', msg);
          toast(msg, { type: 'warning' });
        }
      }

      const activeItemIds = getSelectedCheckoutIds();
      const orderPayload = {
        addressId: finalAddressId,
        shippingAddress: finalAddressId ? undefined : currentActiveAddress,
        couponCode: couponInput || previewData?.pricing?.couponCode || undefined,
        note: orderNote,
        itemIds: activeItemIds.length > 0 ? activeItemIds : undefined,
      };

      const res = await orderService.createOrder(orderPayload);
      if (res.success && res.data) {
        setPlacedOrder(res.data);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('checkoutItemIds');
        }
        toast('🎉 Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.', { type: 'success' });
        if (fetchCart) fetchCart();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Không thể tạo đơn hàng';
      toast(msg, { type: 'error' });
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    toast.success(`Đã sao chép mã đơn hàng: ${code}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-4">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* THANH ĐIỀU HƯỚNG BƯỚC CHECKOUT (STEPPER) */}
        <CartCheckoutSteps currentStep={2} />

        {/* HEADER */}
        <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-[6px] border border-slate-200 shadow-2xs mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <Link
              href="/cart"
              className="h-8 w-8 rounded-[4px] border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Quay lại giỏ hàng"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Thanh toán & Xác nhận đơn hàng</span>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border-emerald-200">
                  GHN + COD Active
                </Badge>
              </h1>
              <p className="text-xs text-slate-500">
                Tự động chọn địa chỉ mặc định, tính cước vận chuyển GHN chính xác và thanh toán khi nhận hàng
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GIAO DIỆN ĐẶT HÀNG CHÍNH */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* CỘT TRÁI (8/12): ĐỊA CHỈ, VẬN CHUYỂN VÀ THANH TOÁN */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4 sm:space-y-6">
            {/* KHỐI 1: THÔNG TIN ĐỊA CHỈ GIAO HÀNG */}
            <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="text-blue-700" size={18} />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Địa chỉ nhận hàng
                  </h2>
                </div>

                {addresses.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCustomAddress(!isCustomAddress)}
                    className="text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 font-semibold h-8"
                  >
                    {isCustomAddress ? 'Chọn địa chỉ đã lưu' : '+ Nhập địa chỉ mới'}
                  </Button>
                )}
              </div>

              {/* Chọn từ danh sách địa chỉ đã lưu */}
              {!isCustomAddress && addresses.length > 0 ? (
                <div className="space-y-3">
                  <div className="space-y-2.5">
                    {sortedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr._id;
                      return (
                        <div
                          key={addr._id}
                          onClick={() => setSelectedAddressId(addr._id)}
                          className={`p-3.5 rounded-[6px] border text-xs cursor-pointer transition-all relative ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-600/30'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                                {addr.fullName}
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="text-slate-600 font-mono text-xs">
                                {addr.phone}
                              </span>
                            </div>
                            {addr.isDefault ? (
                              <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-[4px] shadow-2xs">
                                Địa chỉ mặc định
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-[4px]">
                                Địa chỉ phụ
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-600 leading-relaxed text-xs">
                            {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                          </p>
                          {isSelected && (
                            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold pt-2 border-t border-blue-100/70">
                              <CheckCircle2 size={13} />
                              <span>Đang chọn địa chỉ này để nhận hàng</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Ghi chú cho shipper khi chọn địa chỉ đã lưu */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ghi chú cho shipper / đơn hàng
                    </label>
                    <Input
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              ) : (
                /* Form nhập địa chỉ mới (Tỉnh / Quận / Phường kết nối GHN) */
                <div className="space-y-3.5">
                  {addresses.length > 0 && (
                    <div className="p-2.5 rounded-[6px] bg-blue-50/70 border border-blue-200 text-blue-800 text-xs flex items-center justify-between gap-2">
                      <span>Bạn đang ở form nhập địa chỉ mới.</span>
                      <button
                        type="button"
                        onClick={() => setIsCustomAddress(false)}
                        className="font-semibold underline hover:text-blue-900 cursor-pointer"
                      >
                        Quay lại chọn Địa chỉ mặc định / Địa chỉ phụ
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ và tên người nhận *
                      </label>
                      <Input
                        value={customAddress.fullName}
                        onChange={(e) =>
                          setCustomAddress({ ...customAddress, fullName: e.target.value })
                        }
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Số điện thoại *
                      </label>
                      <Input
                        value={customAddress.phone}
                        maxLength={10}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setCustomAddress({ ...customAddress, phone: val });
                        }}
                        placeholder="Ví dụ: 0901234567 (10 số)"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  {/* 3 Cấp Địa Giới GHN */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tỉnh / Thành phố *
                      </label>
                      <select
                        value={customAddress.provinceId || ''}
                        onChange={handleProvinceChange}
                        disabled={loadingProvinces}
                        className="w-full h-9 text-xs rounded-[6px] border border-slate-200 px-2.5 bg-white text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-50"
                      >
                        <option value="">-- Chọn Tỉnh/Thành --</option>
                        {provinces.map((p) => (
                          <option key={p.ProvinceID} value={p.ProvinceID}>
                            {p.ProvinceName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quận / Huyện *
                      </label>
                      <select
                        value={customAddress.districtId || ''}
                        onChange={handleDistrictChange}
                        disabled={loadingDistricts || !customAddress.provinceId}
                        className="w-full h-9 text-xs rounded-[6px] border border-slate-200 px-2.5 bg-white text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-50"
                      >
                        <option value="">-- Chọn Quận/Huyện --</option>
                        {districts.map((d) => (
                          <option key={d.DistrictID} value={d.DistrictID}>
                            {d.DistrictName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phường / Xã *
                      </label>
                      <select
                        value={customAddress.wardCode || ''}
                        onChange={handleWardChange}
                        disabled={loadingWards || !customAddress.districtId}
                        className="w-full h-9 text-xs rounded-[6px] border border-slate-200 px-2.5 bg-white text-slate-800 focus:outline-none focus:border-blue-600 disabled:opacity-50"
                      >
                        <option value="">-- Chọn Phường/Xã --</option>
                        {wards.map((w) => (
                          <option key={w.WardCode} value={w.WardCode}>
                            {w.WardName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ chi tiết (Số nhà, tên đường) *
                    </label>
                    <Input
                      value={customAddress.detailAddress}
                      onChange={(e) =>
                        setCustomAddress({ ...customAddress, detailAddress: e.target.value })
                      }
                      placeholder="Ví dụ: 123 Lê Lợi"
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* Ghi chú cho shipper / đơn hàng ngay dưới phần địa chỉ chi tiết */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ghi chú cho shipper / đơn hàng
                    </label>
                    <Input
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* 2 button tích chọn: Lưu địa chỉ & Đặt làm địa chỉ mặc định */}
                  {isAuthenticated && (
                    <div className="pt-2.5 border-t border-slate-100 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveToAddressBook}
                          onChange={handleToggleSaveToAddressBook}
                          className="rounded-[4px] text-blue-600 focus:ring-blue-500 accent-blue-600"
                        />
                        <span className="text-xs text-slate-700 font-medium">
                          Lưu địa chỉ vào sổ địa chỉ
                        </span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isDefaultNewAddress}
                          onChange={handleToggleDefaultNewAddress}
                          className="mt-0.5 rounded-[4px] text-blue-600 focus:ring-blue-500 accent-blue-600"
                        />
                        <div className="text-xs leading-snug">
                          <span className="text-slate-800 font-medium block">
                            Đặt làm địa chỉ nhận hàng mặc định
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            (Địa chỉ mặc định cũ sẽ tự động chuyển thành địa chỉ phụ)
                          </span>
                        </div>
                      </label>

                      <div className="pt-1.5 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={savingAddressOnly}
                          onClick={handleSaveCustomAddressNow}
                          className="h-8 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold cursor-pointer"
                        >
                          {savingAddressOnly ? (
                            <>
                              <Loader2 size={13} className="animate-spin mr-1" />
                              <span>Đang lưu vào sổ...</span>
                            </>
                          ) : (
                            <span>+ Lưu địa chỉ này ngay</span>
                          )}
                        </Button>
                        <span className="text-[11px] text-slate-400">
                          (Hoặc bấm &quot;Đặt hàng ngay&quot; để tự động lưu)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* KHỐI 2: ĐƠN VỊ VẬN CHUYỂN GHN & PHÍ SHIP THỰC TẾ */}
            <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="text-blue-700" size={18} />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Phương thức vận chuyển
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Đối tác GHN Express
                </span>
              </div>

              <div className="p-3.5 rounded-[6px] border border-blue-600/60 bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      Giao hàng Nhanh (GHN Tiêu Chuẩn)
                    </span>
                    {(effectiveShippingFee > 0 || shippingFeeData?.source === 'GHN') && (
                      <Badge className="bg-emerald-600 text-white text-[10px] py-0">
                        Cước GHN Thật
                      </Badge>
                    )}
                    {shippingFeeData?.isEstimated && (
                      <Badge className="bg-amber-500 text-slate-950 text-[10px] py-0 font-bold">
                        Cước ước tính
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {calculatingFee || loadingPreview ? (
                      <span className="flex items-center gap-1.5 text-blue-700 font-medium">
                        <Loader2 size={12} className="animate-spin" />
                        Đang kết nối GHN API tính cước...
                      </span>
                    ) : effectiveShippingFee > 0 ? (
                      <span>
                        Xuất kho: <strong className="text-slate-800">{shippingFeeData?.warehouseName || 'Kho Tổng Bình Tân (HCM)'}</strong> ➔ Giao tận nơi (2-3 ngày)
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Đang đồng bộ cước vận chuyển từ hệ thống GHN...
                      </span>
                    )}
                  </p>
                </div>

                <div className="text-right sm:shrink-0">
                  <span className="text-sm sm:text-base font-mono font-bold text-blue-700">
                    {calculatingFee || loadingPreview
                      ? 'Đang tính...'
                      : effectiveShippingFee > 0
                      ? formatPrice(effectiveShippingFee)
                      : '0 đ'}
                  </span>
                </div>
              </div>

              {/* Cảnh báo nếu GHN bị lỗi và dùng cước ước tính */}
              {shippingFeeData?.isEstimated && (
                <div className="mt-3 p-2.5 rounded-[4px] bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Lưu ý phí ước tính:</strong> {shippingFeeData.message}
                  </div>
                </div>
              )}
            </div>

            {/* KHỐI 3: PHƯƠNG THỨC THANH TOÁN (COD) */}
            <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-blue-700" size={18} />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Phương thức thanh toán
                  </h2>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-3 rounded-[6px] border border-blue-600 bg-blue-50/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={selectedPaymentMethod === 'COD'}
                      onChange={() => setSelectedPaymentMethod('COD')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Thanh toán khi nhận hàng (COD)</span>
                        <Badge variant="outline" className="text-[10px] text-blue-700 border-blue-200 bg-white">
                          Khuyên dùng
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Thanh toán tiền mặt cho nhân viên giao hàng khi nhận được kiện hàng
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 font-mono">0 đ phụ phí</span>
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (4/12): TỔNG KẾT ĐƠN HÀNG & NÚT XÁC NHẬN */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 shadow-2xs sticky top-20">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Thông tin đơn hàng</span>
                <span className="text-xs font-normal text-slate-500">
                  ({previewData?.items?.length || cartItems?.length || 0} món)
                </span>
              </h3>

              {/* Danh sách mặt hàng Preview */}
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto py-2">
                {loadingPreview ? (
                  <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <span>Đang kiểm tra tồn kho & cước GHN...</span>
                  </div>
                ) : previewData?.items?.length > 0 ? (
                  previewData.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.variantName && <span>Phân loại: {item.variantName} | </span>}
                          <span>SL: x{item.quantity}</span>
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Chưa có sản phẩm nào được chọn
                  </div>
                )}
              </div>

              {/* Quà tặng kèm nếu có */}
              {previewData?.gifts?.length > 0 && (
                <div className="p-2.5 rounded-[4px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 mb-3 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-[11px] text-emerald-800">
                    <Sparkles size={13} /> Quà tặng kèm miễn phí:
                  </span>
                  {previewData.gifts.map((g, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>🎁 {g.productName} (x{g.quantity})</span>
                      <span className="font-mono text-emerald-700">0 đ</span>
                    </div>
                  ))}
                </div>
              )}

              {/* KHỐI VOUCHER GIẢM GIÁ (Chuẩn phong cách trang Giỏ hàng) */}
              <div className="pt-3 border-t border-slate-100 mb-3">
                <div className="bg-slate-50/80 border border-slate-200 rounded-[6px] p-3 shadow-2xs">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Ticket size={15} className="text-[#284ea1]" />
                        <span>Voucher giảm giá</span>
                        {hasAppliedCoupon && (
                          <span className="text-[10px] font-mono tabular-nums bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-[4px] font-bold">
                            -{formatPrice(appliedCouponDiscount)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {hasAppliedCoupon
                          ? `Đang áp dụng mã ${appliedCouponCode}`
                          : 'Áp dụng mã giảm giá để tiết kiệm thêm'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasAppliedCoupon ? (
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleRemoveCouponCheckout}
                            disabled={loadingPreview}
                            className="h-7 px-2 text-xs text-slate-600 hover:text-red-600 border-slate-300 rounded-[4px] cursor-pointer"
                            title="Gỡ mã giảm giá"
                          >
                            Gỡ
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setShowVoucherModal(true)}
                            className="h-7 px-2.5 text-xs font-bold bg-[#284ea1] hover:bg-[#1e3b82] text-white rounded-[4px] cursor-pointer"
                          >
                            Đổi mã
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setShowVoucherModal(true)}
                          className="h-7 px-3 text-xs font-bold bg-[#284ea1] hover:bg-[#1e3b82] text-white rounded-[4px] cursor-pointer shadow-2xs"
                        >
                          Chọn mã
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chi tiết tính tiền */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính tiền hàng:</span>
                  <span className="font-mono text-slate-900 font-medium">
                    {formatPrice(previewData?.pricing?.subtotal || cart?.subtotal || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Giảm giá voucher:</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    -{formatPrice(previewData?.pricing?.couponDiscount || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển GHN:</span>
                  <span className="font-mono text-blue-700 font-semibold">
                    +{formatPrice(effectiveShippingFee)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Tổng thanh toán:
                  </span>
                  <span className="text-base sm:text-lg font-mono font-black text-[#e30019] tabular-nums">
                    {formatPrice(
                      previewData?.pricing?.totalAmount !== undefined
                        ? previewData.pricing.totalAmount
                        : Math.max(0, (cart?.subtotal || 0) - (cart?.couponDiscount || 0) + effectiveShippingFee)
                    )}
                  </span>
                </div>
              </div>

              {/* Cảnh báo từ Preview nếu có */}
              {previewData?.warnings?.length > 0 && (
                <div className="mt-3 p-2 rounded-[4px] bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                  {previewData.warnings.map((w, i) => (
                    <p key={i}>⚠️ {w}</p>
                  ))}
                </div>
              )}

              {/* Nút đặt hàng COD */}
              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submittingOrder || (previewData && !previewData.canCheckout)}
                  className="w-full h-11 text-sm font-bold bg-[#e30019] hover:bg-[#c40015] text-white shadow-xs active:scale-[0.99] transition cursor-pointer"
                >
                  {submittingOrder ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Đang xử lý đơn hàng...
                    </span>
                  ) : (
                    <span>ĐẶT HÀNG NGAY (COD)</span>
                  )}
                </Button>
                <p className="text-[10px] text-slate-400 text-center mt-2">
                  Bằng việc bấm đặt hàng, bạn đồng ý với Điều khoản mua bán tại cửa hàng
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL XÁC NHẬN ĐẶT HÀNG THÀNH CÔNG */}
        {/* ========================================================================= */}
        {placedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-[8px] border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="text-center space-y-1.5">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Đặt hàng thành công!
                </h3>
                <p className="text-xs text-slate-600">
                  Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được ghi nhận vào hệ thống.
                </p>
              </div>

              {/* Thông tin đơn hàng tóm tắt */}
              <div className="p-3.5 rounded-[6px] bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mã đơn hàng:</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="font-mono text-slate-900 font-bold">#{placedOrder.orderCode}</strong>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(placedOrder.orderCode)}
                      title="Sao chép mã đơn"
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition"
                    >
                      {copiedCode ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái đơn:</span>
                  <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                    Chờ xác nhận
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thanh toán:</span>
                  <Badge variant="outline" className="text-[10px] text-slate-700">
                    COD (Thanh toán khi nhận hàng)
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tổng tiền thanh toán:</span>
                  <strong className="font-mono text-[#e30019] text-sm">
                    {formatPrice(placedOrder.pricing?.totalAmount)}
                  </strong>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-[11px] text-slate-600">
                  <span>Giao tới:</span>
                  <span className="text-right truncate max-w-[220px]">
                    {placedOrder.shippingAddress?.fullName} - {placedOrder.shippingAddress?.phone}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-2">
                  {placedOrder.shippingAddress?.detailAddress}, {placedOrder.shippingAddress?.ward}, {placedOrder.shippingAddress?.district}, {placedOrder.shippingAddress?.province}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  asChild
                  className="w-full text-xs h-9 bg-[#e30019] hover:bg-[#c40015] text-white"
                >
                  <Link href="/tai-khoan?tab=orders">
                    Xem đơn hàng của tôi
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full text-xs h-9 text-slate-700 hover:bg-slate-50"
                >
                  <Link href="/">
                    Tiếp tục mua sắm
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DANH SÁCH VOUCHER GIẢM GIÁ (ĐỒNG BỘ TRANG GIỎ HÀNG) */}
      <CartVoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        appliedCode={appliedCouponCode}
        appliedDiscount={appliedCouponDiscount}
        orderSubtotal={previewData?.pricing?.subtotal || cart?.subtotal || 0}
        onApply={handleApplyCouponCheckout}
        onRemove={handleRemoveCouponCheckout}
      />
    </div>
  );
}
