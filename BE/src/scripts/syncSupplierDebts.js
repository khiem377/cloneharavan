

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const SupplierDebtService = require('../services/supplierDebt.service');

async function run() {
  const start = Date.now();
  console.log('🚀 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB.');

  console.log('🔄 Synchronizing Purchase Orders & Returns into Supplier Debts...');
  const result = await SupplierDebtService.syncAllExistingOrders();
  console.log('🎉 Sync completed successfully!');
  console.log(result);

  console.log(`⏱️ Finished in ${(Date.now() - start) / 1000}s`);
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Error syncing supplier debts:', err);
  process.exit(1);
});
