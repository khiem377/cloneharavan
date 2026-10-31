import React from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWarehouseManager } from './hooks/useWarehouseManager';
import WarehouseSidebarList from './components/WarehouseSidebarList';
import WarehouseDetailHeader from './components/WarehouseDetailHeader';
import WarehouseFormSettings from './components/WarehouseFormSettings';
import WarehouseStockTab from './components/WarehouseStockTab';
import WarehouseStaffTab from './components/WarehouseStaffTab';

export default function WarehouseListPage() {
  const {
    warehouses,
    loading,
    saving,
    searchKeyword,
    setSearchKeyword,
    selectedWarehouseId,
    isCreatingNew,
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    staffCandidates,
    loadingStaff,
    form,
    setForm,
    warehouseStock,
    loadingStock,
    stockKeyword,
    setStockKeyword,
    stockPage,
    setStockPage,
    stockPageSize,
    setStockPageSize,
    stockTotal,
    stockSummary,
    activeTab,
    setActiveTab,
    filteredWarehouses,
    fullAddressPreview,
    handleSelectWarehouse,
    handleStartCreateNew,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    handleAssignStaff,
    handleRemoveStaff,
    fetchWarehouseStock,
    handleSubmit,
    handleSetDefault,
    handleDelete,
  } = useWarehouseManager();

  return (
    <div className="space-y-4 p-4 md:p-6 bg-background min-h-[calc(100vh-56px)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Quản lý Kho hàng
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cấu hình danh mục kho hàng, vị trí lưu kho & đối soát tồn kho đa điểm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isCreatingNew ? 'outline' : 'default'}
            size="sm"
            onClick={handleStartCreateNew}
          >
            <Plus size={14} />
            <span>Thêm kho mới</span>
          </Button>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Warehouse List (4 Cols) */}
        <WarehouseSidebarList
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          loading={loading}
          filteredWarehouses={filteredWarehouses}
          selectedWarehouseId={selectedWarehouseId}
          isCreatingNew={isCreatingNew}
          onSelectWarehouse={handleSelectWarehouse}
        />

        {/* Right Column: Warehouse Detail & Form (8 Cols) */}
        <div className="lg:col-span-8 rounded-[6px] border border-border bg-card">
          <form onSubmit={handleSubmit}>
            <WarehouseDetailHeader
              isCreatingNew={isCreatingNew}
              form={form}
              selectedWarehouseId={selectedWarehouseId}
              warehouses={warehouses}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              stockTotal={stockTotal}
              saving={saving}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />

            {/* Tab: Cài đặt thông tin kho */}
            {activeTab === 'settings' && (
              <WarehouseFormSettings
                form={form}
                setForm={setForm}
                provinces={provinces}
                loadingProvinces={loadingProvinces}
                districts={districts}
                loadingDistricts={loadingDistricts}
                wards={wards}
                loadingWards={loadingWards}
                handleProvinceChange={handleProvinceChange}
                handleDistrictChange={handleDistrictChange}
                handleWardChange={handleWardChange}
                fullAddressPreview={fullAddressPreview}
                staffCandidates={staffCandidates}
                loadingStaff={loadingStaff}
                handleAssignStaff={handleAssignStaff}
                handleRemoveStaff={handleRemoveStaff}
                warehouses={warehouses}
                selectedWarehouseId={selectedWarehouseId}
              />
            )}

            {/* Tab: Bảng tồn kho của riêng kho này */}
            {activeTab === 'stock' && (
              <WarehouseStockTab
                stockTotal={stockTotal}
                stockSummary={stockSummary}
                selectedWarehouseId={selectedWarehouseId}
                warehouses={warehouses}
                stockKeyword={stockKeyword}
                setStockKeyword={setStockKeyword}
                setStockPage={setStockPage}
                fetchWarehouseStock={fetchWarehouseStock}
                loadingStock={loadingStock}
                warehouseStock={warehouseStock}
                form={form}
                stockPage={stockPage}
                stockPageSize={stockPageSize}
                setStockPageSize={setStockPageSize}
              />
            )}

            {/* Tab: Phân công nhân viên phụ trách kho */}
            {activeTab === 'staff' && (
              <WarehouseStaffTab
                form={form}
                staffCandidates={staffCandidates}
                loadingStaff={loadingStaff}
                handleAssignStaff={handleAssignStaff}
                handleRemoveStaff={handleRemoveStaff}
                warehouses={warehouses}
                selectedWarehouseId={selectedWarehouseId}
                saving={saving}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
