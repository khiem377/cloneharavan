const UpsellSuggestion = require('../models/upsellSuggestion.model');

const getUpsellByVariant = async (variantId) => {
    if (!variantId) return null;

    const doc = await UpsellSuggestion.findOne({ variantId })
        .populate('tier1Suggestions.variantId', 'displayName sku price salePrice stock thumbnail attributes')
        .populate('tier1Suggestions.productId', 'name slug thumbnail')
        .populate('tier2Suggestions.productId', 'name slug thumbnail cachedPrice cachedSalePrice isFeatured isHot')
        .lean();

    if (!doc) return null;
    if (doc.tier === 0) return null;

    return {
        tier: doc.tier,
        tier1: doc.tier1Suggestions || [],
        tier2: doc.tier2Suggestions || [],
        lastCalculatedAt: doc.lastCalculatedAt,
    };
};

const getUpsellByProduct = async (productId) => {
    if (!productId) return [];

    const docs = await UpsellSuggestion.find({ productId })
        .select('variantId tier tier1Suggestions tier2Suggestions lastCalculatedAt')
        .lean();

    return docs.map(d => ({
        variantId: d.variantId,
        tier: d.tier,
        tier1: d.tier1Suggestions || [],
        tier2: d.tier2Suggestions || [],
        lastCalculatedAt: d.lastCalculatedAt,
    }));
};

module.exports = { getUpsellByVariant, getUpsellByProduct };
