import React from 'react';
import { notFound } from 'next/navigation';
import productServerService from '@/services/product.server.service';
import ProductDetailClient from '@/components/product/detail/ProductDetailClient';

export const revalidate = 60;

/**
 * Sinh Dynamic SEO Metadata chuẩn E-commerce
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const handle = resolvedParams?.handle;
  if (!handle) {
    return { title: 'Sản phẩm | Haravan' };
  }

  const product = await productServerService.getProductBySlug(handle);
  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | Haravan',
      description: 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.',
    };
  }

  const title = `${product.name} | Chính hãng, Giá tốt`;
  const plainDesc = product.description
    ? product.description.replace(/<[^>]*>?/gm, '').slice(0, 160)
    : `Mua ngay ${product.name} chính hãng, bảo hành chu đáo, giao hàng toàn quốc tại Haravan.`;

  const thumbUrl =
    (typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail?.url) ||
    product.images?.[0]?.url ||
    '';

  return {
    title,
    description: plainDesc,
    openGraph: {
      title,
      description: plainDesc,
      images: thumbUrl ? [{ url: thumbUrl }] : [],
      type: 'website',
    },
  };
}

/**
 * Server Component SSR trang chi tiết sản phẩm
 */
export default async function ProductDetailPage({ params }) {
  try {
    const resolvedParams = await params;
    const handle = resolvedParams?.handle;

    if (!handle) {
      notFound();
    }

  // 1. Fetch dữ liệu sản phẩm chính từ Server Service
  const product = await productServerService.getProductBySlug(handle);
  if (!product) {
    notFound();
  }

  const productId = product._id || product.id;
  const categoryIds = (product.categories || []).map((c) => c._id || c);
  const primaryCategoryId = categoryIds[0] || null;

  // 2. Fetch song song các nguồn dữ liệu chuyên sâu:
  // - Biến thể
  // - Deals (Khuyến mãi, Quà tặng kèm Mua-Gì-Tặng-Nấy, Coupons)
  // - Upsell (Dữ liệu nâng cấp phiên bản / đời máy cao hơn)
  // - Gợi ý cùng loại (Similar Products)
  // - Gợi ý cá nhân hóa (Python SVD Matrix Factorization)
  // - Chương trình tặng kèm (Gift Programs)
  // - Sản phẩm bổ trợ khác danh mục (Complementary Products)
  const [
    variants,
    deals,
    upsellData,
    similarProducts,
    personalizedProducts,
    allGiftPrograms,
    complementaryProducts,
  ] = await Promise.all([
    productServerService.getProductVariants(productId),
    productServerService.getProductDeals(handle),
    productServerService.getProductUpsell(productId),
    productServerService.getSimilarProducts(productId, primaryCategoryId, 12),
    productServerService.getPersonalizedRecommendations(12),
    productServerService.getGiftPrograms(),
    productServerService.getComplementaryProducts(productId, categoryIds, 10),
  ]);

  // Xây dựng danh sách quà tặng kèm & sản phẩm mua cùng thật từ chương trình tặng kèm:
  const giftProductMap = new Map();

  // Ưu tiên 1: Quà tặng từ chính deal của sản phẩm này (Chương trình tặng kèm Mua X Tặng Y)
  (deals?.giftPrograms || []).forEach((gp) => {
    (gp.giftProducts || []).forEach((item) => {
      const prod = item.productId;
      if (prod && (prod._id || prod.id)) {
        giftProductMap.set(String(prod._id || prod.id), {
          ...prod,
          _giftBadge: `QUÀ TẶNG (${gp.name})`,
          _giftProgramName: gp.name,
          _giftTriggerQty: gp.triggerQty,
        });
      }
    });
  });

  // Ưu tiên 2: Quà tặng từ các chương trình tặng kèm đang chạy trên hệ thống
  (allGiftPrograms || []).forEach((gp) => {
    (gp.giftProducts || []).forEach((item) => {
      const prod = item.productId;
      if (prod && (prod._id || prod.id) && !giftProductMap.has(String(prod._id || prod.id))) {
        giftProductMap.set(String(prod._id || prod.id), {
          ...prod,
          _giftBadge: `QUÀ TẶNG (${gp.name})`,
          _giftProgramName: gp.name,
          _giftTriggerQty: gp.triggerQty,
        });
      }
    });
  });

  // Ghép thêm sản phẩm phụ kiện / khác danh mục (Soundbar, Loa...) nếu còn chỗ, tuyệt đối không lấy cùng loại Tivi
  const giftList = Array.from(giftProductMap.values());
  const remainingSlots = Math.max(0, 4 - giftList.length);
  const bundleExtras = (complementaryProducts || []).slice(0, remainingSlots);
  const frequentlyBought = [...giftList, ...bundleExtras];

    return (
      <ProductDetailClient
        product={product}
        variants={variants || []}
        deals={deals || null}
        upsellData={upsellData || null}
        similarProducts={similarProducts || []}
        personalizedProducts={personalizedProducts || []}
        frequentlyBought={frequentlyBought}
      />
    );
  } catch (err) {
    console.error('SERVER RENDERING ERROR ON PDP:', err);
    throw err;
  }
}
