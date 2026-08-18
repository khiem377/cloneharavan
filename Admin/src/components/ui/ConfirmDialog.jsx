import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  title = 'Xác nhận',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  variant = 'danger',
}) {
  return (
    <div className="custom-modal-overlay" style={{ zIndex: 10100 }} onClick={onCancel}>
      <div className="custom-modal-box" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="custom-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: variant === 'danger' ? '#fef2f2' : '#eff6ff',
              color: variant === 'danger' ? '#dc2626' : '#2563eb',
              display: 'flex', alignItems: 'center', justify: 'center', flexShrink: 0
            }}>
              <AlertTriangle size={17} />
            </div>
            <h3 className="custom-modal-title" style={{ fontSize: 15 }}>{title}</h3>
          </div>
          <button className="custom-modal-close" onClick={onCancel}><X size={16} /></button>
        </div>

        <div className="custom-modal-body" style={{ padding: '16px 20px', fontSize: 13.5, color: '#334155', lineHeight: 1.5 }}>
          {message}
        </div>

        <div className="custom-modal-footer">
          <button type="button" className="btn-ghost-sm" onClick={onCancel}>Hủy</button>
          <button
            type="button"
            className={variant === 'danger' ? 'btn-danger-sm' : 'btn-primary-sm'}
            onClick={onConfirm}
            style={variant === 'danger' ? { background: '#dc2626', color: '#fff' } : {}}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
