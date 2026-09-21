const mongoose = require('mongoose');

/**
 * ItemSimilarity Model — Layer 3: Item-to-Item Collaborative Filtering
 * Chuẩn Amazon: pre-compute co-occurrence matrix
 * "Users who viewed/bought X also viewed/bought Y"
 */
const itemSimilaritySchema = new mongoose.Schema(
  {
    itemId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    similar: [
      {
        productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        coOccurrence: { type: Number, default: 0 },  // số session có cả 2 sản phẩm
        jaccardScore: { type: Number, default: 0 },  // Jaccard similarity [0,1]
        type:         { type: String, enum: ['viewed', 'purchased', 'mixed'], default: 'mixed' },
      },
    ],
    lastComputedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

itemSimilaritySchema.index({ itemId: 1 }, { unique: true });

module.exports = mongoose.model('ItemSimilarity', itemSimilaritySchema);
