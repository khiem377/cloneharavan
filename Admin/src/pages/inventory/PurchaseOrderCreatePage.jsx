import React from 'react';
import { FileCheck, ArrowLeft } from '@/components/ui/Icons';
import { Button } from '@/components/ui/button';
import { usePOCreateForm } from './components/po-create/usePOCreateForm';
import POStepperBar from './components/po-create/POStepperBar';
import POSupplierInfoCard from './components/po-create/POSupplierInfoCard';
import POProductItemsCard from './components/po-create/POProductItemsCard';
import POExcelPreviewCard from './components/po-create/POExcelPreviewCard';
import POConfirmationCard from './components/po-create/POConfirmationCard';

export default function PurchaseOrderCreatePage() {
  const {
    navigate,
    currentStep,
    setCurrentStep,
    supplierId,
    setSupplierId,
    warehouseId,
    setWarehouseId,
    warehouses,
    note,
    setNote,
    deliveryDate,
    setDeliveryDate,
    productSearch,
    setProductSearch,
    items,
    subType,
    setSubType,
    referenceDoc,
    setReferenceDoc,
    excelHtml,
    loadingExcel,
    suppliers,
    selectedSupplier,
    searchResults,
    isSearching,
    createPOMutation,
    totalQuantity,
    totalAmount,
    handleAutoFillReceiveAll,
    handleAddProductOrVariant,
    handleUpdateItem,
    handleRemoveItem,
    handleGoToStep2,
    handleSubmit,
  } = usePOCreateForm();

  const canProceedToStep2 = Boolean(supplierId && items.length > 0);

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/purchase-orders')}
            className="h-9 w-9 rounded-[6px] border-border text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              Tạo Đơn Nhập Kho Mới
            </h1>
            <p className="text-xs text-muted-foreground">
              Quy trình 3 bước chuẩn hoá: Lập đơn -&gt; Xem trước bảng kê Excel -&gt; Xác nhận chốt đơn
            </p>
          </div>
        </div>
      </div>

      <POStepperBar
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        canProceedToStep2={canProceedToStep2}
        onGoToStep2={handleGoToStep2}
      />

      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <POSupplierInfoCard
              subType={subType}
              setSubType={setSubType}
              supplierId={supplierId}
              setSupplierId={setSupplierId}
              suppliers={suppliers}
              warehouseId={warehouseId}
              setWarehouseId={setWarehouseId}
              warehouses={warehouses}
              referenceDoc={referenceDoc}
              setReferenceDoc={setReferenceDoc}
              deliveryDate={deliveryDate}
              setDeliveryDate={setDeliveryDate}
              note={note}
              setNote={setNote}
              itemCount={items.length}
              totalQuantity={totalQuantity}
              totalAmount={totalAmount}
            />

            <POProductItemsCard
              items={items}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              searchResults={searchResults}
              isSearching={isSearching}
              onAddProductOrVariant={handleAddProductOrVariant}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
              onAutoFillReceiveAll={handleAutoFillReceiveAll}
              onGoToStep2={handleGoToStep2}
            />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <POExcelPreviewCard
          excelHtml={excelHtml}
          loadingExcel={loadingExcel}
          onBackToStep1={() => setCurrentStep(1)}
          onGoToStep3={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 3 && (
        <POConfirmationCard
          selectedSupplier={selectedSupplier}
          deliveryDate={deliveryDate}
          itemCount={items.length}
          totalQuantity={totalQuantity}
          totalAmount={totalAmount}
          onBackToStep2={() => setCurrentStep(2)}
          onSubmit={handleSubmit}
          isPending={createPOMutation.isPending}
        />
      )}

      <style>{`
        .excel-wizard-preview table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Times New Roman', serif, sans-serif;
          font-size: 13px;
        }
        .excel-wizard-preview td, .excel-wizard-preview th {
          border: 1px solid var(--border, #e2e8f0);
          padding: 8px 12px;
          min-width: 80px;
          white-space: pre-wrap;
        }
        .excel-wizard-preview tr:nth-child(even) {
          background-color: rgba(0,0,0, 0.02);
        }
      `}</style>
    </div>
  );
}
