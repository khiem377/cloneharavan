const fs = require('fs');
const path = require('path');

// Read all route files in src/routes
const routesDir = path.join(__dirname, 'src', 'routes');
const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.routes.js'));

console.log('Found route files:', routeFiles.length);

const express = require('express');
// Mock express router to extract all registered routes
function getRoutesFromRouteFile(file) {
  const fullPath = path.join(routesDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Regex extract router.get/post/put/patch/delete
  const routes = [];
  const regex = /router\.(get|post|put|patch|delete)\s*\(\s*(['"`])([^'"`]+)\2/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    routes.push({
      method: match[1].toUpperCase(),
      path: match[3],
      rawLine: match[0]
    });
  }
  return routes;
}

const mountMap = {
  'auth.routes.js': 'auth',
  'user.routes.js': 'users',
  'banner.routes.js': 'banners',
  'media.routes.js': 'media',
  'folder.routes.js': 'folders',
  'category.routes.js': 'categories',
  'brand.routes.js': 'brands',
  'product.routes.js': 'products',
  'productVariant.routes.js': 'product-variants',
  'coupon.routes.js': 'coupons',
  'promotion.routes.js': 'promotions',
  'gift-program.routes.js': 'gift-programs',
  'flashSale.routes.js': 'flash-sales',
  'dashboard.routes.js': 'dashboard',
  'tag.routes.js': 'tags',
  'blogCategory.routes.js': 'blog-categories',
  'blogPost.routes.js': 'blog-posts',
  'menu.routes.js': 'menus',
  'role.routes.js': 'roles',
  'supplier.routes.js': 'suppliers',
  'purchaseOrder.routes.js': 'purchase-orders',
  'stockExport.routes.js': 'stock-exports',
  'stockAudit.routes.js': 'stock-audits',
  'stockMovement.routes.js': 'stock-movements',
  'purchaseReturn.routes.js': 'purchase-returns',
  'stockAlert.routes.js': 'stock-alerts',
  'stockDocument.routes.js': 'stock-documents',
  'inventoryReport.routes.js': 'inventory-reports',
  'stockReceiving.routes.js': 'stock-receivings',
  'auditLog.routes.js': 'audit-logs',
  'search.routes.js': 'search',
  'recommendation.routes.js': 'recommendations',
  'chatbot.routes.js': 'chat',
  'upsell.routes.js': 'upsell'
};

const allBackendEndpoints = [];

routeFiles.forEach(file => {
  const mount = mountMap[file] || file.replace('.routes.js', '');
  const routes = getRoutesFromRouteFile(file);
  routes.forEach(r => {
    let cleanPath = r.path === '/' ? '' : (r.path.startsWith('/') ? r.path : '/' + r.path);
    const fullUrlPath = `${mount}${cleanPath}`;
    allBackendEndpoints.push({
      file,
      mount,
      method: r.method,
      subPath: r.path,
      fullUrlPath: fullUrlPath,
      key: `${r.method} /api/v1/${fullUrlPath}`
    });
  });
});

console.log('Total BE endpoints extracted:', allBackendEndpoints.length);

// Now load postman collection and extract all existing requests
const postmanPath = path.join(__dirname, '..', 'postman_collection.json');
const postman = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));

const existingPostmanRequests = [];

function traverse(items, folderPath = []) {
  items.forEach(it => {
    if (it.item) {
      traverse(it.item, [...folderPath, it.name]);
    } else if (it.request) {
      const method = it.request.method;
      let rawUrl = '';
      if (typeof it.request.url === 'string') rawUrl = it.request.url;
      else if (it.request.url?.raw) rawUrl = it.request.url.raw;

      // Extract path after {{url}} or /api/v1/
      let cleanUrl = rawUrl.replace('{{url}}', '').replace(/^https?:\/\/[^\/]+\/api\/v1\//, '').replace(/^\//, '');
      // Strip query parameters
      cleanUrl = cleanUrl.split('?')[0];

      existingPostmanRequests.push({
        folder: folderPath.join(' > '),
        name: it.name,
        method: method,
        rawUrl: rawUrl,
        cleanUrl: cleanUrl,
        hasBody: !!it.request.body?.raw && it.request.body.raw.trim().length > 0,
        bodyRaw: it.request.body?.raw || '',
        headers: it.request.header || []
      });
    }
  });
}

traverse(postman.item);
console.log('Total existing Postman requests:', existingPostmanRequests.length);

// Compare
const missingInPostman = [];
allBackendEndpoints.forEach(be => {
  // Try to find matching postman request
  // normalize params like :id or :slug with regex
  const bePattern = be.fullUrlPath.replace(/:[a-zA-Z0-9_]+/g, '[^/?]+');
  const beRegex = new RegExp(`^${bePattern}$`);

  const found = existingPostmanRequests.find(pm => {
    if (pm.method !== be.method) return false;
    // Check direct match or regex match
    if (pm.cleanUrl === be.fullUrlPath) return true;
    return beRegex.test(pm.cleanUrl);
  });

  if (!found) {
    missingInPostman.push(be);
  }
});

console.log('Missing endpoints in Postman:', missingInPostman.length);
console.log('Breakdown of missing endpoints by mount:');
const breakdown = {};
missingInPostman.forEach(m => {
  breakdown[m.mount] = (breakdown[m.mount] || 0) + 1;
});
console.table(breakdown);

// Also check existing requests that might have missing or empty body
const requestsMissingBody = existingPostmanRequests.filter(req => {
  return ['POST', 'PUT', 'PATCH'].includes(req.method) && !req.hasBody;
});
console.log('Existing POST/PUT/PATCH requests missing body:', requestsMissingBody.length);
requestsMissingBody.forEach(r => {
  console.log(`- [${r.folder}] ${r.method} ${r.cleanUrl} (${r.name})`);
});
