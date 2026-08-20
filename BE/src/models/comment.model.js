const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    postId:   { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content:  { type: String, required: true, maxlength: 5000 },

    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    rootId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    depth:    { type: Number, default: 0, min: 0, max: 2 },
    path:     { type: String, default: '' },

    reactions: [reactionSchema],
    reactionCounts: {
      like:  { type: Number, default: 0 },
      love:  { type: Number, default: 0 },
      haha:  { type: Number, default: 0 },
      wow:   { type: Number, default: 0 },
      sad:   { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    replyCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'spam', 'rejected'],
      default: 'approved',
    },
    isEdited:  { type: Boolean, default: false },
    editedAt:  { type: Date, default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, parentId: 1, status: 1, createdAt: 1 });
commentSchema.index({ postId: 1, rootId: 1, depth: 1, createdAt: 1 });
commentSchema.index({ authorId: 1 });
commentSchema.index({ path: 1 });
commentSchema.index({ 'reactions.userId': 1 });

module.exports = mongoose.model('Comment', commentSchema);
