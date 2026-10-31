import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { chatService } from '@/services/chat.service';
import { playChime } from './ChatSound';
import useAuthStore from '@/store/authStore';

const STORAGE_SESSION_KEY = 'shop_ai_chat_session_id';
const STORAGE_MESSAGES_KEY = 'shop_ai_chat_messages';

export function useChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showPill, setShowPill] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortCtrlRef = useRef(null);
  const typewriterTimerRef = useRef(null);

  const isProductPage = pathname?.startsWith('/products/');
  const isCartPage = pathname === '/cart' || pathname?.startsWith('/cart');

  useEffect(() => {
    return () => {
      if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
    };
  }, []);

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

  useEffect(() => {
    if (loading && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

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

    let streamTargetText = '';
    let streamDisplayedText = '';
    let isNetworkDone = false;
    let pendingProducts = [];

    const tickTypewriter = () => {
      if (streamDisplayedText.length < streamTargetText.length) {
        const remaining = streamTargetText.length - streamDisplayedText.length;
        const step = remaining > 100 ? 8 : (remaining > 40 ? 5 : (remaining > 15 ? 3 : 2));
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
                  products: pendingProducts.length > 0 ? pendingProducts : (m.products || []),
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

    typewriterTimerRef.current = setInterval(tickTypewriter, 12);

    try {
      const currentProductSlug = isProductPage && pathname
        ? pathname.replace('/products/', '').split('?')[0].split('/')[0]
        : null;

      await chatService.sendMessageStream(
        {
          sessionId: sessionIdRef.current,
          message: cleanMsg,
          currentProductSlug,
          currentUrl: typeof window !== 'undefined' ? window.location.href : pathname,
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
            if (pendingProducts.length > 0) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId ? { ...m, products: pendingProducts } : m
                )
              );
            }
          },
          onEnd: () => {
            isNetworkDone = true;
          },
          onError: () => {
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

  const handleCloseOnSelectProduct = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelectOrderTracking = useCallback(() => {
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

    const { user, accessToken } = useAuthStore.getState();
    const isAuth = Boolean(user && accessToken);

    const botMsg = {
      id: `bot-${Date.now()}`,
      role: 'bot',
      text: isAuth
        ? 'Dạ em kiểm tra thấy các đơn hàng gần nhất của anh/chị, mình có thể theo dõi nhanh tiến độ ngay bên dưới nhé:'
        : 'Dạ anh/chị vui lòng nhập mã đơn hàng cùng số điện thoại hoặc email đặt hàng vào khung yêu cầu bên dưới để em kiểm tra tiến độ giao hàng cho mình nhé:',
      showOrderLookup: true,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (soundEnabled) playChime();
  }, [soundEnabled]);

  const handleSelectOnlineShopping = useCallback(() => {
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
  }, [soundEnabled]);

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

  return {
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
  };
}
