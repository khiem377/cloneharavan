import { useState, useEffect, useMemo } from 'react';
import { warehouseService } from '@/services/warehouse.service';
import { shippingService } from '@/services/shipping.service';
import { toast } from '@/providers/ToastProvider';

export function useWarehouseManager() {
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
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'stock' | 'staff'

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

  useEffect(() => {
    fetchWarehouses();
    fetchProvincesList();
    fetchStaffCandidatesList();
  }, []);

  return {
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
  };
}
