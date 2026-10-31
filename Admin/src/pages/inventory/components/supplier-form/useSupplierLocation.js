import { useState, useEffect } from 'react';
import { shippingService } from '@/services/shipping.service';
import { toast } from '@/providers/ToastProvider';

export function useSupplierLocation(isOpen, supplier) {
  const [addressTab, setAddressTab] = useState('new');
  const [detailAddress, setDetailAddress] = useState('');

  const [newProvinces, setNewProvinces] = useState([]);
  const [selectedNewProvince, setSelectedNewProvince] = useState(null);
  const [newWards, setNewWards] = useState([]);
  const [selectedNewWard, setSelectedNewWard] = useState(null);
  const [loadingNewLocations, setLoadingNewLocations] = useState(false);

  const [oldProvinces, setOldProvinces] = useState([]);
  const [selectedOldProvince, setSelectedOldProvince] = useState(null);
  const [oldDistricts, setOldDistricts] = useState([]);
  const [selectedOldDistrict, setSelectedOldDistrict] = useState(null);
  const [oldWards, setOldWards] = useState([]);
  const [selectedOldWard, setSelectedOldWard] = useState(null);
  const [loadingOldLocations, setLoadingOldLocations] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProvinces() {
      try {
        const nProvinces = await shippingService.getNewProvinces();
        if (isMounted) setNewProvinces(nProvinces);
      } catch (err) {
        console.error(err);
      }

      try {
        const oProvinces = await shippingService.getProvinces();
        if (isMounted) setOldProvinces(oProvinces);
      } catch (err) {
        console.error(err);
      }
    }

    if (isOpen) {
      loadProvinces();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (supplier) {
      const addrType = supplier.addressType || 'old';
      setAddressTab(addrType);
      setDetailAddress(supplier.detailAddress || '');
    } else {
      setAddressTab('new');
      setDetailAddress('');
      setSelectedNewProvince(null);
      setSelectedNewWard(null);
      setSelectedOldProvince(null);
      setSelectedOldDistrict(null);
      setSelectedOldWard(null);
    }
  }, [isOpen, supplier]);

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

  const buildAddressPayload = () => {
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

    return addressPayload;
  };

  return {
    addressTab,
    setAddressTab,
    detailAddress,
    setDetailAddress,
    newProvinces,
    selectedNewProvince,
    newWards,
    selectedNewWard,
    loadingNewLocations,
    oldProvinces,
    selectedOldProvince,
    oldDistricts,
    selectedOldDistrict,
    oldWards,
    selectedOldWard,
    loadingOldLocations,
    handleSelectNewProvince,
    handleSelectNewWard,
    handleSelectOldProvince,
    handleSelectOldDistrict,
    handleSelectOldWard,
    getFullAddressPreview,
    buildAddressPayload,
  };
}
