import React from 'react';
import { Loader2 } from '@/components/ui/Icons';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useFlashSaleForm } from './components/flash-sale/useFlashSaleForm';
import FlashSaleBasicFields from './components/flash-sale/FlashSaleBasicFields';
import FlashSaleBulkActionBar from './components/flash-sale/FlashSaleBulkActionBar';
import FlashSaleProductSearch from './components/flash-sale/FlashSaleProductSearch';
import FlashSaleItemsTable from './components/flash-sale/FlashSaleItemsTable';

export default function FlashSaleFormModal({ flashSale, onClose, onSuccess }) {
  const {
    isEdit,
    name,
    setName,
    description,
    setDescription,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isActive,
    setIsActive,
    banner,
    setBanner,
    showMediaPicker,
    setShowMediaPicker,
    items,
    productSearch,
    setProductSearch,
    searchResults,
    searching,
    showProductDropdown,
    setShowProductDropdown,
    saving,
    bulkDiscountType,
    setBulkDiscountType,
    bulkDiscountValue,
    setBulkDiscountValue,
    handleSelectProduct,
    handleSelectVariant,
    handleDiscountTypeChange,
    handleDiscountValueChange,
    handleStockChange,
    handleApplyBulkDiscount,
    handleRemoveItem,
    handleSubmit,
  } = useFlashSaleForm({ flashSale, onClose, onSuccess });

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="w-[95vw] max-w-5xl lg:max-w-6xl max-h-[92vh] flex flex-col p-0 rounded-[6px] border border-border">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">
              {isEdit ? 'Chỉnh sửa Flash Sale' : 'Tạo chương trình Flash Sale mới'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <FlashSaleBasicFields
              name={name}
              setName={setName}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              description={description}
              setDescription={setDescription}
              banner={banner}
              onOpenMediaPicker={() => setShowMediaPicker(true)}
              isActive={isActive}
              setIsActive={setIsActive}
            />

            <div className="border-t border-border pt-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Danh sách sản phẩm Flash Sale ({items.length})
                </h3>

                {items.length > 0 && (
                  <FlashSaleBulkActionBar
                    bulkDiscountType={bulkDiscountType}
                    setBulkDiscountType={setBulkDiscountType}
                    bulkDiscountValue={bulkDiscountValue}
                    setBulkDiscountValue={setBulkDiscountValue}
                    onApplyBulkDiscount={handleApplyBulkDiscount}
                  />
                )}
              </div>

              <FlashSaleProductSearch
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                showProductDropdown={showProductDropdown}
                setShowProductDropdown={setShowProductDropdown}
                searching={searching}
                searchResults={searchResults}
                onSelectProduct={handleSelectProduct}
                onSelectVariant={handleSelectVariant}
              />

              <FlashSaleItemsTable
                items={items}
                onDiscountTypeChange={handleDiscountTypeChange}
                onDiscountValueChange={handleDiscountValueChange}
                onStockChange={handleStockChange}
                onRemoveItem={handleRemoveItem}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border flex items-center justify-end gap-2 bg-transparent">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={saving}
                className="h-9 rounded-[6px]"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-9 rounded-[6px] active:scale-[0.98] transition-transform"
              >
                {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
                {isEdit ? 'Cập nhật Flash Sale' : 'Tạo Flash Sale'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showMediaPicker && (
        <MediaPickerModal
          onSelect={(item) => {
            setBanner(item);
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </>
  );
}
