import React, { useState } from 'react';
import { X, Building2, CreditCard, History, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SupplierGeneralInfoCard from './SupplierGeneralInfoCard';
import SupplierDebtTab from './SupplierDebtTab';
import SupplierDebtHistoryTab from './SupplierDebtHistoryTab';
import SupplierDebtCreateModal from './SupplierDebtCreateModal';
import SupplierDebtDetailModal from './SupplierDebtDetailModal';
import SupplierPaymentModal from './SupplierPaymentModal';

export default function SupplierDetailModal({
  supplier,
  open,
  onClose,
  onEditBasic,
}) {
  const [activeTab, setActiveTab] = useState('debt'); // 'debt' | 'history'
  const [createDebtOpen, setCreateDebtOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [paymentDebt, setPaymentDebt] = useState(null);

  if (!open || !supplier) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
        <div className="bg-card text-card-foreground border border-border rounded-[6px] shadow-2xl max-w-6xl w-full h-[88vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-muted/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-[4px] bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                {supplier.name?.charAt(0)?.toUpperCase() || 'N'}
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>{supplier.name}</span>
                  <span className="font-mono text-xs font-normal text-muted-foreground">
                    ({supplier.code})
                  </span>
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Chi tiết hồ sơ đối tác & quản lý công nợ tập trung
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[6px] hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content - Split 2 Cols */}
          <div className="flex-1 grid grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">
            {/* Left 4 Cols: Supplier Basic Info & Bank */}
            <div className="col-span-12 lg:col-span-4 p-5 overflow-y-auto bg-muted/10">
              <SupplierGeneralInfoCard supplier={supplier} onEditBasic={onEditBasic} />
            </div>

            {/* Right 8 Cols: Tabs & Debt Operations */}
            <div className="col-span-12 lg:col-span-8 flex flex-col overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex items-center border-b border-border px-6 pt-3 shrink-0 gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('debt')}
                  className={`pb-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                    activeTab === 'debt'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <DollarSign size={14} /> Công nợ
                  {activeTab === 'debt' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`pb-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <History size={14} /> Lịch sử công nợ
                  {activeTab === 'history' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'debt' ? (
                  <SupplierDebtTab
                    supplierId={supplier._id}
                    onOpenCreateDebt={() => setCreateDebtOpen(true)}
                    onSelectDebt={(debt) => setSelectedDebt(debt)}
                  />
                ) : (
                  <SupplierDebtHistoryTab supplierId={supplier._id} />
                )}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between shrink-0 text-xs">
            <span className="text-muted-foreground">
              Mã đối tác: <strong className="font-mono text-foreground">{supplier.code}</strong>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-[6px] h-8 text-xs font-medium"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <SupplierDebtCreateModal
        supplier={supplier}
        open={createDebtOpen}
        onClose={() => setCreateDebtOpen(false)}
      />

      <SupplierDebtDetailModal
        supplier={supplier}
        debt={selectedDebt}
        open={Boolean(selectedDebt)}
        onClose={() => setSelectedDebt(null)}
        onOpenPayment={(debt) => setPaymentDebt(debt)}
      />

      <SupplierPaymentModal
        supplier={supplier}
        debt={paymentDebt}
        open={Boolean(paymentDebt)}
        onClose={() => setPaymentDebt(null)}
      />
    </>
  );
}
