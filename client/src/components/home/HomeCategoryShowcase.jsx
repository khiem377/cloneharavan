'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ArrowRight, 
  Laptop, 
  Tv, 
  Headphones, 
  Gamepad2, 
  Briefcase, 
  Feather, 
  Layers, 
  Tag
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StaggerGrid, StaggerItem } from '@/components/common/ScrollReveal';
import { productService } from '@/services/product.service';

/**
 * Sub-category visual helper: Icon và tag
 */
const getSubCategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('gaming') || n.includes('chơi game')) return Gamepad2;
  if (n.includes('văn phòng') || n.includes('doanh nhân') || n.includes('học tập')) return Briefcase;
  if (n.includes('mỏng nhẹ') || n.includes('nhẹ') || n.includes('di động')) return Feather;
  if (n.includes('tivi') || n.includes('tv') || n.includes('oled') || n.includes('qled')) return Tv;
  if (n.includes('loa') || n.includes('tai nghe') || n.includes('âm thanh')) return Headphones;
  if (n.includes('laptop') || n.includes('máy tính')) return Laptop;
  return Layers;
};

/**
 * HomeCategoryShowcase - Khối Ngành Hàng Chuẩn Storefront TMĐT
 * - Không gán ảnh/banner cứng, hoàn toàn tự động lấy từ Database danh mục & sản phẩm
 * - Bố cục lưới 5 cột (10 sản phẩm = 2 hàng x 5 cột) đồng bộ toàn bộ Homepage
 * - Bộ lọc sub-categories + brand pills dạng text/button chuẩn UI/UX
 */
