import { api } from '@/lib/axios';

const API_BASE = process.env.API_SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const brandService = {
  // Client-side: Tự động qua Axios Interceptor (tự gắn x-session-id & Authorization token)
  async getBrands(params = {}) {
    try {
      const response = await api.get('/brands', { params });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching brands (client):', error?.message);
      return [];
    }
  },

  async getBrandById(idOrSlug) {
    if (!idOrSlug) return null;
    try {
      const response = await api.get(`/brands/${encodeURIComponent(idOrSlug)}`);
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error fetching brand ${idOrSlug} (client):`, error?.message);
      return null;
    }
  },

  // Server-side (SSR / RSC): Ưu tiên tải phía server cho SEO và tối ưu hiệu năng
  async getServerBrands(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE}/brands${query ? `?${query}` : ''}`;
      
      let res;
      try {
        res = await fetch(url, { cache: 'no-store' });
      } catch {
        const fallbackBase = API_BASE.includes('localhost')
          ? API_BASE.replace('localhost', '127.0.0.1')
          : API_BASE.replace('127.0.0.1', 'localhost');
        res = await fetch(`${fallbackBase}/brands${query ? `?${query}` : ''}`, { cache: 'no-store' });
      }

      if (!res.ok) {
        console.error(`SSR getBrands failed: ${res.status} ${res.statusText}`);
        return [];
      }
      const json = await res.json();
      return json?.data || [];
    } catch (err) {
      console.error('SSR getBrands error:', err?.message);
      return [];
    }
  },

  async getServerBrandBySlug(slugOrId) {
    if (!slugOrId) return null;
    try {
      const url = `${API_BASE}/brands/${encodeURIComponent(slugOrId)}`;
      let res;
      try {
        res = await fetch(url, { cache: 'no-store' });
      } catch {
        const fallbackBase = API_BASE.includes('localhost')
          ? API_BASE.replace('localhost', '127.0.0.1')
          : API_BASE.replace('127.0.0.1', 'localhost');
        res = await fetch(`${fallbackBase}/brands/${encodeURIComponent(slugOrId)}`, { cache: 'no-store' });
      }

      if (!res.ok) {
        if (res.status === 404) return null;
        console.error(`SSR getBrandBySlug failed: ${res.status} ${res.statusText}`);
        return null;
      }
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.error('SSR getBrandBySlug error:', err?.message);
      return null;
    }
  },

  async getProductsByBrand(brandSlugOrId, params = {}) {
    try {
      const response = await api.get('/products', {
        params: { brand: brandSlugOrId, ...params },
      });
      return {
        products: response.data?.data || [],
        pagination: response.data?.pagination || { total: 0, totalPages: 1 },
      };
    } catch (error) {
      console.error('Error fetching products by brand (client):', error?.message);
      return { products: [], pagination: { total: 0, totalPages: 1 } };
    }
  },

  async getServerProductsByBrand(brandSlugOrId, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        brand: brandSlugOrId,
        ...params,
      }).toString();
      const url = `${API_BASE}/products?${queryParams}`;
      let res;
      try {
        res = await fetch(url, { cache: 'no-store' });
      } catch {
        const fallbackBase = API_BASE.includes('localhost')
          ? API_BASE.replace('localhost', '127.0.0.1')
          : API_BASE.replace('127.0.0.1', 'localhost');
        res = await fetch(`${fallbackBase}/products?${queryParams}`, { cache: 'no-store' });
      }
      if (!res.ok) return { products: [], pagination: { total: 0, totalPages: 1 } };
      const json = await res.json();
      return {
        products: json?.data || [],
        pagination: json?.pagination || { total: json?.data?.length || 0, totalPages: 1 },
      };
    } catch (err) {
      console.error('SSR getProductsByBrand error:', err?.message);
      return { products: [], pagination: { total: 0, totalPages: 1 } };
    }
  },
};

export default brandService;
