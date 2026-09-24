const fs = require('fs');
const path = require('path');

const postmanPath = path.join(__dirname, '..', 'postman_collection.json');
const postman = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));

// Helper to create Postman request item
function makeRequest({
  name,
  method,
  urlPath,
  queryParams = [],
  body = null,
  isProtected = true,
  description = '',
  formData = null
}) {
  const headers = [];
  if (isProtected) {
    headers.push({ key: 'Authorization', value: 'Bearer {{accessToken}}', type: 'text' });
  }

  let reqBody = undefined;
  if (body) {
    headers.push({ key: 'Content-Type', value: 'application/json' });
    reqBody = {
      mode: 'raw',
      raw: typeof body === 'string' ? body : JSON.stringify(body, null, 2),
      options: { raw: { language: 'json' } }
    };
  } else if (formData) {
    reqBody = {
      mode: 'formdata',
      formdata: formData
    };
  }

  // Parse path segments
  const cleanPath = urlPath.replace(/^\//, '');
  const pathParts = cleanPath.split('/').filter(Boolean);

  let rawUrl = `{{url}}${cleanPath}`;
  let queryObj = undefined;
  if (queryParams && queryParams.length > 0) {
    const qStr = queryParams.map(q => `${q.key}=${encodeURIComponent(q.value)}`).join('&');
    rawUrl += `?${qStr}`;
    queryObj = queryParams.map(q => ({
      key: q.key,
      value: String(q.value),
      description: q.description || ''
    }));
  }

  const hostPart = `{{url}}${pathParts[0] || ''}`;
  const subPaths = pathParts.slice(1);

  return {
    name,
    request: {
      method: method.toUpperCase(),
      header: headers,
      ...(reqBody ? { body: reqBody } : {}),
      url: {
        raw: rawUrl,
        host: [hostPart],
        path: subPaths,
        ...(queryObj ? { query: queryObj } : {})
      },
      description
    },
    response: []
  };
}

// 1. UPDATE EXISTING FOLDERS
// ==========================

// Folder 1: Auth
const authFolder = postman.item.find(i => i.name.startsWith('1. Auth'));
if (authFolder) {
  // Check if missing register-admin
  if (!authFolder.item.some(r => r.request.url.raw.includes('register-admin'))) {
    authFolder.item.push(makeRequest({
      name: '1.13 Register Admin (Đăng ký tài khoản Admin với Secret Key)',
      method: 'POST',
      urlPath: 'auth/register-admin',
      isProtected: false,
      body: {
        fullName: "Super Admin",
        phone: "0901234567",
        gender: "male",
        email: "admin_master@haravan.com",
        password: "AdminPassword123",
        dateOfBirth: "1995-05-20",
        adminSecretKey: "{{adminSecretKey}}"
      },
      description: "Đăng ký trực tiếp tài khoản quyền Admin với mã bí mật hệ thống (adminSecretKey)."
    }));
  }

  // Check if missing reset-password body endpoint
  if (!authFolder.item.some(r => r.request.method === 'POST' && r.request.url.raw.endsWith('auth/reset-password'))) {
    authFolder.item.push(makeRequest({
      name: '1.14 Reset Password with Body (Đặt lại mật khẩu qua Body)',
      method: 'POST',
      urlPath: 'auth/reset-password',
      isProtected: false,
      body: {
        token: "sample_reset_token_from_email",
        password: "NewPassword123",
        confirmPassword: "NewPassword123"
      },
      description: "Đặt lại mật khẩu mới bằng cách gửi token và password trong request body."
    }));
  }

  // Check if missing verify-email body endpoint
  if (!authFolder.item.some(r => r.request.method === 'POST' && r.request.url.raw.endsWith('auth/verify-email'))) {
    authFolder.item.push(makeRequest({
      name: '1.15 Verify Email with Body (Xác minh Email qua Body)',
      method: 'POST',
      urlPath: 'auth/verify-email',
      isProtected: false,
      body: {
        token: "sample_email_verify_token"
      },
      description: "Xác minh email người dùng qua mã token trong request body."
    }));
  }
}

// Folder 2: Users & Addresses
const usersFolder = postman.item.find(i => i.name.startsWith('2. Users'));
if (usersFolder) {
  if (!usersFolder.item.some(r => r.request.url.raw.includes('users/me'))) {
    usersFolder.item.push(makeRequest({
      name: '2.16 Get Current User Profile (/users/me)',
      method: 'GET',
      urlPath: 'users/me',
      isProtected: true,
      description: "Lấy thông tin tài khoản đang đăng nhập qua route /users/me."
    }));
  }

  if (!usersFolder.item.some(r => r.name.includes('Create Admin Account') || r.request.url.raw.includes('users/admin'))) {
    usersFolder.item.push(makeRequest({
      name: '2.17 Admin: Create Admin Account (Tạo tài khoản Quản trị viên mới)',
      method: 'POST',
      urlPath: 'users/admin',
      isProtected: true,
      body: {
        fullName: "Nguyen Quan Tri",
        email: "quantri@haravan.com",
        password: "AdminPassword123",
        phone: "0908889999",
        gender: "male",
        dateOfBirth: "1992-10-15",
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      },
      description: "Admin tạo mới một tài khoản Admin khác (yêu cầu quyền user.create)."
    }));
  }

  if (!usersFolder.item.some(r => r.request.method === 'POST' && (r.request.url.raw.endsWith('users') || r.request.url.raw.endsWith('users/')))) {
    usersFolder.item.push(makeRequest({
      name: '2.18 Admin: Create User or Admin (/users)',
      method: 'POST',
      urlPath: 'users',
      isProtected: true,
      body: {
        fullName: "Le Thi Nhan Vien",
        email: "nhanvien@haravan.com",
        password: "Password123",
        phone: "0901112233",
        gender: "female",
        dateOfBirth: "1996-08-12",
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      },
      description: "Tạo tài khoản người dùng hoặc admin mới qua route gốc /users."
    }));
  }
}

// Folder 3: Banners
const bannersFolder = postman.item.find(i => i.name.startsWith('3. Banners'));
if (bannersFolder) {
  if (!bannersFolder.item.some(r => r.request.url.raw.includes('banners/admin/locate'))) {
    bannersFolder.item.push(makeRequest({
      name: '3.9 Admin: Locate Banner Page (Tìm trang chứa Banner trong bảng)',
      method: 'GET',
      urlPath: 'banners/admin/locate',
      queryParams: [
        { key: 'id', value: '{{bannerId}}', description: 'ID của banner cần định vị trang' },
        { key: 'limit', value: '10', description: 'Số lượng mục trên mỗi trang' }
      ],
      isProtected: true,
      description: "Tìm chính xác trang chứa banner theo ID trong bảng quản trị (phục vụ highlight hàng)."
    }));
  }

  if (!bannersFolder.item.some(r => r.request.url.raw.includes('/view'))) {
    bannersFolder.item.push(makeRequest({
      name: '3.10 Record Banner View (Tăng lượt hiển thị Banner)',
      method: 'POST',
      urlPath: 'banners/{{bannerId}}/view',
      isProtected: false,
      description: "Ghi nhận 1 lượt view cho banner."
    }));
  }

  if (!bannersFolder.item.some(r => r.request.url.raw.includes('/click'))) {
    bannersFolder.item.push(makeRequest({
      name: '3.11 Record Banner Click (Tăng lượt click Banner)',
      method: 'POST',
      urlPath: 'banners/{{bannerId}}/click',
      isProtected: false,
      description: "Ghi nhận 1 lượt click cho banner."
    }));
  }
}

// Folder 4: Media & Cloudinary
const mediaFolder = postman.item.find(i => i.name.startsWith('4. Media'));
if (mediaFolder) {
  const mediaNewRequests = [
    {
      name: '4.8 Media Stats (Thống kê lưu trữ Media)',
      method: 'GET',
      urlPath: 'media/stats',
      isProtected: true,
      description: 'Lấy thống kê tổng dung lượng, số lượng file, số file chưa sử dụng.'
    },
    {
      name: '4.9 Get Unused Media (Danh sách file chưa sử dụng)',
      method: 'GET',
      urlPath: 'media/unused',
      queryParams: [{ key: 'page', value: '1' }, { key: 'limit', value: '20' }],
      isProtected: true,
      description: 'Lấy danh sách các media file chưa được liên kết với sản phẩm, bài viết hay banner nào.'
    },
    {
      name: '4.10 Get Media By Multiple IDs (Lấy nhiều media theo IDs)',
      method: 'GET',
      urlPath: 'media/by-ids',
      queryParams: [{ key: 'ids', value: 'id1,id2,id3', description: 'Danh sách ID ngăn cách bởi dấu phẩy' }],
      isProtected: true,
      description: 'Lấy thông tin chi tiết của danh sách media IDs.'
    },
    {
      name: '4.11 Check Media Usages (Kiểm tra nơi sử dụng theo Public IDs)',
      method: 'POST',
      urlPath: 'media/check-usages',
      isProtected: true,
      body: {
        publicIds: ["cloneharavan/sample_image_1", "cloneharavan/sample_image_2"]
      },
      description: 'Kiểm tra xem các publicId này đang được dùng ở bảng nào (Product, Banner, Category,...).'
    },
    {
      name: '4.12 Get Single Media Usages (Chi tiết nơi sử dụng của 1 Media)',
      method: 'GET',
      urlPath: 'media/{{mediaId}}/usages',
      isProtected: true,
      description: 'Xem chi tiết các liên kết (products, categories, banners) đang sử dụng file media này.'
    },
    {
      name: '4.13 Bulk Move Media (Di chuyển nhiều file sang Folder khác)',
      method: 'PATCH',
      urlPath: 'media/bulk-move',
      isProtected: true,
      body: {
        ids: ["651234567890abcdef123456", "651234567890abcdef123457"],
        targetFolderId: "651234567890abcdef123458"
      },
      description: 'Di chuyển danh sách file media sang thư mục đích.'
    },
    {
      name: '4.14 Rename Media (Đổi tên hiển thị file Media)',
      method: 'PATCH',
      urlPath: 'media/{{mediaId}}/rename',
      isProtected: true,
      body: {
        filename: "hinh-anh-san-pham-chinh-thuc-moi.jpg"
      },
      description: 'Đổi tên tệp media trong kho lưu trữ.'
    },
    {
      name: '4.15 Update Media Metadata (Cập nhật Alt text & Caption)',
      method: 'PATCH',
      urlPath: 'media/{{mediaId}}/meta',
      isProtected: true,
      body: {
        altText: "Ảnh cận cảnh màn hình OLED tràn viền",
        caption: "Màn hình 4K HDR siêu sắc nét"
      },
      description: 'Cập nhật thẻ SEO Alt text và chú thích cho ảnh media.'
    }
  ];

  mediaNewRequests.forEach(req => {
    if (!mediaFolder.item.some(r => r.name === req.name || (r.request.method === req.method && r.request.url.raw.includes(req.urlPath)))) {
      mediaFolder.item.push(makeRequest(req));
    }
  });
}

// Folder 7: Brands
const brandsFolder = postman.item.find(i => i.name.startsWith('7. Brands'));
if (brandsFolder) {
  if (!brandsFolder.item.some(r => r.request.url.raw.includes('brands/admin/locate'))) {
    brandsFolder.item.push(makeRequest({
      name: '7.9 Admin: Locate Brand Page (Tìm vị trí trang của Thương hiệu)',
      method: 'GET',
      urlPath: 'brands/admin/locate',
      queryParams: [
        { key: 'id', value: '{{brandId}}', description: 'ID thương hiệu cần định vị' },
        { key: 'limit', value: '10', description: 'Số dòng mỗi trang' }
      ],
      isProtected: true,
      description: 'Tìm chính xác số trang chứa thương hiệu trong bảng Admin table.'
    }));
  }
}

// Folder 8: Products
const productsFolder = postman.item.find(i => i.name.startsWith('8. Products'));
if (productsFolder) {
  const prodNewRequests = [
    {
      name: '8.15 Search Inventory Products (Tìm kiếm nhanh sản phẩm phục vụ nhập kho)',
      method: 'GET',
      urlPath: 'products/search-inventory',
      queryParams: [{ key: 'keyword', value: 'samsung', description: 'Từ khóa tên sản phẩm hoặc mã code' }],
      isProtected: false,
      description: 'Tìm nhanh sản phẩm kèm toàn bộ danh sách biến thể, tồn kho phục vụ lập phiếu nhập/xuất kho.'
    },
    {
      name: '8.16 Admin: Locate Product Page (Định vị trang của Sản phẩm)',
      method: 'GET',
      urlPath: 'products/admin/locate',
      queryParams: [
        { key: 'id', value: '{{productId}}', description: 'ID sản phẩm cần định vị' },
        { key: 'limit', value: '20', description: 'Số dòng mỗi trang' }
      ],
      isProtected: true,
      description: 'Tìm chính xác số trang phân trang chứa sản phẩm trong danh sách quản trị.'
    },
    {
      name: '8.17 Bulk Update Product Status (Bật/Tắt hàng loạt trạng thái sản phẩm)',
      method: 'PATCH',
      urlPath: 'products/bulk-status',
      isProtected: true,
      body: {
        ids: ["651234567890abcdef123456", "651234567890abcdef123457"],
        isActive: true
      },
      description: 'Cập nhật trạng thái hiển thị (isActive) cho nhiều sản phẩm cùng lúc.'
    }
  ];

  prodNewRequests.forEach(req => {
    if (!productsFolder.item.some(r => r.request.url.raw.includes(req.urlPath))) {
      productsFolder.item.push(makeRequest(req));
    }
  });
}

// Folder 10: Coupons
const couponsFolder = postman.item.find(i => i.name.startsWith('10. Coupons'));
if (couponsFolder) {
  if (!couponsFolder.item.some(r => r.request.url.raw.includes('toggle-status'))) {
    couponsFolder.item.push(makeRequest({
      name: '10.9 Toggle Coupon Status (Bật/Tắt kích hoạt mã giảm giá)',
      method: 'PATCH',
      urlPath: 'coupons/{{couponId}}/toggle-status',
      isProtected: true,
      description: 'Chuyển đổi trạng thái isActive của mã coupon.'
    }));
  }
}

// Folder 14: Dashboard
const dashboardFolder = postman.item.find(i => i.name.startsWith('14. Dashboard'));
if (dashboardFolder) {
  if (!dashboardFolder.item.some(r => r.request.url.raw.includes('inventory-stats'))) {
    dashboardFolder.item.push(makeRequest({
      name: '14.3 Inventory Dashboard Stats (Thống kê tổng quan kho hàng)',
      method: 'GET',
      urlPath: 'dashboard/inventory-stats',
      isProtected: false,
      description: 'Lấy các chỉ số tổng quan kho: tổng SKU, giá trị tồn vốn, số lượng sắp hết hàng, số lượng hết hàng.'
    }));
  }
}

// Folder 15: Flash Sales
const flashSalesFolder = postman.item.find(i => i.name.startsWith('15. Flash Sales'));
if (flashSalesFolder) {
  if (!flashSalesFolder.item.some(r => r.request.url.raw.includes('flash-sales/locate'))) {
    flashSalesFolder.item.push(makeRequest({
      name: '15.8 Locate Flash Sale Page (Định vị trang Flash Sale)',
      method: 'GET',
      urlPath: 'flash-sales/locate',
      queryParams: [
        { key: 'id', value: '{{flashSaleId}}' },
        { key: 'limit', value: '10' }
      ],
      isProtected: true,
      description: 'Tìm chính xác số trang phân trang chứa chương trình flash sale.'
    }));
  }

  if (!flashSalesFolder.item.some(r => r.name.includes('Update Flash Sale (PATCH)'))) {
    flashSalesFolder.item.push(makeRequest({
      name: '15.9 Update Flash Sale Partial (PATCH Cập nhật 1 phần Flash Sale)',
      method: 'PATCH',
      urlPath: 'flash-sales/{{flashSaleId}}',
      isProtected: true,
      body: {
        name: "Flash Sale Giờ Vàng Cập Nhật",
        isActive: true,
        items: [
          {
            productId: "651234567890abcdef123456",
            variantId: null,
            originalPrice: 15000000,
            flashSalePrice: 11990000,
            stockLimit: 50,
            soldCount: 5
          }
        ]
      },
      description: 'Cập nhật từng phần thông tin chương trình Flash Sale.'
    }));
  }
}

// Folder 16: Blog & Content
const blogFolder = postman.item.find(i => i.name.startsWith('16. Blog'));
if (blogFolder) {
  const blogNewRequests = [
    {
      name: '16.17 Get Blog Category By Slug (Chi tiết danh mục blog theo slug)',
      method: 'GET',
      urlPath: 'blog-categories/cong-nghe-moi',
      isProtected: false,
      description: 'Lấy chi tiết danh mục blog theo slug công khai.'
    },
    {
      name: '16.18 Update Blog Category (Cập nhật danh mục blog)',
      method: 'PUT',
      urlPath: 'blog-categories/{{blogCategoryId}}',
      isProtected: true,
      body: {
        name: "Công Nghệ & Đời Sống Mới",
        description: "Mô tả cập nhật cho danh mục công nghệ",
        order: 1,
        isActive: true
      },
      description: 'Cập nhật thông tin danh mục bài viết.'
    },
    {
      name: '16.19 Delete Blog Category (Xóa 1 danh mục blog)',
      method: 'DELETE',
      urlPath: 'blog-categories/{{blogCategoryId}}',
      isProtected: true,
      description: 'Xóa một danh mục blog.'
    },
    {
      name: '16.20 Bulk Delete Blog Categories (Xóa hàng loạt danh mục blog)',
      method: 'DELETE',
      urlPath: 'blog-categories/bulk',
      isProtected: true,
      body: {
        ids: ["651234567890abcdef123456", "651234567890abcdef123457"]
      },
      description: 'Xóa nhiều danh mục blog cùng lúc.'
    },
    {
      name: '16.21 Locate Blog Post Page (Định vị trang bài viết)',
      method: 'GET',
      urlPath: 'blog-posts/locate',
      queryParams: [
        { key: 'id', value: '{{blogPostId}}' },
        { key: 'limit', value: '10' }
      ],
      isProtected: true,
      description: 'Tìm chính xác số trang chứa bài viết trong danh sách quản trị.'
    },
    {
      name: '16.22 Get Tag By Slug (Chi tiết Tag theo Slug)',
      method: 'GET',
      urlPath: 'tags/review-dien-thoai',
      isProtected: false,
      description: 'Lấy chi tiết 1 tag theo đường dẫn slug.'
    },
    {
      name: '16.23 Update Tag (Cập nhật Tag)',
      method: 'PUT',
      urlPath: 'tags/{{tagId}}',
      isProtected: true,
      body: {
        name: "Review Điện Thoại Cao Cấp",
        description: "Các bài đánh giá điện thoại flagship mới nhất",
        isActive: true
      },
      description: 'Cập nhật thông tin thẻ tag.'
    },
    {
      name: '16.24 Delete Tag (Xóa 1 Tag)',
      method: 'DELETE',
      urlPath: 'tags/{{tagId}}',
      isProtected: true,
      description: 'Xóa 1 thẻ tag theo ID.'
    },
    {
      name: '16.25 Bulk Delete Tags (Xóa hàng loạt Tags)',
      method: 'DELETE',
      urlPath: 'tags/bulk',
      isProtected: true,
      body: {
        ids: ["651234567890abcdef123456", "651234567890abcdef123457"]
      },
      description: 'Xóa nhiều thẻ tag cùng lúc.'
    }
  ];

  blogNewRequests.forEach(req => {
    if (!blogFolder.item.some(r => r.name === req.name)) {
      blogFolder.item.push(makeRequest(req));
    }
  });
}

// Folder 17: Roles & Permissions
const rolesFolder = postman.item.find(i => i.name.startsWith('17. Roles'));
if (rolesFolder) {
  if (!rolesFolder.item.some(r => r.request.url.raw.includes('seed-full-permissions'))) {
    rolesFolder.item.push(makeRequest({
      name: '17.8 Seed Full System Permissions (Khởi tạo toàn bộ Quyền mẫu)',
      method: 'POST',
      urlPath: 'roles/seed-full-permissions',
      isProtected: true,
      description: 'Tự động tạo hoặc cập nhật tất cả các permissions của toàn bộ hệ thống vào database.'
    }));
  }
}

// 2. CREATE NEW MODULE FOLDERS
// =============================

// Helper to add or replace folder
function addOrReplaceFolder(folderObj) {
  const existingIdx = postman.item.findIndex(i => i.name.startsWith(folderObj.name.split(' ')[0]));
  if (existingIdx !== -1) {
    postman.item[existingIdx] = folderObj;
  } else {
    postman.item.push(folderObj);
  }
}

// 18. Suppliers
const suppliersFolder = {
  name: "18. Suppliers (Quản lý Nhà cung cấp)",
  item: [
    makeRequest({
      name: "18.1 Get All Suppliers (Danh sách Nhà cung cấp)",
      method: "GET",
      urlPath: "suppliers",
      queryParams: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "keyword", value: "" },
        { key: "isActive", value: "true" }
      ],
      isProtected: true,
      description: "Lấy danh sách các nhà cung cấp hàng hóa có phân trang và tìm kiếm."
    }),
    makeRequest({
      name: "18.2 Get Supplier By ID (Chi tiết Nhà cung cấp)",
      method: "GET",
      urlPath: "suppliers/{{supplierId}}",
      isProtected: true,
      description: "Xem chi tiết một nhà cung cấp theo ID."
    }),
    makeRequest({
      name: "18.3 Create Supplier (Thêm mới Nhà cung cấp)",
      method: "POST",
      urlPath: "suppliers",
      isProtected: true,
      body: {
        name: "Công ty TNHH Phân Phối Samsung Việt Nam",
        code: "NCC-SAMSUNG",
        phone: "02839998888",
        email: "contact@samsungdist.vn",
        address: "Tòa nhà Bitexco, Q1, TP.HCM",
        taxCode: "0312345678",
        note: "Nhà phân phối chính thức các dòng TV, Điện thoại Samsung",
        isActive: true
      },
      description: "Thêm một nhà cung cấp hàng hóa mới vào hệ thống."
    }),
    makeRequest({
      name: "18.4 Update Supplier (Cập nhật Nhà cung cấp)",
      method: "PUT",
      urlPath: "suppliers/{{supplierId}}",
      isProtected: true,
      body: {
        name: "Công ty TNHH Phân Phối Samsung Việt Nam (Cập nhật)",
        phone: "02839999999",
        email: "sales@samsungdist.vn",
        address: "Tầng 25, Landmark 81, Bình Thạnh, TP.HCM",
        taxCode: "0312345678",
        note: "Đối tác chiến lược cấp 1",
        isActive: true
      },
      description: "Cập nhật thông tin chi tiết nhà cung cấp."
    }),
    makeRequest({
      name: "18.5 Delete Supplier (Xóa Nhà cung cấp)",
      method: "DELETE",
      urlPath: "suppliers/{{supplierId}}",
      isProtected: true,
      description: "Xóa hoặc chuyển trạng thái nhà cung cấp nếu chưa có đơn hàng nhập liên quan."
    })
  ]
};
addOrReplaceFolder(suppliersFolder);

