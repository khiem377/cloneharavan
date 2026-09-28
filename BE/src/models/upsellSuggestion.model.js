const mongoose = require('mongoose');

const tier1ItemSchema = new mongoose.Schema({
    variantId:    { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    displayName:  { type: String, default: '' },
    sku:          { type: String, default: '' },
    price:        { type: Number, required: true },
    priceDiff:    { type: Number, required: true },
    stock:        { type: Number, default: 0 },
    thumbnailUrl: { type: String, default: '' },
    attributes:   { type: Array, default: [] },
}, { _id: false });

const tier2ItemSchema = new mongoose.Schema({
    productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:         { type: String, default: '' },
    slug:         { type: String, default: '' },
    price:        { type: Number, required: true },
    priceDiff:    { type: Number, required: true },
    thumbnailUrl: { type: String, default: '' },
    isFeatured:   { type: Boolean, default: false },
    isHot:        { type: Boolean, default: false },
}, { _id: false });

const upsellSuggestionSchema = new mongoose.Schema(
    {
        variantId:         { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true, unique: true },
        productId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        tier:              { type: Number, enum: [0, 1, 2], default: 0 },
        tier1Suggestions:  { type: [tier1ItemSchema], default: [] },
        tier2Suggestions:  { type: [tier2ItemSchema], default: [] },
        lastCalculatedAt:  { type: Date, default: Date.now },
    },
    { timestamps: true }
);

upsellSuggestionSchema.index({ variantId: 1 }, { unique: true });
upsellSuggestionSchema.index({ productId: 1 });

module.exports = mongoose.model('UpsellSuggestion', upsellSuggestionSchema);
