'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import CheckoutAddressSection from './CheckoutAddressSection';
import CheckoutShippingSection from './CheckoutShippingSection';
import CheckoutPaymentSection from './CheckoutPaymentSection';
import CheckoutCompanyInvoiceSection from './CheckoutCompanyInvoiceSection';
import CheckoutThreeStepReview from './CheckoutThreeStepReview';

export default function CheckoutThreeStepContent({
  activeStep,
  setActiveStep,
  onValidateToStep2,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  isCustomAddress,
  setIsCustomAddress,
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
  saveToAddressBook,
  setSaveToAddressBook,
  isAuthenticated,
  fieldMatrix,
  useTwoLevelAddress,
  effectiveShippingFee,
  shippingDiscount,
  finalShippingFee,
  shippingFeeData,
  calculatingFee,
  loadingPreview,
  formatPrice,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  orderNote,
  setOrderNote,
  activeProviders,
  allowCompanyInvoice,
  invoiceData,
  setInvoiceData,
  currentActiveAddress,
  allowDifferentShippingAddress,
  differentRecipient,
  onDifferentRecipientChange,
  recipientInfo,
  onRecipientInfoChange,
}) {
  return (
    <div className="space-y-5">
      {/* Bước 1: Thông tin khách hàng & Địa chỉ */}
      {activeStep === 1 && (
        <div className="space-y-4">
          <CheckoutAddressSection
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onSelectAddressId={setSelectedAddressId}
            isCustomAddress={isCustomAddress}
            setIsCustomAddress={setIsCustomAddress}
            customAddress={customAddress}
            onCustomAddressChange={handleCustomAddressChange}
            provinces={provinces}
            districts={districts}
            wards={wards}
            newWards={newWards}
            loadingProvinces={loadingProvinces}
            loadingDistricts={loadingDistricts}
            loadingWards={loadingWards}
            loadingNewWards={loadingNewWards}
            onProvinceSelect={handleProvinceSelect}
            onDistrictSelect={handleDistrictSelect}
            onWardSelect={handleWardSelect}
            saveToAddressBook={saveToAddressBook}
            setSaveToAddressBook={setSaveToAddressBook}
            isAuthenticated={isAuthenticated}
            fieldMatrix={fieldMatrix}
            useTwoLevelAddress={useTwoLevelAddress}
            allowDifferentShippingAddress={allowDifferentShippingAddress}
            differentRecipient={differentRecipient}
            onDifferentRecipientChange={onDifferentRecipientChange}
            recipientInfo={recipientInfo}
            onRecipientInfoChange={onRecipientInfoChange}
          />

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              onClick={onValidateToStep2}
              className="h-10 px-5 text-xs sm:text-sm bg-[#0088ff] hover:bg-blue-600 text-white rounded-[6px] font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <span>Tiếp tục: Vận chuyển & Thanh toán</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Bước 2: Vận chuyển & Phương thức thanh toán */}
      {activeStep === 2 && (
        <div className="space-y-4">
          <CheckoutShippingSection
            effectiveShippingFee={effectiveShippingFee}
            shippingDiscount={shippingDiscount}
            finalShippingFee={finalShippingFee}
            shippingFeeData={shippingFeeData}
            calculatingFee={calculatingFee}
            loadingPreview={loadingPreview}
            formatPrice={formatPrice}
          />

          <CheckoutPaymentSection
            selectedPaymentMethod={selectedPaymentMethod}
            onSelectPaymentMethod={setSelectedPaymentMethod}
            orderNote={orderNote}
            onOrderNoteChange={setOrderNote}
            activeProviders={activeProviders}
          />

          <CheckoutCompanyInvoiceSection
            allowCompanyInvoice={allowCompanyInvoice}
            invoiceData={invoiceData}
            onInvoiceChange={setInvoiceData}
          />

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveStep(1)}
              className="h-9 px-4 text-xs font-semibold rounded-[6px]"
            >
              <ArrowLeft size={13} className="mr-1" />
              <span>Quay lại thông tin</span>
            </Button>
            <Button
              type="button"
              onClick={() => {
                setActiveStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-10 px-5 text-xs sm:text-sm bg-[#0088ff] hover:bg-blue-600 text-white rounded-[6px] font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <span>Tiếp tục: Xác nhận đơn hàng</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Bước 3: Xem lại thông tin đơn hàng */}
      {activeStep === 3 && (
        <div className="space-y-4">
          <CheckoutThreeStepReview
            currentAddress={currentActiveAddress}
            selectedPaymentMethod={selectedPaymentMethod}
            effectiveShippingFee={finalShippingFee}
            invoiceData={invoiceData}
            onBackToStep={setActiveStep}
            formatPrice={formatPrice}
          />

          <div className="flex items-center justify-start pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveStep(2)}
              className="h-9 px-4 text-xs font-semibold rounded-[6px]"
            >
              <ArrowLeft size={13} className="mr-1" />
              <span>Quay lại phương thức</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