// 19. Purchase Orders
const purchaseOrdersFolder = {
  name: "19. Purchase Orders (Đơn đặt mua hàng / Nhập hàng)",
  item: [
    makeRequest({
      name: "19.1 Get Purchase Orders (Danh sách Đơn mua hàng)",
      method: "GET",
      urlPath: "purchase-orders",
      queryParams: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "keyword", value: "" },
        { key: "status", value: "draft", description: "draft | sent | completed | cancelled" },
        { key: "supplierId", value: "{{supplierId}}" }
      ],
      isProtected: true,
      description: "Lấy danh sách các đơn đặt mua hàng từ nhà cung cấp kèm phân trang và lọc."
    }),
    makeRequest({
      name: "19.2 Get Purchase Order By ID (Chi tiết Đơn mua hàng)",
      method: "GET",
      urlPath: "purchase-orders/{{purchaseOrderId}}",
      isProtected: true,
      description: "Xem chi tiết một đơn đặt mua hàng (danh sách mặt hàng, số lượng dự kiến, thực nhập, đơn giá, tổng tiền)."
    }),
    makeRequest({
      name: "19.3 Create Purchase Order (Tạo Đơn mua hàng mới)",
      method: "POST",
      urlPath: "purchase-orders",
      isProtected: true,
      body: {
        supplierId: "{{supplierId}}",
        deliveryDate: "2026-10-01",
        note: "Đơn nhập hàng phục vụ sự kiện khuyến mãi tháng 10",
        status: "draft",
        items: [
          {
            productId: "651234567890abcdef123456",
            variantId: "651234567890abcdef123457",
            sku: "SS-QA75-BLK",
            productName: "Smart Tivi Samsung 4K QA75Q65D 75 inch",
            unit: "Chiếc",
            expectedQty: 10,
            actualQty: 10,
            importPrice: 15500000
          },
          {
            productId: "651234567890abcdef123458",
            variantId: null,
            sku: "SS-SOUNDBAR-B450",
            productName: "Loa Thanh Samsung HW-B450",
            unit: "Bộ",
            expectedQty: 20,
            actualQty: 20,
            importPrice: 2100000
          }
        ]
      },
      description: "Lập đơn đặt mua hàng mới từ nhà cung cấp với danh sách chi tiết các mặt hàng."
    }),
    makeRequest({
      name: "19.4 Update Purchase Order Status (Cập nhật trạng thái Đơn mua)",
      method: "PATCH",
      urlPath: "purchase-orders/{{purchaseOrderId}}/status",
      isProtected: true,
      body: {
        status: "completed",
        items: [
          {
            productId: "651234567890abcdef123456",
            variantId: "651234567890abcdef123457",
            actualQty: 10,
            importPrice: 15500000
          }
        ]
      },
      description: "Chuyển trạng thái đơn: draft -> sent -> completed. Khi chuyển thành completed, hệ thống tự động cộng tồn kho và ghi nhật ký StockMovement."
    }),
    makeRequest({
      name: "19.5 Preview Excel PO Slip (Xem trước file Excel phiếu đặt hàng)",
      method: "POST",
      urlPath: "purchase-orders/preview-excel",
      isProtected: true,
      body: {
        supplierId: "{{supplierId}}",
        deliveryDate: "2026-10-01",
        note: "Xem trước phiếu trước khi xuất chính thức",
        items: [
          {
            productId: "651234567890abcdef123456",
            productName: "Smart Tivi Samsung 4K QA75Q65D 75 inch",
            expectedQty: 5,
            importPrice: 15500000
          }
        ]
      },
      description: "Tạo tạm và trả về luồng file Excel (xlsx) để kiểm tra giao diện phiếu in."
    }),
    makeRequest({
      name: "19.6 Download Excel PO Slip (Tải file Excel Đơn mua hàng)",
      method: "GET",
      urlPath: "purchase-orders/{{purchaseOrderId}}/download-excel",
      isProtected: true,
      description: "Tải file Excel mẫu chuẩn phiếu mua hàng hoàn chỉnh theo ID."
    }),
    makeRequest({
      name: "19.7 Preview PO Email (Xem trước nội dung Email gửi NCC)",
      method: "GET",
      urlPath: "purchase-orders/{{purchaseOrderId}}/preview-email",
      isProtected: true,
      description: "Xem trước mẫu giao diện HTML email đặt hàng gửi cho đối tác."
    }),
    makeRequest({
      name: "19.8 Send PO To Supplier (Gửi Email Đơn mua hàng cho NCC)",
      method: "POST",
      urlPath: "purchase-orders/{{purchaseOrderId}}/send-po",
      isProtected: true,
      body: {
        sendMethod: "email",
        recipientEmail: "supplier-sales@samsungdist.vn",
        subject: "[SHOP] - Đơn Đặt Mua Hàng Mới #PO-20260924-001",
        customNote: "Kính nhờ quý công ty xuất hóa đơn VAT điện tử và giao hàng trước ngày 01/10/2026."
      },
      description: "Tự động gửi email thông báo đặt hàng đính kèm bảng sản phẩm tới email nhà cung cấp và chuyển trạng thái đơn sang 'sent'."
    })
  ]
};
addOrReplaceFolder(purchaseOrdersFolder);

