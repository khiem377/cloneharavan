const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
    });
    console.log(`MongoDB connected: ${conn.connection.host} | DB: ${conn.connection.name}`);

    // Pre-load all models to prevent MissingSchemaError on populate()
    const fs = require('fs');
    const path = require('path');
    const modelsDir = path.join(__dirname, '../models');
    if (fs.existsSync(modelsDir)) {
      fs.readdirSync(modelsDir).forEach((file) => {
        if (file.endsWith('.model.js')) {
          require(path.join(modelsDir, file));
        }
      });
    }

  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
