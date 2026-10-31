import { useState } from 'react';
import { X, History, DollarSign, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupplierActivity } from '@/hooks/useSuppliers';
import SupplierGeneralInfoCard from './SupplierGeneralInfoCard';
import SupplierAssignmentCard from './SupplierAssignmentCard';
import SupplierActivityStats from './SupplierActivityStats';
import SupplierActivityTab from './SupplierActivityTab';
import SupplierDebtTab from './SupplierDebtTab';
import SupplierDebtHistoryTab from './SupplierDebtHistoryTab';
import SupplierDebtCreateModal from './SupplierDebtCreateModal';
import SupplierDebtDetailModal from './SupplierDebtDetailModal';
import SupplierPaymentModal from './SupplierPaymentModal';
import { monthToRange } from './supplierActivityUtils';

const TABS = [
  { id: 'activity', label: 'Nhập / trả hàng', Icon: Truck },
  { id: 'debt', label: 'Công nợ', Icon: DollarSign },
  { id: 'history', label: 'Lịch sử công nợ', Icon: History },
];

const ACTIVITY_PAGE_SIZE = 10;

export default function SupplierDetailModal({
  supplier: supplierProp,
  open,
  onClose,
  onEditBasic,
}) {
  const [supplier, setSupplier] = useState(supplierProp);
  const [activeTab, setActiveTab] = useState('activity');
  const [createDebtOpen, setCreateDebtOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [paymentDebt, setPaymentDebt] = useState(null);
  const [month, setMonth] = useState(''); // '' = tất cả thời gian
  const [activityPage, setActivityPage] = useState(1);

  const range = month ? monthToRange(month) : {};
  const activityQuery = useSupplierActivity(supplier?._id, {
    ...range,
    page: activityPage,
    limit: ACTIVITY_PAGE_SIZE,
  });

  if (!open || !supplier) return null;

  const handleMonthChange = (value) => {
    setMonth(value);
    setActivityPage(1);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
        <div className="bg-card text-card-foreground border border-border rounded-[6px] shadow-sm max-w-6xl w-full h-[88vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-muted/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
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
                  Chi tiết hồ sơ đối tác &amp; quản lý công nợ tập trung
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[6px] hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 grid grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">
            {/* Left 4 Cols: Supplier Basic Info, Bank, Staff & Tags */}
            <div className="col-span-12 lg:col-span-4 p-5 overflow-y-auto bg-muted/10">
              <SupplierGeneralInfoCard supplier={supplier} onEditBasic={onEditBasic} />
              <SupplierAssignmentCard supplier={supplier} onSaved={setSupplier} />
            </div>

            {/* Right 8 Cols: Stats, Tabs & Operations */}
            <div className="col-span-12 lg:col-span-8 flex flex-col overflow-hidden">
              <SupplierActivityStats
                stats={activityQuery.data?.stats}
                month={month}
                onMonthChange={handleMonthChange}
                isLoading={activityQuery.isLoading}
              />

              {/* Tab Navigation */}
              <div className="flex items-center border-b border-border px-6 pt-3 shrink-0 gap-6">
                {TABS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`pb-2.5 text-xs font-bold transition-colors relative flex items-center gap-1.5 ${
                      activeTab === id
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon size={14} /> {label}
                    {activeTab === id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'activity' && (
                  <SupplierActivityTab
                    data={activityQuery.data}
                    isLoading={activityQuery.isLoading}
                    isError={activityQuery.isError}
                    onRetry={() => activityQuery.refetch()}
                    page={activityPage}
                    onPageChange={setActivityPage}
                  />
                )}
                {activeTab === 'debt' && (
                  <SupplierDebtTab
                    supplierId={supplier._id}
                    onOpenCreateDebt={() => setCreateDebtOpen(true)}
                    onSelectDebt={(debt) => setSelectedDebt(debt)}
                  />
                )}
                {activeTab === 'history' && <SupplierDebtHistoryTab supplierId={supplier._id} />}
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
