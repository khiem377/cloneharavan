const store = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, item] of store.entries()) {
    if (item.expireAt && now >= item.expireAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

const cacheService = {
  get: (key) => {
    const item = store.get(key);
    if (!item) return null;
    if (item.expireAt && Date.now() >= item.expireAt) {
      store.delete(key);
      return null;
    }
    return item.value;
  },

  set: (key, value, ttlSeconds = 300) => {
    const expireAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    store.set(key, { value, expireAt });
  },

  del: (key) => {
    store.delete(key);
  },

  delByPrefix: (prefix) => {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) {
        store.delete(key);
      }
    }
  },

  clear: () => {
    store.clear();
  },

  getOrSet: async (key, fetcher, ttlSeconds = 300) => {
    const cached = cacheService.get(key);
    if (cached !== null) return cached;
    const freshData = await fetcher();
    if (freshData !== undefined && freshData !== null) {
      cacheService.set(key, freshData, ttlSeconds);
    }
    return freshData;
  },
};

module.exports = cacheService;
