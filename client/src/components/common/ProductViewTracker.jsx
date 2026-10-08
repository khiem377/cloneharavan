'use client';

import { useEffect, useRef } from 'react';
import trackingService from '@/services/tracking.service';

/**
 * ProductViewTracker
 * Tự động ghi nhận tương tác xem trang chi tiết sản phẩm và tính dwell time gửi về Recommendation Engine
 */
export default function ProductViewTracker({ product }) {
  const productId = product?._id || product?.id;
  const startTimeRef = useRef(null);
  const trackedDetailRef = useRef({});

  useEffect(() => {
    if (!productId) return;

    startTimeRef.current = Date.now();

    // Tránh React 18 StrictMode double mount gửi 2 request trùng nhau cùng mili-giây
    if (!trackedDetailRef.current[productId]) {
      trackedDetailRef.current[productId] = true;

      // Ghi nhận ngay tương tác vào trang chi tiết (weight 1.8)
      const categoryId = product.categories?.[0]?._id || product.categories?.[0] || null;
      const brandId = product.brand?._id || product.brand || null;

      trackingService.recordInteraction({
        productId,
        interactionType: 'product_detail',
        context: {
          categoryId,
          brandId,
          price: product.salePrice || product.price,
        },
      });
    }

    let hasFiredLeave = false;

    // Tính thời gian xem trang (dwell time) khi rời trang
    const handleLeave = () => {
      if (!startTimeRef.current || hasFiredLeave) return;
      hasFiredLeave = true;

      const dwellSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      const categoryId = product.categories?.[0]?._id || product.categories?.[0] || null;
      const brandId = product.brand?._id || product.brand || null;

      if (dwellSeconds >= 15) {
        // Tương tác sâu (> 15s) -> Thưởng điểm quan tâm cao
        trackingService.recordInteraction({
          productId,
          interactionType: 'view_deep',
          dwellTime: dwellSeconds,
          context: {
            categoryId,
            brandId,
          },
        });
      } else if (dwellSeconds >= 3) {
        // Tương tác xem tiêu chuẩn (3s - 14s)
        trackingService.recordInteraction({
          productId,
          interactionType: 'view',
          dwellTime: dwellSeconds,
          context: {
            categoryId,
            brandId,
          },
        });
      } else if (dwellSeconds < 2 && dwellSeconds >= 0) {
        // Thoát trang quá nhanh (< 2s) -> Tín hiệu ngầm tiêu cực (bounce)
        trackingService.recordInteraction({
          productId,
          interactionType: 'view_bounce',
          dwellTime: dwellSeconds,
          context: {
            categoryId,
            brandId,
          },
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleLeave();
      }
    };

    window.addEventListener('beforeunload', handleLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      handleLeave();
      window.removeEventListener('beforeunload', handleLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [productId]);

  return null;
}
