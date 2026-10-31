'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';
import useCompareStore from '@/store/compareStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CompareHeaderBar from './CompareHeaderBar';
import CompareProductHeaderRow from './CompareProductHeaderRow';
import CompareSpecsTable from './CompareSpecsTable';
import CompareFeatureShowcase from './CompareFeatureShowcase';
import CompareAddProductDialog from './CompareAddProductDialog';
import { resolveProductSpecs } from '../utils/resolveProductSpecs';

export default function CompareClientView({ initialProducts = [], productIdsParam = '' }) {
  const router = useRouter();
  const { comparedProducts, removeProduct, clearAll, addProduct } = useCompareStore();
  const { addToCart } = useCartStore();

  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0 && Boolean(productIdsParam));
  const [highlightDiff, setHighlightDiff] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    const fetchComparedProducts = async () => {
      let ids = productIdsParam ? productIdsParam.split(',').filter(Boolean) : [];
      if (ids.length === 0 && comparedProducts.length > 0) {
        ids = comparedProducts.map((p) => p._id || p.id).filter(Boolean);
      }
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.post('/products/compare', { ids });
        setProducts(res.data?.data || []);
      } catch {
        setProducts(comparedProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchComparedProducts();
  }, [productIdsParam, comparedProducts, initialProducts]);

  const handleRemoveProduct = (id) => {
    removeProduct(id);
    const remaining = products.filter((p) => (p._id || p.id) !== id);
    setProducts(remaining);
    const newIds = remaining.map((p) => p._id || p.id).join(',');
    router.replace(newIds ? `/so-sanh?products=${newIds}` : '/so-sanh');
  };

  const handleClearAll = () => {
    clearAll();
    setProducts([]);
    router.replace('/so-sanh');
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddToCart = async (p) => {
    const activeVariant = p.variants?.[0] || null;
    const payload = {
      productId: p._id || p.id,
      variantId: activeVariant?._id || activeVariant?.id || undefined,
      sku: activeVariant?.sku || p.sku || undefined,
      quantity: 1,
    };
    await addToCart(payload, { isBuyNow: true });
    router.push('/checkout');
  };

  useEffect(() => {
    if (!searchQuery.trim() || !isAddModalOpen) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/products', {
          params: { q: searchQuery.trim(), limit: 6 },
        });
        setSearchResults(res.data?.data?.products || res.data?.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isAddModalOpen]);

  const handleSelectAddProduct = (item) => {
    const itemId = item._id || item.id;
    if (products.some((p) => (p._id || p.id) === itemId)) {
      setIsAddModalOpen(false);
      return;
    }
    addProduct(item);
    const updated = [...products, item];
    setProducts(updated);
    setIsAddModalOpen(false);
    setSearchQuery('');
    router.replace(`/so-sanh?products=${updated.map((p) => p._id || p.id).join(',')}`);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="w-9 h-9 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Đang tải bảng so sánh chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-[#f8f9fa] min-h-[80vh] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Card className="rounded-[6px] border border-slate-200 bg-white p-10 sm:p-14 shadow-2xs">
            <CardContent className="p-0 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-brand-light text-brand flex items-center justify-center mb-4">
                <ArrowLeftRight size={26} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Chưa có sản phẩm nào để so sánh</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                Hãy chọn ít nhất 2 sản phẩm từ danh mục hoặc tìm kiếm để tiến hành so sánh thông số kỹ thuật, giá thành và công nghệ tính năng chi tiết.
              </p>
              <Button asChild size="default" className="rounded-[6px] gap-2">
                <Link href="/">
                  <ArrowLeft size={14} /> Khám phá sản phẩm
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const productSpecsList = products.map((p) => resolveProductSpecs(p));

  return (
    <div className="bg-[#f8f9fa] min-h-[90vh] py-5 sm:py-8">
      <div className="max-w-[1536px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 space-y-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-red-600 transition">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">So sánh sản phẩm</span>
        </div>

        <CompareHeaderBar
          productCount={products.length}
          highlightDiff={highlightDiff}
          onToggleHighlightDiff={setHighlightDiff}
          onShareLink={handleCopyShareLink}
          copiedLink={copiedLink}
          onClearAll={handleClearAll}
        />

        <div className="bg-white rounded-[6px] border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[760px]">
              <div className="border-b border-slate-200 bg-white">
                <table className="w-full border-collapse text-xs">
                  <CompareProductHeaderRow
                    products={products}
                    onRemoveProduct={handleRemoveProduct}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                    onAddToCart={handleAddToCart}
                  />
                </table>
              </div>
            </div>
          </div>
        </div>

        <CompareSpecsTable
          products={products}
          productSpecsList={productSpecsList}
          highlightDiff={highlightDiff}
        />

        <CompareFeatureShowcase
          products={products}
          productSpecsList={productSpecsList}
        />
      </div>

      <CompareAddProductDialog
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searching={searching}
        searchResults={searchResults}
        products={products}
        onSelectProduct={handleSelectAddProduct}
      />
    </div>
  );
}
