import React from 'react';
import { Trash2, ChevronDown, ChevronUp, Loader2, Save } from '@/components/ui/Icons';
import MediaPickerModal from '@/components/ui/MediaPickerModal';
import { useVariantManagerState } from './variant-manager/useVariantManagerState';
import OptionBuilder from './variant-manager/OptionBuilder';
import VariantRow from './variant-manager/VariantRow';
import VariantBulkBar from './variant-manager/VariantBulkBar';
import { GenerateConfirmDialog, DeleteConfirmDialog } from './variant-manager/VariantDialogs';

export default function VariantManager({
  productId,
  options = [],
  onOptionsChange,
  basePrice = 0,
  baseSalePrice = 0,
  parentSku = '',
}) {
  const {
    showOptions,
    setShowOptions,
    serverVariants,
    isLoading,
    bulkCreateMut,
    deleteAllMut,
    locals,
    dirtyLocals,
    pickerMode,
    setPickerMode,
    deleteTarget,
    setDeleteTarget,
    generateConfirm,
    setGenerateConfirm,
    isSaving,
    pickedMediaObjects,
    updateLocal,
    setAllField,
    handleEdit,
    handlePickImage,
    handlePickGallery,
    handleImageSelected,
    removeGalleryImage,
    handleGenerateRequest,
    doGenerate,
    handleDeleteConfirm,
    handleDeleteAll,
    handleSaveAll,
  } = useVariantManagerState({ productId, parentSku });

  if (!productId) {
    return (
      <div className="rounded-[6px] border border-dashed border-border bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">Lưu sản phẩm trước để quản lý biến thể</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[6px] border border-border bg-card shadow-xs">
        <button
          type="button"
          className="flex items-center justify-between w-full px-5 py-3.5 cursor-pointer"
          onClick={() => setShowOptions((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">Thuộc tính biến thể</h4>
            {options.length > 0 && (
              <span className="rounded-[6px] bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 border border-primary/20 tabular-nums font-mono">
                {options.length} thuộc tính
              </span>
            )}
          </div>
          {showOptions ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </button>

        {showOptions && (
          <div className="border-t border-border px-5 py-4">
            <OptionBuilder
              options={options}
              onChange={onOptionsChange}
              parentSku={parentSku}
              onGenerate={handleGenerateRequest}
              hasVariants={serverVariants.length > 0}
              isGenerating={bulkCreateMut.isPending || deleteAllMut.isPending}
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10 gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Đang tải biến thể...
        </div>
      ) : locals.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium text-foreground">Chưa có biến thể nào</p>
          <p className="text-xs text-muted-foreground mt-1">Thêm thuộc tính ở trên và nhấn "Tạo biến thể" để tạo tự động</p>
        </div>
      ) : (
        <div className="rounded-[6px] border border-border bg-card shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground tabular-nums font-mono">{locals.length} biến thể</span>
              {dirtyLocals.length > 0 && (
                <span className="rounded-[6px] bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-semibold px-2 py-0.5 tabular-nums font-mono">
                  {dirtyLocals.length} chưa lưu
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {dirtyLocals.length > 0 && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 h-8 px-4 rounded-[6px] bg-primary text-primary-foreground text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-[0.98]"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Lưu {dirtyLocals.length} thay đổi
                </button>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-destructive/30 text-destructive text-xs cursor-pointer hover:bg-destructive/10 transition-colors disabled:opacity-50 active:scale-[0.98]"
                onClick={() => setDeleteTarget('all')}
                disabled={deleteAllMut.isPending}
              >
                {deleteAllMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Xóa tất cả
              </button>
            </div>
          </div>

          <VariantBulkBar onSetAll={setAllField} />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-24">Ảnh / Bộ ảnh</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Biến thể</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-32">SKU</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-28 text-right">Giá niêm yết</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-28 text-right">Giá KM</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-20 text-center">Tồn kho</th>
                  <th className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-14 text-center">Hiện</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {locals.map((local) => (
                  <VariantRow
                    key={local._rowId}
                    local={local}
                    mediaObjects={pickedMediaObjects}
                    onChange={(patch) => updateLocal(local._rowId, patch)}
                    onPickImage={handlePickImage}
                    onPickGallery={handlePickGallery}
                    onRemoveImage={removeGalleryImage}
                    onDelete={setDeleteTarget}
                    onEdit={handleEdit}
                    basePrice={basePrice}
                    baseSalePrice={baseSalePrice}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-2 border-t border-border bg-muted/10">
            <p className="text-[10px] text-muted-foreground">
              Click vào ô bất kỳ để chỉnh sửa trực tiếp · Ô giá trống = kế thừa từ sản phẩm gốc · Ô vàng = có thay đổi chưa lưu
            </p>
          </div>
        </div>
      )}

      {pickerMode && (
        <MediaPickerModal
          isMultiple={pickerMode.type === 'images'}
          onSelect={handleImageSelected}
          onClose={() => setPickerMode(null)}
        />
      )}

      {deleteTarget && deleteTarget !== 'all' && (
        <DeleteConfirmDialog
          message={`Xóa biến thể "${deleteTarget.displayName || deleteTarget.sku}"? Không thể hoàn tác.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleteTarget === 'all' && (
        <DeleteConfirmDialog
          message={`Xóa toàn bộ ${locals.length} biến thể? Không thể hoàn tác.`}
          onConfirm={handleDeleteAll}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {generateConfirm && (
        <GenerateConfirmDialog
          existingCount={serverVariants.length}
          newCount={generateConfirm.count}
          onReplace={() => doGenerate(generateConfirm.validOptions, true)}
          onAppend={() => doGenerate(generateConfirm.validOptions, false)}
          onCancel={() => setGenerateConfirm(null)}
        />
      )}
    </div>
  );
}
