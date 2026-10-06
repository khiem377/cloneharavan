/**
 * Auth Group Layout — không có Header, Footer, Chatbot
 * Dùng cho: /login, /register, /forgot-password, /reset-password
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {children}
    </div>
  );
}
