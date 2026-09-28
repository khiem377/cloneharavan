import { useState, useCallback } from 'react';

/**
 * useModalSet — generic hook để quản lý nhiều modal/drawer state.
 *
 * Thay thế pattern:
 *   const [detailOpen, setDetailOpen] = useState(false);
 *   const [selectedItem, setSelectedItem] = useState(null);
 *   const [confirmOpen, setConfirmOpen] = useState(false);
 *   ...
 *
 * Sử dụng:
 *   const modal = useModalSet(['detail', 'confirm', 'excelPreview', 'sendPO']);
 *
 *   // Mở modal với data
 *   modal.open('detail', { id: '123', name: 'Test' })
 *   // Đóng modal
 *   modal.close('detail')
 *   // Kiểm tra open/data
 *   modal.isOpen('detail')     → boolean
 *   modal.data('detail')       → any
 *   // Shorthand props cho components
 *   modal.props('detail')      → { open: boolean, data: any, onClose: fn }
 *
 * @param {string[]} keys — danh sách key của các modal
 */
export function useModalSet(keys) {
  const initial = Object.fromEntries(keys.map((k) => [k, { open: false, data: null }]));
  const [state, setState] = useState(initial);

  const open = useCallback((key, data = null) => {
    setState((prev) => ({ ...prev, [key]: { open: true, data } }));
  }, []);

  const close = useCallback((key) => {
    setState((prev) => ({ ...prev, [key]: { open: false, data: null } }));
  }, []);

  const isOpen = useCallback((key) => state[key]?.open ?? false, [state]);

  const getData = useCallback((key) => state[key]?.data ?? null, [state]);

  const props = useCallback(
    (key) => ({
      open: state[key]?.open ?? false,
      data: state[key]?.data ?? null,
      onClose: () => close(key),
    }),
    [state, close]
  );

  return { open, close, isOpen, data: getData, props, state };
}

export default useModalSet;
