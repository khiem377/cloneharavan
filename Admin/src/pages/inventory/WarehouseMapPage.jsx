import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { warehouseService } from '@/services/warehouse.service';
import { toast } from '@/providers/ToastProvider';
import { cn } from '@/lib/utils';

// Subcomponents & Constants
import {
  DEFAULT_AMIS_LAYOUT,
  STORAGE_KEY_PREFIX,
} from './warehouse-map/constants/defaultAmisLayout';
import WarehouseMapToolbar from './warehouse-map/components/WarehouseMapToolbar';
import PaletteToolbox from './warehouse-map/components/PaletteToolbox';
import LocationSidebarTree from './warehouse-map/components/LocationSidebarTree';
import WarehouseMapCanvas from './warehouse-map/components/WarehouseMapCanvas';
import LocationDetailModal from './warehouse-map/components/LocationDetailModal';

export default function WarehouseMapPage() {
  const navigate = useNavigate();

  // Danh sách kho từ backend
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  // Mode: 'view' (Tra cứu & click xem tồn) | 'edit' (Thiết lập kéo thả)
  const [mode, setMode] = useState('view');

  // Floor plan items (Local state per warehouse - NOT TOUCHING DB)
  const [elements, setElements] = useState(DEFAULT_AMIS_LAYOUT);
  const [selectedElementId, setSelectedElementId] = useState(null);

  // Hiển thị vị trí còn tồn switch
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);

  // Search vị trí bên sidebar trái
  const [locationSearch, setLocationSearch] = useState('');

  // Zoom level & Fullscreen
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dragging state on canvas (Builder mode)
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Modal xem chi tiết vị trí (Screenshot 3)
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectElement, setInspectElement] = useState(null);

  // 1. Fetch Warehouses list for selector
  useEffect(() => {
    const fetchWh = async () => {
      try {
        const res = await warehouseService.getWarehouses();
        const list = res.data?.data?.data || [];
        setWarehouses(list);
        const def = list.find((w) => w.isDefault) || list[0];
        if (def) setSelectedWarehouseId(def._id);
      } catch (err) {
        console.warn('Lỗi tải danh mục kho:', err);
      }
    };
    fetchWh();
  }, []);

  // 2. Load layout from LocalStorage or Fallback to Default AMIS Layout
  useEffect(() => {
    if (!selectedWarehouseId) return;
    const storageKey = `${STORAGE_KEY_PREFIX}${selectedWarehouseId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setElements(parsed);
          return;
        }
      } catch (e) {
        console.warn('Lỗi phân tích layout từ localStorage:', e);
      }
    }
    // Fallback: Default AMIS layout
    setElements(DEFAULT_AMIS_LAYOUT);
  }, [selectedWarehouseId]);

  // Lưu layout vào localStorage
  const handleSaveLayout = () => {
    if (!selectedWarehouseId) return;
    const storageKey = `${STORAGE_KEY_PREFIX}${selectedWarehouseId}`;
    localStorage.setItem(storageKey, JSON.stringify(elements));
    toast.success('Đã lưu sơ đồ kho hàng thành công (Lưu trên trình duyệt, không ảnh hưởng DB)!');
  };

  // Khôi phục layout mẫu MISA AMIS
  const handleResetToDefault = () => {
    if (!window.confirm('Khôi phục lại sơ đồ mẫu mặc định chuẩn MISA AMIS?')) return;
    setElements(DEFAULT_AMIS_LAYOUT);
    if (selectedWarehouseId) {
      const storageKey = `${STORAGE_KEY_PREFIX}${selectedWarehouseId}`;
      localStorage.setItem(storageKey, JSON.stringify(DEFAULT_AMIS_LAYOUT));
    }
    toast.success('Đã khôi phục sơ đồ mẫu thành công');
  };

  // Thêm thành phần mới vào canvas (Builder Mode)
  const handleAddPaletteItem = (type, subType, label) => {
    const nextId = `${type}-${Date.now().toString().slice(-4)}`;
    const newEl = {
      id: nextId,
      type,
      subType,
      name: label,
      x: 350 + (elements.length % 5) * 40,
      y: 220 + (elements.length % 4) * 30,
      width: type === 'rack' ? 28 : type === 'room' ? 120 : type === 'door' ? 40 : 36,
      height: type === 'rack' ? 180 : type === 'room' ? 100 : type === 'door' ? 16 : 36,
      rotation: 0,
      slots: type === 'rack' ? 5 : undefined,
      hasStock: true,
      items: [
        { sku: 'SKU-NEW-01', name: `Hàng hóa mới tại ${label}`, unit: 'Cái', stock: 10 },
      ],
    };

    if (type === 'room') {
      newEl.color = subType === 'cold' ? '#c27848' : '#3b82f6';
      newEl.bgColor = subType === 'cold' ? 'rgba(194, 120, 72, 0.15)' : 'rgba(59, 130, 246, 0.12)';
      newEl.borderColor = newEl.color;
    }

    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(newEl.id);
    toast.success(`Đã thêm [${label}] vào sơ đồ`);
  };

  // Xoay 90 độ
  const handleRotateElement = (id) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          const nextRot = (el.rotation + 90) % 360;
          return { ...el, rotation: nextRot };
        }
        return el;
      })
    );
  };

  // Xóa thành phần
  const handleDeleteElement = (id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  // Mouse drag handlers on canvas in Builder mode
  const handleMouseDownItem = (e, item) => {
    if (mode !== 'edit') return;
    e.stopPropagation();
    setSelectedElementId(item.id);
    setDraggingId(item.id);

    const canvasRect = e.currentTarget.parentElement.getBoundingClientRect();
    const offsetX = (e.clientX - canvasRect.left) / zoom - item.x;
    const offsetY = (e.clientY - canvasRect.top) / zoom - item.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleCanvasMouseMove = (e) => {
    if (mode !== 'edit' || !draggingId) return;
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(140, Math.min(990, Math.round(((e.clientX - canvasRect.left) / zoom - dragOffset.x) / 5) * 5));
    const newY = Math.max(20, Math.min(520, Math.round(((e.clientY - canvasRect.top) / zoom - dragOffset.y) / 5) * 5));

    setElements((prev) =>
      prev.map((el) => (el.id === draggingId ? { ...el, x: newX, y: newY } : el))
    );
  };

  const handleCanvasMouseUp = () => {
    setDraggingId(null);
  };

  // Mở modal kiểm tra chi tiết
  const openInspectForElement = (el) => {
    setInspectElement(el);
    setInspectModalOpen(true);
  };

  // Click vào element trên canvas
  const handleElementClick = (el) => {
    setSelectedElementId(el.id);
    if (mode === 'view' && (el.type === 'rack' || el.type === 'room')) {
      openInspectForElement(el);
    }
  };

  // Lọc cây vị trí bên cột trái
  const treeLocations = useMemo(() => {
    const list = elements.filter((el) => el.type === 'rack' || el.type === 'room');
    if (!locationSearch.trim()) return list;
    const q = locationSearch.toLowerCase().trim();
    return list.filter(
      (el) =>
        (el.name && el.name.toLowerCase().includes(q)) ||
        (el.code && el.code.toLowerCase().includes(q))
    );
  }, [elements, locationSearch]);

  const selectedWarehouseObj = warehouses.find((w) => w._id === selectedWarehouseId);

  return (
    <div
      className={cn(
        "space-y-4 p-4 md:p-6 bg-background min-h-[calc(100vh-56px)] select-none",
        isFullscreen && "fixed inset-0 z-50 p-6 overflow-hidden bg-background"
      )}
    >
      {/* 1. TOP HEADER TOOLBAR */}
      <WarehouseMapToolbar
        navigate={navigate}
        warehouses={warehouses}
        selectedWarehouseId={selectedWarehouseId}
        setSelectedWarehouseId={setSelectedWarehouseId}
        mode={mode}
        setMode={setMode}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        handleResetToDefault={handleResetToDefault}
        handleSaveLayout={handleSaveLayout}
      />

      {/* 2. MAIN SPLIT LAYOUT: LEFT SIDEBAR + CENTER 2D CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN (3 Cols) */}
        <div className="lg:col-span-3 rounded-[6px] border border-border bg-card overflow-hidden shadow-xs">
          {mode === 'view' ? (
            <LocationSidebarTree
              treeLocations={treeLocations}
              locationSearch={locationSearch}
              setLocationSearch={setLocationSearch}
              selectedElementId={selectedElementId}
              handleElementClick={handleElementClick}
            />
          ) : (
            <PaletteToolbox
              elements={elements}
              handleAddPaletteItem={handleAddPaletteItem}
            />
          )}
        </div>

        {/* CENTER COLUMN (9 Cols): Interactive 2D Canvas */}
        <div className="lg:col-span-9">
          <WarehouseMapCanvas
            selectedWarehouseObj={selectedWarehouseObj}
            mode={mode}
            filterInStockOnly={filterInStockOnly}
            setFilterInStockOnly={setFilterInStockOnly}
            zoom={zoom}
            setZoom={setZoom}
            elements={elements}
            selectedElementId={selectedElementId}
            draggingId={draggingId}
            handleCanvasMouseMove={handleCanvasMouseMove}
            handleCanvasMouseUp={handleCanvasMouseUp}
            handleElementClick={handleElementClick}
            handleMouseDownItem={handleMouseDownItem}
            handleRotateElement={handleRotateElement}
            handleDeleteElement={handleDeleteElement}
            openInspectForElement={openInspectForElement}
          />
        </div>
      </div>

      {/* 3. POPUP MODAL THÔNG TIN HÀNG HÓA TẠI VỊ TRÍ (Screenshot 3) */}
      <LocationDetailModal
        inspectModalOpen={inspectModalOpen}
        setInspectModalOpen={setInspectModalOpen}
        inspectElement={inspectElement}
      />
    </div>
  );
}
