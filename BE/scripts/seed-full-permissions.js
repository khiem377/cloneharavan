require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Permission = require('../src/models/permission.model');
const Role = require('../src/models/role.model');

const PERMISSIONS = [
  // Dashboard
  { code: 'dashboard.view', name: 'Xem thống kê Dashboard', module: 'dashboard', description: 'Xem tổng quan và các biểu đồ báo cáo thống kê' },

  // Products
  { code: 'product.view', name: 'Xem danh sách sản phẩm', module: 'products', description: 'Xem danh sách và chi tiết thông tin sản phẩm' },
  { code: 'product.create', name: 'Tạo sản phẩm mới', module: 'products', description: 'Thêm mới sản phẩm vào hệ thống' },
  { code: 'product.edit', name: 'Chỉnh sửa sản phẩm', module: 'products', description: 'Cập nhật thông tin, giá bán, mô tả sản phẩm' },
  { code: 'product.delete', name: 'Xóa sản phẩm', module: 'products', description: 'Xóa sản phẩm khỏi hệ thống' },
  { code: 'product.import', name: 'Import / Export sản phẩm', module: 'products', description: 'Nhập xuất dữ liệu sản phẩm từ file Excel/CSV' },
  { code: 'product.sync_images', name: 'Đồng bộ ảnh sản phẩm', module: 'products', description: 'Đồng bộ ảnh sản phẩm qua Cloudinary hoặc thư viện' },

  // Product Variants
  { code: 'product_variant.view', name: 'Xem biến thể sản phẩm', module: 'product_variants', description: 'Xem các biến thể SKU, màu sắc, dung lượng' },
  { code: 'product_variant.create', name: 'Tạo biến thể sản phẩm', module: 'product_variants', description: 'Tạo các biến thể cho sản phẩm' },
  { code: 'product_variant.edit', name: 'Chỉnh sửa biến thể', module: 'product_variants', description: 'Cập nhật giá, kho, thuộc tính của biến thể' },
  { code: 'product_variant.delete', name: 'Xóa biến thể', module: 'product_variants', description: 'Xóa biến thể sản phẩm' },

  // Categories
  { code: 'category.view', name: 'Xem danh mục sản phẩm', module: 'categories', description: 'Xem cây danh mục ngành hàng' },
  { code: 'category.create', name: 'Tạo danh mục sản phẩm', module: 'categories', description: 'Thêm mới danh mục sản phẩm' },
  { code: 'category.edit', name: 'Chỉnh sửa danh mục', module: 'categories', description: 'Cập nhật tên, icon, banner, thứ tự danh mục' },
  { code: 'category.delete', name: 'Xóa danh mục', module: 'categories', description: 'Xóa danh mục sản phẩm' },
  { code: 'category.manage', name: 'Quản lý toàn quyền danh mục', module: 'categories', description: 'Toàn quyền cấu hình và sắp xếp danh mục' },

  // Brands
  { code: 'brand.view', name: 'Xem thương hiệu', module: 'brands', description: 'Xem danh sách các thương hiệu đối tác' },
  { code: 'brand.create', name: 'Tạo thương hiệu mới', module: 'brands', description: 'Thêm mới thương hiệu sản phẩm' },
  { code: 'brand.edit', name: 'Chỉnh sửa thương hiệu', module: 'brands', description: 'Cập nhật logo, tên, mô tả thương hiệu' },
  { code: 'brand.delete', name: 'Xóa thương hiệu', module: 'brands', description: 'Xóa thương hiệu khỏi hệ thống' },
  { code: 'brand.manage', name: 'Quản lý toàn quyền thương hiệu', module: 'brands', description: 'Toàn quyền cấu hình thương hiệu' },

  // Coupons & Promotions
  { code: 'coupon.manage', name: 'Quản lý mã giảm giá', module: 'coupons', description: 'Tạo và quản lý các mã coupon giảm giá khuyến mãi' },
  { code: 'promotion.view', name: 'Xem khuyến mãi', module: 'promotions', description: 'Xem các chương trình chiết khấu, khuyến mãi' },
  { code: 'promotion.manage', name: 'Quản lý khuyến mãi', module: 'promotions', description: 'Thiết lập các chương trình khuyến mãi tự động' },
  { code: 'gift_program.manage', name: 'Quản lý quà tặng kèm', module: 'gift_programs', description: 'Cài đặt quà tặng kèm theo sản phẩm' },
  { code: 'flash_sale.manage', name: 'Quản lý Flash Sale', module: 'flash_sales', description: 'Thiết lập khung giờ Flash Sale và giá sốc' },

  // Blogs & Tags
  { code: 'blog.view', name: 'Xem bài viết tin tức', module: 'blogs', description: 'Xem danh sách bài viết blog và tin tức' },
  { code: 'blog.create', name: 'Tạo bài viết mới', module: 'blogs', description: 'Soạn thảo và đăng bài viết mới' },
  { code: 'blog.edit', name: 'Chỉnh sửa bài viết', module: 'blogs', description: 'Cập nhật nội dung, SEO, ảnh bìa bài viết' },
  { code: 'blog.delete', name: 'Xóa bài viết', module: 'blogs', description: 'Xóa bài viết blog khỏi website' },
  { code: 'blog_category.manage', name: 'Quản lý danh mục blog', module: 'blog_categories', description: 'Quản lý phân loại các chuyên mục bài viết' },
  { code: 'tag.manage', name: 'Quản lý nhãn thẻ (Tags)', module: 'tags', description: 'Quản lý các từ khóa gắn thẻ sản phẩm và bài viết' },

  // Media & Banners
  { code: 'media.view', name: 'Xem thư viện Media', module: 'media', description: 'Xem danh sách hình ảnh, video tải lên' },
  { code: 'media.upload', name: 'Tải lên Media', module: 'media', description: 'Tải hình ảnh, tệp tin mới lên máy chủ' },
  { code: 'media.delete', name: 'Xóa tệp Media', module: 'media', description: 'Xóa hình ảnh, tệp tin khỏi thư viện' },
  { code: 'media.manage', name: 'Quản lý toàn quyền Media', module: 'media', description: 'Toàn quyền tổ chức và dọn dẹp thư viện Media' },
  { code: 'folder.manage', name: 'Quản lý thư mục Media', module: 'media', description: 'Tạo, sửa, đổi tên các thư mục lưu trữ media' },
  { code: 'banner.view', name: 'Xem banner quảng cáo', module: 'banners', description: 'Xem các vị trí hiển thị banner trên website' },
  { code: 'banner.manage', name: 'Quản lý banner quảng cáo', module: 'banners', description: 'Cập nhật hình ảnh banner slider, pop-up, hero' },

  // Menus
  { code: 'menu.view', name: 'Xem menu điều hướng', module: 'menus', description: 'Xem cấu trúc điều hướng header, footer' },
  { code: 'menu.manage', name: 'Quản lý menu điều hướng', module: 'menus', description: 'Cấu hình liên kết, cây điều hướng trang web' },

  // Users & Roles
  { code: 'user.view', name: 'Xem danh sách tài khoản', module: 'users', description: 'Xem danh sách nhân viên và khách hàng' },
  { code: 'user.create', name: 'Tạo tài khoản mới', module: 'users', description: 'Tạo tài khoản quản trị và nhân viên' },
  { code: 'user.edit', name: 'Chỉnh sửa tài khoản', module: 'users', description: 'Cập nhật thông tin cá nhân, trạng thái kích hoạt' },
  { code: 'user.delete', name: 'Xóa tài khoản', module: 'users', description: 'Khóa hoặc xóa tài khoản người dùng' },
  { code: 'role.manage', name: 'Quản lý vai trò & quyền hạn', module: 'roles', description: 'Tạo, sửa, xóa các vai trò và phân quyền' },
  { code: 'role.assign', name: 'Gán vai trò cho người dùng', module: 'roles', description: 'Phân quyền và chỉ định vai trò cho nhân viên' },

  // Audit Logs
  { code: 'audit_log.view', name: 'Xem nhật ký thao tác', module: 'audit_logs', description: 'Xem lịch sử các hoạt động, thay đổi trên hệ thống' },
  { code: 'audit_log.rollback', name: 'Khôi phục thao tác', module: 'audit_logs', description: 'Khôi phục dữ liệu đã bị sửa đổi hoặc xóa' },

  // Inventory & Suppliers & POs
  { code: 'supplier.view', name: 'Xem nhà cung cấp', module: 'suppliers', description: 'Xem danh sách và thông tin các nhà cung cấp' },
  { code: 'supplier.manage', name: 'Quản lý nhà cung cấp', module: 'suppliers', description: 'Thêm, sửa, xóa thông tin nhà cung cấp hàng hóa' },
  { code: 'purchase_order.view', name: 'Xem đơn nhập hàng (PO)', module: 'purchase_orders', description: 'Xem các đơn đặt hàng từ nhà cung cấp' },
  { code: 'purchase_order.create', name: 'Tạo đơn nhập hàng (PO)', module: 'purchase_orders', description: 'Lập đơn đặt hàng nhập mới từ nhà cung cấp' },
  { code: 'purchase_order.manage', name: 'Quản lý đơn nhập hàng', module: 'purchase_orders', description: 'Duyệt đơn, nhập kho, hủy hoặc hoàn trả hàng' },
  { code: 'stock_export.view', name: 'Xem phiếu xuất kho', module: 'stock_exports', description: 'Xem danh sách các phiếu xuất hàng' },
  { code: 'stock_export.manage', name: 'Quản lý phiếu xuất kho', module: 'stock_exports', description: 'Tạo và duyệt các phiếu xuất kho hàng hóa' },
  { code: 'stock_audit.view', name: 'Xem phiếu kiểm kê kho', module: 'stock_audits', description: 'Xem lịch sử và kết quả các đợt kiểm kê' },
  { code: 'stock_audit.manage', name: 'Quản lý kiểm kê kho', module: 'stock_audits', description: 'Tạo đợt kiểm kê và cân bằng số lượng tồn kho' },
  { code: 'stock_movement.view', name: 'Xem biến động kho', module: 'stock_movements', description: 'Xem thẻ kho, lịch sử xuất/nhập/tồn chi tiết' },
];

