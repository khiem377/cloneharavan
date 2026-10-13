import React, { useState } from 'react';
import { Building2, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DataTablePagination from '@/components/ui/DataTablePagination';
import SupplierDebtRowDetail from './SupplierDebtRowDetail';

export default function SupplierTable({
  suppliers = [],
  isLoading = false,
  isColumnVisible,
  visibleCount = 10,
  onViewDetail,
  onEdit,
  onDelete,
  totalDebt = 0,
  page = 1,
  pageSize = 10,
  pagination = { total: 0, totalPages: 1 },
  onPageChange,
  onPageSizeChange,
}) {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (supId) => {
    setExpandedIds((prev) => ({
      ...prev,
      [supId]: !prev[supId],
    }));
  };
  return (
    <Card className="rounded-[6px] border border-border overflow-hidden shadow-xs bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/60 font-bold text-muted-foreground uppercase text-[11px]">
              {isColumnVisible('name') && <th className="py-3 px-3.5 whitespace-nowrap">Tên Nhà Cung Cấp</th>}
              {isColumnVisible('code') && <th className="py-3 px-3.5 whitespace-nowrap">Mã NCC</th>}
              {isColumnVisible('supplierType') && <th className="py-3 px-3.5 whitespace-nowrap">Loại NCC</th>}
              {isColumnVisible('phone') && <th className="py-3 px-3.5 whitespace-nowrap">Số Điện Thoại</th>}
              {isColumnVisible('debt') && <th className="py-3 px-3.5 whitespace-nowrap text-right">Nợ Cần Trả Hiện Tại</th>}
              {isColumnVisible('totalPurchase') && <th className="py-3 px-3.5 whitespace-nowrap text-right">Tổng Mua</th>}
              {isColumnVisible('address') && <th className="py-3 px-3.5 whitespace-nowrap">Địa Chỉ</th>}
              {isColumnVisible('bank') && <th className="py-3 px-3.5 whitespace-nowrap">Tài Khoản Ngân Hàng</th>}
              {isColumnVisible('status') && <th className="py-3 px-3.5 whitespace-nowrap text-center">Trạng Thái</th>}
              {isColumnVisible('actions') && <th className="py-3 px-3.5 text-right whitespace-nowrap">Thao Tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={visibleCount} className="py-12 text-center text-xs text-muted-foreground">
                  Đang tải danh sách nhà cung cấp...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={visibleCount} className="py-12 text-center text-xs text-muted-foreground">
                  <Building2 className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                  Không tìm thấy nhà cung cấp nào. Nhấn "Thêm nhà cung cấp" để bắt đầu.
                </td>
              </tr>
            ) : (
              suppliers.map((sup) => {
                const bInfo = sup.bankInfo || {};
                const isActive = sup.isActive !== false && sup.status !== 'inactive';

                return (
                  <React.Fragment key={sup._id}>
                    <tr className="hover:bg-muted/30 transition-colors align-middle">
                    {/* Tên NCC & Avatar */}
                    {isColumnVisible('name') && (
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          {sup.image ? (
                            <img
                              src={sup.image}
                              alt={sup.name}
                              className="size-8 rounded-[4px] object-cover border border-border shrink-0 bg-muted"
                            />
                          ) : (
                            <div className="size-8 rounded-[4px] bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                              {sup.name?.charAt(0)?.toUpperCase() || 'N'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p
                              className="font-bold text-foreground text-xs hover:text-primary transition-colors cursor-pointer"
                              onClick={() => (onViewDetail ? onViewDetail(sup) : onEdit(sup))}
                            >
                              {sup.name}
                            </p>
                            {sup.email && (
                              <p className="text-[11px] text-muted-foreground truncate">{sup.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Mã NCC */}
                    {isColumnVisible('code') && (
                      <td className="py-3 px-3.5 font-mono text-xs font-bold text-primary whitespace-nowrap">
                        <span
                          onClick={() => (onViewDetail ? onViewDetail(sup) : onEdit(sup))}
                          className="rounded-[4px] bg-primary/10 border border-primary/20 px-2 py-0.5 cursor-pointer hover:bg-primary/20 transition-colors"
                        >
                          {sup.code}
                        </span>
                      </td>
                    )}

                    {/* Loại NCC */}
                    {isColumnVisible('supplierType') && (
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <Badge variant="outline" className="rounded-[4px] px-2 py-0.5 text-[11px] font-medium bg-muted/60">
                          {sup.supplierType || 'Sản phẩm'}
                        </Badge>
                      </td>
                    )}

                    {/* Số điện thoại */}
                    {isColumnVisible('phone') && (
                      <td className="py-3 px-3.5 font-mono tabular-nums text-xs whitespace-nowrap">
                        {sup.phone ? (
                          <span className="text-foreground">{sup.phone}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    )}

                    {/* Nợ cần trả hiện tại */}
                    {isColumnVisible('debt') && (
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-xs whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className={sup.debt > 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                            {(sup.debt || 0).toLocaleString('vi-VN')} đ
                          </span>
                          {sup.unpaidDebts?.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(sup._id);
                              }}
                              className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline font-semibold mt-0.5 cursor-pointer"
                              title="Bấm để xem danh sách đơn nợ cụ thể"
                            >
                              <span>{sup.unpaidDebts.length} đơn</span>
                              {expandedIds[sup._id] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Tổng mua */}
                    {isColumnVisible('totalPurchase') && (
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-xs whitespace-nowrap text-foreground">
                        {(sup.totalPurchase || 0).toLocaleString('vi-VN')} đ
                      </td>
                    )}

                    {/* Địa chỉ */}
                    {isColumnVisible('address') && (
                      <td className="py-3 px-3.5 text-xs text-muted-foreground max-w-xs truncate" title={sup.address}>
                        {sup.address || '-'}
                      </td>
                    )}

                    {/* Tài khoản ngân hàng VietQR */}
                    {isColumnVisible('bank') && (
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {bInfo.accountNumber ? (
                          <div className="flex items-center gap-2">
                            {bInfo.bankLogo && (
                              <img
                                src={bInfo.bankLogo}
                                alt={bInfo.bankShortName}
                                className="h-4 max-w-[40px] object-contain rounded-[2px] bg-white border border-border p-0.5 shrink-0"
                              />
                            )}
                            <div className="text-[11px]">
                              <div className="font-mono tabular-nums font-bold text-foreground">
                                {bInfo.accountNumber}
                                <span className="ml-1 text-muted-foreground font-normal">
                                  ({bInfo.bankShortName || bInfo.bankCode || 'NH'})
                                </span>
                              </div>
                              {bInfo.accountHolder && (
                                <div className="text-[10px] text-muted-foreground font-mono uppercase">
                                  {bInfo.accountHolder}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                    )}

                    {/* Trạng thái */}
                    {isColumnVisible('status') && (
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-muted-foreground/60'
                            }`}
                          />
                          {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                    )}

                    {/* Thao tác */}
                    {isColumnVisible('actions') && (
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(sup)}
                            className="size-7 rounded-[4px] flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-transform cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(sup)}
                            className="size-7 rounded-[4px] flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-[0.98] transition-transform cursor-pointer"
                            title="Xóa nhà cung cấp"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                  {expandedIds[sup._id] && (
                    <SupplierDebtRowDetail
                      supplier={sup}
                      visibleCount={visibleCount}
                      onViewDetail={onViewDetail}
                    />
                  )}
                </React.Fragment>
              );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Bar: Total Debt and Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border px-4 py-2.5 gap-2 bg-muted/20">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>Tổng công nợ cần trả:</span>
          <span className="font-mono tabular-nums font-bold text-destructive text-sm">
            {totalDebt.toLocaleString('vi-VN')} đ
          </span>
        </div>

        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </Card>
  );
}
