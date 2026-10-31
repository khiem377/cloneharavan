import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComboForm } from './components/combo-form/useComboForm';
import ComboBasicInfoSection from './components/combo-form/ComboBasicInfoSection';
import ComboProductSearchSection from './components/combo-form/ComboProductSearchSection';
import ComboItemsTable from './components/combo-form/ComboItemsTable';
import ComboPricingSection from './components/combo-form/ComboPricingSection';

export default function ComboFormModal({ isOpen, onClose, initialData = null, onSuccess }) {
  if (!isOpen) return null;

  const form = useComboForm({ initialData, onSuccess, onClose });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-5xl xl:max-w-6xl rounded-[6px] border border-border bg-card text-card-foreground shadow-sm flex flex-col max-h-[92vh] overflow-hidden my-auto">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {form.isEditing ? 'Chỉnh sửa combo' : 'Tạo combo sản phẩm'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Đóng gói sản phẩm thành gói ưu đãi, tính tồn kho động & định giá
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!form.isCustomCode ? (
              <button
                type="button"
                onClick={() => form.setIsCustomCode(true)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-primary/20 bg-primary/5 cursor-pointer active:scale-[0.98] transition-transform"
              >
                # Nhập mã tùy chỉnh
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="MÃ COMBO..."
                  value={form.code}
                  onChange={(e) => form.setCode(e.target.value.toUpperCase())}
                  className="h-7 w-32 px-2 text-xs font-mono uppercase bg-background rounded-[6px] border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    form.setIsCustomCode(false);
                    form.setCode('');
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  title="Để hệ thống tự sinh mã"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <ComboBasicInfoSection
            name={form.name}
            setName={form.setName}
            startDate={form.startDate}
            setStartDate={form.setStartDate}
            endDate={form.endDate}
            setEndDate={form.setEndDate}
            isUnlimitedTime={form.isUnlimitedTime}
            setIsUnlimitedTime={form.setIsUnlimitedTime}
            usageLimit={form.usageLimit}
            setUsageLimit={form.setUsageLimit}
            description={form.description}
            setDescription={form.setDescription}
          />

          <div className="border-t border-border" />

          <ComboProductSearchSection
            searchQuery={form.searchQuery}
            setSearchQuery={form.setSearchQuery}
            isSearchOpen={form.isSearchOpen}
            setIsSearchOpen={form.setIsSearchOpen}
            isSearching={form.isSearching}
            searchResults={form.searchResults}
            handleSelectProduct={form.handleSelectProduct}
            suggestedBundles={form.suggestedBundles}
            setSuggestedBundles={form.setSuggestedBundles}
            handleApplyBundle={form.handleApplyBundle}
            selectedItemsCount={form.selectedItems.length}
          />

          <ComboItemsTable
            selectedItems={form.selectedItems}
            virtualStock={form.virtualStock}
            limitingProduct={form.limitingProduct}
            handleQuantityChange={form.handleQuantityChange}
            handleRemoveItem={form.handleRemoveItem}
            totalOriginalPrice={form.totalOriginalPrice}
            handleLoadAiBundles={form.handleLoadAiBundles}
            isAiSuggestingBundles={form.isAiSuggestingBundles}
          />

          <div className="border-t border-border" />

          <ComboPricingSection
            pricingStrategy={form.pricingStrategy}
            setPricingStrategy={form.setPricingStrategy}
            discountType={form.discountType}
            setDiscountType={form.setDiscountType}
            discountValue={form.discountValue}
            setDiscountValue={form.setDiscountValue}
            comboPriceInput={form.comboPriceInput}
            setComboPriceInput={form.setComboPriceInput}
            totalOriginalPrice={form.totalOriginalPrice}
            finalComboPrice={form.finalComboPrice}
            savingsAmount={form.savingsAmount}
            savingsPercent={form.savingsPercent}
            handleTriggerAiSuggestion={form.handleTriggerAiSuggestion}
            isAiSuggestingPricing={form.isAiSuggestingPricing}
            selectedItemsCount={form.selectedItems.length}
            aiSuggestionData={form.aiSuggestionData}
            setAiSuggestionData={form.setAiSuggestionData}
            handleApplyAiName={form.handleApplyAiName}
            handleApplyAiOption={form.handleApplyAiOption}
          />
        </form>

        <div className="flex items-center justify-end gap-2.5 border-t border-border px-6 py-3.5 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-[6px] text-xs h-8"
            disabled={form.isSubmitting}
          >
            Hủy
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={form.handleSubmit}
            disabled={form.isSubmitting || form.selectedItems.length < 2}
            className="rounded-[6px] text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform font-semibold"
          >
            {form.isSubmitting ? 'Đang lưu...' : form.isEditing ? 'Cập nhật combo' : 'Tạo combo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