const PRESET_ROLES = [
  {
    name: 'Quản trị viên (Administrator)',
    code: 'administrator',
    isSystem: true,
    description: 'Toàn quyền quản trị hệ thống, không bị giới hạn bất kỳ tính năng nào (*)',
    permissions: '*', // Toàn bộ quyền
  },
  {
    name: 'Quản lý cửa hàng (Manager)',
    code: 'manager',
    isSystem: false,
    description: 'Quản lý sản phẩm, danh mục, khuyến mãi, kho bãi, bài viết và nhân viên',
    permissions: [
      'dashboard.view',
      'product.view', 'product.create', 'product.edit', 'product.delete', 'product.import', 'product.sync_images',
      'product_variant.view', 'product_variant.create', 'product_variant.edit', 'product_variant.delete',
      'category.view', 'category.create', 'category.edit', 'category.delete', 'category.manage',
      'brand.view', 'brand.create', 'brand.edit', 'brand.delete', 'brand.manage',
      'coupon.manage', 'promotion.view', 'promotion.manage', 'gift_program.manage', 'flash_sale.manage',
      'blog.view', 'blog.create', 'blog.edit', 'blog.delete', 'blog_category.manage', 'tag.manage',
      'media.view', 'media.upload', 'media.delete', 'media.manage', 'folder.manage',
      'banner.view', 'banner.manage', 'menu.view', 'menu.manage',
      'user.view', 'user.create', 'user.edit',
      'supplier.view', 'supplier.manage',
      'purchase_order.view', 'purchase_order.create', 'purchase_order.manage',
      'stock_export.view', 'stock_export.manage',
      'stock_audit.view', 'stock_audit.manage',
      'stock_movement.view',
      'audit_log.view',
    ],
  },
  {
    name: 'Quản lý kho vận (Inventory Manager)',
    code: 'inventory_manager',
    isSystem: false,
    description: 'Quản lý tồn kho, nhà cung cấp, đơn mua hàng (PO), phiếu nhập/xuất/kiểm kê kho',
    permissions: [
      'dashboard.view',
      'product.view', 'product.create', 'product.edit', 'product.import',
      'product_variant.view', 'product_variant.create', 'product_variant.edit',
      'category.view', 'brand.view',
      'supplier.view', 'supplier.manage',
      'purchase_order.view', 'purchase_order.create', 'purchase_order.manage',
      'stock_export.view', 'stock_export.manage',
      'stock_audit.view', 'stock_audit.manage',
      'stock_movement.view',
      'media.view', 'media.upload',
    ],
  },
  {
    name: 'Nhân viên bán hàng (Staff)',
    code: 'staff',
    isSystem: false,
    description: 'Xem thông tin sản phẩm, áp dụng khuyến mãi, theo dõi biến động kho',
    permissions: [
      'dashboard.view',
      'product.view', 'product_variant.view',
      'category.view', 'brand.view',
      'promotion.view',
      'stock_movement.view',
      'media.view',
    ],
  },
  {
    name: 'Biên tập viên nội dung (Content Editor)',
    code: 'content_editor',
    isSystem: false,
    description: 'Soạn thảo và quản lý bài viết blog, banner trang chủ, menu và tệp media',
    permissions: [
      'dashboard.view',
      'blog.view', 'blog.create', 'blog.edit', 'blog.delete', 'blog_category.manage',
      'tag.manage',
      'media.view', 'media.upload', 'media.delete', 'media.manage', 'folder.manage',
      'banner.view', 'banner.manage',
      'menu.view', 'menu.manage',
    ],
  },
  {
    name: 'Chăm sóc khách hàng (Customer Care)',
    code: 'customer_care',
    isSystem: false,
    description: 'Tra cứu thông tin sản phẩm, chính sách khuyến mãi và hỗ trợ khách hàng',
    permissions: [
      'dashboard.view',
      'product.view', 'product_variant.view',
      'category.view', 'brand.view',
      'promotion.view',
      'blog.view',
    ],
  },
];