// 20. Stock Receivings
const stockReceivingsFolder = {
  name: "20. Stock Receivings (Phiếu nhập kho thực tế)",
  item: [
    makeRequest({
      name: "20.1 Get All Stock Receivings (Danh sách Phiếu nhập kho)",
      method: "GET",
      urlPath: "stock-receivings",
      queryParams: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "keyword", value: "" },
        { key: "status", value: "" }
      ],
      isProtected: true,
      description: "Lấy danh sách các phiếu nhập kho thực tế đã tạo."
    }),
    makeRequest({
      name: "20.2 Get Stock Receiving By ID (Chi tiết Phiếu nhập kho)",
      method: "GET",
      urlPath: "stock-receivings/{{receivingId}}",
      isProtected: true,
      description: "Xem chi tiết một phiếu nhập kho kèm danh sách sản phẩm và số lượng thực nhập."
    }),
    makeRequest({
      name: "20.3 Create Stock Receiving (Tạo Phiếu nhập kho mới)",
      method: "POST",
      urlPath: "stock-receivings",
      isProtected: true,
      body: {
        purchaseOrderId: "{{purchaseOrderId}}",
        note: "Nhập hàng từ xe tải giao đợt 1",
        items: [
          {
            productId: "651234567890abcdef123456",
            variantId: "651234567890abcdef123457",
            sku: "SS-QA75-BLK",
            productName: "Smart Tivi Samsung 4K QA75Q65D 75 inch",
            unit: "Chiếc",
            receivedQty: 10,
            importPrice: 15500000
          }
        ]
      },
      description: "Tạo phiếu nhập kho thực tế dựa trên Đơn mua hàng (PO). Hệ thống cộng tồn kho thực tế và cập nhật trạng thái đơn mua."
    }),
    makeRequest({
      name: "20.4 Sync Receivings From POs (Đồng bộ phiếu nhập từ các PO)",
      method: "POST",
      urlPath: "stock-receivings/sync-from-pos",
      isProtected: true,
      description: "Tự động quét các đơn PO hoàn thành chưa có phiếu nhập để sinh phiếu nhập kho tương ứng."
    }),
    makeRequest({
      name: "20.5 Download Excel Stock Receiving Slip (Tải Excel Phiếu nhập kho)",
      method: "GET",
      urlPath: "stock-receivings/{{receivingId}}/download-excel",
      isProtected: true,
      description: "Xuất và tải về file Excel phiếu nhập kho chính thức."
    })
  ]
};
addOrReplaceFolder(stockReceivingsFolder);

