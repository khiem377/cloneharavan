import { useState, useEffect, useMemo } from 'react';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Save,
  Trash2,
  Star,
  Loader2,
  Package,
  Building2,
  Users,
} from 'lucide-react';
import { warehouseService } from '@/services/warehouse.service';
import { shippingService } from '@/services/shipping.service';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import WarehouseSidebarList from './components/WarehouseSidebarList';
import WarehouseFormSettings from './components/WarehouseFormSettings';
import WarehouseStockTab from './components/WarehouseStockTab';
import WarehouseStaffTab from './components/WarehouseStaffTab';

export default function WarehouseListPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Address Cascading State (GHN)
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Staff Candidates State (Nhân viên phân quyền vào kho)
  const [staffCandidates, setStaffCandidates] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    code: '',
    phone: '',
    status: 'active',
    isDefault: false,
    address: {
      province: '',
      provinceId: null,
      district: '',
      districtId: null,
      ward: '',
      wardCode: '',
      detailAddress: '',
      fullAddress: '',
    },
    binLocations: [],
    assignedStaffIds: [],
  });

  // Tồn kho chi tiết của kho đang chọn
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [stockKeyword, setStockKeyword] = useState('');
  const [stockPage, setStockPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState(20);
  const [stockTotal, setStockTotal] = useState(0);
  const [stockSummary, setStockSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'stock'

  // 1. Fetch Danh sách kho hàng
  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getWarehouses();
      const list = res.data?.data?.data || [];
      setWarehouses(list);

      if (!selectedWarehouseId && list.length > 0) {
        handleSelectWarehouse(list[0]);
      } else if (selectedWarehouseId) {
        const current = list.find((w) => w._id === selectedWarehouseId);
        if (current) handleSelectWarehouse(current);
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách kho: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchProvincesList();
    fetchStaffCandidatesList();
  }, []);

  // Fetch danh sách nhân viên để chọn phân quyền kho
  const fetchStaffCandidatesList = async () => {
    try {
      setLoadingStaff(true);
      const res = await warehouseService.getStaffCandidates();
      setStaffCandidates(res.data?.data || []);
    } catch (err) {
      console.warn('Lỗi tải danh sách nhân viên:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  // 2. Fetch Tỉnh / Thành phố từ GHN
  const fetchProvincesList = async () => {
    setLoadingProvinces(true);
    try {
      const data = await shippingService.getProvinces();
      setProvinces(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách tỉnh/thành:', err);
    } finally {
      setLoadingProvinces(false);
    }
  };

  // 3. Chọn kho để xem / sửa
  const handleSelectWarehouse = (wh) => {
    setIsCreatingNew(false);
    setSelectedWarehouseId(wh._id);
    setActiveTab('settings');
    setStockKeyword('');
    setStockPage(1);
    setStockTotal(wh.totalSKUs || 0);
    setWarehouseStock([]);

    setForm({
      name: wh.name || '',
      code: wh.code || '',
      phone: wh.phone || '',
      status: wh.status || 'active',
      isDefault: Boolean(wh.isDefault),
      address: {
        province: wh.address?.province || '',
        provinceId: wh.address?.provinceId || null,
        district: wh.address?.district || '',
        districtId: wh.address?.districtId || null,
        ward: wh.address?.ward || '',
        wardCode: wh.address?.wardCode || '',
        detailAddress: wh.address?.detailAddress || '',
        fullAddress: wh.address?.fullAddress || '',
      },
      binLocations: wh.binLocations || [],
      assignedStaffIds: (wh.assignedStaffIds || []).map((s) => (typeof s === 'object' ? s._id : s)),
    });

    if (wh.address?.provinceId) {
      fetchDistrictsList(wh.address.provinceId);
    } else {
      setDistricts([]);
    }

    if (wh.address?.districtId) {
      fetchWardsList(wh.address.districtId);
    } else {
      setWards([]);
    }

    fetchWarehouseStock(wh._id, 1, stockPageSize, '');
  };

  // 4. Mở form Tạo kho mới
  const handleStartCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedWarehouseId(null);
    setActiveTab('settings');
    setDistricts([]);
    setWards([]);

    setForm({
      name: '',
      code: '',
      phone: '',
      status: 'active',
      isDefault: false,
      address: {
        province: '',
        provinceId: null,
        district: '',
        districtId: null,
        ward: '',
        wardCode: '',
        detailAddress: '',
        fullAddress: '',
      },
      binLocations: [
        { code: 'A-01-01', rack: 'A', shelf: '1', column: '1' },
      ],
      assignedStaffIds: [],
    });
  };

  // Gán / Xoá nhân viên phụ trách kho
  const handleAssignStaff = (userId) => {
    if (!userId) return;
    if (form.assignedStaffIds.includes(userId)) {
      toast.warning('Nhân viên này đã được phân công vào kho');
      return;
    }
    setForm((prev) => ({
      ...prev,
      assignedStaffIds: [...prev.assignedStaffIds, userId],
    }));
  };

  const handleRemoveStaff = (userId) => {
    setForm((prev) => ({
      ...prev,
      assignedStaffIds: prev.assignedStaffIds.filter((id) => id !== userId),
    }));
  };

  // Fetch Quận / Huyện
  const fetchDistrictsList = async (provinceId) => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }
    setLoadingDistricts(true);
    try {
      const data = await shippingService.getDistricts(provinceId);
      setDistricts(data || []);
    } catch (err) {
      console.error('Lỗi tải quận/huyện:', err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch Phường / Xã
  const fetchWardsList = async (districtId) => {
    if (!districtId) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    try {
      const data = await shippingService.getWards(districtId);
      setWards(data || []);
    } catch (err) {
      console.error('Lỗi tải phường/xã:', err);
    } finally {
      setLoadingWards(false);
    }
  };

  // Xử lý chọn Tỉnh / Thành
  const handleProvinceChange = (provinceId) => {
    const prov = provinces.find((p) => String(p.ProvinceID) === String(provinceId));
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        province: prov ? prov.ProvinceName : '',
        provinceId: prov ? prov.ProvinceID : null,
        district: '',
        districtId: null,
        ward: '',
        wardCode: '',
      },
    }));
    setWards([]);
    if (provinceId) fetchDistrictsList(provinceId);
  };

  // Xử lý chọn Quận / Huyện
  const handleDistrictChange = (districtId) => {
    const dist = districts.find((d) => String(d.DistrictID) === String(districtId));
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        district: dist ? dist.DistrictName : '',
        districtId: dist ? dist.DistrictID : null,
        ward: '',
        wardCode: '',
      },
    }));
    if (districtId) fetchWardsList(districtId);
  };

  // Xử lý chọn Phường / Xã
  const handleWardChange = (wardCode) => {
    const ward = wards.find((w) => String(w.WardCode) === String(wardCode));
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        ward: ward ? ward.WardName : '',
        wardCode: ward ? ward.WardCode : '',
      },
    }));
  };

  // Tự động ghép chuỗi địa chỉ bưu chính chuẩn
  const fullAddressPreview = useMemo(() => {
    const parts = [
      form.address.detailAddress?.trim(),
      form.address.ward,
      form.address.district,
      form.address.province,
    ].filter(Boolean);
    return parts.join(', ');
  }, [form.address]);

  // Thêm ô/kệ lưu trữ (Bin Location)
  const handleAddBinLocation = () => {
    const nextNum = form.binLocations.length + 1;
    const newBin = {
      code: `A-01-${String(nextNum).padStart(2, '0')}`,
      rack: 'A',
      shelf: '1',
      column: String(nextNum),
    };
    setForm((prev) => ({
      ...prev,
      binLocations: [...prev.binLocations, newBin],
    }));
  };

  const handleRemoveBinLocation = (index) => {
    setForm((prev) => ({
      ...prev,
      binLocations: prev.binLocations.filter((_, i) => i !== index),
    }));
  };

  const handleBinLocationChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.binLocations];
      updated[index] = { ...updated[index], [field]: value };
      if (field !== 'code') {
        const r = updated[index].rack || 'A';
        const s = updated[index].shelf || '1';
        const c = updated[index].column || '1';
        updated[index].code = `${r}-${String(s).padStart(2, '0')}-${String(c).padStart(2, '0')}`;
      }
      return { ...prev, binLocations: updated };
    });
  };

  // Tải bảng tồn kho của kho
  const fetchWarehouseStock = async (whId, page = stockPage, limit = stockPageSize, keyword = stockKeyword) => {
    if (!whId) return;
    setLoadingStock(true);
    try {
      const res = await warehouseService.getWarehouseInventory(whId, {
        keyword,
        page,
        limit,
      });
      const data = res.data?.data;
      setWarehouseStock(data?.data || []);
      setStockTotal(data?.pagination?.total || 0);
      setStockSummary(data?.summary || null);
    } catch (err) {
      console.warn('Lỗi tải tồn kho:', err);
    } finally {
      setLoadingStock(false);
    }
  };

  // Tự động tải lại bảng tồn kho khi đổi trang, số lượng hiển thị hoặc từ khoá tìm kiếm
  useEffect(() => {
    if (selectedWarehouseId && activeTab === 'stock') {
      const timer = setTimeout(() => {
        fetchWarehouseStock(selectedWarehouseId, stockPage, stockPageSize, stockKeyword);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [selectedWarehouseId, activeTab, stockPage, stockPageSize, stockKeyword]);

  // Lưu kho hàng (Tạo mới hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên kho hàng');
    if (!form.code.trim()) return toast.error('Vui lòng nhập mã kho');

    setSaving(true);
    try {
      const payload = {
        ...form,
        address: {
          ...form.address,
          fullAddress: fullAddressPreview,
        },
      };

      if (isCreatingNew) {
        const res = await warehouseService.createWarehouse(payload);
        toast.success('Tạo kho hàng mới thành công');
        await fetchWarehouses();
        if (res.data?.data?.warehouse) {
          handleSelectWarehouse(res.data.data.warehouse);
        }
      } else {
        await warehouseService.updateWarehouse(selectedWarehouseId, payload);
        toast.success('Cập nhật kho hàng thành công');
        await fetchWarehouses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  // Đặt làm kho mặc định
  const handleSetDefault = async (whId) => {
    try {
      await warehouseService.setDefault(whId);
      toast.success('Đã đặt làm kho mặc định');
      await fetchWarehouses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đặt mặc định');
    }
  };

  // Xóa kho hàng
  const handleDelete = async (whId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kho hàng này không?')) return;
    try {
      await warehouseService.deleteWarehouse(whId);
      toast.success('Đã xóa kho hàng');
      setSelectedWarehouseId(null);
      await fetchWarehouses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa kho thất bại');
    }
  };

  // Lọc danh sách kho bên cột trái
  const filteredWarehouses = useMemo(() => {
    if (!searchKeyword.trim()) return warehouses;
    const q = searchKeyword.toLowerCase().trim();
    return warehouses.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.code.toLowerCase().includes(q) ||
        (w.phone && w.phone.includes(q)) ||
        (w.address?.fullAddress && w.address.fullAddress.toLowerCase().includes(q))
    );
  }, [warehouses, searchKeyword]);

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
          {/* Tạm ẩn nút Sơ đồ mặt bằng 2D - phát triển trong tương lai */}
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
            {/* Form Top Header */}
            <div className="px-5 py-3.5 border-b border-border bg-muted/10 rounded-t-[6px] flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <WarehouseIcon className="size-4 text-primary" />
                  {isCreatingNew
                    ? 'Tạo kho hàng mới'
                    : `Cấu hình kho: ${form.name || 'Chi tiết'}`}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isCreatingNew
                    ? 'Nhập đầy đủ thông tin định danh và địa chỉ để khởi tạo kho'
                    : 'Cập nhật thông tin định danh và địa chỉ bưu chính kho hàng'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isCreatingNew && selectedWarehouseId && (
                  <div className="flex items-center rounded-[6px] border border-border p-0.5 bg-muted/40 text-xs font-semibold mr-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('settings')}
                      className={cn(
                        'px-2.5 py-1 rounded-[4px] transition-colors',
                        activeTab === 'settings'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Thông tin kho
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('stock')}
                      className={cn(
                        'px-2.5 py-1 rounded-[4px] transition-colors flex items-center gap-1',
                        activeTab === 'stock'
                          ? 'bg-background text-foreground shadow-xs font-bold text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Package size={12} />
                      Tồn kho ({Number(stockTotal ?? warehouses.find((w) => w._id === selectedWarehouseId)?.totalSKUs ?? 0)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('staff')}
                      className={cn(
                        'px-2.5 py-1 rounded-[4px] transition-colors flex items-center gap-1',
                        activeTab === 'staff'
                          ? 'bg-background text-foreground shadow-xs font-bold text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Users size={12} />
                      Nhân viên phụ trách ({form.assignedStaffIds?.length || 0})
                    </button>
                  </div>
                )}

                {!isCreatingNew && !form.isDefault && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(selectedWarehouseId)}
                    title="Đặt làm kho mặc định"
                  >
                    <Star size={13} />
                    <span className="hidden sm:inline">Đặt mặc định</span>
                  </Button>
                )}

                {!isCreatingNew && !form.isDefault && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedWarehouseId)}
                    title="Xóa kho hàng"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Xóa kho</span>
                  </Button>
                )}

                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>Lưu kho</span>
                </Button>
              </div>
            </div>

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
