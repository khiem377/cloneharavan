'use client';

import React, { useState } from 'react';
import CheckoutPolicyModal from './CheckoutPolicyModal';

export default function CheckoutFooter({ policies = {}, footerContent = '' }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    content: '',
  });

  const { refundPolicy, privacyPolicy, termsOfService } = policies;

  const openPolicy = (title, content) => {
    setModalConfig({
      isOpen: true,
      title,
      content,
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const hasAnyPolicy = Boolean(refundPolicy || privacyPolicy || termsOfService);

  return (
    <footer className="pt-6 pb-8 border-t border-slate-200 mt-8 text-center text-xs text-slate-500 space-y-3">
      {hasAnyPolicy && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-medium">
          {refundPolicy && (
            <button
              type="button"
              onClick={() => openPolicy('Chính sách hoàn trả', refundPolicy)}
              className="hover:text-slate-900 transition underline underline-offset-2 cursor-pointer"
            >
              Chính sách hoàn trả
            </button>
          )}

          {privacyPolicy && (
            <button
              type="button"
              onClick={() => openPolicy('Chính sách bảo mật', privacyPolicy)}
              className="hover:text-slate-900 transition underline underline-offset-2 cursor-pointer"
            >
              Chính sách bảo mật
            </button>
          )}

          {termsOfService && (
            <button
              type="button"
              onClick={() => openPolicy('Điều khoản sử dụng', termsOfService)}
              className="hover:text-slate-900 transition underline underline-offset-2 cursor-pointer"
            >
              Điều khoản dịch vụ
            </button>
          )}
        </div>
      )}

      {footerContent && (
        <div className="text-[11.5px] text-slate-400 whitespace-pre-line max-w-2xl mx-auto leading-relaxed">
          {footerContent}
        </div>
      )}

      <CheckoutPolicyModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
      />
    </footer>
  );
}
