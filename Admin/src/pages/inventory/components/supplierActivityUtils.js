// Hằng số & helper dùng chung cho các component hoạt động NCC

export function formatVnd(val) {
  return Number(val || 0).toLocaleString('vi-VN') + ' đ';
}

export function formatDateTime(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 'YYYY-MM' của tháng hiện tại (giờ máy người dùng)
export function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// 'YYYY-MM' -> { from: 'YYYY-MM-01', to: 'YYYY-MM-<ngày cuối>' }
export function monthToRange(monthValue) {
  const [y, m] = monthValue.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, '0');
  return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(lastDay).padStart(2, '0')}` };
}

const TONE = {
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  info: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  neutral: 'bg-muted text-muted-foreground border-border',
  danger: 'bg-destructive/10 text-destructive border-destructive/20',
};

const PO_STATUS = {
  draft: { label: 'Nháp', tone: TONE.neutral },
  sent: { label: 'Đã gửi NCC', tone: TONE.info },
  in_transit: { label: 'Đang vận chuyển', tone: TONE.info },
  partial_received: { label: 'Nhập một phần', tone: TONE.warning },
  arrived: { label: 'Đã đến kho', tone: TONE.info },
  inspecting: { label: 'Đang kiểm hàng', tone: TONE.warning },
  completed: { label: 'Đã nhập', tone: TONE.success },
  cancelled: { label: 'Đã hủy', tone: TONE.danger },
};

const RETURN_STATUS = {
  draft: { label: 'Nháp', tone: TONE.neutral },
  completed: { label: 'Đã trả', tone: TONE.success },
};

const PO_PAYMENT = {
  unpaid: { label: 'Chưa thanh toán', tone: TONE.warning },
  partially_paid: { label: 'Thanh toán một phần', tone: TONE.info },
  paid: { label: 'Đã thanh toán', tone: TONE.success },
};

const RETURN_PAYMENT = {
  unpaid: { label: 'Chưa nhận hoàn tiền', tone: TONE.warning },
  partially_paid: { label: 'Hoàn tiền một phần', tone: TONE.info },
  paid: { label: 'Đã nhận hoàn tiền', tone: TONE.success },
};

export function getStatusMeta(row) {
  const map = row.type === 'purchase_order' ? PO_STATUS : RETURN_STATUS;
  return map[row.status] || { label: row.status || '-', tone: TONE.neutral };
}

export function getPaymentMeta(row) {
  const map = row.type === 'purchase_order' ? PO_PAYMENT : RETURN_PAYMENT;
  return map[row.paymentStatus] || { label: row.paymentStatus || '-', tone: TONE.neutral };
}

export const ROW_TYPE_LABEL = {
  purchase_order: 'Đơn nhập',
  purchase_return: 'Đơn trả',
};
