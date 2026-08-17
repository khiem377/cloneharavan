import { createContext, useContext, useRef } from 'react';
import { useToast } from '@astryxdesign/core';
import { ToastViewport } from '@astryxdesign/core/dist/Toast/ToastViewport';

const ToastContext = createContext(null);


function ToastBridge({ children }) {
  const showToast = useToast();
  const ref = useRef(showToast);
  ref.current = showToast;


  if (typeof window !== 'undefined') {
    window.__astryx_toast__ = (opts) => ref.current(opts);
  }

  return <ToastContext.Provider value={showToast}>{children}</ToastContext.Provider>;
}

export function ToastProvider({ children }) {
  return (

    <ToastViewport position="topEnd" maxVisible={4} inset={{ top: 16, end: 16 }}>
      <ToastBridge>{children}</ToastBridge>
    </ToastViewport>
  );
}


export function useAppToast() {
  return useContext(ToastContext);
}



export const toast = {
  success: (message) =>
    window.__astryx_toast__?.({ body: message, type: 'info', autoHideDuration: 2500 }),
  error: (message) =>
    window.__astryx_toast__?.({ body: message, type: 'error', autoHideDuration: 3000 }),
  info: (message) =>
    window.__astryx_toast__?.({ body: message, type: 'info', autoHideDuration: 2500 }),
};
