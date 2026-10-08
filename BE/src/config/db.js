const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
    
    // One-time cleanup passkey for requested user
    try {
      const User = require('../models/user.model');
      const updated = await User.findOneAndUpdate(
        { email: 'khiemhgps39587@gmail.com' },
        { $set: { passkeys: [] }, $unset: { passkeyChallenge: 1, passkeyChallengeExpires: 1 } },
        { returnDocument: 'after' }
      );
      if (updated) {
        console.log(`🧹 Cleared passkeys for ${updated.email}. Current passkeys count: ${updated.passkeys?.length}`);
      }
    } catch (cleanErr) {
      console.error('Passkey cleanup note:', cleanErr.message);
    }
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
