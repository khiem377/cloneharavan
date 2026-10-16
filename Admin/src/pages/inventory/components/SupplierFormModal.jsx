import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Building2,
  MapPin,
  CreditCard,
  Search,
  Check,
  ChevronDown,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { shippingService } from '@/services/shipping.service';
import { vietqrService } from '@/services/vietqr.service';
import { mediaService } from '@/services/media.service';
import { toast } from '@/providers/ToastProvider';

const SUPPLIER_TYPES = [
  'Sản phẩm / Nguyên vật liệu',
  'Sản phẩm',
  'Nguyên phụ liệu',
];

export default function SupplierFormModal({
  isOpen,
  supplier,
  onClose,
  onSubmit,
  isPending,
}) {
  // Active/Inactive status
  const [isActive, setIsActive] = useState(true);

  // General Info
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [supplierType, setSupplierType] = useState('Sản phẩm');
  const [taxCode, setTaxCode] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Address: 'new' (2-tier) | 'old' (3-tier)
  const [addressTab, setAddressTab] = useState('new');
  const [detailAddress, setDetailAddress] = useState('');

  // New Address dropdown data & selections
  const [newProvinces, setNewProvinces] = useState([]);
  const [selectedNewProvince, setSelectedNewProvince] = useState(null);
  const [newWards, setNewWards] = useState([]);
  const [selectedNewWard, setSelectedNewWard] = useState(null);
  const [loadingNewLocations, setLoadingNewLocations] = useState(false);

  // Old Address dropdown data & selections
  const [oldProvinces, setOldProvinces] = useState([]);
  const [selectedOldProvince, setSelectedOldProvince] = useState(null);
  const [oldDistricts, setOldDistricts] = useState([]);
  const [selectedOldDistrict, setSelectedOldDistrict] = useState(null);
  const [oldWards, setOldWards] = useState([]);
  const [selectedOldWard, setSelectedOldWard] = useState(null);
  const [loadingOldLocations, setLoadingOldLocations] = useState(false);

  // VietQR Bank data & selections
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [branch, setBranch] = useState('');

  // 1. Initial Load of Master Data (VietQR Banks, New & Old Provinces)
  useEffect(() => {
    let isMounted = true;

    async function loadMasterData() {
      setLoadingBanks(true);
      try {
        const bankList = await vietqrService.getBanks();
        if (isMounted) setBanks(bankList);
      } catch (err) {
        console.error('Lỗi tải ngân hàng:', err);
      } finally {
        if (isMounted) setLoadingBanks(false);
      }

      try {
        const nProvinces = await shippingService.getNewProvinces();
        if (isMounted) setNewProvinces(nProvinces);
      } catch (err) {
        console.error('Lỗi tải tỉnh mới:', err);
      }

      try {
        const oProvinces = await shippingService.getProvinces();
        if (isMounted) setOldProvinces(oProvinces);
      } catch (err) {
        console.error('Lỗi tải tỉnh cũ:', err);
      }
    }

    if (isOpen) {
      loadMasterData();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 2. Populate form when editing or creating
  useEffect(() => {
    if (!isOpen) return;

    if (supplier) {
      setIsActive(supplier.isActive !== false && supplier.status !== 'inactive');
      setCode(supplier.code || '');
      setName(supplier.name || '');
      setPhone(supplier.phone || '');
      setEmail(supplier.email || '');
      setSupplierType(supplier.supplierType || 'Sản phẩm');
      setTaxCode(supplier.taxCode || '');
      setDescription(supplier.description || supplier.note || '');
      setImage(supplier.image || '');

      // Address
      const addrType = supplier.addressType || 'old';
      setAddressTab(addrType);
      setDetailAddress(supplier.detailAddress || '');

      // Bank Info
      const bInfo = supplier.bankInfo || {};
      setAccountNumber(bInfo.accountNumber || '');
      setAccountHolder((bInfo.accountHolder || '').toUpperCase());
      setBranch(bInfo.branch || '');

      if (bInfo.bankCode || bInfo.bankName) {
        setSelectedBank({
          code: bInfo.bankCode,
          name: bInfo.bankName,
          shortName: bInfo.bankShortName || bInfo.bankCode,
          logo: bInfo.bankLogo,
        });
      } else {
        setSelectedBank(null);
      }
    } else {
      // Create mode
      setIsActive(true);
      setCode(`NCC-${Date.now().toString().slice(-4)}`);
      setName('');
      setPhone('');
      setEmail('');
      setSupplierType('Sản phẩm');
      setTaxCode('');
      setDescription('');
      setImage('');
      setAddressTab('new');
      setDetailAddress('');
      setSelectedNewProvince(null);
      setSelectedNewWard(null);
      setSelectedOldProvince(null);
      setSelectedOldDistrict(null);
      setSelectedOldWard(null);
      setSelectedBank(null);
      setAccountNumber('');
      setAccountHolder('');
      setBranch('');
    }
  }, [isOpen, supplier]);

  // 3. Match initial location data for edit mode
  useEffect(() => {
    if (!isOpen || !supplier) return;

    const pid = supplier.provinceId;
    const did = supplier.districtId;
    const wcode = supplier.wardCode;
    const pName = supplier.province;
    const dName = supplier.district;
    const wName = supplier.ward;

    if (supplier.addressType === 'new') {
      if (newProvinces.length > 0) {
        const foundP = newProvinces.find(
          (p) =>
            (pid && String(p._id || p.ProvinceID || p.id) === String(pid)) ||
            (pName && (p.name === pName || p.ProvinceName === pName))
        );
        if (foundP) {
          const actualPid = foundP._id || foundP.ProvinceID || foundP.id;
          setSelectedNewProvince(foundP);
          shippingService.getNewWards(actualPid).then((wards) => {
            setNewWards(Array.isArray(wards) ? wards : []);
            if (wcode || wName) {
              const foundW = wards.find(
                (w) =>
                  (wcode && String(w._id || w.code || w.WardCode) === String(wcode)) ||
                  (wName && (w.name === wName || w.WardName === wName))
              );
              if (foundW) setSelectedNewWard(foundW);
            }
          });
        }
      }
    } else {
      if (oldProvinces.length > 0) {
        const foundP = oldProvinces.find(
          (p) =>
            (pid && p.ProvinceID === pid) ||
            (pName && p.ProvinceName === pName)
        );
        if (foundP) {
          setSelectedOldProvince(foundP);
          shippingService.getDistricts(foundP.ProvinceID).then((dists) => {
            setOldDistricts(dists);
            const foundD = dists.find(
              (d) =>
                (did && d.DistrictID === did) ||
                (dName && d.DistrictName === dName)
            );
            if (foundD) {
              setSelectedOldDistrict(foundD);
              shippingService.getWards(foundD.DistrictID).then((wds) => {
                setOldWards(wds);
                const foundW = wds.find(
                  (w) =>
                    (wcode && w.WardCode === String(wcode)) ||
                    (wName && w.WardName === wName)
                );
                if (foundW) setSelectedOldWard(foundW);
              });
            }
          });
        }
      }
    }
  }, [isOpen, supplier, newProvinces, oldProvinces]);

  // Handlers for New Address
  const handleSelectNewProvince = async (e) => {
    const pId = e.target.value;
    if (!pId) {
      setSelectedNewProvince(null);
      setNewWards([]);
      setSelectedNewWard(null);
      return;
    }
    const pObj = newProvinces.find(
      (p) => String(p._id || p.ProvinceID || p.id) === String(pId)
    );
    setSelectedNewProvince(pObj || null);
    setSelectedNewWard(null);
    setLoadingNewLocations(true);
    try {
      const wards = await shippingService.getNewWards(pId);
      setNewWards(Array.isArray(wards) ? wards : []);
    } catch (err) {
      toast.error('Lỗi tải danh sách phường/xã mới');
    } finally {
      setLoadingNewLocations(false);
    }
  };

  const handleSelectNewWard = (e) => {
    const wCode = e.target.value;
    if (!wCode) {
      setSelectedNewWard(null);
      return;
    }
    const wObj = newWards.find(
      (w) => String(w._id || w.code || w.WardCode || w.id) === String(wCode)
    );
    setSelectedNewWard(wObj || null);
  };

  // Handlers for Old Address
  const handleSelectOldProvince = async (e) => {
    const pId = e.target.value;
    if (!pId) {
      setSelectedOldProvince(null);
      setOldDistricts([]);
      setSelectedOldDistrict(null);
      setOldWards([]);
      setSelectedOldWard(null);
      return;
    }
    const pObj = oldProvinces.find((p) => String(p.ProvinceID) === String(pId));
    setSelectedOldProvince(pObj || null);
    setSelectedOldDistrict(null);
    setOldWards([]);
    setSelectedOldWard(null);
    setLoadingOldLocations(true);
    try {
      const dists = await shippingService.getDistricts(pId);
      setOldDistricts(dists);
    } catch (err) {
      toast.error('Lỗi tải danh sách quận/huyện');
    } finally {
      setLoadingOldLocations(false);
    }
  };

  const handleSelectOldDistrict = async (e) => {
    const dId = e.target.value;
    if (!dId) {
      setSelectedOldDistrict(null);
      setOldWards([]);
      setSelectedOldWard(null);
      return;
    }
    const dObj = oldDistricts.find((d) => String(d.DistrictID) === String(dId));
    setSelectedOldDistrict(dObj || null);
    setSelectedOldWard(null);
    setLoadingOldLocations(true);
    try {
      const wds = await shippingService.getWards(dId);
      setOldWards(wds);
    } catch (err) {
      toast.error('Lỗi tải danh sách phường/xã');
    } finally {
      setLoadingOldLocations(false);
    }
  };

  const handleSelectOldWard = (e) => {
    const wCode = e.target.value;
    if (!wCode) {
      setSelectedOldWard(null);
      return;
    }
    const wObj = oldWards.find((w) => String(w.WardCode) === String(wCode));
    setSelectedOldWard(wObj || null);
  };

  // Media upload for Supplier Logo/Image (Optional)
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ');
      return;
    }

    const fd = new FormData();
    fd.append('file', file);

    setIsUploadingImage(true);
    try {
      const res = await mediaService.upload(fd);
      const uploadedUrl = res.data?.data?.url || res.data?.url;
      if (uploadedUrl) {
        setImage(uploadedUrl);
        toast.success('Tải ảnh đại diện thành công');
      } else {
        toast.error('Không tìm thấy link ảnh trả về');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tải ảnh thất bại');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Compute Full Address Preview
  const getFullAddressPreview = () => {
    if (addressTab === 'new') {
      const pName = selectedNewProvince?.name || selectedNewProvince?.ProvinceName || '';
      const wName = selectedNewWard?.name || selectedNewWard?.WardName || '';
      return [detailAddress.trim(), wName, pName].filter(Boolean).join(', ');
    } else {
      const pName = selectedOldProvince?.ProvinceName || selectedOldProvince?.name || '';
      const dName = selectedOldDistrict?.DistrictName || selectedOldDistrict?.name || '';
      const wName = selectedOldWard?.WardName || selectedOldWard?.name || '';
      return [detailAddress.trim(), wName, dName, pName].filter(Boolean).join(', ');
    }
  };

  // Bank search filter
  const filteredBanks = banks.filter((b) => {
    if (!bankSearch.trim()) return true;
    const q = bankSearch.toLowerCase();
    return (
      (b.shortName && b.shortName.toLowerCase().includes(q)) ||
      (b.code && b.code.toLowerCase().includes(q)) ||
      (b.name && b.name.toLowerCase().includes(q))
    );
  });

  // Submit Handler
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    let addressPayload = {
      addressType: addressTab,
      detailAddress: detailAddress.trim(),
      address: getFullAddressPreview(),
    };

    if (addressTab === 'new') {
      addressPayload.province = selectedNewProvince?.name || selectedNewProvince?.ProvinceName || '';
      addressPayload.provinceId = Number(selectedNewProvince?._id || selectedNewProvince?.ProvinceID || selectedNewProvince?.id) || null;
      addressPayload.district = '';
      addressPayload.districtId = null;
      addressPayload.ward = selectedNewWard?.name || selectedNewWard?.WardName || '';
      addressPayload.wardCode = String(selectedNewWard?._id || selectedNewWard?.code || selectedNewWard?.WardCode || '');
    } else {
      addressPayload.province = selectedOldProvince?.ProvinceName || '';
      addressPayload.provinceId = Number(selectedOldProvince?.ProvinceID) || null;
      addressPayload.district = selectedOldDistrict?.DistrictName || '';
      addressPayload.districtId = Number(selectedOldDistrict?.DistrictID) || null;
      addressPayload.ward = selectedOldWard?.WardName || '';
      addressPayload.wardCode = String(selectedOldWard?.WardCode || '');
    }

    const bankInfo = {
      bankCode: selectedBank?.code || '',
      bankName: selectedBank?.name || '',
      bankShortName: selectedBank?.shortName || '',
      bankLogo: selectedBank?.logo || '',
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim().toUpperCase(),
      branch: branch.trim(),
    };

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      supplierType,
      taxCode: taxCode.trim(),
      description: description.trim(),
      note: description.trim(),
      image: image.trim(),
      isActive,
      status: isActive ? 'active' : 'inactive',
      bankInfo,
      ...addressPayload,
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Rộng rãi, thoải mái: max-w-5xl (1024px) hoặc max-w-6xl */}
      <DialogContent className="sm:max-w-5xl w-[94vw] rounded-[8px] border border-border bg-card p-0 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {supplier ? `Chỉnh sửa nhà cung cấp: ${supplier.name}` : 'Thêm Nhà Cung Cấp Mới'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cấu hình thông tin đối tác cung ứng, địa chỉ bưu chính và tài khoản thanh toán
              </p>
            </div>
          </div>

          {/* Status Switcher Button */}
          <div className="flex items-center gap-1.5 bg-background border border-border rounded-[6px] p-1">
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5 ${isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <span className={`size-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
              Đang hoạt động
            </button>
            <button
              type="button"
              onClick={() => setIsActive(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5 ${!isActive
                  ? 'bg-destructive/10 text-destructive border border-destructive/30'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <span className={`size-2 rounded-full ${!isActive ? 'bg-destructive' : 'bg-muted-foreground/40'}`} />
              Không hoạt động
            </button>
          </div>
        </div>

        {/* Spacious 2-Column Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* CỘT TRÁI (5/12): THÔNG TIN CHUNG & LOGO */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 pb-1.5 border-b border-border/60">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  1. Thông tin chung
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Mã NCC <span className="text-muted-foreground font-normal">(tự sinh nếu để trống)</span>
                  </label>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="NCC-0001"
                    className="rounded-[6px] h-9 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Tên nhà cung cấp <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Công ty TNHH Phân Phối ABC..."
                    className="rounded-[6px] h-9 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Số điện thoại
                  </label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0987xxxxxx"
                    className="rounded-[6px] h-9 text-xs font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Email liên hệ
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="supplier@company.com"
                    className="rounded-[6px] h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Loại nhà cung cấp
                  </label>
                  <select
                    value={supplierType}
                    onChange={(e) => setSupplierType(e.target.value)}
                    className="w-full h-9 px-2.5 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer"
                  >
                    {SUPPLIER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Mã số thuế
                  </label>
                  <Input
                    type="text"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="0101234567"
                    className="rounded-[6px] h-9 text-xs font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Logo / Ảnh đại diện (Rộng rãi, thoáng, không bị che chữ) */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Logo / Ảnh đại diện <span className="text-muted-foreground font-normal">(tùy chọn)</span>
                </label>
                <div className="flex items-center gap-3 p-3 rounded-[6px] border border-border bg-muted/20">
                  {image ? (
                    <div className="relative group size-14 rounded-[6px] border border-border overflow-hidden bg-background shrink-0">
                      <img src={image} alt="Logo" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="size-14 rounded-[6px] border-2 border-dashed border-border bg-background flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-colors shrink-0">
                      {isUploadingImage ? (
                        <Loader2 size={18} className="animate-spin text-primary" />
                      ) : (
                        <Upload size={18} className="text-muted-foreground" />
                      )}
                      <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">Tải ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                        disabled={isUploadingImage}
                      />
                    </label>
                  )}

                  <div className="flex-1 min-w-0">
                    <Input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Dán đường dẫn ảnh logo hoặc tải file..."
                      className="rounded-[6px] h-9 text-xs bg-background"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Hỗ trợ JPG, PNG, WebP (Tối đa 2MB). Lưu vào thư viện Media.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ghi chú / Mô tả */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Ghi chú / Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Thông tin thêm về chính sách chiết khấu, thời gian giao hàng, người phụ trách..."
                  className="w-full px-3 py-2 text-xs rounded-[6px] border border-input bg-background focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* CỘT PHẢI (7/12): ĐỊA CHỈ & TÀI KHOẢN THANH TOÁN (VIETQR) */}
            <div className="lg:col-span-6 space-y-5">

              {/* PHẦN 2: ĐỊA CHỈ */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      2. Địa chỉ nhà cung cấp
                    </span>
                  </div>

                  {/* 2 Tabs: Địa chỉ mới & Địa chỉ cũ */}
                  <div className="flex items-center bg-muted p-0.5 rounded-[6px] border border-border">
                    <button
                      type="button"
                      onClick={() => setAddressTab('new')}
                      className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${addressTab === 'new'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Địa chỉ mới (2 cấp)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressTab('old')}
                      className={`px-3 py-1 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${addressTab === 'old'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      Địa chỉ cũ (3 cấp)
                    </button>
                  </div>
                </div>

                {/* TAB 1: ĐỊA CHỈ MỚI (Tỉnh mới -> Phường mới) */}
                {addressTab === 'new' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-[6px] border border-border/60">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Tỉnh / Thành phố mới
                      </label>
                      <select
                        value={selectedNewProvince?._id || selectedNewProvince?.ProvinceID || selectedNewProvince?.id || ''}
                        onChange={handleSelectNewProvince}
                        className="w-full h-9 px-2.5 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer"
                      >
                        <option value="">-- Chọn Tỉnh / Thành phố mới --</option>
                        {newProvinces.map((p) => {
                          const id = p._id || p.ProvinceID || p.id;
                          const pName = p.name || p.ProvinceName;
                          return (
                            <option key={id} value={id}>
                              {pName}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Phường / Xã mới
                      </label>
                      <select
                        value={selectedNewWard?._id || selectedNewWard?.code || selectedNewWard?.WardCode || ''}
                        onChange={handleSelectNewWard}
                        disabled={!selectedNewProvince || loadingNewLocations}
                        className="w-full h-9 px-2.5 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer disabled:opacity-50"
                      >
                        <option value="">
                          {loadingNewLocations
                            ? 'Đang tải danh sách...'
                            : !selectedNewProvince
                              ? '-- Chọn Tỉnh trước --'
                              : '-- Chọn Phường / Xã mới --'}
                        </option>
                        {newWards.map((w) => {
                          const codeVal = w._id || w.code || w.WardCode;
                          const wName = w.name || w.WardName;
                          return (
                            <option key={codeVal} value={codeVal}>
                              {wName}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                )}

                {/* TAB 2: ĐỊA CHỈ CŨ (Tỉnh cũ -> Quận/Huyện -> Phường/Xã) */}
                {addressTab === 'old' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-muted/20 p-3.5 rounded-[6px] border border-border/60">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Tỉnh / TP
                      </label>
                      <select
                        value={selectedOldProvince?.ProvinceID || ''}
                        onChange={handleSelectOldProvince}
                        className="w-full h-9 px-2 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer"
                      >
                        <option value="">-- Chọn Tỉnh --</option>
                        {oldProvinces.map((p) => (
                          <option key={p.ProvinceID} value={p.ProvinceID}>
                            {p.ProvinceName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Quận / Huyện
                      </label>
                      <select
                        value={selectedOldDistrict?.DistrictID || ''}
                        onChange={handleSelectOldDistrict}
                        disabled={!selectedOldProvince || loadingOldLocations}
                        className="w-full h-9 px-2 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer disabled:opacity-50"
                      >
                        <option value="">
                          {loadingOldLocations ? 'Đang tải...' : '-- Chọn Quận --'}
                        </option>
                        {oldDistricts.map((d) => (
                          <option key={d.DistrictID} value={d.DistrictID}>
                            {d.DistrictName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Phường / Xã
                      </label>
                      <select
                        value={selectedOldWard?.WardCode || ''}
                        onChange={handleSelectOldWard}
                        disabled={!selectedOldDistrict || loadingOldLocations}
                        className="w-full h-9 px-2 text-xs rounded-[6px] border border-input bg-background font-medium cursor-pointer disabled:opacity-50"
                      >
                        <option value="">
                          {loadingOldLocations ? 'Đang tải...' : '-- Chọn Phường --'}
                        </option>
                        {oldWards.map((w) => (
                          <option key={w.WardCode} value={w.WardCode}>
                            {w.WardName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Chi tiết địa chỉ */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Địa chỉ chi tiết (Số nhà, tòa nhà, ngõ/ngách, tên đường...)
                  </label>
                  <Input
                    type="text"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    placeholder="VD: Tòa nhà Green Park, 29 Lê Duẩn..."
                    className="rounded-[6px] h-9 text-xs"
                  />
                </div>

                {/* Preview địa chỉ đầy đủ */}
                {getFullAddressPreview() && (
                  <div className="p-2.5 rounded-[6px] bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-2">
                    <span className="font-semibold text-foreground shrink-0">Địa chỉ hiển thị:</span>
                    <span className="truncate">{getFullAddressPreview()}</span>
                  </div>
                )}
              </div>

              {/* PHẦN 3: TÀI KHOẢN THANH TOÁN (VIETQR) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/60">
                  <CreditCard className="size-4 text-primary" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    3. Tài khoản ngân hàng
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* VietQR Bank Searchable Dropdown */}
                  <div className="relative sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Ngân hàng thụ hưởng
                    </label>
                    <div
                      onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                      className="w-full h-9 px-3 rounded-[6px] border border-input bg-background flex items-center justify-between cursor-pointer text-xs"
                    >
                      {selectedBank ? (
                        <div className="flex items-center gap-2.5 truncate">
                          {selectedBank.logo && (
                            <img
                              src={selectedBank.logo}
                              alt={selectedBank.shortName}
                              className="h-5 max-w-[60px] object-contain shrink-0"
                            />
                          )}
                          <span className="font-bold text-foreground font-mono">
                            {selectedBank.shortName || selectedBank.code}
                          </span>
                          <span className="text-muted-foreground truncate text-xs">
                            - {selectedBank.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-- Chọn ngân hàng VietQR --</span>
                      )}
                      <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-1" />
                    </div>

                    {/* Dropdown panel */}
                    {isBankDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-[6px] shadow-xl max-h-64 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-border bg-muted/40">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <Input
                              type="text"
                              value={bankSearch}
                              onChange={(e) => setBankSearch(e.target.value)}
                              placeholder="Tìm nhanh theo tên, mã VCB, MB, TCB, ACB, VietinBank..."
                              className="h-8 text-xs pl-8 rounded-[4px]"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto flex-1 divide-y divide-border/50">
                          {filteredBanks.length === 0 ? (
                            <div className="py-4 text-center text-xs text-muted-foreground">
                              Không tìm thấy ngân hàng phù hợp
                            </div>
                          ) : (
                            filteredBanks.map((b) => (
                              <div
                                key={b.id || b.code}
                                onClick={() => {
                                  setSelectedBank(b);
                                  setIsBankDropdownOpen(false);
                                }}
                                className={`p-2.5 flex items-center justify-between hover:bg-muted/60 cursor-pointer text-xs transition-colors ${selectedBank?.code === b.code ? 'bg-primary/10' : ''
                                  }`}
                              >
                                <div className="flex items-center gap-3 truncate">
                                  {b.logo ? (
                                    <img
                                      src={b.logo}
                                      alt={b.shortName}
                                      className="h-5 w-12 object-contain bg-white rounded-[2px] p-0.5 border border-border shrink-0"
                                    />
                                  ) : (
                                    <div className="h-5 w-12 bg-muted rounded-[2px] shrink-0" />
                                  )}
                                  <div className="truncate">
                                    <span className="font-bold text-foreground font-mono mr-2">
                                      {b.shortName || b.code}
                                    </span>
                                    <span className="text-muted-foreground text-xs truncate">
                                      {b.name}
                                    </span>
                                  </div>
                                </div>
                                {selectedBank?.code === b.code && (
                                  <Check className="size-4 text-primary shrink-0 ml-1" />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Số tài khoản ngân hàng
                    </label>
                    <Input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\s+/g, ''))}
                      placeholder="0123456789"
                      className="rounded-[6px] h-9 text-xs font-mono tabular-nums tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Tên chủ tài khoản <span className="text-muted-foreground font-normal">(tự viết hoa)</span>
                    </label>
                    <Input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                      placeholder="NGUYEN VAN A"
                      className="rounded-[6px] h-9 text-xs font-mono uppercase font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Chi nhánh ngân hàng
                    </label>
                    <Input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="VD: Chi nhánh TP. Hồ Chí Minh"
                      className="rounded-[6px] h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <DialogFooter className="px-6 py-3.5 border-t border-border bg-muted/20 flex items-center justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-[6px] h-9 px-4 text-xs font-medium"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={handleFormSubmit}
            disabled={isPending}
            className="rounded-[6px] h-9 px-5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform gap-1.5"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {supplier ? 'Lưu thay đổi' : 'Tạo nhà cung cấp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
