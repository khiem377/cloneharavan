'use client';

import { useState, useEffect } from 'react';
import settingService from '@/services/setting.service';
import paymentService from '@/services/payment.service';

const DEFAULT_CHECKOUT_SETTINGS = {
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

export function useCheckoutSettings() {
  const [checkoutSettings, setCheckoutSettings] = useState(DEFAULT_CHECKOUT_SETTINGS);
  const [storeInfo, setStoreInfo] = useState(null);
  const [activeProviders, setActiveProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAllSettings = async () => {
      try {
        setLoading(true);
        const [publicData, providersData] = await Promise.all([
          settingService.getPublicSettings(),
          paymentService.getActivePaymentProviders(),
        ]);

        if (!isMounted) return;

        if (publicData) {
          if (publicData.checkout) {
            setCheckoutSettings((prev) => ({
              ...DEFAULT_CHECKOUT_SETTINGS,
              ...publicData.checkout,
              fieldMatrix: {
                ...DEFAULT_CHECKOUT_SETTINGS.fieldMatrix,
                ...(publicData.checkout.fieldMatrix || {}),
              },
              policies: {
                ...DEFAULT_CHECKOUT_SETTINGS.policies,
                ...(publicData.checkout.policies || {}),
              },
            }));
          }
          if (publicData.storeInfo) {
            setStoreInfo(publicData.storeInfo);
          }
        }

        if (Array.isArray(providersData)) {
          setActiveProviders(providersData);
        }
      } catch (err) {
        console.warn('[useCheckoutSettings] Lỗi nạp cấu hình Checkout:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllSettings();

    const handleFocus = () => {
      loadAllSettings();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return {
    checkoutSettings,
    storeInfo,
    activeProviders,
    refreshSettings: async () => {
      try {
        const [publicData, providersData] = await Promise.all([
          settingService.getPublicSettings(),
          paymentService.getActivePaymentProviders(),
        ]);
        if (publicData?.checkout) {
          setCheckoutSettings((prev) => ({
            ...DEFAULT_CHECKOUT_SETTINGS,
            ...publicData.checkout,
            fieldMatrix: {
              ...DEFAULT_CHECKOUT_SETTINGS.fieldMatrix,
              ...(publicData.checkout.fieldMatrix || {}),
            },
            policies: {
              ...DEFAULT_CHECKOUT_SETTINGS.policies,
              ...(publicData.checkout.policies || {}),
            },
          }));
        }
        if (Array.isArray(providersData)) {
          setActiveProviders(providersData);
        }
      } catch (err) {
        console.warn('[useCheckoutSettings] Lỗi refreshSettings:', err);
      }
    },
  };
}

export default useCheckoutSettings;
