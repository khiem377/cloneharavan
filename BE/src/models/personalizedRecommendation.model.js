const mongoose = require('mongoose');

const personalizedRecommendationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    sessionId: { type: String, default: '', index: true },
    recommendedProducts: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        predictedScore: { type: Number, required: true },
        reason: { type: String, default: 'Matrix Factorization Model' },
      },
    ],
    lastCalculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

personalizedRecommendationSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('PersonalizedRecommendation', personalizedRecommendationSchema);