// 21. Stock Exports
const stockExportsFolder = {
  name: "21. Stock Exports (Phiếu xuất kho)",
  item: [
    makeRequest({
      name: "21.1 Get All Stock Exports (Danh sách Phiếu xuất kho)",
      method: "GET",
      urlPath: "stock-exports",
      queryParams: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "keyword", value: "" },
        { key: "status", value: "pending_pick", description: "pending_pick | picking | picked | shipping | delivered | cancelled" },
        { key: "type", value: "sale", description: "sale | transfer | damage | return" }
      ],
      isProtected: true,
      description: "Lấy danh sách các phiếu xuất kho (bán hàng, điều chuyển, hủy hàng hỏng,...)."
    }),
    makeRequest({
      name: "21.2 Get Stock Export By ID (Chi tiết Phiếu xuất kho)",
      method: "GET",
      urlPath: "stock-exports/{{exportId}}",
      isProtected: true,
      description: "Xem chi tiết thông tin phiếu xuất kho, thông tin người nhận, danh sách hàng xuất."
    }),
    makeRequest({
      name: "21.3 Create Stock Export (Tạo Phiếu xuất kho)",
      method: "POST",
      urlPath: "stock-exports",
      isProtected: true,
      body: {
        type: "sale",
        recipientName: "Trần Thị B",
        recipientPhone: "0912345678",
        recipientAddress: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
        note: "Xuất kho giao cho đơn hàng trực tuyến #DH-9992",
        items: [
          {
            productId: "651234567890abcdef123456",
            variantId: "651234567890abcdef123457",
            sku: "SS-QA75-BLK",
            productName: "Smart Tivi Samsung 4K QA75Q65D 75 inch",
            unit: "Chiếc",
            quantity: 1,
            exportPrice: 22490000
          }
        ]
      },
      description: "Tạo phiếu xuất kho mới. Trạng thái ban đầu: pending_pick (chờ lấy hàng)."
    }),
    makeRequest({
      name: "21.4 Update Stock Export Workflow Status (Cập nhật tiến trình xuất kho)",
      method: "PATCH",
      urlPath: "stock-exports/{{exportId}}/status",
      isProtected: true,
      body: {
        status: "shipping",
        note: "Hàng đã bàn giao cho đơn vị vận chuyển Viettel Post"
      },
      description: "Cập nhật trạng thái quy trình xuất kho: pending_pick -> picking -> picked -> shipping -> delivered."
    }),
    makeRequest({
      name: "21.5 Download Excel Stock Export Slip (Tải Excel Phiếu xuất kho)",
      method: "GET",
      urlPath: "stock-exports/{{exportId}}/download-excel",
      isProtected: true,
      description: "Tải file Excel mẫu phiếu xuất kho chính thức."
    })
  ]
};
addOrReplaceFolder(stockExportsFolder);

