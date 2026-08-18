import AppProvider from '@/providers/AppProvider';
import AppRouter from '@/router';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
