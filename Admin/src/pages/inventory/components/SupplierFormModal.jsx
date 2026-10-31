import React, { useState, useEffect } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { mediaService } from '@/services/media.service';
import { toast } from '@/providers/ToastProvider';
import SupplierGeneralInfoSection from './supplier-form/SupplierGeneralInfoSection';
import SupplierAddressSection from './supplier-form/SupplierAddressSection';
import SupplierBankSection from './supplier-form/SupplierBankSection';
import { useSupplierLocation } from './supplier-form/useSupplierLocation';
import { useSupplierBank } from './supplier-form/useSupplierBank';

export default function SupplierFormModal({
  isOpen,
  supplier,
  onClose,
  onSubmit,
  isPending,
}) {
  const [isActive, setIsActive] = useState(true);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [supplierType, setSupplierType] = useState('Sản phẩm');
  const [taxCode, setTaxCode] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const locationState = useSupplierLocation(isOpen, supplier);
  const bankState = useSupplierBank(isOpen, supplier);

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
    } else {
      setIsActive(true);
      setCode(`NCC-${Date.now().toString().slice(-4)}`);
      setName('');
      setPhone('');
      setEmail('');
      setSupplierType('Sản phẩm');
      setTaxCode('');
      setDescription('');
      setImage('');
    }
  }, [isOpen, supplier]);

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên nhà cung cấp');
      return;
    }
    onSubmit({
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
      bankInfo: bankState.buildBankPayload(),
      ...locationState.buildAddressPayload(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl w-[94vw] rounded-[6px] border border-border bg-card p-0 shadow-sm overflow-hidden flex flex-col max-h-[92vh]">
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

          <div className="flex items-center gap-1.5 bg-background border border-border rounded-[6px] p-1">
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                isActive
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                !isActive
                  ? 'bg-destructive/10 text-destructive border border-destructive/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className={`size-2 rounded-full ${!isActive ? 'bg-destructive' : 'bg-muted-foreground/40'}`} />
              Không hoạt động
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <SupplierGeneralInfoSection
              code={code}
              setCode={setCode}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              email={email}
              setEmail={setEmail}
              supplierType={supplierType}
              setSupplierType={setSupplierType}
              taxCode={taxCode}
              setTaxCode={setTaxCode}
              image={image}
              setImage={setImage}
              isUploadingImage={isUploadingImage}
              handleImageUpload={handleImageFileChange}
              description={description}
              setDescription={setDescription}
            />

            <div className="lg:col-span-6 space-y-5">
              <SupplierAddressSection
                addressTab={locationState.addressTab}
                setAddressTab={locationState.setAddressTab}
                selectedNewProvince={locationState.selectedNewProvince}
                handleSelectNewProvince={locationState.handleSelectNewProvince}
                newProvinces={locationState.newProvinces}
                selectedNewWard={locationState.selectedNewWard}
                handleSelectNewWard={locationState.handleSelectNewWard}
                newWards={locationState.newWards}
                loadingNewLocations={locationState.loadingNewLocations}
                selectedOldProvince={locationState.selectedOldProvince}
                handleSelectOldProvince={locationState.handleSelectOldProvince}
                oldProvinces={locationState.oldProvinces}
                selectedOldDistrict={locationState.selectedOldDistrict}
                handleSelectOldDistrict={locationState.handleSelectOldDistrict}
                oldDistricts={locationState.oldDistricts}
                loadingOldLocations={locationState.loadingOldLocations}
                selectedOldWard={locationState.selectedOldWard}
                handleSelectOldWard={locationState.handleSelectOldWard}
                oldWards={locationState.oldWards}
                detailAddress={locationState.detailAddress}
                setDetailAddress={locationState.setDetailAddress}
                fullAddressPreview={locationState.getFullAddressPreview()}
              />

              <SupplierBankSection
                selectedBank={bankState.selectedBank}
                setSelectedBank={bankState.setSelectedBank}
                isBankDropdownOpen={bankState.isBankDropdownOpen}
                setIsBankDropdownOpen={bankState.setIsBankDropdownOpen}
                bankSearch={bankState.bankSearch}
                setBankSearch={bankState.setBankSearch}
                filteredBanks={bankState.filteredBanks}
                accountNumber={bankState.accountNumber}
                setAccountNumber={bankState.setAccountNumber}
                accountHolder={bankState.accountHolder}
                setAccountHolder={bankState.setAccountHolder}
                branch={bankState.branch}
                setBranch={bankState.setBranch}
              />
            </div>
          </div>
        </form>

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
