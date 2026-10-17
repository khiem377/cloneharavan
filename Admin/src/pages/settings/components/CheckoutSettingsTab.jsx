import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/providers/ToastProvider';
import storeSettingService from '@/services/storeSetting.service';
import CheckoutDisplayTypeCard from './checkout/CheckoutDisplayTypeCard';
import CheckoutCustomerAccountCard from './checkout/CheckoutCustomerAccountCard';
import CheckoutPaymentInfoCard from './checkout/CheckoutPaymentInfoCard';
import CheckoutPoliciesCard from './checkout/CheckoutPoliciesCard';
import CheckoutFooterAndLanguageCard from './checkout/CheckoutFooterAndLanguageCard';

const DEFAULT_CHECKOUT = {
  layoutType: 'one_step',
  customerAccount: 'optional',
  fieldMatrix: {
    phone: 'optional',
    email: 'required',
    address: 'optional',
    district: 'optional',
    ward: 'optional',
  },
  useTwoLevelAddress: false,
  allowDifferentShippingAddress: true,
  allowCompanyInvoice: true,
  policies: {
    refundPolicy: '',
    privacyPolicy: '',
    termsOfService: '',
  },
  extraNotice: '',
  enableReCaptcha: false,
  footerContent: '',
  language: 'vi',
};

export default function CheckoutSettingsTab({ initialData, onRefresh }) {
  const [checkout, setCheckout] = useState(initialData?.checkout || DEFAULT_CHECKOUT);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialData?.checkout) {
      setCheckout({
        ...DEFAULT_CHECKOUT,
        ...initialData.checkout,
        fieldMatrix: {
          ...DEFAULT_CHECKOUT.fieldMatrix,
          ...(initialData.checkout.fieldMatrix || {}),
        },
        policies: {
          ...DEFAULT_CHECKOUT.policies,
          ...(initialData.checkout.policies || {}),
        },
      });
      setIsDirty(false);
    }
  }, [initialData]);

  const updateCheckout = (key, value) => {
    setCheckout((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleFieldMatrixChange = (fieldKey, value) => {
    setCheckout((prev) => ({
      ...prev,
      fieldMatrix: {
        ...prev.fieldMatrix,
        [fieldKey]: value,
      },
    }));
    setIsDirty(true);
  };

  const handlePolicyChange = (policyKey, value) => {
    setCheckout((prev) => ({
      ...prev,
      policies: {
        ...prev.policies,
        [policyKey]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleReset = () => {
    if (initialData?.checkout) {
      setCheckout(initialData.checkout);
      setIsDirty(false);
      toast.info('Đã hoàn tác các thay đổi');
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await storeSettingService.updateSettings('checkout', checkout);
      toast.success('Đã lưu cấu hình trang thanh toán thành công!');
      setIsDirty(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Lỗi lưu cấu hình: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-[880px] pb-12">
      {/* SAPO TOP BAR: CHỈNH SỬA CHƯA ĐƯỢC LƯU + NÚT HỦY & LƯU */}
      <div className="flex items-center justify-between pb-1 border-b border-[#f4f6f8] dark:border-border">
        <div className="text-[13px] text-[#637381] dark:text-muted-foreground">
          {isDirty ? (
            <span className="text-[#e29000] dark:text-amber-400 font-medium animate-pulse">● Chỉnh sửa chưa được lưu</span>
          ) : (
            <span>Cấu hình trang thanh toán</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-8 px-3 text-[13px] border-[#c4cdd5] dark:border-border text-[#212b36] dark:text-foreground bg-white dark:bg-card hover:bg-[#f4f6f8] dark:hover:bg-accent rounded-[6px]"
            >
              Hủy
            </Button>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="h-8 px-4 text-[13px] bg-[#0088ff] hover:bg-[#0077e6] text-white rounded-[6px] shadow-xs active:scale-[0.98] transition-transform font-medium"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </div>

      {/* 1. KIỂU HIỂN THỊ TRANG THANH TOÁN (1 BƯỚC / 3 BƯỚC) */}
      <CheckoutDisplayTypeCard
        layoutType={checkout.layoutType || 'one_step'}
        onChange={(val) => updateCheckout('layoutType', val)}
      />

      {/* 2. TÀI KHOẢN KHÁCH HÀNG */}
      <CheckoutCustomerAccountCard
        customerAccount={checkout.customerAccount || 'optional'}
        onChange={(val) => updateCheckout('customerAccount', val)}
      />

      {/* 3. THÔNG TIN THANH TOÁN & ĐỊA CHỈ 2 CẤP */}
      <CheckoutPaymentInfoCard
        checkout={checkout}
        onChange={updateCheckout}
        onFieldMatrixChange={handleFieldMatrixChange}
      />

      {/* 4. ĐIỀU KHOẢN, BẢO MẬT, HOÀN TRẢ, RECAPTCHA */}
      <CheckoutPoliciesCard
        policies={checkout.policies || {}}
        extraNotice={checkout.extraNotice || ''}
        enableReCaptcha={checkout.enableReCaptcha || false}
        onChangePolicy={handlePolicyChange}
        onChangeExtraNotice={(val) => updateCheckout('extraNotice', val)}
        onChangeReCaptcha={(val) => updateCheckout('enableReCaptcha', val)}
      />

      {/* 5 & 6. NỘI DUNG CHÂN TRANG & NGÔN NGỮ */}
      <CheckoutFooterAndLanguageCard
        footerContent={checkout.footerContent || ''}
        language={checkout.language || 'vi'}
        onChangeFooter={(val) => updateCheckout('footerContent', val)}
        onChangeLanguage={(val) => updateCheckout('language', val)}
      />

      {/* BOTTOM ACTION BAR */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#0088ff] hover:bg-[#0077e6] text-white px-5 py-2 rounded-[6px] text-[13px] font-medium shadow-xs active:scale-[0.98] transition-transform"
        >
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </form>
  );
}
