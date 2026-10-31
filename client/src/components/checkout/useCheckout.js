'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from '@/components/ui/toast';
import useAuthStore from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import userService from '@/services/user.service';
import shippingService from '@/services/shipping.service';
import orderService from '@/services/order.service';

export function useCheckout() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    cart,
    items: cartItems,
    selectedItemIds,
    fetchCart,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeItem,
    toggleSelectItem,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [showEditItemsModal, setShowEditItemsModal] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const [saveToAddressBook, setSaveToAddressBook] = useState(false);
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

  // Tự động điền sẵn Họ tên và Số điện thoại từ tài khoản đã đăng nhập
  useEffect(() => {
    if (user) {
      setCustomAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // GHN Master Data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [newWards, setNewWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingNewWards, setLoadingNewWards] = useState(false);

  // 3-step checkout step tracker (1: Info, 2: Shipping & Payment, 3: Review)
  const [activeStep, setActiveStep] = useState(1);

  // Company VAT Invoice state
  const [invoiceData, setInvoiceData] = useState({
    requireInvoice: false,
    companyName: '',
    taxCode: '',
    companyAddress: '',
    invoiceEmail: '',
  });

  // Shipping & Order Preview
  const [shippingFeeData, setShippingFeeData] = useState(null);
  const [calculatingFee, setCalculatingFee] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [shippingCouponInput, setShippingCouponInput] = useState('');
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // Payment & Order Submission
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
  const [orderNote, setOrderNote] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Idempotency Key bảo vệ submit trùng lặp
  const idempotencyKeyRef = useRef(null);
  const getIdempotencyKey = () => {
    if (!idempotencyKeyRef.current) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        idempotencyKeyRef.current = crypto.randomUUID();
      } else {
        idempotencyKeyRef.current = 'idemp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      }
    }
    return idempotencyKeyRef.current;
  };

  const formatPrice = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Nạp địa chỉ
  useEffect(() => {
    if (!mounted) return;
    const loadAddressData = async () => {
      try {
        const [defaultRes, listRes] = await Promise.all([
          userService.getDefaultAddress(),
          userService.getAddresses(),
        ]);

        const list = Array.isArray(listRes) ? listRes : [];
        setAddresses(list);

        if (defaultRes?.hasDefault && defaultRes.address) {
          setSelectedAddressId(defaultRes.address._id);
          setIsCustomAddress(false);
        } else if (list.length > 0) {
          const first = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(first._id);
          setIsCustomAddress(false);
        } else {
          setIsCustomAddress(true);
        }
      } catch (err) {
        console.warn('Lỗi nạp địa chỉ:', err);
        setIsCustomAddress(true);
      }
    };
    loadAddressData();
  }, [mounted]);

  // 2. Nạp Tỉnh/Thành từ GHN
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

  const handleProvinceSelect = async (pId, raw) => {
    setCustomAddress((prev) => ({
      ...prev,
      provinceId: pId || '',
      province: raw?.ProvinceName || raw?.label || '',
      districtId: '',
      district: '',
      wardCode: '',
      ward: '',
    }));
    setDistricts([]);
    setWards([]);
    setNewWards([]);
    setShippingFeeData(null);
    if (!pId) return;

    setLoadingDistricts(true);
    setLoadingNewWards(true);
    try {
      const [dists, nwWards] = await Promise.all([
        shippingService.getDistricts(Number(pId)),
        shippingService.getNewWards(Number(pId)),
      ]);
      setDistricts(dists || []);
      setNewWards(nwWards || []);
    } finally {
      setLoadingDistricts(false);
      setLoadingNewWards(false);
    }
  };

  const handleDistrictSelect = async (dId, raw) => {
    setCustomAddress((prev) => ({
      ...prev,
      districtId: dId || '',
      district: raw?.DistrictName || raw?.label || '',
      wardCode: '',
      ward: '',
    }));
    setWards([]);
    setShippingFeeData(null);
    if (!dId) return;

    setLoadingWards(true);
    try {
      const wrds = await shippingService.getWards(Number(dId));
      setWards(wrds || []);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleWardSelect = (wCode, raw) => {
    const rawObj = raw?.raw || raw || {};
    setCustomAddress((prev) => ({
      ...prev,
      wardCode: wCode || '',
      ward: rawObj.WardName || raw?.WardName || raw?.label || '',
      districtId: rawObj.DistrictID || prev.districtId || '',
      district: rawObj.DistrictName || prev.district || '',
    }));
  };

  const handleCustomAddressChange = (field, value) => {
    setCustomAddress((prev) => ({ ...prev, [field]: value }));
  };

  const currentActiveAddress = useMemo(() => {
    if (isCustomAddress) return customAddress;
    return addresses.find((a) => a._id === selectedAddressId) || null;
  }, [isCustomAddress, customAddress, addresses, selectedAddressId]);

  // 3. Tính phí GHN mỗi khi District/Ward thay đổi
  useEffect(() => {
    if (!currentActiveAddress) return;
    const toDid = currentActiveAddress.districtId || currentActiveAddress.toDistrictId;
    const toWcode = currentActiveAddress.wardCode || currentActiveAddress.toWardCode;
    if (!toDid || !toWcode) return;

    const calcFee = async () => {
      setCalculatingFee(true);
      try {
        const activeIds = getSelectedCheckoutIds();
        const relevantItems = activeIds.length > 0
          ? (cartItems || []).filter((i) => activeIds.includes(i._id) || activeIds.includes(i.variantId))
          : (cartItems || []);
        const totalWeight = relevantItems.reduce((acc, it) => acc + ((Number(it.quantity) || 1) * 300), 200);

        const res = await shippingService.calculateFee({
          toDistrictId: toDid,
          toWardCode: toWcode,
          weight: Math.min(50000, Math.max(200, totalWeight)),
          insuranceValue: 0,
        });
        setShippingFeeData(res);
      } catch (err) {
        console.warn('Lỗi tính phí ship GHN:', err);
      } finally {
        setCalculatingFee(false);
      }
    };
    calcFee();
  }, [currentActiveAddress?.districtId, currentActiveAddress?.wardCode, isCustomAddress, selectedAddressId]);

  // Đồng bộ giỏ hàng khi vào trang Checkout
  useEffect(() => {
    if (mounted && fetchCart) {
      fetchCart();
    }
  }, [mounted]);

  // Lắng nghe sự kiện storage từ các tab khác (ví dụ: người dùng đổi lựa chọn ở tab giỏ hàng)
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const handleStorageChange = (e) => {
      if (!e.key || e.key === 'checkoutItemIds') {
        if (fetchCart) fetchCart();
        triggerOrderPreview();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mounted]);

  const getSelectedCheckoutIds = () => {
    let ids = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('checkoutItemIds') || sessionStorage.getItem('checkoutItemIds');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) ids = parsed.map(String);
        }
      } catch (_) {}
    }
    if (ids.length === 0 && selectedItemIds && selectedItemIds.length > 0) {
      ids = selectedItemIds.map(String);
    }

    // Nếu cartItems đã được nạp, kiểm tra ID hợp lệ
    if (cartItems && cartItems.length > 0) {
      if (ids.length > 0) {
        const validItemIds = new Set(cartItems.map((i) => String(i._id)));
        const filtered = ids.map(String).filter((id) => validItemIds.has(id));
        if (filtered.length > 0) return filtered;
      }
      // Nếu chưa chọn hoặc ID lưu trữ cũ, mặc định lấy toàn bộ món còn hàng
      return cartItems.filter((i) => !i.isOutOfStock).map((i) => String(i._id));
    }

    return ids.map(String);
  };

  // 4. Preview Order
  const triggerOrderPreview = async (couponToApply = undefined, shippingCouponToApply = undefined) => {
    const activeItemIds = getSelectedCheckoutIds();
    if (activeItemIds.length === 0 && (!cartItems || cartItems.length === 0)) {
      setLoadingPreview(false);
      return;
    }

    // Chỉ bật spinner khi chưa có dữ liệu hoặc thay đổi voucher
    if (!previewData || couponToApply !== undefined || shippingCouponToApply !== undefined) {
      setLoadingPreview(true);
    }
    try {
      const codeToSend = couponToApply !== undefined ? couponToApply : (couponInput || cart?.couponCode || '');
      const shippingCodeToSend = shippingCouponToApply !== undefined
        ? shippingCouponToApply
        : (shippingCouponInput || cart?.shippingCouponCode || '');

      const shippingAddressPayload = isCustomAddress ? {
        fullName: customAddress.fullName || user?.fullName || user?.name || 'Khách hàng',
        phone: customAddress.phone || user?.phone || '0901234567',
        province: customAddress.province,
        provinceId: customAddress.provinceId,
        district: customAddress.district,
        districtId: customAddress.districtId,
        ward: customAddress.ward,
        wardCode: customAddress.wardCode,
        detailAddress: customAddress.detailAddress || 'Địa chỉ giao hàng',
      } : undefined;

      const payload = {
        couponCode: codeToSend,
        shippingCouponCode: shippingCodeToSend,
        shippingAddress: shippingAddressPayload,
        addressId: !isCustomAddress && selectedAddressId ? selectedAddressId : undefined,
        itemIds: activeItemIds.length > 0 ? activeItemIds : undefined,
      };

      const res = await orderService.previewOrder(payload);
      if (res.success && res.data) {
        setPreviewData(res.data);
        return { success: true, data: res.data };
      }
      return { success: false, message: res?.message || 'Không thể xem trước đơn hàng' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setLoadingPreview(false);
    }
  };

  // Khóa chuỗi định danh selectedItemIds để tránh re-render lặp vô tận
  const cartItemsCount = (cartItems || []).length;
  const selectedItemIdsKey = (selectedItemIds || []).slice().sort().join(',');

  useEffect(() => {
    if (mounted) triggerOrderPreview();
  }, [
    mounted,
    cartItemsCount,
    isCustomAddress,
    selectedAddressId,
    customAddress.districtId,
    customAddress.wardCode,
    selectedItemIdsKey,
  ]);

  const handleApplyCoupon = async (code, category = 'order') => {
    const trimmed = (code || '').trim().toUpperCase();
    if (!trimmed) return { success: false, message: 'Vui lòng nhập mã giảm giá' };

    const applyRes = await applyCoupon(trimmed, category);
    if (!applyRes?.success) {
      return {
        success: false,
        message: applyRes?.message || 'Mã giảm giá không hợp lệ',
      };
    }

    let res;
    if (category === 'shipping') {
      setShippingCouponInput(trimmed);
      res = await triggerOrderPreview(undefined, trimmed);
      if (res?.success) {
        const discount = Number(res.data?.pricing?.shippingDiscount) || 0;
        return discount > 0
          ? { success: true, message: `Áp dụng mã freeship ${trimmed} thành công (-${formatPrice(discount)})` }
          : { success: false, message: 'Mã freeship không đủ điều kiện cho đơn hàng này' };
      }
    } else {
      setCouponInput(trimmed);
      res = await triggerOrderPreview(trimmed, undefined);
      if (res?.success) {
        const discount = Number(res.data?.pricing?.couponDiscount) || 0;
        return discount > 0
          ? { success: true, message: `Áp dụng mã ${trimmed} thành công (-${formatPrice(discount)})` }
          : { success: false, message: 'Mã không đủ điều kiện cho đơn hàng này' };
      }
    }

    return { success: false, message: res?.message || 'Mã giảm giá không hợp lệ' };
  };

  const handleRemoveCoupon = async (category = 'order') => {
    await removeCoupon(category);
    if (category === 'shipping') {
      setShippingCouponInput('');
      await triggerOrderPreview(undefined, '');
    } else {
      setCouponInput('');
      await triggerOrderPreview('', undefined);
    }
    return { success: true };
  };

  // Nếu người dùng đang tự chọn địa chỉ mới, ưu tiên cước từ calculateFee của địa chỉ đó
  const effectiveShippingFee = isCustomAddress
    ? (shippingFeeData?.fee ?? previewData?.pricing?.shippingFee ?? 0)
    : (previewData?.pricing?.shippingFee ?? shippingFeeData?.fee ?? 0);

  // 5. Đặt hàng COD
  const handlePlaceOrder = async () => {
    if (!currentActiveAddress?.fullName || !currentActiveAddress?.phone) {
      toast('Vui lòng cung cấp đầy đủ họ tên và số điện thoại người nhận', { type: 'warning' });
      return;
    }
    if (!currentActiveAddress?.detailAddress) {
      toast('Vui lòng cung cấp địa chỉ nhận hàng chi tiết', { type: 'warning' });
      return;
    }

    if (selectedPaymentMethod && selectedPaymentMethod !== 'COD' && selectedPaymentMethod !== 'ONEPAY' && selectedPaymentMethod !== 'VNPAY') {
      const methodLabels = {
        MOMO: 'Ví MoMo',
        ZALOPAY: 'Cổng ZaloPay',
      };
      const label = methodLabels[selectedPaymentMethod] || selectedPaymentMethod;
      toast(`Tính năng đặt hàng bằng ${label} đang phát triển. Quý khách vui lòng chọn COD, OnePay hoặc VNPAY.`, {
        type: 'warning',
      });
      return;
    }

    setSubmittingOrder(true);
    try {
      if (isCustomAddress && saveToAddressBook && isAuthenticated) {
        try {
          await userService.addAddress({
            ...customAddress,
            isDefault: addresses.length === 0,
          });
        } catch (addErr) {
          console.warn('Lưu sổ địa chỉ không thành công:', addErr);
        }
      }

      const activeItemIds = getSelectedCheckoutIds();
      const idempotencyKey = getIdempotencyKey();
      const orderPayload = {
        addressId: !isCustomAddress && selectedAddressId ? selectedAddressId : undefined,
        shippingAddress: isCustomAddress ? currentActiveAddress : undefined,
        couponCode: couponInput || previewData?.pricing?.couponCode || undefined,
        shippingCouponCode: shippingCouponInput || previewData?.pricing?.shippingCouponCode || undefined,
        note: orderNote,
        paymentMethod: selectedPaymentMethod || 'COD',
        itemIds: activeItemIds.length > 0 ? activeItemIds : undefined,
        idempotencyKey,
      };

      const res = await orderService.createOrder(orderPayload, { 'Idempotency-Key': idempotencyKey });
      if (res.success && res.data) {
        idempotencyKeyRef.current = null; // Hoàn thành đơn -> giải phóng key cho đơn tiếp theo
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('checkoutItemIds');
          localStorage.removeItem('checkoutItemIds');
        }

        // Nếu thanh toán qua OnePay hoặc VNPAY và nhận được link thanh toán
        const selectedMethodUpper = String(selectedPaymentMethod || '').toUpperCase();
        if (['ONEPAY', 'VNPAY'].includes(selectedMethodUpper) && res.data.paymentUrl) {
          const name = selectedMethodUpper === 'VNPAY' ? 'VNPAY' : 'OnePay';
          toast(`Khởi tạo đơn hàng thành công. Đang chuyển sang cổng thanh toán ${name}...`, { type: 'success' });
          if (fetchCart) fetchCart();
          window.location.href = res.data.paymentUrl;
          return;
        }

        setPlacedOrder(res.data);
        toast('Đặt hàng thành công. Đơn hàng của bạn đang được xử lý.', { type: 'success' });
        if (fetchCart) fetchCart();
      }
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Không thể tạo đơn hàng', { type: 'error' });
    } finally {
      setSubmittingOrder(false);
    }
  };

  return {
    isAuthenticated,
    cart,
    cartItems,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    isCustomAddress,
    setIsCustomAddress,
    saveToAddressBook,
    setSaveToAddressBook,
    customAddress,
    handleCustomAddressChange,
    provinces,
    districts,
    wards,
    newWards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    loadingNewWards,
    handleProvinceSelect,
    handleDistrictSelect,
    handleWardSelect,
    shippingFeeData,
    calculatingFee,
    previewData,
    loadingPreview,
    couponInput,
    shippingCouponInput,
    setShippingCouponInput,
    showVoucherModal,
    setShowVoucherModal,
    showEditItemsModal,
    setShowEditItemsModal,
    updateQuantity,
    removeItem,
    toggleSelectItem,
    triggerOrderPreview,
    selectedItemIds,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    orderNote,
    setOrderNote,
    submittingOrder,
    placedOrder,
    currentActiveAddress,
    activeStep,
    setActiveStep,
    invoiceData,
    setInvoiceData,
    effectiveShippingFee,
    formatPrice,
    handleApplyCoupon,
    handleRemoveCoupon,
    handlePlaceOrder,
  };
}
