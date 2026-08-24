import React from 'react';
import useAuthStore from '../../store/authStore';

/**
 * Can Component - Wrapper kiểm tra quyền hiển thị UI
 * @param {string} props.do - Mã quyền cần có (ví dụ: "product.create")
 * @param {string[]} props.any - Mảng các mã quyền (chỉ cần có 1 trong số đó)
 * @param {React.ReactNode} props.fallback - Giao diện hiển thị khi không có quyền (mặc định: null)
 * @param {React.ReactNode} props.children - Giao diện hiển thị khi có đủ quyền
 */
const Can = ({ do: permCode, any: permCodes, fallback = null, children }) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);

  let allowed = false;

  if (permCode) {
    allowed = hasPermission(permCode);
  } else if (permCodes && permCodes.length > 0) {
    allowed = hasAnyPermission(permCodes);
  } else {
    allowed = true; // Không truyền perm -> cho phép render
  }

  if (!allowed) return fallback;

  return <>{children}</>;
};

export default Can;
