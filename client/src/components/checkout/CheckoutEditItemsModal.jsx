'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function CheckoutEditItemsModal({
  isOpen = false,
  onClose,
  items = [],
  selectedItemIds = [],
  onToggleSelect,
  onUpdateQuantity,
  onRemoveItem,
  onRefreshPreview,
  formatPrice,
}) {
  const [updatingId, setUpdatingId] = useState(null);

  const { singleItems, comboGroups } = useMemo(() => {
    const singles = [];
    const combos = {};
    (items || []).forEach((item) => {
      const isCombo = Boolean(item.isComboItem || item.comboName || item.comboId);
      if (isCombo) {
        const key = item.comboId || item.comboName || 'default_combo';
        if (!combos[key]) {
          combos[key] = { comboId: item.comboId, comboName: item.comboName || 'Gói Combo Ưu Đãi', items: [] };
        }
        combos[key].items.push(item);
      } else {
        singles.push(item);
      }
    });
    return { singleItems: singles, comboGroups: Object.values(combos) };
  }, [items]);

  if (!isOpen) return null;

  const handleQtyChange = async (itemId, newQty) => {
    if (newQty < 1 || updatingId) return;
    setUpdatingId(itemId);
    try {
      if (onUpdateQuantity) await onUpdateQuantity(itemId, newQty);
      if (onRefreshPreview) await onRefreshPreview();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    if (updatingId) return;
    setUpdatingId(itemId);
    try {
      if (onRemoveItem) await onRemoveItem(itemId);
      if (onRefreshPreview) await onRefreshPreview();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggle = (itemId) => {
    if (onToggleSelect) {
      onToggleSelect(itemId);
      if (onRefreshPreview) setTimeout(() => onRefreshPreview(), 50);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50">
      <div className="bg-white border border-slate-200 rounded-[6px] shadow-sm max-w-2xl w-full flex flex-col max-h-[90vh] animate-fadeIn">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Chỉnh sửa sản phẩm trong đơn</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tăng giảm số lượng hoặc bỏ chọn sản phẩm bạn chưa muốn mua</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-[4px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer" aria-label="Đóng modal">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3.5 divide-y divide-slate-100 flex-1">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Giỏ hàng hiện chưa có sản phẩm nào</div>
          ) : (
            <>
              {comboGroups.map((group, gIdx) => {
                const isGroupSelected = group.items.some((it) => selectedItemIds.includes(it._id));
                const firstItem = group.items[0];
                return (
                  <div key={`modal-combo-${gIdx}`} className="pt-3 first:pt-0 space-y-2">
                    <div className="p-3 rounded-[6px] border border-emerald-200 bg-emerald-50/40 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isGroupSelected} onChange={() => firstItem && handleToggle(firstItem._id)} className="h-4 w-4 rounded-[4px] cursor-pointer" />
                          <span className="text-xs font-bold text-emerald-800">Gói combo: {group.comboName}</span>
                        </div>
                        <button type="button" onClick={() => firstItem && handleRemove(firstItem._id)} disabled={updatingId === firstItem?._id} className="text-[11px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer">
                          <Trash2 size={12} /><span>Xóa combo</span>
                        </button>
                      </div>
                      <div className="divide-y divide-emerald-100/70">
                        {group.items.map((item) => (
                          <div key={item._id} className="py-2 first:pt-0 last:pb-0 flex items-center gap-3 text-xs">
                            <div className="w-11 h-11 rounded-[4px] border border-slate-200 bg-white overflow-hidden shrink-0">
                              <img src={item.thumbnail || '/logo-shop.jpg'} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                              <p className="text-[11px] text-emerald-700 font-mono font-bold mt-0.5">{formatPrice(item.unitPrice || item.comboPrice || 0)}</p>
                            </div>
                            <div className="flex items-center border border-slate-300 rounded-[4px] bg-white shrink-0">
                              <button type="button" onClick={() => handleQtyChange(item._id, item.quantity - 1)} disabled={item.quantity <= 1 || updatingId === item._id} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"><Minus size={12} /></button>
                              <span className="w-8 text-center font-mono font-bold text-xs tabular-nums text-slate-900">{item.quantity}</span>
                              <button type="button" onClick={() => handleQtyChange(item._id, item.quantity + 1)} disabled={updatingId === item._id} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"><Plus size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {singleItems.map((item) => (
                <div key={item._id} className="pt-3 first:pt-0 flex items-center gap-3 text-xs">
                  <Checkbox checked={selectedItemIds.includes(item._id)} onChange={() => handleToggle(item._id)} className="h-4 w-4 rounded-[4px] cursor-pointer shrink-0" />
                  <div className="w-11 h-11 rounded-[4px] border border-slate-200 bg-white overflow-hidden shrink-0">
                    <img src={item.thumbnail || '/logo-shop.jpg'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                    {item.variantName && !['mặc định', 'default'].includes(item.variantName.toLowerCase()) && (
                      <p className="text-[11px] text-slate-500 font-sans">{item.variantName}</p>
                    )}
                    <p className="text-xs font-bold text-slate-900 font-mono tabular-nums mt-0.5">{formatPrice(item.unitPrice || 0)}</p>
                  </div>
                  <div className="flex items-center border border-slate-300 rounded-[4px] bg-white shrink-0">
                    <button type="button" onClick={() => handleQtyChange(item._id, item.quantity - 1)} disabled={item.quantity <= 1 || updatingId === item._id} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"><Minus size={12} /></button>
                    <span className="w-8 text-center font-mono font-bold text-xs tabular-nums text-slate-900">{item.quantity}</span>
                    <button type="button" onClick={() => handleQtyChange(item._id, item.quantity + 1)} disabled={updatingId === item._id} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"><Plus size={12} /></button>
                  </div>
                  <button type="button" onClick={() => handleRemove(item._id)} disabled={updatingId === item._id} className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Xóa món này khỏi giỏ"><Trash2 size={15} /></button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
          <Link href="/cart" onClick={onClose} className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1">
            <span>Trang giỏ hàng đầy đủ</span><ArrowRight size={13} />
          </Link>
          <Button type="button" onClick={async () => { if (onRefreshPreview) await onRefreshPreview(); onClose(); }} disabled={Boolean(updatingId)} className="h-9 px-4 text-xs font-bold bg-[#e30019] hover:bg-[#c40015] text-white rounded-[6px] cursor-pointer">
            <span>Xong & Cập nhật đơn hàng</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
