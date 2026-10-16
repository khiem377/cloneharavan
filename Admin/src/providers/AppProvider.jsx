import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './ToastProvider';
import { CommonOptionsProvider } from './CommonOptionsProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 phút không coi dữ liệu là cũ
      gcTime: 15 * 60 * 1000,    // Giữ cache trong 15 phút
    },
  },
});

export default function AppProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CommonOptionsProvider>
          {children}
        </CommonOptionsProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
