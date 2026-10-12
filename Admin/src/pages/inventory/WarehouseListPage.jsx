import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  MapPin,
  Phone,
  Layers,
  Save,
  Trash2,
  Star,
  Loader2,
  Package,
  Building2,
  Check,
  Users,
  UserCheck,
  X,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { warehouseService } from '@/services/warehouse.service';
import { shippingService } from '@/services/shipping.service';
import { toast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import SearchableSelect from '@/components/ui/SearchableSelect';
import DataTablePagination from '@/components/ui/DataTablePagination';
import { cn } from '@/lib/utils';

export default function WarehouseListPage() {
  const navigate = useNavigate();
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
        <div className="lg:col-span-4 rounded-[6px] border border-border bg-card overflow-hidden">
          {/* List Search Bar */}
          <div className="p-3 border-b border-border bg-muted/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo tên, mã, địa chỉ..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-background rounded-[6px] border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-border max-h-[calc(100vh-220px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Đang tải danh sách kho...</span>
              </div>
            ) : filteredWarehouses.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Không tìm thấy kho hàng nào
              </div>
            ) : (
              filteredWarehouses.map((wh) => {
                const isSelected = wh._id === selectedWarehouseId && !isCreatingNew;
                return (
                  <div
                    key={wh._id}
                    onClick={() => handleSelectWarehouse(wh)}
                    className={cn(
                      'p-3.5 cursor-pointer transition-colors relative',
                      isSelected
                        ? 'bg-primary/5 border-l-4 border-l-primary'
                        : 'hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-foreground truncate">
                            {wh.name}
                          </span>
                          {wh.isDefault && (
                            <Badge variant="default" className="text-[10px] h-4 px-1.5 gap-0.5 rounded-[4px]">
                              <Star size={9} className="fill-current" /> Mặc định
                            </Badge>
                          )}
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded-[4px] font-mono',
                              wh.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {wh.code}
                          </span>
                        </div>

                        {wh.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                            <Phone size={11} />
                            <span className="tabular-nums font-mono">{wh.phone}</span>
                          </div>
                        )}

                        <div className="flex items-start gap-1 text-[11px] text-muted-foreground mt-1 line-clamp-2">
                          <MapPin size={11} className="shrink-0 mt-0.5" />
                          <span>{wh.address?.fullAddress || 'Chưa thiết lập địa chỉ chi tiết'}</span>
                        </div>

                        {/* Stock & SKU & Staff Count Pills */}
                        <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-border/40 text-[11px]">
                          <span className="text-muted-foreground">
                            Tồn kho:{' '}
                            <strong className="font-mono tabular-nums text-foreground">
                              {Number(wh.totalStock || 0).toLocaleString()}
                            </strong>
                          </span>
                          <span className="text-border">•</span>
                          <span className="text-muted-foreground">
                            Mặt hàng:{' '}
                            <strong className="font-mono tabular-nums text-foreground">
                              {Number(wh.totalSKUs || 0)}
                            </strong>
                          </span>
                          <span className="text-border">•</span>
                          <span className="text-muted-foreground flex items-center gap-1 font-medium text-primary">
                            <Users size={11} />
                            <strong className="font-mono tabular-nums">
                              {wh.assignedStaffIds?.length || 0}
                            </strong> nv
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Warehouse Detail & Form (8 Cols) */}
        <div className="lg:col-span-8 rounded-[6px] border border-border bg-card overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Form Top Header */}
            <div className="px-5 py-3.5 border-b border-border bg-muted/10 flex items-center justify-between gap-3">
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
              <div className="p-5 space-y-6">
                {/* 1. Thông tin chung */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Building2 size={14} className="text-primary" />
                    Thông tin chung
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Tên kho hàng <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="text"
                        required
                        placeholder="Ví dụ: Kho Tổng Bình Tân"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="h-9 text-xs rounded-[6px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Mã kho <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="text"
                        required
                        placeholder="KHO-BINHTAN"
                        value={form.code}
                        onChange={(e) =>
                          setForm({ ...form, code: e.target.value.toUpperCase().trim() })
                        }
                        className="h-9 text-xs font-mono uppercase rounded-[6px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Số điện thoại liên hệ
                      </Label>
                      <Input
                        type="tel"
                        placeholder="0987654321"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="h-9 text-xs font-mono tabular-nums rounded-[6px]"
                      />
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center gap-6">
                    <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isDefault}
                        onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                        className="rounded-[4px] border-border text-primary focus:ring-primary size-4"
                      />
                      <span>Đặt làm kho mặc định của hệ thống</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.status === 'active'}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })
                        }
                        className="rounded-[4px] border-border text-primary focus:ring-primary size-4"
                      />
                      <span>Trạng thái hoạt động</span>
                    </label>
                  </div>
                </div>

                {/* 2. Địa chỉ kho hàng (3-level GHN Selector chuẩn như Client) */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" />
                    Địa chỉ kho hàng (Chuẩn hóa bưu chính GHN)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Tỉnh / Thành phố <span className="text-destructive">*</span>
                      </Label>
                      <SearchableSelect
                        options={provinces.map((p) => ({
                          value: p.ProvinceID,
                          label: p.ProvinceName,
                        }))}
                        value={form.address.provinceId}
                        onChange={handleProvinceChange}
                        placeholder="Chọn Tỉnh / Thành"
                        disabled={loadingProvinces}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Quận / Huyện <span className="text-destructive">*</span>
                      </Label>
                      <SearchableSelect
                        options={districts.map((d) => ({
                          value: d.DistrictID,
                          label: d.DistrictName,
                        }))}
                        value={form.address.districtId}
                        onChange={handleDistrictChange}
                        placeholder={
                          !form.address.provinceId
                            ? 'Chọn tỉnh/thành trước'
                            : 'Chọn Quận / Huyện'
                        }
                        disabled={loadingDistricts || !form.address.provinceId}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Phường / Xã <span className="text-destructive">*</span>
                      </Label>
                      <SearchableSelect
                        options={wards.map((w) => ({
                          value: w.WardCode,
                          label: w.WardName,
                        }))}
                        value={form.address.wardCode}
                        onChange={handleWardChange}
                        placeholder={
                          !form.address.districtId
                            ? 'Chọn quận/huyện trước'
                            : 'Chọn Phường / Xã'
                        }
                        disabled={loadingWards || !form.address.districtId}
                      />
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Địa chỉ chi tiết (Số nhà, tên đường, toà nhà...)
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ví dụ: 38-40 Đường 21A, Tòa nhà T (QTSC9)..."
                      value={form.address.detailAddress}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          address: { ...form.address, detailAddress: e.target.value },
                        })
                      }
                      className="h-9 text-xs rounded-[6px]"
                    />
                  </div>

                  {/* Preview Địa chỉ chuẩn */}
                  {fullAddressPreview && (
                    <div className="mt-3 p-3 rounded-[6px] bg-muted/40 border border-border flex items-start gap-2 text-xs">
                      <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground">
                          Địa chỉ hoàn chỉnh hiển thị trên chứng từ:
                        </span>
                        <p className="text-muted-foreground">{fullAddressPreview}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Nhân viên phụ trách kho (Phân quyền truy cập) */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Users size={14} className="text-primary" />
                        Nhân viên phụ trách kho
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Nhân viên được phân công vào kho này sẽ có quyền truy cập, theo dõi tồn kho và xử lý phiếu xuất nhập của riêng kho này.
                      </p>
                    </div>
                  </div>

                  {/* Select to assign staff */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                    <div className="flex-1">
                      <SearchableSelect
                        options={staffCandidates
                          .filter((s) => !form.assignedStaffIds.includes(s._id))
                          .map((s) => ({
                            value: s._id,
                            label: `${s.fullName || s.name || 'Nhân viên'} (${s.email}) — [${s.role}]`,
                          }))}
                        value=""
                        onChange={(val) => {
                          if (val) handleAssignStaff(val);
                        }}
                        placeholder="Chọn nhân viên để gán vào kho này..."
                        disabled={loadingStaff}
                      />
                    </div>
                  </div>

                  {/* List of currently assigned staff */}
                  {form.assignedStaffIds.length === 0 ? (
                    <div className="rounded-[6px] border border-dashed border-border p-3.5 text-center text-xs text-muted-foreground bg-muted/20">
                      Chưa có nhân viên nào được chỉ định phụ trách kho này. (Quản trị viên có toàn quyền xem tất cả các kho).
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {form.assignedStaffIds.map((staffId) => {
                        const selectedWh = warehouses.find((w) => w._id === selectedWarehouseId);
                        const staffObj =
                          staffCandidates.find((s) => s._id === staffId) ||
                          (selectedWh?.assignedStaffIds || []).find((s) => (s._id || s) === staffId);
                        const name = staffObj?.fullName || staffObj?.name || 'Nhân viên';
                        const email = staffObj?.email || '';
                        const role = staffObj?.role || 'staff';
                        const phone = staffObj?.phone || '';

                        return (
                          <div
                            key={staffId}
                            className="flex items-center justify-between p-2.5 rounded-[6px] border border-border bg-background shadow-xs text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-foreground truncate flex items-center gap-1.5">
                                  <span>{name}</span>
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 uppercase rounded-[4px]">
                                    {role}
                                  </Badge>
                                </div>
                                <div className="text-[11px] text-muted-foreground truncate">
                                  {email} {phone ? `• ${phone}` : ''}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveStaff(staffId)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                              title="Gỡ nhân viên khỏi kho"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Tạm ẩn cấu hình Sơ đồ ô / kệ lưu trữ (Bin Locations) - sẽ triển khai trong tương lai chung với Bản đồ 2D */}
              </div>
            )}

            {/* Tab: Bảng tồn kho của riêng kho này (Xem toàn bộ 336 mặt hàng, tìm kiếm, phân trang) */}
            {activeTab === 'stock' && (
              <div className="p-5 space-y-4">
                {/* Summary 3 Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-[6px] border border-border bg-background shadow-xs">
                    <span className="text-[11px] font-medium text-muted-foreground">Tổng mặt hàng trong kho</span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xl font-bold font-mono tabular-nums text-foreground">
                        {stockTotal || warehouses.find((w) => w._id === selectedWarehouseId)?.totalSKUs || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">mặt hàng (SKU)</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[6px] border border-border bg-background shadow-xs">
                    <span className="text-[11px] font-medium text-muted-foreground">Tổng tồn kho thực tế</span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        {Number(
                          stockSummary?.totalStock ?? warehouses.find((w) => w._id === selectedWarehouseId)?.totalStock ?? 0
                        ).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">cái / sản phẩm</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[6px] border border-border bg-background shadow-xs">
                    <span className="text-[11px] font-medium text-muted-foreground">Tồn khả dụng xuất bán</span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xl font-bold font-mono tabular-nums text-primary">
                        {Number(
                          Math.max(
                            0,
                            (stockSummary?.totalStock ?? warehouses.find((w) => w._id === selectedWarehouseId)?.totalStock ?? 0) -
                              (stockSummary?.totalAllocated ?? warehouses.find((w) => w._id === selectedWarehouseId)?.totalAllocated ?? 0)
                          )
                        ).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">cái (đã trừ giữ chỗ)</span>
                    </div>
                  </div>
                </div>

                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
                    <Input
                      type="text"
                      placeholder="Tìm theo tên sản phẩm, mã SKU hoặc vị trí trong kho này..."
                      value={stockKeyword}
                      onChange={(e) => {
                        setStockKeyword(e.target.value);
                        setStockPage(1);
                      }}
                      className="h-8 pl-8 text-xs rounded-[6px]"
                    />
                    {stockKeyword && (
                      <button
                        type="button"
                        onClick={() => {
                          setStockKeyword('');
                          setStockPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchWarehouseStock(selectedWarehouseId, stockPage, stockPageSize, stockKeyword)}
                    disabled={loadingStock}
                    className="h-8 text-xs rounded-[6px] shrink-0"
                  >
                    <RefreshCw size={13} className={cn('mr-1.5', loadingStock && 'animate-spin')} />
                    Làm mới tồn kho
                  </Button>
                </div>

                {/* Table */}
                {loadingStock ? (
                  <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <span>Đang tải danh sách tồn kho {form.name}...</span>
                  </div>
                ) : warehouseStock.length === 0 ? (
                  <div className="p-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-[6px] bg-muted/10">
                    {stockKeyword
                      ? `Không tìm thấy mặt hàng nào khớp với từ khoá "${stockKeyword}" trong kho này.`
                      : 'Kho này hiện chưa có mặt hàng nào có dữ liệu tồn kho.'}
                  </div>
                ) : (
                  <div className="rounded-[6px] border border-border overflow-hidden bg-background">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/40 border-b border-border text-foreground font-bold text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3 text-left">Sản phẩm & Biến thể</th>
                            <th className="py-2.5 px-3 text-left">Mã SKU</th>
                            <th className="py-2.5 px-3 text-left">Vị trí ô/kệ</th>
                            <th className="py-2.5 px-3 text-right">Tồn thực tế</th>
                            <th className="py-2.5 px-3 text-right">Đang giữ chỗ</th>
                            <th className="py-2.5 px-3 text-right">Khả dụng</th>
                            <th className="py-2.5 px-3 text-right">Giá bán</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {warehouseStock.map((item) => {
                            const available = Math.max(0, (item.stock || 0) - (item.allocated || 0));
                            const thumb = item.productId?.thumbnail?.url || item.productId?.thumbnail;
                            return (
                              <tr key={item._id} className="hover:bg-muted/20 transition-colors">
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2.5">
                                    {thumb ? (
                                      <img
                                        src={thumb}
                                        alt=""
                                        className="size-8 rounded-[4px] object-cover border border-border shrink-0"
                                      />
                                    ) : (
                                      <div className="size-8 rounded-[4px] bg-muted border border-border flex items-center justify-center shrink-0">
                                        <Package size={14} className="text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <div className="font-semibold text-foreground line-clamp-1">
                                        {item.productId?.name || 'Sản phẩm'}
                                      </div>
                                      <div className="text-[11px] text-muted-foreground truncate">
                                        {item.productId?.brand?.name && `${item.productId.brand.name} • `}
                                        {item.variantId?.displayName || 'Mặc định'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-primary whitespace-nowrap">
                                  {item.variantId?.sku || '---'}
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-[4px] bg-muted text-muted-foreground border border-border">
                                    {item.binLocation || 'A-01-01'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-foreground whitespace-nowrap">
                                  {Number(item.stock || 0).toLocaleString()}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                                  {Number(item.allocated || 0).toLocaleString()}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                  {available.toLocaleString()}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground whitespace-nowrap">
                                  {item.variantId?.price
                                    ? `${Number(item.variantId.price).toLocaleString('vi-VN')} đ`
                                    : '---'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-3 border-t border-border bg-muted/20">
                      <DataTablePagination
                        page={stockPage}
                        pageSize={stockPageSize}
                        total={stockTotal}
                        totalPages={Math.ceil((stockTotal || 1) / stockPageSize)}
                        onPageChange={(newPage) => setStockPage(newPage)}
                        onPageSizeChange={(newSize) => {
                          setStockPageSize(newSize);
                          setStockPage(1);
                        }}
                        pageSizeOptions={[20, 50, 100, 350]}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Phân công nhân viên phụ trách kho */}
            {activeTab === 'staff' && (
              <div className="p-5 space-y-4">
                <div className="p-4 rounded-[6px] border border-border bg-background shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Users size={16} className="text-primary" />
                        Danh sách nhân viên quản lý & vận hành: {form.name || 'Kho hàng'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Nhân viên được gán vào đây sẽ được cấp quyền theo dõi tồn kho, lập và duyệt các chứng từ Nhập kho (PNK), Xuất kho (PXK), Kiểm kho và Chuyển kho nội bộ tại chi nhánh này.
                      </p>
                    </div>

                    <Badge variant="outline" className="h-6 px-2.5 text-xs font-mono tabular-nums self-start sm:self-auto">
                      {form.assignedStaffIds?.length || 0} nhân sự
                    </Badge>
                  </div>

                  {/* Thanh chọn nhân viên gán vào kho */}
                  <div className="mb-4">
                    <Label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Thêm nhân viên vào kho này
                    </Label>
                    <div className="max-w-xl">
                      <SearchableSelect
                        options={staffCandidates
                          .filter((s) => !form.assignedStaffIds.includes(s._id))
                          .map((s) => ({
                            value: s._id,
                            label: `${s.fullName || s.name || 'Nhân viên'} (${s.email}) — [${s.role || 'staff'}]`,
                          }))}
                        value=""
                        onChange={(val) => {
                          if (val) handleAssignStaff(val);
                        }}
                        placeholder="Tìm theo tên hoặc email nhân viên để thêm..."
                        disabled={loadingStaff}
                      />
                    </div>
                  </div>

                  {/* Danh sách thẻ nhân viên */}
                  {form.assignedStaffIds.length === 0 ? (
                    <div className="rounded-[6px] border border-dashed border-border p-8 text-center bg-muted/10">
                      <Users size={32} className="mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-xs font-semibold text-foreground">Chưa có nhân viên nào được phân công riêng cho kho này</p>
                      <p className="text-[11px] text-muted-foreground mt-1 max-w-md mx-auto">
                        Tài khoản Quản trị viên (Admin) vẫn có toàn quyền kiểm soát kho. Bạn có thể chọn nhân sự ở ô phía trên để phân quyền thủ kho hoặc nhân viên vận hành.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {form.assignedStaffIds.map((staffId) => {
                        const selectedWh = warehouses.find((w) => w._id === selectedWarehouseId);
                        const staffObj =
                          staffCandidates.find((s) => s._id === staffId) ||
                          (selectedWh?.assignedStaffIds || []).find((s) => (s._id || s) === staffId);
                        const name = staffObj?.fullName || staffObj?.name || 'Nhân viên';
                        const email = staffObj?.email || '';
                        const role = staffObj?.role || 'staff';
                        const phone = staffObj?.phone || '';

                        return (
                          <div
                            key={staffId}
                            className="p-3 rounded-[6px] border border-border bg-card hover:border-primary/40 transition-colors shadow-2xs flex flex-col justify-between"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-xs text-foreground truncate">
                                    {name}
                                  </div>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-0.5 uppercase rounded-[4px]">
                                    {role}
                                  </Badge>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveStaff(staffId)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted transition-colors cursor-pointer shrink-0"
                                title="Gỡ nhân viên khỏi kho này"
                              >
                                <X size={14} />
                              </button>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-border/50 text-[11px] text-muted-foreground space-y-0.5">
                              <div className="truncate flex items-center gap-1">
                                <span>📧</span> {email || 'Chưa có email'}
                              </div>
                              {phone && (
                                <div className="tabular-nums font-mono flex items-center gap-1">
                                  <span>📞</span> {phone}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      * Nhớ bấm nút <strong>"Lưu kho"</strong> ở góc trên bên phải để áp dụng thay đổi.
                    </span>
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={saving}
                    >
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      <span>Lưu phân công nhân viên</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
