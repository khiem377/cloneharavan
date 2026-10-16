/**
 * cleanSocialDummyEmails.js
 * Script to remove synthetic / dummy emails (zalo_... / tiktok_...) from users
 * and preserve them exclusively as linking parameters (zaloId, tiktokId).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

async function cleanSocialDummyEmails() {
  const User = require('../models/user.model');

  // 1. Cập nhật lại MongoDB Indexes cho email TRƯỚC TIÊN để cho phép nhiều user không có email
  try {
    const collection = User.collection;
    const indexes = await collection.indexes();
    const oldEmailIndex = indexes.find((idx) => idx.name === 'email_1' || idx.key?.email);
    if (oldEmailIndex && !oldEmailIndex.partialFilterExpression) {
      console.log('🔄 Dropping old non-partial email index...');
      await collection.dropIndex(oldEmailIndex.name);
      console.log('✅ Dropped old email index.');
    }
    console.log('⚡ Ensuring new sparse partial email index...');
    await collection.createIndex(
      { email: 1 },
      { unique: true, sparse: true, partialFilterExpression: { email: { $type: 'string' } } }
    );
    console.log('✅ Partial email index ensured.');
  } catch (idxErr) {
    console.warn('⚠️ Notice when adjusting indexes:', idxErr.message);
  }

  // 2. Tìm tất cả user có email giả lập (zalo / tiktok)
  console.log('🔍 Finding users with synthetic social emails...');
  const dummyUsers = await User.find({
    $or: [
      { email: { $regex: /@zalo\.user$/i } },
      { email: { $regex: /@tiktok\.user$/i } },
      { email: { $regex: /^zalo_/i } },
      { email: { $regex: /^tiktok_/i } },
    ],
  });

  console.log(`Found ${dummyUsers.length} users with synthetic emails to clean.`);

  let cleanedZalo = 0;
  let cleanedTikTok = 0;

  for (const user of dummyUsers) {
    const rawEmail = (user.email || '').toLowerCase();
    const updateSet = {};

    if (rawEmail.includes('zalo')) {
      const extractedId = rawEmail.replace(/^zalo_/i, '').replace(/@zalo\.user$/i, '').trim();
      if (!user.zaloId && extractedId) {
        updateSet.zaloId = extractedId;
      }
      updateSet.authProvider = 'zalo';
      cleanedZalo++;
    } else if (rawEmail.includes('tiktok')) {
      const extractedId = rawEmail.replace(/^tiktok_/i, '').replace(/@tiktok\.user$/i, '').trim();
      if (!user.tiktokId && extractedId) {
        updateSet.tiktokId = extractedId;
      }
      updateSet.authProvider = 'tiktok';
      cleanedTikTok++;
    }

    // Gỡ bỏ email giả lập bằng $unset
    await User.updateOne(
      { _id: user._id },
      {
        $unset: { email: 1 },
        $set: updateSet,
      }
    );
    console.log(`✅ Cleaned user: ${user.fullName} (${user._id}) -> Removed email: ${rawEmail}`);
  }

  return {
    success: true,
    totalCleaned: dummyUsers.length,
    cleanedZalo,
    cleanedTikTok,
    message: `Đã dọn dẹp thành công ${dummyUsers.length} tài khoản (Zalo: ${cleanedZalo}, TikTok: ${cleanedTikTok}). Đã loại bỏ email rác và giữ lại id liên kết.`,
  };
}

module.exports = cleanSocialDummyEmails;

if (require.main === module) {
  (async () => {
    try {
      console.log('🚀 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB.');

      const result = await cleanSocialDummyEmails();
      console.log('🎉 Migration finished:', result);
      process.exit(0);
    } catch (err) {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    }
  })();
}
