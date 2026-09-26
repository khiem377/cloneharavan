const upsellService = require('../services/upsell.service');

const getByVariant = async (req, res, next) => {
    try {
        const { variantId } = req.params;
        const data = await upsellService.getUpsellByVariant(variantId);
        if (!data) return res.json({ success: true, data: null });
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const getByProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const data = await upsellService.getUpsellByProduct(productId);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

module.exports = { getByVariant, getByProduct };