// 22. Stock Audits
const stockAuditsFolder = {
  name: "22. Stock Audits (Kiểm kê kho & Cân bằng tồn)",
  item: [
    makeRequest({
      name: "22.1 Get All Stock Audits (Danh sách Phiếu kiểm kê)",
      method: "GET",
      urlPath: "stock-audits",
      queryParams: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "keyword", value: "" }
      ],
      isProtected: true,
      description: "Lấy danh sách các đợt kiểm kê kho định kỳ/đột xuất."
    }),
    makeRequest({
      name: "22.2 Get Stock Audit By ID (Chi tiết Phiếu kiểm kê)",
      method: "GET",
      urlPath: "stock-audits/{{auditId}}",
      isProtected: true,
      description: "Xem chi tiết một phiếu kiểm kê, độ lệch giữa tồn hệ thống và tồn thực đếm."
    }),
    makeRequest({
      name: "22.3 Create Stock Audit (Tạo Phiếu kiểm kê & Cân bằng tồn kho)",
      method: "POST",
      urlPath: "stock-audits",
      isProtected: true,
      body: {
        note: "Kiểm kê định kỳ cuối quý III/2026",
        auditDate: "2026-09-24T16:00:00.000Z",
        items: [
          {
            productId: "651234567890abcdef123456",
            variantId: "651234567890abcdef123457",
            sku: "SS-QA75-BLK",
            productName: "Smart Tivi Samsung 4K QA75Q65D 75 inch",
            unit: "Chiếc",
            systemStock: 10,
            actualStock: 9,
            reason: "Hàng bị vỡ màn hình trong kho, đã hủy"
          }
        ]
      },
      description: "Tạo phiếu kiểm kê thực tế. Hệ thống sẽ tự động tính toán chênh lệch (variance) và điều chỉnh tồn kho sản phẩm về số lượng thực tế kèm ghi log StockMovement."
    }),
    makeRequest({
      name: "22.4 Download Excel Stock Audit Slip (Tải Excel Phiếu kiểm kê)",
      method: "GET",
      urlPath: "stock-audits/{{auditId}}/download-excel",
      isProtected: true,
      description: "Tải file Excel bảng kiểm kê kho và biên bản cân bằng tồn."
    })
  ]
};
addOrReplaceFolder(stockAuditsFolder);

