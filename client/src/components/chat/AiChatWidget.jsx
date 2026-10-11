'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { chatService } from '@/services/chat.service';
import { playChime } from './ChatSound';
import ChatHeader from './ChatHeader';
import ChatMessageItem from './ChatMessageItem';
import ChatQuickPrompts from './ChatQuickPrompts';
import ChatInput from './ChatInput';
import ChatTriggerButton from './ChatTriggerButton';

const STORAGE_SESSION_KEY = 'shop_ai_chat_session_id';
const STORAGE_MESSAGES_KEY = 'shop_ai_chat_messages';

export default function AiChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showPill, setShowPill] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tin nhắn mở đầu Samsung Concierge với các nút lựa chọn hình viên thuốc
  const buildInitialMessages = () => [
    {
      id: 'welcome-samsung',
      role: 'bot',
      text: 'Dạ em chào anh/chị ạ! Em là chuyên viên tư vấn của SHOP. Anh/chị vui lòng chọn nội dung cần hỗ trợ bên dưới hoặc nhắn tin trực tiếp để em hỗ trợ nhé:',
      hasOptions: true,
      timestamp: 'Vừa xong',
    },
  ];

  const [messages, setMessages] = useState(buildInitialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const sessionIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortCtrlRef = useRef(null);
  const typewriterTimerRef = useRef(null);

  const isProductPage = pathname?.startsWith('/products/');
  const isCartPage = pathname === '/cart' || pathname?.startsWith('/cart');

  // Dọn dẹp typewriter timer khi unmount
  useEffect(() => {
    return () => {
      if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
    };
  }, []);

  // Khôi phục Session & Lịch sử tin nhắn từ LocalStorage & Database khi mount
  useEffect(() => {
    try {
      const savedSid = localStorage.getItem(STORAGE_SESSION_KEY);
      const savedMsgs = localStorage.getItem(STORAGE_MESSAGES_KEY);

      if (savedSid) {
        sessionIdRef.current = savedSid;
        setSessionId(savedSid);
      }

      if (savedMsgs) {
        const parsed = JSON.parse(savedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } else if (savedSid) {
        // Tải lại từ DB nếu chưa có trong LocalStorage
        chatService.getHistory(savedSid).then((res) => {
          if (res?.messages?.length > 0) {
            const formatted = res.messages.map((m, idx) => ({
              id: `db-${idx}-${Date.now()}`,
              role: m.role === 'assistant' ? 'bot' : 'user',
              text: m.content,
              products: m.products || [],
              timestamp: new Date(m.timestamp || Date.now()).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }));
            setMessages(formatted);
            localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(formatted));
          }
        });
      }
    } catch (e) {
      console.warn('[AiChatWidget Init Error]', e);
    }
  }, []);

  // Tự động lưu tin nhắn vào LocalStorage mỗi khi có cập nhật
  useEffect(() => {
    if (messages.length > 1 || (messages.length === 1 && messages[0].id !== 'welcome-samsung')) {
      try {
        const toSave = messages.map((m) => ({
          ...m,
          streaming: false,
        }));
        localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(toSave));
      } catch (e) {}
    }
  }, [messages]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới hoặc đang stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea khi mở chat widget
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const rawMsg = textToSend ?? input;
    const cleanMsg = rawMsg?.trim();
    if (!cleanMsg || loading) return;

    setInput('');

    const nowTime = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: cleanMsg,
      timestamp: nowTime,
    };

    const botMsgId = `bot-${Date.now()}`;
    const botMsg = {
      id: botMsgId,
      role: 'bot',
      text: '',
      products: [],
      timestamp: nowTime,
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setLoading(true);

    abortCtrlRef.current = new AbortController();

    // Typewriter pacer: Progressive smooth token reveal (nhả từng chữ mượt mà như ChatGPT)
    let streamTargetText = '';
    let streamDisplayedText = '';
    let isNetworkDone = false;
    let pendingProducts = [];
    let typewriterTimer = null;

    const tickTypewriter = () => {
      if (streamDisplayedText.length < streamTargetText.length) {
        const remaining = streamTargetText.length - streamDisplayedText.length;
        // Nhả từng 1-2 ký tự (hoặc 3-4 nếu buffer tồn nhiều) để tạo hiệu ứng gõ phím mượt mà tự nhiên
        const step = remaining > 60 ? 4 : (remaining > 20 ? 2 : 1);
        streamDisplayedText = streamTargetText.slice(0, streamDisplayedText.length + step);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId ? { ...m, text: streamDisplayedText } : m
          )
        );
      } else if (isNetworkDone) {
        if (typewriterTimerRef.current) {
          clearInterval(typewriterTimerRef.current);
          typewriterTimerRef.current = null;
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: streamTargetText,
                  products: pendingProducts,
                  streaming: false,
                }
              : m
          )
        );
        setLoading(false);
        if (soundEnabled) playChime();
      }
    };

    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
      typewriterTimerRef.current = null;
    }

    typewriterTimerRef.current = setInterval(tickTypewriter, 18);

    try {
      await chatService.sendMessageStream(
        {
          sessionId: sessionIdRef.current,
          message: cleanMsg,
        },
        {
          signal: abortCtrlRef.current.signal,
          onSessionId: (newSid) => {
            if (newSid && newSid !== sessionIdRef.current) {
              sessionIdRef.current = newSid;
              setSessionId(newSid);
              try {
                localStorage.setItem(STORAGE_SESSION_KEY, newSid);
              } catch (e) {}
            }
          },
          onChunk: (chunk) => {
            streamTargetText += chunk;
          },
          onProducts: (products) => {
            pendingProducts = products || [];
          },
          onEnd: () => {
            isNetworkDone = true;
          },
          onError: (errMsg) => {
            isNetworkDone = true;
            if (!streamTargetText) {
              streamTargetText =
                'Dạ em rất tiếc, kết nối hiện đang bị gián đoạn. Anh/chị vui lòng thử gửi lại giúp em nhé ạ.';
            }
          },
        }
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        isNetworkDone = true;
        if (!streamTargetText) {
          streamTargetText =
            'Dạ em rất tiếc, đã có lỗi xảy ra. Anh/chị thử lại sau giây lát giúp em nhé.';
        }
      }
    }
  };

  const handleSelectOrderTracking = () => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: 'Tra cứu đơn hàng của tôi',
      timestamp: nowTime,
    };

    const botMsg = {
      id: `bot-${Date.now()}`,
      role: 'bot',
      text: 'Dạ anh/chị vui lòng nhập mã đơn hàng cùng số điện thoại hoặc email đặt hàng vào khung yêu cầu bên dưới để em kiểm tra tiến độ giao hàng cho mình nhé:',
      showOrderLookup: true,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (soundEnabled) playChime();
  };

  const handleSelectOnlineShopping = () => {
    const nowTime = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: 'Hỗ trợ mua hàng trực tuyến',
      timestamp: nowTime,
    };

    const botMsg = {
      id: `bot-${Date.now()}`,
      role: 'bot',
      text: 'Dạ em chào anh/chị ạ! Siêu thị điện máy SHOP bên em chuyên cung cấp Tivi, Tủ lạnh, Máy giặt, Điều hòa và Thiết bị âm thanh chính hãng 100%. Anh/chị đang quan tâm đến dòng sản phẩm nào hoặc ngân sách khoảng bao nhiêu để em tư vấn chi tiết cho mình ạ?',
      products: [],
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (soundEnabled) playChime();
  };

  const handleResetSession = async () => {
    if (loading) return;
    const oldSid = sessionIdRef.current;
    sessionIdRef.current = null;
    setSessionId(null);
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      localStorage.removeItem(STORAGE_MESSAGES_KEY);
    } catch (e) {}

    if (oldSid) {
      await chatService.resetSession(oldSid);
    }
    setMessages(buildInitialMessages());
  };

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

      {/* Cửa sổ chat chính dạng modal nổi bên góc phải */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-white border border-slate-200 shadow-lg overflow-hidden transition-all duration-200 select-none
            inset-x-0 bottom-0 top-0 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[420px] sm:h-[620px] sm:max-h-[85vh] sm:rounded-[6px]
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
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#f8fafc] text-xs sm:text-sm select-text">
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                msg={msg}
                loading={loading}
                onSelectOrderTracking={handleSelectOrderTracking}
                onSelectOnlineShopping={handleSelectOnlineShopping}
                onSelectProduct={() => setIsOpen(false)}
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
            onSendMessage={() => handleSendMessage()}
            textareaRef={textareaRef}
          />
        </div>
      )}
    </>
  );
}
