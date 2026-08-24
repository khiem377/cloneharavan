import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './ToastProvider';
import { CommonOptionsProvider } from './CommonOptionsProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
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
