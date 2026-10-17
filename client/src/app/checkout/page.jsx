'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/toast';

import CartVoucherModal from '@/components/cart/CartVoucherModal';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import CheckoutOrderSummary from '@/components/checkout/CheckoutOrderSummary';
import CheckoutSuccessModal from '@/components/checkout/CheckoutSuccessModal';
import CheckoutEditItemsModal from '@/components/checkout/CheckoutEditItemsModal';
import CheckoutNoticeBanner from '@/components/checkout/CheckoutNoticeBanner';
import CheckoutCustomerAccountAlert from '@/components/checkout/CheckoutCustomerAccountAlert';
import CheckoutFooter from '@/components/checkout/CheckoutFooter';
import CheckoutOneStepContent from '@/components/checkout/CheckoutOneStepContent';
import CheckoutThreeStepContent from '@/components/checkout/CheckoutThreeStepContent';

import { useCheckout } from '@/components/checkout/useCheckout';
import { useCheckoutSettings } from '@/components/checkout/useCheckoutSettings';

export default function CheckoutPage() {
  const { checkoutSettings, activeProviders } = useCheckoutSettings();
  const checkout = useCheckout();

  const [differentRecipient, setDifferentRecipient] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState({ fullName: '', phone: '' });
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);

  const layoutType = checkoutSettings?.layoutType || 'one_step';
  const customerAccount = checkoutSettings?.customerAccount || 'optional';
  const fieldMatrix = checkoutSettings?.fieldMatrix || {};
  const useTwoLevelAddress = Boolean(checkoutSettings?.useTwoLevelAddress);
  const allowCompanyInvoice = Boolean(checkoutSettings?.allowCompanyInvoice);
  const allowDifferentShippingAddress = Boolean(checkoutSettings?.allowDifferentShippingAddress);
  const enableReCaptcha = Boolean(checkoutSettings?.enableReCaptcha);
  const extraNotice = checkoutSettings?.extraNotice || '';
  const policies = checkoutSettings?.policies || {};
  const footerContent = checkoutSettings?.footerContent || '';

  const subtotal = checkout.previewData?.pricing?.subtotal || checkout.cart?.subtotal || 0;
  const couponDiscount = checkout.previewData?.pricing?.couponDiscount ?? checkout.cart?.couponDiscount ?? 0;
  const shippingDiscount = checkout.previewData?.pricing?.shippingDiscount || 0;
  const finalShippingFee = Math.max(0, checkout.effectiveShippingFee - shippingDiscount);
  const totalAmount = checkout.previewData?.pricing?.totalAmount ?? Math.max(0, subtotal - couponDiscount + finalShippingFee);

  const handleValidateToStep2 = () => {
    if (!checkout.currentActiveAddress?.fullName) {
      toast('Vui lòng nhập họ và tên người nhận hàng', { type: 'warning' });
      return;
    }
    if (fieldMatrix?.phone !== 'optional' && !checkout.currentActiveAddress?.phone) {
      toast('Vui lòng cung cấp số điện thoại người nhận', { type: 'warning' });
      return;
    }
    if (fieldMatrix?.address !== 'optional' && !checkout.currentActiveAddress?.detailAddress) {
      toast('Vui lòng nhập địa chỉ nhận hàng chi tiết', { type: 'warning' });
      return;
    }
    if (!checkout.currentActiveAddress?.provinceId) {
      toast('Vui lòng chọn Tỉnh / Thành phố nhận hàng', { type: 'warning' });
      return;
    }
    checkout.setActiveStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isThreeStep = layoutType === 'three_step';

  const sharedStepProps = {
    ...checkout,
    fieldMatrix,
    useTwoLevelAddress,
    allowCompanyInvoice,
    allowDifferentShippingAddress,
    differentRecipient,
    onDifferentRecipientChange: setDifferentRecipient,
    recipientInfo,
    onRecipientInfoChange: (field, val) => setRecipientInfo((prev) => ({ ...prev, [field]: val })),
    activeProviders,
    finalShippingFee,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Quay lại giỏ hàng */}
        <div className="flex items-center justify-between pb-1">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft size={14} />
            <span>Quay lại giỏ hàng</span>
          </Link>
        </div>

        {/* Thông báo bổ sung từ Admin Settings */}
        <CheckoutNoticeBanner notice={extraNotice} />

        {/* Cảnh báo / Hướng dẫn tài khoản khách hàng */}
        <CheckoutCustomerAccountAlert
          customerAccount={customerAccount}
          isAuthenticated={checkout.isAuthenticated}
        />

        {/* Tiến trình đặt hàng (1 bước hoặc 3 bước) */}
        <CheckoutSteps
          layoutType={layoutType}
          currentStep={isThreeStep ? checkout.activeStep : 2}
          onStepClick={checkout.setActiveStep}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Cột trái (7/12): Form nhập liệu */}
          <div className="lg:col-span-7">
            {isThreeStep ? (
              <CheckoutThreeStepContent
                {...sharedStepProps}
                onValidateToStep2={handleValidateToStep2}
              />
            ) : (
              <CheckoutOneStepContent {...sharedStepProps} />
            )}
          </div>

          {/* Cột phải (5/12): Tóm tắt đơn hàng & Nút đặt hàng */}
          <div className="lg:col-span-5">
            <CheckoutOrderSummary
              items={checkout.previewData?.items || checkout.cartItems || []}
              gifts={checkout.previewData?.gifts || []}
              pricing={{
                subtotal,
                couponDiscount,
                shippingFee: checkout.effectiveShippingFee,
                shippingDiscount,
                finalShippingFee,
                totalAmount,
              }}
              loadingPreview={checkout.loadingPreview}
              appliedCouponCode={checkout.couponInput || checkout.previewData?.pricing?.couponCode}
              appliedCouponDiscount={couponDiscount}
              appliedShippingCode={checkout.shippingCouponInput || checkout.previewData?.pricing?.shippingCouponCode}
              appliedShippingDiscount={shippingDiscount}
              onOpenVoucherModal={() => checkout.setShowVoucherModal(true)}
              onRemoveCoupon={checkout.handleRemoveCoupon}
              onOpenEditModal={() => checkout.setShowEditItemsModal(true)}
              submittingOrder={checkout.submittingOrder}
              canCheckout={checkout.previewData ? checkout.previewData.canCheckout : true}
              warnings={checkout.previewData?.warnings || []}
              enableReCaptcha={enableReCaptcha}
              recaptchaVerified={recaptchaVerified}
              onVerifyRecaptcha={setRecaptchaVerified}
              selectedPaymentMethod={checkout.selectedPaymentMethod}
              onPlaceOrder={() => {
                if (enableReCaptcha && !recaptchaVerified) {
                  toast('Vui lòng xác nhận bạn không phải là người máy', { type: 'warning' });
                  return;
                }
                checkout.handlePlaceOrder();
              }}
              formatPrice={checkout.formatPrice}
            />
          </div>
        </div>

        {/* Chân trang thanh toán (Chính sách và nội dung chân trang) */}
        <CheckoutFooter policies={policies} footerContent={footerContent} />
      </div>

      <CartVoucherModal
        isOpen={checkout.showVoucherModal}
        onClose={() => checkout.setShowVoucherModal(false)}
        appliedCode={checkout.couponInput || checkout.previewData?.pricing?.couponCode}
        appliedDiscount={couponDiscount}
        appliedShippingCode={checkout.shippingCouponInput || checkout.previewData?.pricing?.shippingCouponCode}
        appliedShippingDiscount={shippingDiscount}
        orderSubtotal={subtotal}
        onApply={checkout.handleApplyCoupon}
        onRemove={checkout.handleRemoveCoupon}
      />

      <CheckoutEditItemsModal
        isOpen={checkout.showEditItemsModal}
        onClose={() => checkout.setShowEditItemsModal(false)}
        items={checkout.cartItems}
        selectedItemIds={checkout.selectedItemIds}
        onToggleSelect={checkout.toggleSelectItem}
        onUpdateQuantity={checkout.updateQuantity}
        onRemoveItem={checkout.removeItem}
        onRefreshPreview={checkout.triggerOrderPreview}
        formatPrice={checkout.formatPrice}
      />

      <CheckoutSuccessModal
        placedOrder={checkout.placedOrder}
        formatPrice={checkout.formatPrice}
      />
    </div>
  );
}
