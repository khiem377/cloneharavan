import { api } from '@/lib/axios';

const API_BASE = process.env.API_SERVER_URL || 'http://127.0.0.1:5000/api/v1';

export const searchService = {
  getSuggestions: async (query, signal) => {
    if (!query || !query.trim()) return { categories: [], products: [], blogs: [], brands: [] };
    const res = await api.get('/search/suggest', { params: { q: query.trim() }, signal });
    return res.data?.data || { categories: [], products: [], blogs: [], brands: [] };
  },

  getTrending: async (limit = 8, type = 'rising') => {
    try {
      const res = await api.get('/search/trending', { params: { limit, type } });
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  getServerTrending: async (limit = 10, type = 'all') => {
    try {
      let res;
      try {
        res = await fetch(`${API_BASE}/search/trending?limit=${limit}&type=${type}`, {
          cache: 'no-store',
        });
      } catch {
        const fallbackBase = API_BASE.includes('localhost')
          ? API_BASE.replace('localhost', '127.0.0.1')
          : API_BASE.replace('127.0.0.1', 'localhost');
        res = await fetch(`${fallbackBase}/search/trending?limit=${limit}&type=${type}`, {
          cache: 'no-store',
        });
      }
      if (!res.ok) return [];
      const json = await res.json();
      return json?.data || [];
    } catch {
      return [];
    }
  },

  globalSearch: async (params = {}) => {
    const queryParams = typeof params === 'string' ? { q: params, domain: 'products' } : { domain: 'products', ...params };
    const res = await api.get('/search', { params: queryParams });
    return res.data?.data || null;
  },

  searchByImage: async (imageFile) => {
    let fileToUpload = imageFile;
    // Nén ảnh phía client nếu file ảnh lớn hơn 150KB
    if (typeof window !== 'undefined' && imageFile?.size > 150 * 1024) {
      try {
        fileToUpload = await new Promise((resolve) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(imageFile);
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const maxDim = 800;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob && blob.size < imageFile.size) {
                  resolve(new File([blob], imageFile.name || 'visual_search.jpg', { type: 'image/jpeg' }));
                } else {
                  resolve(imageFile);
                }
              },
              'image/jpeg',
              0.8
            );
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(imageFile);
          };
          img.src = objectUrl;
        });
      } catch {
        fileToUpload = imageFile;
      }
    }

    const formData = new FormData();
    formData.append('image', fileToUpload);
    const res = await api.post('/search/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || null;
  },

  recordClick: async (keyword, productId) => {
    try {
      await api.post('/search/click', { keyword, productId });
    } catch {
    }
  },

  getServerSearchResults: async (optionsOrQuery, defaultLimit = 24) => {
    try {
      const searchParams = new URLSearchParams();

      if (typeof optionsOrQuery === 'string') {
        if (optionsOrQuery) searchParams.set('q', optionsOrQuery);
        searchParams.set('limit', String(defaultLimit));
      } else if (optionsOrQuery && typeof optionsOrQuery === 'object') {
        const {
          q = '',
          category = '',
          brand = '',
          minPrice = '',
          maxPrice = '',
          inStock = '',
          sort = 'relevance',
          page = 1,
          limit = defaultLimit,
          attrs = '',
        } = optionsOrQuery;

        if (q) searchParams.set('q', q);
        if (category) searchParams.set('category', category);
        if (brand) searchParams.set('brand', brand);
        if (minPrice) searchParams.set('minPrice', String(minPrice));
        if (maxPrice) searchParams.set('maxPrice', String(maxPrice));
        if (inStock) searchParams.set('inStock', String(inStock));
        if (sort) searchParams.set('sort', sort);
        if (page) searchParams.set('page', String(page));
        if (limit) searchParams.set('limit', String(limit));
        if (attrs) {
          searchParams.set(
            'attrs',
            typeof attrs === 'object' ? JSON.stringify(attrs) : String(attrs)
          );
        }
        const domain = optionsOrQuery?.domain || 'products';
        searchParams.set('domain', domain);
      }

      if (!searchParams.has('domain')) {
        searchParams.set('domain', 'products');
      }

      const url = `${API_BASE}/search?${searchParams.toString()}`;
      let res;
      try {
        res = await fetch(url, { cache: 'no-store' });
      } catch {
        const fallbackUrl = url.includes('localhost')
          ? url.replace('localhost', '127.0.0.1')
          : url.replace('127.0.0.1', 'localhost');
        try {
          res = await fetch(fallbackUrl, { cache: 'no-store' });
        } catch (e) {
          console.error('Failed to fetch search API:', e.message);
        }
      }

      console.log('getServerSearchResults fetch URL:', url, 'status:', res?.status);
      if (!res || !res.ok) {
        return null;
      }
      const json = await res.json();
      console.log('getServerSearchResults json products count:', json?.data?.results?.products?.length);
      return json?.data || null;
    } catch (err) {
      console.error('getServerSearchResults error:', err.message);
      return null;
    }
  },
};

export default searchService;