export default function HomeCategoryShowcase({
  category = null,
  initialProducts = [],
  brands = [],
}) {
  if (!category) return null;

  const categoryName = category.name || 'Ngành hàng';
  const categorySlug = category.slug || '';
  const subCategoriesFromDb = Array.isArray(category.children) ? category.children : [];

  // Danh sách Tab con từ Database
  const subTabs = [
    { id: 'all', label: 'Tất cả', slug: categorySlug },
    ...subCategoriesFromDb.map((sub) => ({
      id: sub.slug || sub._id,
      label: sub.name,
      slug: sub.slug,
    })),
  ];

  // LỌC CHÍNH XÁC: Chỉ hiển thị các Thương hiệu THỰC SỰ CÓ SẢN PHẨM trong ngành hàng này
  const relevantBrands = React.useMemo(() => {
    if (!Array.isArray(initialProducts) || initialProducts.length === 0) return [];

    const brandMap = new Map();
    initialProducts.forEach((p) => {
      const b = p.brand;
      if (b && typeof b === 'object' && (b.name || b.slug)) {
        const key = (b.slug || b.name || '').toLowerCase();
        if (key && !brandMap.has(key)) {
          brandMap.set(key, {
            _id: b._id || b.id,
            name: b.name,
            slug: b.slug || b.name.toLowerCase(),
          });
        }
      }
    });

    if (Array.isArray(brands) && brands.length > 0) {
      return Array.from(brandMap.values()).map((b) => {
        const found = brands.find(
          (globalBrand) =>
            globalBrand._id === b._id ||
            globalBrand.slug?.toLowerCase() === b.slug?.toLowerCase() ||
            globalBrand.name?.toLowerCase() === b.name?.toLowerCase()
        );
        return found || b;
      });
    }

    return Array.from(brandMap.values());
  }, [initialProducts, brands]);

  const [activeTab, setActiveTab] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [products, setProducts] = useState(initialProducts);
  const [isPending, startTransition] = useTransition();

  // Xử lý đổi bộ lọc Tab / Brand
  const handleFilterChange = (tabId, brandSlug) => {
    setActiveTab(tabId);
    if (brandSlug !== undefined) setActiveBrand(brandSlug);

    const selectedTab = subTabs.find((t) => t.id === tabId);
    const targetCategorySlug = selectedTab?.id === 'all' ? categorySlug : selectedTab?.slug;

    startTransition(async () => {
      const params = {
        limit: 10,
        category: targetCategorySlug,
      };

      const targetBrand = brandSlug !== undefined ? brandSlug : activeBrand;
      if (targetBrand && targetBrand !== 'all') {
        params.brand = targetBrand;
      }

      try {
        const data = await productService.getProducts(params);
        setProducts(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        console.error('Lỗi lọc showcase category:', err?.message);
      }
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 my-6" aria-label={categoryName}>
      <div className="bg-white rounded-[6px] border border-slate-200 p-4 sm:p-5">
        
        {/* ─── HEADER KHỐI: Tiêu đề + Danh mục con + Link Xem tất cả ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight uppercase">
              {categoryName}
            </h2>
          </div>

          {/* Sub-categories dạng Tabs */}
          {subTabs.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {subTabs.map((sub) => {
                const isActive = activeTab === sub.id;
                const IconComp = getSubCategoryIcon(sub.label);
                return (
                  <Button
                    key={sub.id}
                    type="button"
                    variant={isActive ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => handleFilterChange(sub.id, activeBrand)}
                    className={`font-semibold whitespace-nowrap text-xs gap-1.5 h-7.5 px-3 ${
                      isActive
                        ? 'bg-slate-900 hover:bg-slate-950 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span>{sub.label}</span>
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── HÀNG BRAND FILTER PILLS CỦA NGÀNH HÀNG ─── */}
        {relevantBrands.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 my-1 border-b border-slate-100 text-xs">
            <span className="text-slate-400 font-medium shrink-0 text-[11px] flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              Thương hiệu:
            </span>
            <Button
              type="button"
              variant={activeBrand === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(activeTab, 'all')}
              className={`h-6.5 px-2.5 rounded-[4px] font-medium whitespace-nowrap text-xs ${
                activeBrand === 'all'
                  ? 'bg-red-600 hover:bg-red-700 text-white border-transparent'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              Tất cả
            </Button>
            {relevantBrands.slice(0, 12).map((b) => {
              const bSlug = b.slug || b._id;
              const isSelected = activeBrand === bSlug;
              return (
                <Button
                  key={b._id || bSlug}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange(activeTab, bSlug)}
                  className={`h-6.5 px-2.5 rounded-[4px] font-medium whitespace-nowrap text-xs ${
                    isSelected
                      ? 'bg-red-600 hover:bg-red-700 text-white border-transparent'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {b.name}
                </Button>
              );
            })}
          </div>
        )}

        {/* ─── LƯỚI SẢN PHẨM: 5 CỘT (2 HÀNG X 5 CỘT = 10 ITEMS) CHUẨN STOREFRONT ─── */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.div
                key="showcase-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3"
              >
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={`showcase-skel-${idx}`}
                    className="rounded-[6px] border border-slate-200 bg-white p-3 space-y-3 animate-pulse"
                  >
                    <div className="aspect-square w-full rounded-[4px] bg-slate-100" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-5 bg-slate-100 rounded w-2/3" />
                  </div>
                ))}
              </motion.div>
            ) : products && products.length > 0 ? (
              <StaggerGrid
                key={`${activeTab}-${activeBrand}`}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3"
              >
                {products.slice(0, 10).map((prod) => (
                  <StaggerItem key={prod._id || prod.id}>
                    <ProductCard product={prod} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs font-medium bg-slate-50 rounded-[6px] border border-dashed border-slate-200">
                Chưa tìm thấy sản phẩm phù hợp với thương hiệu & danh mục đã chọn.
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── FOOTER KHỐI: NÚT XEM TẤT CẢ SẢN PHẨM ─── */}
        <div className="mt-6 pt-3 border-t border-slate-100 text-center flex items-center justify-center">
          <Link href={`/collections/${categorySlug}`}>
            <Button
              variant="outline"
              className="border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 px-6 h-8.5 gap-1.5"
            >
              <span>Xem tất cả sản phẩm {categoryName}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
