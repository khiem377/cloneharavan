export const calculateFinalPrice = (orig, type, val) => {
  if (type === 'percent') {
    const pct = Math.max(0, Math.min(99, Number(val) || 0));
    return Math.round(orig * (1 - pct / 100));
  }
  if (type === 'fixed_discount') {
    const disc = Math.max(0, Number(val) || 0);
    return Math.max(0, orig - disc);
  }
  if (type === 'fixed_price') {
    const price = Math.max(0, Number(val) || 0);
    return Math.min(orig, price);
  }
  return orig;
};

export const mapInitialFlashSaleItems = (rawItems = []) => {
  return rawItems.map((item) => {
    const orig = item.originalPrice || 0;
    const fsPrice = item.flashSalePrice || 0;
    const pct = orig > 0 ? Math.round(((orig - fsPrice) / orig) * 100) : 0;

    let vName = '';
    if (item.variantId) {
      if (typeof item.variantId === 'object') {
        vName = item.variantId.attributes?.map((a) => `${a.name}: ${a.value}`).join(', ') || item.variantId.sku || item.variantId.nameOverride || '';
      } else {
        vName = item.variantId;
      }
    }

    const invStock = typeof item.productId === 'object'
      ? (item.variantId && typeof item.variantId === 'object' ? item.variantId.stock : item.productId?.stock)
      : null;
    const allSold = typeof item.productId === 'object'
      ? (item.variantId && typeof item.variantId === 'object' ? item.variantId.sold : item.productId?.sold || 0)
      : 0;

    return {
      productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
      productName: typeof item.productId === 'object' ? item.productId.name : 'Sản phẩm',
      productImage: typeof item.productId === 'object' ? (typeof item.productId.thumbnail === 'string' ? item.productId.thumbnail : item.productId.thumbnail?.url || '') : '',
      variantId: item.variantId ? (typeof item.variantId === 'object' ? item.variantId._id : item.variantId) : null,
      variantName: vName,
      inventoryStock: invStock,
      totalSold: allSold,
      originalPrice: orig,
      discountType: 'percent',
      discountValue: pct,
      flashSalePrice: fsPrice,
      stockLimit: item.stockLimit || 10,
      soldCount: item.soldCount || 0,
    };
  });
};

export const createItemFromProduct = (product, defaultPct = 30) => {
  const price = product.salePrice || product.price || 0;
  const fsPrice = Math.round(price * (1 - defaultPct / 100));
  return {
    productId: product._id,
    productName: product.name,
    productImage: (typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail?.url) || '',
    variantId: null,
    variantName: '',
    inventoryStock: product.stock ?? 0,
    totalSold: product.sold ?? 0,
    originalPrice: price,
    discountType: 'percent',
    discountValue: defaultPct,
    flashSalePrice: fsPrice,
    stockLimit: Math.min(product.stock || 10, 20),
    soldCount: 0,
  };
};

export const createItemFromVariant = (product, variant, defaultPct = 30) => {
  const price = variant.price || product.salePrice || product.price || 0;
  const fsPrice = Math.round(price * (1 - defaultPct / 100));
  const attrString = variant.attributes?.map((a) => `${a.name}: ${a.value}`).join(', ') || variant.sku || 'Biến thể';
  const vImg = typeof variant.image === 'string' ? variant.image : variant.image?.url;
  const pImg = typeof product.thumbnail === 'string' ? product.thumbnail : product.thumbnail?.url;
  return {
    productId: product._id,
    productName: product.name,
    productImage: vImg || pImg || '',
    variantId: variant._id,
    variantName: attrString,
    inventoryStock: variant.stock ?? product.stock ?? 0,
    totalSold: variant.sold ?? product.sold ?? 0,
    originalPrice: price,
    discountType: 'percent',
    discountValue: defaultPct,
    flashSalePrice: fsPrice,
    stockLimit: Math.min(variant.stock || 10, 20),
    soldCount: 0,
  };
};
