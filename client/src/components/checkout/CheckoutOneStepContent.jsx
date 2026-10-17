'use client';

import React from 'react';
import CheckoutAddressSection from './CheckoutAddressSection';
import CheckoutShippingSection from './CheckoutShippingSection';
import CheckoutPaymentSection from './CheckoutPaymentSection';
import CheckoutCompanyInvoiceSection from './CheckoutCompanyInvoiceSection';

export default function CheckoutOneStepContent({
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
  allowDifferentShippingAddress,
  differentRecipient,
  onDifferentRecipientChange,
  recipientInfo,
  onRecipientInfoChange,
}) {
  return (
    <div className="space-y-5">
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
    </div>
  );
}
