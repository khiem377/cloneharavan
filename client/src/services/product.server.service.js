const API_SERVER_URL = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const productServerService = {
  /**
   * Lấy danh sách sản phẩm với các bộ lọc (category, brand, sort, limit, ...)
   * @param {Object} params
   */
  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_SERVER_URL}/products${queryString}`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) {
        console.error(`SSR getProducts failed: ${res.status} ${res.statusText}`);
        return [];
      }
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR getProducts error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy chi tiết sản phẩm theo slug hoặc ObjectId
   * @param {string} slugOrId 
   */
  async getProductBySlug(slugOrId) {
    if (!slugOrId) return null;
    try {
      const res = await fetch(`${API_SERVER_URL}/products/${encodeURIComponent(slugOrId)}`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        console.error(`SSR getProductBySlug failed: ${res.status} ${res.statusText}`);
        return null;
      }
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.error('SSR getProductBySlug error:', err?.message);
      return null;
    }
  },

  /**
   * Lấy danh sách toàn bộ biến thể của sản phẩm
   * @param {string} productId 
   */
  async getProductVariants(productId) {
    if (!productId) return [];
    try {
      const res = await fetch(`${API_SERVER_URL}/products/${productId}/variants`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR getProductVariants error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy danh sách ưu đãi, quà tặng kèm, coupons & flash sale
   * @param {string} slugOrId 
   */
  async getProductDeals(slugOrId) {
    if (!slugOrId) return null;
    try {
      const res = await fetch(`${API_SERVER_URL}/products/${encodeURIComponent(slugOrId)}/deals`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.error('SSR getProductDeals error:', err?.message);
      return null;
    }
  },

  /**
   * Lấy dữ liệu Upsell (Nâng cấp cấu hình / Nâng cấp model cao cấp hơn)
   * @param {string} productId 
   */
  async getProductUpsell(productId) {
    if (!productId) return null;
    try {
      const res = await fetch(`${API_SERVER_URL}/upsell/product/${productId}`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.error('SSR getProductUpsell error:', err?.message);
      return null;
    }
  },

  /**
   * Lấy danh sách sản phẩm tương tự (Recommendation Item-CF hoặc Fallback danh mục)
   * @param {string} productId 
   * @param {string} [categoryId]
   * @param {number} [limit=6]
   */
  async getSimilarProducts(productId, categoryId = null, limit = 6) {
    if (!productId) return [];
    try {
      // 1. Thử lấy từ Recommendation API
      const res = await fetch(`${API_SERVER_URL}/recommendations/similar/${productId}?limit=${limit}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const json = await res.json();
        const items = json?.data || [];
        if (Array.isArray(items) && items.length > 0) return items;
      }

      // 2. Fallback sang Category nếu recommendation trống
      if (categoryId) {
        const catRes = await fetch(`${API_SERVER_URL}/products?category=${categoryId}&limit=${limit}`, {
          next: { revalidate: 60 },
        });
        if (catRes.ok) {
          const catJson = await catRes.json();
          const catProducts = catJson?.data?.filter((p) => (p._id || p.id) !== productId) || [];
          return catProducts.slice(0, limit);
        }
      }

      return [];
    } catch (err) {
      console.error('SSR getSimilarProducts error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy danh sách gợi ý cá nhân hóa (Python SVD Matrix Factorization)
   * @param {number} [limit=6]
   */
  async getPersonalizedRecommendations(limit = 6) {
    try {
      const res = await fetch(`${API_SERVER_URL}/recommendations/personalized?limit=${limit}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const json = await res.json();
        const items = json?.data || [];
        if (Array.isArray(items) && items.length > 0) return items;
      }

      // Fallback sang trending
      const trendRes = await fetch(`${API_SERVER_URL}/recommendations/trending?limit=${limit}`, {
        next: { revalidate: 60 },
      });
      if (trendRes.ok) {
        const trendJson = await trendRes.json();
        return trendJson?.data || [];
      }
      return [];
    } catch (err) {
      console.error('SSR getPersonalizedRecommendations error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy danh sách toàn bộ chương trình tặng kèm đang chạy
   */
  async getGiftPrograms() {
    try {
      const res = await fetch(`${API_SERVER_URL}/gift-programs`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR getGiftPrograms error:', err?.message);
      return [];
    }
  },

  /**
   * Lấy sản phẩm phụ kiện / mua kèm khác danh mục (Cross-sell, tránh cùng loại TV)
   */
  async getComplementaryProducts(excludeProductId, excludeCategoryIds = [], limit = 6) {
    try {
      const res = await fetch(`${API_SERVER_URL}/products?limit=25`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) return [];
      const json = await res.json();
      const all = json?.data || [];
      const excludeCatSet = new Set(excludeCategoryIds.map((id) => String(id)));

      // Lọc sản phẩm khác danh mục chính và khác sản phẩm đang xem
      const complementary = all.filter((p) => {
        const pId = String(p._id || p.id);
        if (pId === String(excludeProductId)) return false;
        const pCats = (p.categories || []).map((c) => String(c?._id || c));
        const isSameCategory = pCats.some((c) => excludeCatSet.has(c));
        return !isSameCategory;
      });

      return complementary.slice(0, limit);
    } catch (err) {
      console.error('SSR getComplementaryProducts error:', err?.message);
      return [];
    }
  },
};

export default productServerService;
