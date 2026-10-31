import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/providers/ToastProvider';
import { resolveDisplayColor } from '@/utils/colorResolver';
import {
  useProductVariants,
  useBulkCreateVariants,
  useUpdateVariant,
  useDeleteVariant,
  useDeleteAllVariants,
} from '@/hooks/useProductVariants';
import { serverToLocal, cartesian } from './variantManagerUtils';

export function useVariantManagerState({ productId, parentSku }) {
  const [showOptions, setShowOptions] = useState(true);
  const { data: serverVariants = [], isLoading } = useProductVariants(productId);
  const bulkCreateMut = useBulkCreateVariants(productId);
  const updateMut = useUpdateVariant(productId);
  const deleteMut = useDeleteVariant(productId);
  const deleteAllMut = useDeleteAllVariants(productId);

  const [locals, setLocals] = useState([]);
  const [pickerMode, setPickerMode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [generateConfirm, setGenerateConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pickedMediaObjects, setPickedMediaObjects] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    setLocals(serverVariants.map(serverToLocal));
  }, [serverVariants]);

  const dirtyLocals = locals.filter((l) => l._dirty && l._serverId);

  const updateLocal = (rowId, patch) =>
    setLocals((prev) => prev.map((l) => l._rowId === rowId ? { ...l, ...patch, _dirty: true } : l));

  const setAllField = (field, value) =>
    setLocals((prev) => prev.map((l) => ({ ...l, [field]: value, _dirty: true })));

  const handleEdit = (local) => {
    if (local._serverId && productId) {
      navigate(`/products/${productId}/variants/${local._serverId}/edit`);
    }
  };

  const handlePickImage = (rowId) => setPickerMode({ rowId, type: 'thumbnail' });
  const handlePickGallery = (rowId) => setPickerMode({ rowId, type: 'images' });

  const handleImageSelected = (media) => {
    if (!pickerMode) return;
    const { rowId, type } = pickerMode;
    if (type === 'thumbnail') {
      const m = Array.isArray(media) ? media[0] : media;
      if (m) {
        updateLocal(rowId, { thumbnailMediaId: m._id, thumbnailUrl: m.url });
        setPickedMediaObjects((prev) => ({ ...prev, [m._id]: m }));
      }
    } else {
      const list = Array.isArray(media) ? media : [media];
      const newObjs = {};
      setLocals((prev) => prev.map((l) => {
        if (l._rowId !== rowId) return l;
        const ids = [...(l.imageMediaIds || [])], urls = [...(l.imageUrls || [])];
        list.forEach((m) => {
          if (!ids.includes(m._id)) {
            ids.push(m._id);
            urls.push(m.url);
            newObjs[m._id] = m;
          }
        });
        return { ...l, imageMediaIds: ids, imageUrls: urls, _dirty: true };
      }));
      setPickedMediaObjects((prev) => ({ ...prev, ...newObjs }));
    }
    setPickerMode(null);
  };

  const removeGalleryImage = (rowId, idx) => {
    setLocals((prev) => prev.map((l) => l._rowId !== rowId ? l : {
      ...l,
      imageMediaIds: (l.imageMediaIds || []).filter((_, i) => i !== idx),
      imageUrls: (l.imageUrls || []).filter((_, i) => i !== idx),
      _dirty: true,
    }));
  };

  const doGenerate = (validOptions, deleteFirst) => {
    setGenerateConfirm(null);
    const run = () => {
      const valueArrays = validOptions.map((o) => o.values.filter((v) => v.value.trim()));
      const combos = cartesian(valueArrays);
      const generated = combos.map((combo, idx) => {
        const skuSuffix = combo.map((val) => val.value.replace(/\s+/g, '').slice(0, 5).toUpperCase()).join('-');
        const sku = parentSku ? `${parentSku}-${skuSuffix}` : `VAR-${skuSuffix || idx + 1}`;
        return {
          attributes: combo.map((val, i) => {
            const isColor =
              validOptions[i].name.toLowerCase().includes('màu') ||
              validOptions[i].name.toLowerCase().includes('color') ||
              validOptions[i].type === 'color';
            return {
              name: validOptions[i].name,
              value: val.value,
              colorCode:
                val.colorCode ||
                (isColor ? resolveDisplayColor('', val.value) : ''),
            };
          }),
          sku,
          stock: 0,
          price: null,
          salePrice: null,
          isActive: true,
        };
      });
      bulkCreateMut.mutate(generated, {
        onSuccess: (res) => toast.success(res.data?.message || `Tạo ${generated.length} biến thể thành công`),
        onError: (e) => toast.error(e.response?.data?.message || 'Lỗi tạo biến thể'),
      });
    };

    if (deleteFirst) {
      deleteAllMut.mutate(undefined, { onSuccess: run, onError: () => toast.error('Lỗi xóa biến thể cũ') });
    } else {
      run();
    }
  };

  const handleGenerateRequest = (validOptions, count) => {
    if (serverVariants.length > 0) setGenerateConfirm({ validOptions, count });
    else doGenerate(validOptions, false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget || deleteTarget === 'all') return;
    deleteMut.mutate(deleteTarget._serverId, {
      onSuccess: () => { toast.success('Đã xóa biến thể'); setDeleteTarget(null); },
      onError: (e) => { toast.error(e.response?.data?.message || 'Lỗi xóa'); setDeleteTarget(null); },
    });
  };

  const handleDeleteAll = () => {
    deleteAllMut.mutate(undefined, {
      onSuccess: () => { toast.success('Đã xóa toàn bộ biến thể'); setDeleteTarget(null); },
      onError: (e) => { toast.error(e.response?.data?.message || 'Lỗi'); setDeleteTarget(null); },
    });
  };

  const handleSaveAll = async () => {
    if (!dirtyLocals.length) return;
    setIsSaving(true);
    let ok = 0, fail = 0;
    for (const local of dirtyLocals) {
      try {
        await updateMut.mutateAsync({
          id: local._serverId,
          data: {
            sku: local.sku,
            price: local.price,
            salePrice: local.salePrice,
            stock: local.stock,
            isActive: local.isActive,
            thumbnailMediaId: local.thumbnailMediaId || null,
            imageMediaIds: local.imageMediaIds || [],
          },
        });
        ok++;
      } catch { fail++; }
    }
    setIsSaving(false);
    if (ok > 0) toast.success(`Đã lưu ${ok} biến thể`);
    if (fail > 0) toast.error(`${fail} biến thể lỗi khi lưu`);
  };

  return {
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
  };
}