// 23. Stock Movements
const stockMovementsFolder = {
  name: "23. Stock Movements (Sổ nhật ký biến động kho)",
  item: [
    makeRequest({
      name: "23.1 Get Stock Movements History (Lịch sử biến động xuất nhập tồn)",
      method: "GET",
      urlPath: "stock-movements",
      queryParams: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "keyword", value: "", description: "Tìm theo SKU, tên sản phẩm, mã phiếu, lý do" },
        { key: "productId", value: "{{productId}}", description: "Lọc theo ID sản phẩm cụ thể" },
        { key: "type", value: "IN", description: "IN | OUT | AUDIT" }
      ],
      isProtected: true,
      description: "Truy vấn sổ cái nhật ký kho (Stock Movements). Theo dõi mọi biến động tăng/giảm tồn kho, người thực hiện, thời gian và số phiếu tham chiếu."
    })
  ]
};
addOrReplaceFolder(stockMovementsFolder);

// 24. Purchase Returns
const purchaseReturnsFolder = {
  name: "24. Purchase Returns (Trả hàng nhập cho NCC)",
  item: [
    makeRequest({
      name: "24.1 Get All Purchase Returns (Danh sách Phiếu trả hàng nhập)",
      method: "GET",
      urlPath: "purchase-returns",
      queryParams: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "keyword", value: "" },
        { key: "supplierId", value: "{{supplierId}}" },
        { key: "status", value: "completed" }
      ],
      isProtected: true,
      description: "Lấy danh sách các phiếu xuất trả hàng về lại cho nhà cung cấp."
    }),
    makeRequest({
      name: "24.2 Get Purchase Return By ID (Chi tiết Phiếu trả hàng nhập)",
      method: "GET",
      urlPath: "purchase-returns/{{returnId}}",
      isProtected: true,
      description: "Xem chi tiết một phiếu trả hàng nhập, nguyên nhân trả, trạng thái hoàn tiền từ NCC."
    }),
    makeRequest({
      name: "24.3 Create Purchase Return (Tạo Phiếu xuất trả hàng cho NCC)",
      method: "POST",
      urlPath: "purchase-returns",
      isProtected: true,
      body: {
        supplierId: "{{supplierId}}",
        poId: "{{purchaseOrderId}}",
        note: "Trả hàng lỗi linh kiện về hãng Samsung",
        items: [
          {
            productId: "651234567890abcdef123456",
            variantId: "651234567890abcdef123457",
            sku: "SS-QA75-BLK",
            productName: "Smart Tivi Samsung 4K QA75Q65D 75 inch",
            unit: "Chiếc",
            quantity: 2,
            returnPrice: 15500000,
            reason: "Màn hình lỗi sọc ngang ngay khi mở thùng"
          }
        ]
      },
      description: "Tạo phiếu trả hàng nhập cho NCC. Trừ tồn kho sản phẩm tương ứng và ghi nhận nợ phải thu từ NCC."
    }),
    makeRequest({
      name: "24.4 Update Refund Status (Cập nhật trạng thái hoàn tiền của NCC)",
      method: "PATCH",
      urlPath: "purchase-returns/{{returnId}}/refund-status",
      isProtected: true,
      body: {
        refundStatus: "completed",
        refundAmount: 31000000
      },
      description: "Cập nhật trạng thái nhà cung cấp đã hoàn tiền hoặc cấn trừ công nợ: pending | partial | completed."
    }),
    makeRequest({
      name: "24.5 Download Excel Purchase Return Slip (Tải Excel Phiếu trả hàng)",
      method: "GET",
      urlPath: "purchase-returns/{{returnId}}/download-excel",
      isProtected: true,
      description: "Tải file Excel phiếu trả hàng nhập chính thức."
    })
  ]
};
addOrReplaceFolder(purchaseReturnsFolder);

// 25. Stock Alerts
const stockAlertsFolder = {
  name: "25. Stock Alerts (Cảnh báo tồn kho)",
  item: [
    makeRequest({
      name: "25.1 Get Low Stock Items & Alerts (Danh sách sản phẩm sắp hết hàng)",
      method: "GET",
      urlPath: "stock-alerts",
      queryParams: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "type", value: "low_stock", description: "low_stock | out_of_stock | reorder_needed" }
      ],
      isProtected: true,
      description: "Cảnh báo các sản phẩm có tồn kho dưới định mức an toàn hoặc hết hàng cần tái đặt hàng khẩn cấp."
    }),
    makeRequest({
      name: "25.2 Update Product Cost Price (Cập nhật giá vốn nhập sản phẩm)",
      method: "PATCH",
      urlPath: "stock-alerts/{{productId}}/cost-price",
      isProtected: true,
      body: {
        costPrice: 15200000
      },
      description: "Cập nhật giá vốn (costPrice) cho sản phẩm hoặc biến thể phục vụ tính định giá tồn kho."
    })
  ]
};
addOrReplaceFolder(stockAlertsFolder);

