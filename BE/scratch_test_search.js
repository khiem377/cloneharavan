const mongoose = require('mongoose');
const Product = require('./src/models/product.model');
const Category = require('./src/models/category.model');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/haravan-clone');
  console.log('Connected to DB');

  const tvCount = await Product.countDocuments({
    name: { $regex: /tivi|ti vi|\btv\b/i }
  });
  console.log('TV count by regex name:', tvCount);

  const tvProducts = await Product.find({
    name: { $regex: /tivi|ti vi|\btv\b/i }
  }).select('name slug productCode brand categories specifications options').limit(10).lean();

  console.log('Sample TV products:');
  tvProducts.forEach(p => {
    console.log(`- [${p._id}] ${p.name}`);
    console.log('  options:', JSON.stringify(p.options));
    console.log('  specs:', JSON.stringify(p.specifications));
  });

  const fridgeCount = await Product.countDocuments({
    name: { $regex: /tủ lạnh|tu lanh/i }
  });
  console.log('Fridge count:', fridgeCount);

  const fridgesWithTV = await Product.find({
    name: { $regex: /tủ lạnh|tu lanh/i },
    $or: [
      { name: { $regex: /tv/i } },
      { productCode: { $regex: /tv/i } },
      { sku: { $regex: /tv/i } },
      { description: { $regex: /tv/i } }
    ]
  }).select('name productCode sku').limit(5).lean();

  console.log('Fridges matching TV substring:');
  fridgesWithTV.forEach(f => {
    console.log(`- ${f.name} (code: ${f.productCode}, sku: ${f.sku})`);
  });

  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