const seedFullPermissions = async (exitOnFinish = false) => {
  let isStandaloneConnection = false;

  try {
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cloneharavan';
      console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
      await mongoose.connect(mongoUri);
      isStandaloneConnection = true;
    }

    console.log(`[Seed] Seeding ${PERMISSIONS.length} permissions...`);
    const permMap = new Map();

    for (const p of PERMISSIONS) {
      const doc = await Permission.findOneAndUpdate(
        { code: p.code },
        { $set: p },
        { upsert: true, new: true }
      );
      permMap.set(doc.code, doc._id);
    }
    console.log(`[Seed] ✅ Done seeding ${permMap.size} permissions.`);

    console.log(`[Seed] Seeding ${PRESET_ROLES.length} preset roles...`);
    const allPermIds = Array.from(permMap.values());
    const roleResults = [];

    for (const r of PRESET_ROLES) {
      let rolePermIds = [];
      if (r.permissions === '*') {
        rolePermIds = allPermIds;
      } else if (Array.isArray(r.permissions)) {
        rolePermIds = r.permissions
          .map((code) => permMap.get(code))
          .filter(Boolean);
      }

      const roleDoc = await Role.findOneAndUpdate(
        { code: r.code },
        {
          $set: {
            name: r.name,
            description: r.description,
            isSystem: r.isSystem,
            permissions: rolePermIds,
          },
        },
        { upsert: true, new: true }
      );
      roleResults.push(roleDoc);
    }
    console.log(`[Seed] ✅ Done seeding ${roleResults.length} preset roles.`);

    const summary = {
      permissionsCount: permMap.size,
      rolesCount: roleResults.length,
    };

    if (exitOnFinish) {
      console.log('✅ Seed completed successfully!');
      if (isStandaloneConnection) await mongoose.disconnect();
      process.exit(0);
    }

    return summary;
  } catch (error) {
    console.error('❌ Error seeding full permissions & roles:', error);
    if (exitOnFinish) {
      if (isStandaloneConnection) await mongoose.disconnect();
      process.exit(1);
    }
    throw error;
  }
};

module.exports = seedFullPermissions;

if (require.main === module) {
  seedFullPermissions(true);
}