// 26. Stock Documents
const stockDocumentsFolder = {
  name: "26. Stock Documents (Chứng từ kho & Hóa đơn)",
  item: [
    makeRequest({
      name: "26.1 Get All Stock Documents (Danh sách chứng từ kho)",
      method: "GET",
      urlPath: "stock-documents",
      queryParams: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "type", value: "", description: "PO | RECEIVING | EXPORT | AUDIT | RETURN" }
      ],
      isProtected: true,
      description: "Tra cứu toàn bộ tài liệu, chứng từ xuất nhập kho, biên bản bàn giao trong hệ thống."
    })
  ]
};
addOrReplaceFolder(stockDocumentsFolder);

// 27. Inventory Reports
const inventoryReportsFolder = {
  name: "27. Inventory Reports (Báo cáo Xuất - Nhập - Tồn)",
  item: [
    makeRequest({
      name: "27.1 Get Inventory Balance Report (Báo cáo Xuất Nhập Tồn)",
      method: "GET",
      urlPath: "inventory-reports/balance-report",
      queryParams: [
        { key: "startDate", value: "2026-09-01" },
        { key: "endDate", value: "2026-09-30" },
        { key: "keyword", value: "" }
      ],
      isProtected: true,
      description: "Bảng tổng hợp vật tư: Tồn đầu kỳ, Nhập trong kỳ, Xuất trong kỳ, Tồn cuối kỳ kèm định giá thành tiền."
    }),
    makeRequest({
      name: "27.2 Export Inventory Balance Report Excel (Xuất Excel Báo cáo X-N-T)",
      method: "GET",
      urlPath: "inventory-reports/export-excel",
      queryParams: [
        { key: "startDate", value: "2026-09-01" },
        { key: "endDate", value: "2026-09-30" },
        { key: "keyword", value: "" }
      ],
      isProtected: true,
      description: "Tải file bảng tính Excel báo cáo kế toán kho đầy đủ số liệu tồn và giá trị kho."
    })
  ]
};
addOrReplaceFolder(inventoryReportsFolder);

// 28. Audit Logs
const auditLogsFolder = {
  name: "28. Audit Logs (Nhật ký kiểm toán & Rollback)",
  item: [
    makeRequest({
      name: "28.1 Get Audit Logs (Xem lịch sử thao tác hệ thống)",
      method: "GET",
      urlPath: "audit-logs",
      queryParams: [
        { key: "page", value: "1" },
        { key: "limit", value: "20" },
        { key: "module", value: "", description: "PURCHASE_ORDER | PRODUCT | USER | etc." },
        { key: "action", value: "", description: "CREATE | UPDATE | DELETE" },
        { key: "userId", value: "" }
      ],
      isProtected: true,
      description: "Truy vết chi tiết mọi hành vi tạo, sửa, xóa, snapshot trước và sau trên hệ thống."
    }),
    makeRequest({
      name: "28.2 Get Audit Log By ID (Chi tiết 1 bản ghi kiểm toán)",
      method: "GET",
      urlPath: "audit-logs/{{auditLogId}}",
      isProtected: true,
      description: "Xem chi tiết diff dữ liệu cũ (oldData) và mới (newData) của 1 hành động."
    }),
    makeRequest({
      name: "28.3 Rollback Audit Log (Hoàn tác thay đổi dữ liệu)",
      method: "POST",
      urlPath: "audit-logs/{{auditLogId}}/rollback",
      isProtected: true,
      description: "Khôi phục dữ liệu mục tiêu về trạng thái trước khi thay đổi dựa trên bản ghi audit log."
    })
  ]
};
addOrReplaceFolder(auditLogsFolder);

// 29. Search & Suggestions
const searchFolder = {
  name: "29. Search & Suggestions (Tìm kiếm đa năng & Gợi ý)",
  item: [
    makeRequest({
      name: "29.1 Global Multi-Domain Search (Tìm kiếm đa năng toàn trang)",
      method: "GET",
      urlPath: "search",
      queryParams: [
        { key: "q", value: "samsung 4k" },
        { key: "domain", value: "all", description: "all | products | blogs | categories" },
        { key: "page", value: "1" },
        { key: "limit", value: "20" }
      ],
      isProtected: false,
      description: "Tìm kiếm tốc độ cao trên nhiều lĩnh vực: sản phẩm, bài viết blog, danh mục."
    }),
    makeRequest({
      name: "29.2 Instant Search Suggestions (Gợi ý tức thì khi gõ từ khóa)",
      method: "GET",
      urlPath: "search/suggest",
      queryParams: [
        { key: "q", value: "sam" }
      ],
      isProtected: false,
      description: "Trả về gợi ý tức thì autocomplete bao gồm từ khóa hot, sản phẩm phù hợp."
    }),
    makeRequest({
      name: "29.3 Get Trending Keywords (Danh sách từ khóa tìm kiếm hot nhất)",
      method: "GET",
      urlPath: "search/trending",
      queryParams: [
        { key: "limit", value: "10" },
        { key: "type", value: "all", description: "all | rising" }
      ],
      isProtected: false,
      description: "Lấy danh sách các từ khóa tìm kiếm thịnh hành hoặc tăng trưởng nhanh nhất."
    }),
    makeRequest({
      name: "29.4 Admin: Toggle Pin Trending Keyword (Ghim từ khóa hot)",
      method: "PATCH",
      urlPath: "search/trending",
      isProtected: true,
      body: {
        keyword: "smart tivi 4k",
        isTrending: true
      },
      description: "Admin ghim hoặc bỏ ghim từ khóa nổi bật trong hộp tìm kiếm."
    }),
    makeRequest({
      name: "29.5 Record Search Click CTR (Ghi nhận click từ kết quả tìm kiếm)",
      method: "POST",
      urlPath: "search/click",
      isProtected: false,
      body: {
        keyword: "tivi samsung"
      },
      description: "Client gọi khi người dùng bấm vào sản phẩm trong trang kết quả tìm kiếm để cải thiện xếp hạng CTR."
    }),
    makeRequest({
      name: "29.6 Record Purchase From Search (Ghi nhận đơn hàng từ từ khóa)",
      method: "POST",
      urlPath: "search/purchase",
      isProtected: false,
      body: {
        keywords: ["tivi samsung", "loa soundbar"]
      },
      description: "Ghi nhận tín hiệu mua hàng thành công để ưu tiên trọng số chuyển đổi tìm kiếm."
    }),
    makeRequest({
      name: "29.7 Search By Image (Tìm kiếm bằng hình ảnh)",
      method: "POST",
      urlPath: "search/image",
      isProtected: false,
      formData: [
        { key: "image", type: "file", src: "" }
      ],
      description: "Upload ảnh sản phẩm để tìm kiếm sản phẩm tương tự bằng AI."
    }),
    makeRequest({
      name: "29.8 Export Search Analytics CSV (Xuất báo cáo thống kê từ khóa)",
      method: "GET",
      urlPath: "search/export-csv",
      queryParams: [
        { key: "days", value: "30" }
      ],
      isProtected: false,
      description: "Xuất dữ liệu thống kê từ khóa tìm kiếm, lượt click, tỉ lệ mua hàng ra file CSV."
    })
  ]
};
addOrReplaceFolder(searchFolder);

