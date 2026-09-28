/**
 * ChatbotBubble — bóng chat test ở góc phải Admin
 * Đã nâng cấp: Hỗ trợ Bảng Markdown, Tự động dãn ô gõ tin nhắn, Khung chat rộng rãi
 */
import { useState, useRef, useEffect } from 'react';
import { X, Loader2 } from '@/components/ui/Icons';
import api from '@/lib/axios';

// CSS wave animation cho typing indicator
const waveStyle = `
  @keyframes wave {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30%            { transform: translateY(-5px); opacity: 1; }
  }
  .wave-dot { animation: wave 1.2s ease-in-out infinite; }
  .wave-dot:nth-child(2) { animation-delay: 0.15s; }
  .wave-dot:nth-child(3) { animation-delay: 0.3s; }
  .stream-cursor { display:inline-flex; gap:3px; align-items:center; margin-left:4px; vertical-align:middle; }
  .stream-cursor span {
    display: inline-block;
    width: 4px; height: 4px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.5;
    animation: wave 1.2s ease-in-out infinite;
  }
  .stream-cursor span:nth-child(2) { animation-delay: 0.15s; }
  .stream-cursor span:nth-child(3) { animation-delay: 0.30s; }
`;

const BotIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
    <line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" />
    <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

// Component hiển thị Markdown text và Bảng Markdown
function RenderMarkdown({ text = '' }) {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks = [];
  let currentTable = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      // Bỏ qua dòng phân cách kiểu |---|---|
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        return;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
        blocks.push({ type: 'table', data: currentTable });
      } else {
        currentTable.rows.push(cells);
      }
    } else {
      currentTable = null;
      if (trimmed) {
        blocks.push({ type: 'text', content: line });
      } else {
        blocks.push({ type: 'break' });
      }
    }
  });

  return (
    <div className="space-y-1.5">
      {blocks.map((block, idx) => {
        if (block.type === 'table') {
          const { headers, rows } = block.data;
          return (
            <div key={idx} className="my-2 overflow-x-auto rounded-lg border border-border bg-background/80 shadow-sm">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-muted text-foreground font-semibold">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-2.5 py-1.5 border-b border-border">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-2.5 py-1.5 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === 'break') {
          return <div key={idx} className="h-0.5" />;
        }

        // Parse inline bold **bold**
        const parts = block.content.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={idx} className="leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={pIdx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatbotBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Xin chào! Mình là Shop Assistant, tư vấn viên của shop. Bạn cần hỗ trợ gì không?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const sessionIdRef = useRef(null); // ref để tránh stale closure
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Tự động dãn chiều cao của ô gõ tin nhắn theo nội dung
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    setMessages(p => [...p, { role: 'user', text }]);
    setLoading(true);

    const botId = Date.now().toString();
    setMessages(p => [...p, { id: botId, role: 'bot', text: '', streaming: true }]);

    try {
      const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionIdRef.current }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'session' && !sessionIdRef.current) {
                sessionIdRef.current = data.sessionId;
                setSessionId(data.sessionId);
              }
            if (data.type === 'text') {
              accText += data.text;
              const captured = accText;
              setMessages(p => p.map(m =>
                m.id === botId ? { ...m, text: captured } : m
              ));
            }
            if (data.type === 'done') {
              setMessages(p => p.map(m =>
                m.id === botId ? { ...m, streaming: false } : m
              ));
            }
            if (data.type === 'error') {
              setMessages(p => p.map(m =>
                m.id === botId ? { role: 'bot', text: data.message, error: true, streaming: false } : m
              ));
            }
          } catch { }
        }
      }
    } catch {
      setMessages(p => p.map(m =>
        m.id === botId ? { role: 'bot', text: 'Lỗi kết nối. Thử lại sau nhé!', error: true, streaming: false } : m
      ));
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (sessionId) {
      await api.delete('/chat/session', { data: { sessionId } }).catch(() => { });
    }
    sessionIdRef.current = null;
    setSessionId(null);
    setMessages([{ role: 'bot', text: 'Cuộc trò chuyện mới bắt đầu! Mình có thể giúp gì cho bạn?' }]);
  };

  return (
    <>
      <style>{waveStyle}</style>
      {/* Nút bấm mở khung chat */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[9999] rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center"
        title="Trợ lý AI Shop"
        style={{ width: 54, height: 54 }}
      >
        {open ? <X size={22} /> : <BotIcon />}
      </button>

      {/* Cửa sổ Chatbot mở rộng */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-[9998] w-[380px] sm:w-[440px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden transition-all"
          style={{ height: 540, maxHeight: '85vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-primary text-primary-foreground shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <BotIcon />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Trợ lý AI Shop</p>
                <p className="text-[10px] opacity-80 mt-0.5">Google Gemini 1.5 Flash · Smart Agent</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="p-1.5 rounded-md hover:bg-white/20 transition-colors text-primary-foreground/90 hover:text-primary-foreground"
              title="Bắt đầu cuộc trò chuyện mới"
            >
              <TrashIcon />
            </button>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {m.role === 'bot' && (
                  <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <BotIcon />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words shadow-sm
                    ${m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-xs'
                      : m.error
                        ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-xs'
                        : 'bg-muted/70 border border-border/50 text-foreground rounded-tl-xs'
                    }`}
                >
                  <RenderMarkdown text={m.text || (m.streaming ? '' : '…')} />
                  {m.streaming && (
                    <span className="stream-cursor">
                      <span /><span /><span />
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Indicator khi đang gọi Tool / AI xử lý */}
            {loading && !messages.some(m => m.streaming) && (
              <div className="flex gap-2">
                <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <BotIcon />
                </div>
                <div className="bg-muted/70 border border-border/50 rounded-2xl rounded-tl-xs px-4 py-3 flex gap-1.5 items-center">
                  {[0, 150, 300].map(d => (
                    <span
                      key={d}
                      className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">Đang tra cứu dữ liệu...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Ô nhập liệu tự động mở rộng (Auto-expanding Textarea) */}
          <div className="px-3.5 py-3 border-t border-border shrink-0 bg-background/50">
            <div className="flex items-end gap-2 rounded-xl border border-input bg-background focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 transition-all px-3 py-2">
              <textarea
                ref={inputRef}
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground leading-relaxed max-h-32"
                placeholder="Nhập câu hỏi"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                style={{ minHeight: '24px', overflowY: 'auto' }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs mb-0.5"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <SendIcon />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/70 text-center mt-1.5">Enter để gửi · Shift+Enter xuống dòng</p>
          </div>
        </div>
      )}
    </>
  );
}
