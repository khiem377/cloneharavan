'use client';

import React from 'react';
import ChatHeader from './ChatHeader';
import ChatMessageItem from './ChatMessageItem';
import ChatQuickPrompts from './ChatQuickPrompts';
import ChatInput from './ChatInput';
import ChatTriggerButton from './ChatTriggerButton';
import { useChatWidget } from './useChatWidget';

export default function AiChatWidget() {
  const {
    isOpen,
    setIsOpen,
    showPill,
    setShowPill,
    soundEnabled,
    setSoundEnabled,
    messages,
    input,
    setInput,
    loading,
    messagesContainerRef,
    messagesEndRef,
    textareaRef,
    isProductPage,
    isCartPage,
    handleSendMessage,
    handleCloseOnSelectProduct,
    handleSelectOrderTracking,
    handleSelectOnlineShopping,
    handleResetSession,
  } = useChatWidget();

  return (
    <>
      {/* Nút kích hoạt chat ở góc màn hình */}
      <ChatTriggerButton
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        showPill={showPill}
        onClosePill={() => setShowPill(false)}
        isProductPage={isProductPage}
        isCartPage={isCartPage}
      />

      {/* Cửa sổ chat chính dạng modal nổi bên góc phải / Fullscreen trên Mobile */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-white border border-slate-200 shadow-md overflow-hidden transition-all duration-200 select-none
            inset-0 h-[100dvh] max-h-[100dvh] sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[420px] sm:h-[620px] sm:max-h-[85vh] sm:rounded-[6px]
          `}
          role="dialog"
          aria-label="Cửa sổ trò chuyện tư vấn SHOP"
        >
          {/* Header */}
          <ChatHeader
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((v) => !v)}
            onResetSession={handleResetSession}
            onClose={() => setIsOpen(false)}
            loading={loading}
          />

          {/* Vùng nội dung tin nhắn */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#f8fafc] text-xs sm:text-sm select-text"
          >
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                msg={msg}
                loading={loading}
                onSelectOrderTracking={handleSelectOrderTracking}
                onSelectOnlineShopping={handleSelectOnlineShopping}
                onSelectProduct={handleCloseOnSelectProduct}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Dải nút gợi ý câu hỏi nhanh */}
          <ChatQuickPrompts
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            loading={loading}
          />

          {/* Ô nhập tin nhắn */}
          <ChatInput
            input={input}
            setInput={setInput}
            loading={loading}
            onSendMessage={(msg) => handleSendMessage(msg)}
            textareaRef={textareaRef}
          />
        </div>
      )}
    </>
  );
}