// 30. Recommendations
const recommendationsFolder = {
  name: "30. Recommendations (Gợi ý sản phẩm thông minh - AI Engine)",
  item: [
    makeRequest({
      name: "30.1 Record User Interaction (Ghi nhận hành vi tương tác người dùng)",
      method: "POST",
      urlPath: "recommendations/interactions",
      isProtected: false,
      body: {
        sessionId: "sess_guest_uuid_001",
        productId: "651234567890abcdef123456",
        interactionType: "view",
        dwellTime: 65,
        context: {
          category: "tivi",
          source: "homepage_deal"
        }
      },
      description: "Ghi nhận tương tác: view, add_to_cart, purchase, wish cùng thời gian xem để nuôi mô hình AI."
    }),
    makeRequest({
      name: "30.2 Personalized Recommendations (Gợi ý cá nhân hóa 7 tầng)",
      method: "GET",
      urlPath: "recommendations/personalized",
      queryParams: [
        { key: "limit", value: "10" },
        { key: "sessionId", value: "sess_guest_uuid_001" }
      ],
      isProtected: false,
      description: "Hệ thống gợi ý kết hợp SVD Matrix Factorization + Content-based + ItemCF + Xu hướng thời gian thực."
    }),
    makeRequest({
      name: "30.3 Session-based Recommendations (Gợi ý theo phiên lướt web tức thì)",
      method: "GET",
      urlPath: "recommendations/session-based",
      queryParams: [
        { key: "limit", value: "8" },
        { key: "sessionId", value: "sess_guest_uuid_001" }
      ],
      isProtected: false,
      description: "Gợi ý tức thời dựa trên các sản phẩm vừa xem trong phiên hiện tại không cần đăng nhập."
    }),
    makeRequest({
      name: "30.4 Trending Recommendations (Gợi ý sản phẩm đang thịnh hành)",
      method: "GET",
      urlPath: "recommendations/trending",
      queryParams: [
        { key: "limit", value: "10" }
      ],
      isProtected: false,
      description: "Top sản phẩm được xem và mua nhiều nhất trong 7 ngày qua."
    }),
    makeRequest({
      name: "30.5 Similar Products (Gợi ý sản phẩm tương tự cùng phân khúc)",
      method: "GET",
      urlPath: "recommendations/similar/{{productId}}",
      queryParams: [
        { key: "limit", value: "6" }
      ],
      isProtected: false,
      description: "Gợi ý các sản phẩm có cùng tính năng, thương hiệu, khoảng giá phù hợp so sánh."
    }),
    makeRequest({
      name: "30.6 Compute Item-Collaborative Filtering Matrix (Tính toán ma trận gợi ý)",
      method: "POST",
      urlPath: "recommendations/compute-item-cf",
      isProtected: true,
      description: "Admin trigger tính toán lại ma trận tương đồng Item-CF từ nhật ký tương tác."
    })
  ]
};
addOrReplaceFolder(recommendationsFolder);

// 31. AI Chatbot
const chatbotFolder = {
  name: "31. AI Chatbot (Trợ lý tư vấn AI)",
  item: [
    makeRequest({
      name: "31.1 Send Chat Message (Gửi tin nhắn tư vấn AI Rest)",
      method: "POST",
      urlPath: "chat",
      isProtected: false,
      body: {
        message: "Shop có tivi Samsung nào tầm 15 đến 20 triệu không?",
        sessionId: "chat_session_uuid_01"
      },
      description: "Chatbot thông minh sử dụng Gemini/Groq tự động tra cứu sản phẩm trong DB để tư vấn."
    }),
    makeRequest({
      name: "31.2 Stream Chat Message (Chatbot phản hồi dạng SSE Stream)",
      method: "POST",
      urlPath: "chat/stream",
      isProtected: false,
      body: {
        message: "So sánh giúp mình màn hình OLED và QLED của tivi",
        sessionId: "chat_session_uuid_01"
      },
      description: "Phản hồi chữ chạy theo thời gian thực (Server-Sent Events) mượt mà cho giao diện chat web."
    }),
    makeRequest({
      name: "31.3 Clear Chat Session (Xóa lịch sử phiên hội thoại)",
      method: "DELETE",
      urlPath: "chat/session",
      isProtected: false,
      body: {
        sessionId: "chat_session_uuid_01"
      },
      description: "Reset phiên hội thoại của người dùng để bắt đầu chủ đề mới."
    })
  ]
};
addOrReplaceFolder(chatbotFolder);

// 32. Upsell
const upsellFolder = {
  name: "32. Upsell (Gợi ý bán kèm & Cross-sell)",
  item: [
    makeRequest({
      name: "32.1 Get Upsell By Variant (Gợi ý mua kèm theo biến thể)",
      method: "GET",
      urlPath: "upsell/variant/{{variantId}}",
      isProtected: false,
      description: "Gợi ý phụ kiện hoặc gói bảo hành bán kèm tương ứng với biến thể đã chọn."
    }),
    makeRequest({
      name: "32.2 Get Upsell By Product (Gợi ý mua kèm theo sản phẩm)",
      method: "GET",
      urlPath: "upsell/product/{{productId}}",
      isProtected: false,
      description: "Gợi ý các combo quà tặng, sản phẩm bán kèm giá ưu đãi theo ID sản phẩm chính."
    })
  ]
};
addOrReplaceFolder(upsellFolder);

// 3. SORT FOLDERS NUMERICALLY
postman.item.sort((a, b) => {
  const numA = parseInt(a.name.match(/^\d+/)?.[0] || '999', 10);
  const numB = parseInt(b.name.match(/^\d+/)?.[0] || '999', 10);
  return numA - numB;
});

// Write updated collection
fs.writeFileSync(postmanPath, JSON.stringify(postman, null, 2), 'utf8');
console.log('Successfully updated postman_collection.json!');
console.log('Total folders:', postman.item.length);
let totalReqs = 0;
postman.item.forEach((f, i) => {
  const count = f.item ? f.item.length : 0;
  totalReqs += count;
  console.log(`${f.name} -> ${count} requests`);
});
console.log('TOTAL REQUESTS IN COLLECTION:', totalReqs);
