const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');
const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.routes.js'));

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
      let cleanUrl = rawUrl.replace('{{url}}', '').replace(/^https?:\/\/[^\/]+\/api\/v1\//, '').replace(/^\//, '').split('?')[0];
      existingPostmanRequests.push({
        folder: folderPath.join(' > '),
        name: it.name,
        method: method,
        cleanUrl: cleanUrl,
        rawUrl: rawUrl,
        bodyRaw: it.request.body?.raw || '',
        headers: it.request.header || []
      });
    }
  });
}
traverse(postman.item);

const allEndpoints = [];

routeFiles.forEach(file => {
  const mount = mountMap[file];
  const fullPath = path.join(routesDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Let's find all router endpoints
  // regex for router.METHOD(PATH, ...)
  const regex = /router\.(get|post|put|patch|delete)\s*\(\s*(['"`])([^'"`]+)\2\s*,\s*([\s\S]*?)(?=\n\s*router\.|\n\s*module\.exports|$)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const subPath = match[3];
    const handlersStr = match[4].trim();

    let cleanPath = subPath === '/' ? '' : (subPath.startsWith('/') ? subPath : '/' + subPath);
    const fullUrlPath = `${mount}${cleanPath}`;
    
    // Check if protected
    const isProtected = /protect|authenticate|authMiddleware|requirePermission/i.test(handlersStr);
    
    // Check validation schema
    const valMatch = handlersStr.match(/validate\s*\(\s*([a-zA-Z0-9_]+)\s*\)/);
    const validatorName = valMatch ? valMatch[1] : null;

    // Check if file upload
    const isUpload = /upload\./i.test(handlersStr);

    // Match with existing Postman
    const bePattern = fullUrlPath.replace(/:[a-zA-Z0-9_]+/g, '[^/?]+');
    const beRegex = new RegExp(`^${bePattern}$`);

    const existingMatch = existingPostmanRequests.find(pm => {
      if (pm.method !== method) return false;
      if (pm.cleanUrl === fullUrlPath) return true;
      return beRegex.test(pm.cleanUrl);
    });

    allEndpoints.push({
      file,
      mount,
      method,
      subPath,
      fullUrlPath,
      isProtected,
      validatorName,
      isUpload,
      handlersSnippet: handlersStr.substring(0, 120).replace(/\s+/g, ' '),
      existing: existingMatch ? {
        name: existingMatch.name,
        folder: existingMatch.folder,
        cleanUrl: existingMatch.cleanUrl,
        hasBody: !!existingMatch.bodyRaw
      } : null
    });
  }
});

fs.writeFileSync(path.join(__dirname, 'all_routes_analyzed.json'), JSON.stringify(allEndpoints, null, 2), 'utf8');
console.log('Saved all_routes_analyzed.json with', allEndpoints.length, 'endpoints');
const missing = allEndpoints.filter(e => !e.existing);
console.log('Total missing endpoints:', missing.length);
