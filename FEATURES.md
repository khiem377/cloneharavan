# Clone Haravan — Danh Sách Chi Tiết Các Tính Năng Đã Hoàn Thành Toàn Hệ Thống (FEATURE.MD)

> **Cập nhật ngày:** 12/10/2026  
> **Kiến trúc:** 3 Phân hệ độc lập: Backend API (Express.js/Node.js) + Admin Portal (React/Vite) + Client Storefront (Next.js 14 App Router).  
> **Tham chiếu chuẩn UI/UX:** EGA Điện Máy — Haravan Enterprise Theme, Phong cách Flat Design, Bo góc 6px, Chống nhảy layout, Modal làm việc siêu rộng (max-w-5xl/6xl), Tương tác xúc giác.

---

## 📑 Mục lục Phân hệ Nghiệp vụ

1. [Phân hệ Xác thực, Tài khoản & Bảo mật (Auth & Security System)](#1-phân-hệ-xác-thực-tài-khoản--bảo-mật-auth--security-system)
2. [Phân hệ Quản lý Sản phẩm, Biến thể, Danh mục & Combo AI (PIM, Catalog & Gemini Bundles)](#2-phân-hệ-quản-lý-sản-phẩm-biến-thể-danh-mục--combo-ai-pim-catalog--gemini-bundles)
3. [Phân hệ Khuyến mãi, Marketing & Flash Sale (Promotions Engine)](#3-phân-hệ-khuyến-mãi-marketing--flash-sale-promotions-engine)
4. [Phân hệ Giỏ hàng & Quy trình Thanh toán (Cart & Checkout Engine)](#4-phân-hệ-giỏ-hàng--quy-trình-thanh-toán-cart--checkout-engine)
5. [Phân hệ Đơn hàng, Hậu cần & Vận chuyển GHN v2/v3 (OMS & Logistics)](#5-phân-hệ-đơn-hàng-hậu-cần--vận-chuyển-ghn-v2v3-oms--logistics)
6. [Phân hệ Quản lý Kho & Chuỗi Cung ứng (Inventory & Supply Chain - 16 Submodules Toàn diện)](#6-phân-hệ-quản-lý-kho--chuỗi-cung-ứng-inventory--supply-chain---16-submodules-toàn-diện)
7. [Phân hệ Thư viện Media & Quản lý Tài nguyên (Media Library & Cloudinary)](#7-phân-hệ-thư-viện-media--quản-lý-tài-nguyên-media-library--cloudinary)
8. [Phân hệ Bài viết, Tin tức & SEO (Blog & Content Management)](#8-phân-hệ-bài-viết-tin-tức--seo-blog--content-management)
9. [Phân hệ Đánh giá & Bình luận (Customer Reviews & Q&A)](#9-phân-hệ-đánh-giá--bình-luận-customer-reviews--qa)
10. [Phân hệ Trợ lý AI & Động cơ Tìm kiếm Thông minh (Dual AI Chatbot, Visual Search & Recommendations)](#10-phân-hệ-trợ-lý-ai--động-cơ-tìm-kiếm-thông-minh-dual-ai-chatbot-visual-search--recommendations)
11. [Phân hệ Quản trị Nhân viên, Phân quyền Động & Nhật ký Hệ thống (RBAC & Audit Logs)](#11-phân-hệ-quản-trị-nhân-viên-phân-quyền-động--nhật-ký-hệ-thống-rbac--audit-logs)
12. [Giao diện Trải nghiệm Khách hàng Storefront (Client Experience)](#12-giao-diện-trải-nghiệm-khách-hàng-storefront-client-experience)
13. [Quy chuẩn Thiết kế Giao diện UI/UX Quản trị & Trải nghiệm Người dùng (Admin Design System & UX Standards)](#13-quy-chuẩn-thiết-kế-giao-diện-uiux-quản-trị--trải-nghiệm-người-dùng-admin-design-system--ux-standards)

---

## 1. Phân hệ Xác thực, Tài khoản & Bảo mật (Auth & Security System)

### 1.1 Backend (`BE/src/controllers/auth.controller.js`, `auth.service.js`)
- **Xác thực JWT đa tầng**:
  - `accessToken` ngắn hạn gửi kèm Authorization Header.
  - `refreshToken` lưu trữ trong **httpOnly Cookie** an toàn, chống tấn công XSS.
  - Tự động cơ chế xoay vòng Refresh Token (Token Rotation).
- **Đăng ký / Đăng nhập truyền thống**:
  - Đăng ký tài khoản mật khẩu mã hóa an toàn qua `bcryptjs`.
  - Đăng nhập xác thực email/số điện thoại và mật khẩu.
- **Xác thực Mạng Xã Hội (Social OAuth 2.0)**:
  - Tích hợp đăng nhập nhanh qua **Google OAuth 2.0**.
  - Tích hợp đăng nhập nhanh qua **Zalo OAuth**.
  - Tích hợp đăng nhập nhanh qua **TikTok Login Kit**.
  - Tự động liên kết tài khoản mạng xã hội với tài khoản email sẵn có hoặc tạo mới an toàn.
- **Bảo mật & Phục hồi Mật khẩu**:
  - Quên mật khẩu qua gửi mã OTP / Token kích hoạt vào Email (sử dụng template HTML Nodemailer).
  - Xác thực mã OTP và đặt lại mật khẩu mới.
  - Hỗ trợ Xác thực 2 bước (2FA / Two-Factor Authentication).
  - Hỗ trợ đăng nhập sinh trắc học / Passkey (FIDO2 / WebAuthn ready).
- **Quản lý Thiết bị & Giám sát Phiên hoạt động (Device & Session Management)**:
  - Tự động thu thập IP, User-Agent, Tên thiết bị, Trình duyệt, Vị trí khi đăng nhập.
  - API lấy danh sách các phiên đăng nhập đang hoạt động của tài khoản.
  - API Đăng xuất từ xa / Thu hồi quyền truy cập (Revoke Session) của từng thiết bị hoặc tất cả thiết bị khác.
  - **Server-Sent Events (SSE) Session Stream (`/api/v1/auth/session-stream`)**: Thông báo thời gian thực khi phiên bị đăng xuất từ xa để hủy token và redirect ngay lập tức.

### 1.2 Admin Portal (`Admin/src/pages/auth/`, `Admin/src/pages/profile/`)
- Màn hình Đăng nhập quản trị viên tối ưu bảo mật.
- Xử lý Callback OAuth đồng bộ (`AdminAuthCallbackPage`).
- Trang Quản lý Hồ sơ Cá nhân Admin (`AdminProfilePage`): Đổi họ tên, avatar, số điện thoại, đổi mật khẩu, quản lý các thiết bị đang đăng nhập, bật/tắt 2FA.
- Bảo vệ truy cập qua HOC `ProtectedRoute` và `PermissionGuard`.

### 1.3 Client Storefront (`client/src/components/auth/`, `client/src/app/tai-khoan`)
- Modal Đăng nhập / Đăng ký nhanh không cần chuyển trang.
- Trang Đăng nhập (`/login`), Đăng ký (`/register`), Quên mật khẩu (`/forgot-password`), Đặt lại mật khẩu (`/reset-password`).
- Cụm nút Social Login (Google, Zalo, TikTok).
- Tab **Bảo mật tài khoản (`/tai-khoan?tab=security`)**:
  - Đổi mật khẩu tài khoản trực tiếp.
  - Bảng danh sách thiết bị và phiên đăng nhập đang hoạt động (kèm thông tin OS, Browser, Thời gian truy cập cuối).
  - Nút "Đăng xuất thiết bị này" hoặc "Đăng xuất khỏi tất cả thiết bị khác".

---

## 2. Phân hệ Quản lý Sản phẩm, Biến thể, Danh mục & Combo AI (PIM, Catalog & Gemini Bundles)

### 2.1 Backend (`BE/src/models/product.model.js`, `productVariant.model.js`, `category.model.js`, `brand.model.js`)
- **Quản lý Sản phẩm Đa thuộc tính (Product Model)**:
  - Thông tin chung: Tên, Slug chuẩn SEO, Mã SKU gốc, Thương hiệu (`ref: Brand`), Danh mục (`ref: Category`), Tag (`ref: Tag`).
  - Giá cả: Giá bán lẻ, Giá so sánh (Giá gốc gạch chân), Giá vốn (Cost price để tính lợi nhuận).
  - Nội dung: Tóm tắt ngắn, Mô tả chi tiết Rich HTML, Bộ thông số kỹ thuật (Specs dạng Key-Value / JSON có cấu trúc).
  - Hình ảnh: Ảnh đại diện (Thumbnail), Thư viện ảnh chi tiết (Gallery Cloudinary).
  - Trạng thái: Nháp (Draft), Đang bán (Active), Ngừng bán (Archived).
  - Chuẩn SEO: `metaTitle`, `metaDescription`, `metaKeywords`, Canonical URL.
- **Quản lý Biến thể Chi tiết (ProductVariant Model)**:
  - Cấu hình đa thuộc tính (Options: Màu sắc, Dung lượng, Bộ nhớ RAM, Kích thước...).
  - Mỗi biến thể có: Mã SKU riêng biệt, Barcode, Giá bán riêng, Giá so sánh riêng, Giá vốn riêng, Ảnh riêng theo màu.
  - Quản lý kho 3 trạng thái: Tồn kho thực tế (`stock`), Tồn kho đang giữ chỗ cho đơn hàng (`allocated`), Tồn kho khả dụng (`available = stock - allocated`).
- **Nhập / Xuất Dữ liệu Hàng loạt (Excel Import / Export)**:
  - Service đọc và phân tích file Excel sản phẩm qua thư viện `exceljs`.
  - Preview dữ liệu trước khi import (kiểm tra lỗi SKU trùng lặp, thiếu thông tin bắt buộc).
  - Tự động tạo sản phẩm kèm ma trận biến thể tự sinh.
  - Xuất danh sách sản phẩm ra file Excel đầy đủ thuộc tính và tồn kho.
- **Quản lý Danh mục & Thương hiệu (Category & Brand)**:
  - Cây danh mục sản phẩm đa cấp (Hỗ trợ cha - con `parentId`, cấp 1, cấp 2, cấp 3).
  - Icon danh mục, Banner danh mục, Slug danh mục, Cấu hình SEO danh mục.
  - Quản lý thương hiệu: Tên hãng, Slug, Logo, Banner thương hiệu, Mô tả hãng.
- **Quản lý Menu Điều hướng (Menu Model)**:
  - Tạo và quản lý nhiều vị trí menu (Main Menu, Mega Menu, Footer Menu...).
  - Cấu trúc cây menu đa cấp có liên kết đến Sản phẩm, Danh mục, Bài viết hoặc URL tùy chỉnh.

### 2.2 Admin Portal (`Admin/src/pages/products/`, `categories/`, `brands/`, `menus/`)
- **Danh sách sản phẩm (`ProductListPage.jsx`)**:
  - Bảng dữ liệu chuyên nghiệp: Phân trang, Tìm kiếm từ khóa, Lọc theo Danh mục, Thương hiệu, Trạng thái, Kho hàng.
  - Ẩn/Hiện cột linh hoạt (`ColumnToggleDropdown`), Bulk Action (Đổi trạng thái, Xóa hàng loạt).
  - Chỉnh sửa nhanh Giá và Tồn kho trực tiếp trên bảng dữ liệu.
- **Form Tạo / Sửa Sản phẩm (`ProductFormPage.jsx`)**:
  - Tab Thông tin cơ bản, Tab Media chọn ảnh từ Cloudinary Media Picker.
  - Trình soạn thảo Rich Text Editor định dạng bài viết mô tả sản phẩm.
  - Trình dựng Thông số kỹ thuật động (Dynamic Key-Value Specs Builder).
  - Trình tạo Biến thể ma trận trực quan (Matrix Variant Generator theo Options).
- **Quản lý Biến thể Chuyên sâu (`ProductVariantsPage.jsx`, `VariantEditPage.jsx`)**:
  - Xem danh sách biến thể của sản phẩm, điều chỉnh giá bán, giá vốn, tồn kho, ảnh riêng của từng biến thể.
- **Trang Import / Export Excel (`ImportExportPage.jsx`)**:
  - Kéo thả file Excel, Tải template mẫu chuẩn, Modal xem trước dữ liệu và báo cáo lỗi dòng (`ExcelPreviewModal.jsx`).
- **Quản lý Danh mục (`CategoryPage.jsx`) & Thương hiệu (`BrandPage.jsx`)**:
  - Giao diện quản lý danh mục dạng Cây phân cấp, gán Icon, SEO.
  - Giao diện quản lý Thương hiệu đối tác.
- **Biên tập Menu Điều hướng (`MenuListPage.jsx`, `MenuEditorPage.jsx`)**:
  - Kéo thả sắp xếp thứ tự và cấp độ lồng nhau (DnD-Kit sortable & nesting) trực quan.

### 2.3 Client Storefront (`client/src/app/collections/`, `products/`, `so-sanh/`)
- **Trang Bộ sưu tập / Danh mục (`/collections/[handle]`)**:
  - Bộ lọc Sidebar đa chiều (Multi-Facet Filter): Lọc theo Khoảng giá, Thương hiệu (checkbox có search), Danh mục con, Màu sắc (Color Swatches), Tags khuyến mãi.
  - Sắp xếp sản phẩm: Mới nhất, Bán chạy, Giá tăng dần, Giá giảm dần, Tên A-Z.
  - Thẻ sản phẩm chuẩn EGA: Hover lật ảnh phụ, Nhãn % giảm giá, Badge Flash Sale, Nhãn quà tặng kèm 0đ, Giá niêm yết và giá gạch.
  - Nút Xem nhanh (Quick View Modal) và Thêm nhanh vào giỏ (Quick Add).
- **Trang Chi tiết Sản phẩm (`/products/[handle]`)**:
  - Gallery hình ảnh: Ảnh lớn có Zoom chi tiết / Lightbox xem toàn màn hình, Thumbnail Carousel cuộn mượt mà, Tự động nhảy ảnh theo màu biến thể được chọn.
  - Bộ chọn biến thể (Pill buttons): Tự động tính toán tồn kho khả dụng và cập nhật giá bán tức thì.
  - Bộ chọn số lượng có kiểm soát chống đặt quá số lượng tồn kho khả dụng.
  - Hiển thị danh sách Quà tặng 0đ đi kèm (nếu có).
  - Hiển thị danh sách Mã giảm giá áp dụng được cho sản phẩm kèm nút "Sao chép mã".
  - **Thanh Mua hàng Cố định Dính đáy (Sticky Purchase Bar)** khi cuộn chuột qua khối CTA.
  - Khối nội dung Đa Tab: Tab Thông số kỹ thuật (Bảng Specs Key-Value), Tab Mô tả Rich HTML, Tab Đánh giá & Bình luận.
  - Khối Gợi ý: Sản phẩm tương tự cùng phân khúc, Phụ kiện mua kèm (Upsell), Sản phẩm đã xem gần đây.
- **Trang So sánh Thông số (`/so-sanh`)**:
  - So sánh song song 2-4 sản phẩm trên một bảng ma trận thuộc tính, giá bán, tồn kho và chi tiết kỹ thuật.

### 2.4 Phân hệ Combo Sản Phẩm & Trí Tuệ Nhân Tạo Gemini Định Giá (Gemini Combo & AI Pricing Engine)
- **Backend Architecture (`BE/src/models/combo.model.js`, `combo.service.js`, `combo.controller.js`)**:
  - **Mô hình Dữ liệu Combo Chuyên sâu**:
    - Định danh: Mã Combo (`code` tự sinh tiền tố `CB-` hoặc tùy biến), Tên Combo, Slug chuẩn SEO, Ảnh đại diện, Mô tả chi tiết.
    - Danh sách Sản phẩm Thành phần (`items`): Liên kết trực tiếp tới `product` và `variant`, lưu trữ số lượng mỗi món trong combo.
    - Cơ chế Tính Tồn Kho Ảo (`virtualStock`): Tự động tính toán tồn kho khả dụng của combo theo sản phẩm thành phần có số lượng nhỏ nhất (`Math.floor(stock / item.quantity)`). Đảm bảo không bao giờ bán vượt quá tồn kho thực tế của các sản phẩm đơn lẻ.
    - Động cơ Giá & Tiết kiệm: Tự động cộng dồn giá gốc của các sản phẩm con (`originalPrice`), áp dụng chiết khấu linh hoạt theo % (`percentage`) hoặc số tiền cố định (`fixed_amount`), tự sinh giá bán combo (`comboPrice`), số tiền tiết kiệm được (`savingsAmount`) và tỷ lệ % tiết kiệm (`savingsPercent`).
    - Cấu hình Nâng cao: Cờ Miễn phí vận chuyển (`freeShipping: true`), Thời gian hiệu lực (`startDate`, `endDate`), Trạng thái (`active`, `inactive`).
  - **Động cơ Trí Tuệ Nhân Tạo Google Gemini Gợi Ý Định Giá (`POST /api/v1/combos/ai-suggest-pricing`)**:
    - Kết nối Google Gemini Pro AI phân tích chi tiết giá vốn, giá bán lẻ và biên lợi nhuận của từng món trong combo.
    - Trả về 3 phương án định giá kinh doanh tối ưu:
      1. *Kích cầu tối đa (Max Volume)*: Mức giá khuyến mãi sâu, kích thích chốt đơn nhanh để đẩy hàng tồn kho.
      2. *Cân bằng tối ưu (Balanced Margin)*: Cân đối hoàn hảo giữa tỷ lệ chuyển đổi và biên lợi nhuận ròng của doanh nghiệp.
      3. *Định vị Cao cấp (Premium Value)*: Giữ vững giá trị thương hiệu, định giá hợp lý kết hợp quà tặng.
    - Kèm phân tích chiến lược: Đánh giá biên lợi nhuận ước tính, tâm lý người tiêu dùng và lý do khuyến nghị cho từng phương án.
  - **Động cơ Gemini AI Gợi Ý Gói Combo Tiềm Năng (`GET /api/v1/combos/ai-suggest-bundles`)**:
    - AI tự động rà soát danh mục sản phẩm, phát hiện các nhóm phụ kiện - thiết bị thường đi cùng nhau để đề xuất lập tức các gói combo bán chéo hiệu quả.
  - **Bộ API CRUD Hoàn Chỉnh**: `GET /api/v1/combos` (hỗ trợ tìm kiếm, lọc theo loại combo, trạng thái), `GET /api/v1/combos/:id`, `POST /api/v1/combos`, `PUT /api/v1/combos/:id`, `PATCH /api/v1/combos/:id/toggle-status`, `DELETE /api/v1/combos/:id`.
- **Admin Portal (`Admin/src/pages/products/ComboListPage.jsx`, `ComboFormModal.jsx`)**:
  - **Bảng Quản lý Combo Chuẩn Pancake POS (`ComboListPage.jsx`)**:
    - Bảng dữ liệu chuyên nghiệp hiển thị đầy đủ 14 cột nghiệp vụ: Mã combo, Tên combo, Thành phần món (hình ảnh đại diện + tên sản phẩm/biến thể + số lượng), Tồn kho ảo (`virtualStock`), Phân loại combo, Miễn phí vận chuyển (Badge Freeship), Giá bán combo, % Tiết kiệm, Tiền tiết kiệm, Thời hạn áp dụng, Ngày tạo, Ngày cập nhật, Trạng thái (Đang bán / Tạm ngừng), Cột thao tác nhanh.
    - Bộ tùy biến bật/tắt cột linh hoạt (`ColumnToggleDropdown`) giúp nhân viên tùy chỉnh giao diện xem gọn gàng theo nhu cầu.
    - Thao tác nhanh: Bật/tắt trạng thái tức thì, sửa nhanh, xóa combo có xác nhận an toàn.
  - **Modal Soạn Thảo Siêu Rộng (`ComboFormModal.jsx`)**:
    - Thiết kế giao diện phẳng 2 cột không gian làm việc rộng rãi (`max-w-5xl xl:max-w-6xl`), loại bỏ hoàn toàn cảm giác chật chội.
    - Tích hợp nút "Hỏi Gemini AI Định Giá" trực tiếp trên giao diện: Gọi API phân tích và tự động điền giá combo chỉ với 1 cú click.
    - Tìm kiếm và thêm sản phẩm thành phần ma trận trực quan, kiểm tra tồn kho tức thì.

---

## 3. Phân hệ Khuyến mãi, Marketing & Flash Sale (Promotions Engine)

### 3.1 Backend (`BE/src/models/coupon.model.js`, `promotion.model.js`, `gift-program.model.js`, `flashSale.model.js`)
- **Mã Giảm giá Voucher (Coupon Model)**:
  - Loại giảm: Giảm số tiền cố định (VNĐ) hoặc Giảm theo phần trăm (%).
  - Điều kiện: Giá trị đơn hàng tối thiểu (`minOrderValue`), Mức giảm tối đa (`maxDiscountValue`).
  - Giới hạn: Tổng số lượt sử dụng tối đa, Giới hạn số lượt dùng cho mỗi khách hàng.
  - Phạm vi áp dụng: Toàn bộ đơn hàng, Theo danh mục chỉ định, hoặc Theo danh sách sản phẩm chỉ định.
  - Thời gian hiệu lực: Bắt đầu & Kết thúc, Tự động kiểm tra trạng thái kích hoạt.
- **Chương trình Giảm giá Tự động (Promotion Model)**:
  - Tự động chiết khấu giá trực tiếp trên từng sản phẩm hoặc toàn bộ danh mục mà không cần nhập mã voucher.
- **Chương trình Quà tặng Kèm 0đ (Gift Program Model)**:
  - Mua sản phẩm X được tặng sản phẩm quà Y giá 0đ.
  - Mua đơn hàng có tổng giá trị đạt mốc Z được tự động tặng quà công nghệ 0đ.
- **Chiến dịch Flash Sale Giá Sốc (Flash Sale Model)**:
  - Cấu hình theo khung giờ (Time Slots: Sáng, Trưa, Chiều, Tối).
  - Thiết lập giá bán sốc Flash Sale riêng biệt cho từng biến thể sản phẩm.
  - Giới hạn số lượng mở bán Flash Sale (`flashSaleLimit`), Theo dõi số lượng đã bán (`flashSaleSold`).
  - Tự động mở bán khi đến giờ và tự động kết thúc/khóa giá khi hết thời gian hoặc hết số lượng phân bổ.
- **Động cơ Định giá 4 Cấp Tự động (4-Tier Pricing Engine)**:
  `Giá gốc -> [1] Giá Flash Sale -> [2] Chiết khấu Promotion -> [3] Mã giảm giá Coupon -> [4] Quà tặng 0đ Gift Program`.

### 3.2 Admin Portal (`Admin/src/pages/promotions/`)
- **Quản lý Mã Giảm giá (`CouponPage.jsx`)**: Tạo mã, cấu hình chiết khấu, theo dõi lượt sử dụng, tìm kiếm và lọc voucher.
- **Quản lý Giảm giá Tự động (`PromotionPage.jsx`)**: Thiết lập chương trình chiết khấu theo nhóm sản phẩm.
- **Quản lý Quà tặng 0đ (`GiftProgramPage.jsx`)**: Cấu hình quà tặng kèm theo sản phẩm hoặc mốc đơn hàng.
- **Quản lý Flash Sale (`FlashSalePage.jsx`, `FlashSaleFormModal.jsx`)**: Thiết lập chiến dịch Flash Sale theo khung giờ, chọn sản phẩm tham gia, đặt giá sốc và giới hạn số lượng bán.

### 3.3 Client Storefront (`client/src/components/home/`, `client/src/app/flash-sale/`, `client/src/components/cart/`)
- Trang chủ: Promo Ticker Bar (Sao chép mã nhanh), Lưới Coupon Cards phân cấp, Khối Flash Sale đếm ngược với thanh tiến trình số lượng đã bán / còn lại.
- **Trang Flash Sale Chuyên biệt (`/flash-sale`)**:
  - Hiển thị danh sách các khung giờ Flash Sale (Khung giờ Đang diễn ra & Khung giờ Sắp diễn ra).
  - Đồng hồ đếm ngược Countdown Timer lật số.
  - Lưới sản phẩm Flash Sale với thanh % số lượng đã bán.
- Khối Coupon gợi ý tại Trang chi tiết sản phẩm và Modal chọn voucher trong Giỏ hàng.

---

## 4. Phân hệ Giỏ hàng & Quy trình Thanh toán (Cart & Checkout Engine)

### 4.1 Backend (`BE/src/controllers/cart.controller.js`, `cart.service.js`, `checkout.service.js`)
- **Quản lý Session Giỏ hàng Độc lập**:
  - Hỗ trợ giỏ hàng Khách vãng lai (Guest) thông qua Header `x-session-id` (UUID).
  - Hỗ trợ giỏ hàng Khách hàng đã đăng nhập (User) gắn với `userId`.
- **Cơ chế Hợp nhất Giỏ hàng (Cart Merging)**:
  - Khi khách vãng lai đăng nhập, hệ thống tự động gộp toàn bộ sản phẩm từ giỏ Guest vào giỏ User mà không làm mất dữ liệu.
- **Xác thực & Tự động Tính toán Tồn kho & Giá cả**:
  - API `GET /api/v1/cart`: Tự động quét lại tồn kho thực tế, loại bỏ sản phẩm đã hết hàng, tính lại giá bán 4 cấp theo các chương trình khuyến mãi đang chạy.
  - API `POST /api/v1/cart/items`: Thêm 1 hoặc nhiều sản phẩm (`variantId`, `quantity`) vào giỏ.
  - API `PATCH /api/v1/cart/items/:itemId`: Cập nhật số lượng có kiểm tra chặn vượt quá tồn kho khả dụng.
  - API `POST /api/v1/cart/apply-coupon`: Áp dụng mã giảm giá và kiểm tra điều kiện đơn tối thiểu.
  - Tự động gắn sản phẩm Quà tặng 0đ vào giỏ khi đạt điều kiện chương trình Gift Program.
- **Engine Xác thực Thanh toán (Validate Checkout Engine)**:
  - Kiểm tra toàn diện trước khi chuyển sang thanh toán: kiểm tra biến thể còn bán không, còn đủ tồn không, mã giảm giá còn hiệu lực không.

### 4.2 Client Storefront (`client/src/app/cart/`, `client/src/components/cart/`, `client/src/store/cartStore.js`)
- **Mini Cart Drawer**: Mở nhanh từ Header, hiển thị danh sách món, tổng tiền, thao tác nhanh.
- **Trang Giỏ hàng Hoàn chỉnh (`/cart`)**:
  - **Thanh Tiến trình Nhận quà (Cart Reward Bar)**: Đo giá trị đơn hàng theo 3 mốc (VD: Mốc 1 Miễn phí vận chuyển, Mốc 2 Tặng voucher 100k, Mốc 3 Tặng bộ quà tặng 0đ).
  - **Danh sách Sản phẩm trong giỏ**: Ảnh, Tên sản phẩm, Tên biến thể, Giá gốc, Giá sau khuyến mãi, Bộ nút tăng giảm số lượng `−`/`+`, Nút xóa sản phẩm, Cảnh báo tồn kho.
  - **Khối Quà tặng Kèm 0đ**: Hiển thị riêng biệt các món quà được tặng kèm với giá 0₫, khóa không cho tăng số lượng tùy tiện.
  - **Khối Mã Giảm giá (`CartVoucherModal.jsx`)**: Nhập mã hoặc chọn trực tiếp từ danh sách voucher khả dụng.
  - **Khối Tổng kết Đơn hàng (`CartOrderSummary.jsx`)**: Tạm tính tiền hàng, Tiền giảm giá khuyến mãi, Tiền giảm voucher, Phí vận chuyển ước tính, Tổng thanh toán cuối cùng, Nút "TIẾN HÀNH ĐẶT HÀNG".

---

## 5. Phân hệ Đơn hàng, Hậu cần & Vận chuyển GHN v2/v3 (OMS & Logistics)

### 5.1 Backend (`BE/src/controllers/order.controller.js`, `order.service.js`, `ghn.service.js`, `shipping.controller.js`)
- **Quản lý Vòng đời Đơn hàng (Order Management System - OMS)**:
  - Mã đơn hàng sinh tự động chuẩn hóa.
  - Lưu trữ Snapshot toàn bộ thông tin tại thời điểm đặt hàng: Giá, SKU, Tên sản phẩm, Tên biến thể, Hình ảnh, Địa chỉ giao hàng.
  - Quản lý trạng thái đơn hàng: `pending` (Chờ xác nhận) -> `confirmed` (Đã xác nhận) -> `processing` (Đang xử lý/Đóng gói) -> `shipping` (Đang giao hàng) -> `completed` (Hoàn tất) -> `cancelled` (Đã hủy) -> `returned` (Đã hoàn trả).
  - Quản lý trạng thái thanh toán: `unpaid` (Chưa thanh toán), `paid` (Đã thanh toán), `refunded` (Đã hoàn tiền).
  - Lịch sử thay đổi trạng thái đơn hàng (Order Timeline Logs).
- **Tích hợp Hậu cần Vận chuyển Giao Hàng Nhanh (GHN Integration)**:
  - API Lấy danh mục Tỉnh / Thành phố, Quận / Huyện, Phường / Xã chuẩn GHN v2.
  - API Tính phí vận chuyển tự động dựa trên trọng lượng, kích thước gói hàng và địa chỉ nhận hàng.
  - API Tạo đơn giao hàng sang hệ thống bưu tá GHN, nhận mã vận đơn GHN Tracking Code.
  - API Theo dõi hành trình đơn hàng thời gian thực.
- **Tích hợp Cổng Thanh toán & Chuyển khoản**:
  - Thanh toán khi nhận hàng (COD).
  - Thanh toán Chuyển khoản Ngân hàng tự động qua **VietQR (NAPAS 247)**: Tự động sinh mã QR động kèm mã đơn và số tiền chính xác.
  - Sẵn sàng tích hợp cổng VNPay, MoMo.
- **Xử lý Tồn kho Tự động theo Đơn hàng**:
  - Đặt hàng: Giữ chỗ tồn kho (`allocated += qty`).
  - Xác nhận/Xuất kho: Trừ tồn kho thực tế (`stock -= qty`, `allocated -= qty`).
  - Hủy đơn: Giải phóng tồn kho giữ chỗ (`allocated -= qty`).
- **Gửi Email Xác nhận Đơn hàng Tự động**:
  - Gửi email thông báo đơn hàng mới kèm hóa đơn chi tiết qua Nodemailer.

### 5.2 Chuẩn Hóa Bưu Chính Mới 2 Cấp & Đối Soát Sáp Nhập Địa Giới GHN v3 (Nghị quyết 202/2025/QH15)
- **Tích hợp Kiến trúc Địa danh 2 Cấp GHN v3 (`BE/src/controllers/shipping.controller.js`)**:
  - `GET /api/v1/shipping/new-provinces`: Truy xuất danh mục 63 Tỉnh/Thành phố mới chuẩn hóa GHN v3 (`_id`, `name`, `code`).
  - `GET /api/v1/shipping/new-wards?province_id=...`: Truy xuất danh mục Phường/Xã mới trực thuộc cấp Tỉnh (tối ưu hóa loại bỏ cấp trung gian Quận/Huyện theo quy hoạch hành chính mới).
  - `GET /api/v1/shipping/post-merger-lookup`: Động cơ đối soát và tự động ánh xạ địa chỉ cũ (3 cấp) sang địa chỉ mới (2 cấp), đảm bảo đơn vận chuyển bưu tá luôn chuyển phát chính xác tuyệt đối.
  - Hỗ trợ song song: Vừa tương thích ngược với hệ thống địa chỉ 3 cấp GHN v2 (`/provinces`, `/districts`, `/wards`), vừa sẵn sàng toàn diện với chuẩn GHN v3 2 cấp.

### 5.3 Client Storefront & Admin Portal Trải nghiệm Nhập Liệu Địa Chỉ
- **Client Storefront (`client/src/app/tai-khoan`)**:
  - **Tab Đơn hàng của tôi (`/tai-khoan?tab=orders`)**: Bộ lọc đơn hàng theo trạng thái (Tất cả, Chờ xử lý, Đang giao, Hoàn tất, Đã hủy), Tra cứu theo mã đơn, Xem chi tiết snapshot và hủy đơn tự động khi còn ở trạng thái Chờ xác nhận.
  - **Tab Sổ địa chỉ nhận hàng (`/tai-khoan?tab=addresses`)**: Quản lý nhiều địa chỉ, hỗ trợ nhập liệu linh hoạt, đặt địa chỉ mặc định khi checkout.
- **Admin Portal (`SupplierFormModal.jsx`, `WarehouseListPage.jsx`)**:
  - Bộ chọn địa chỉ 2 Chế độ (Dual Address Mode): Tab 1 cho phép chọn theo "Địa chỉ mới 2 cấp GHN v3", Tab 2 cho phép chọn theo "Địa chỉ cũ 3 cấp GHN v2".
  - Tự động ghép nối chuỗi địa chỉ hoàn chỉnh (`formattedAddress`), đảm bảo tính thống nhất dữ liệu trên toàn hệ thống.

---

## 6. Phân hệ Quản lý Kho & Chuỗi Cung ứng (Inventory & Supply Chain - 16 Submodules Toàn diện)

Hệ thống cung cấp phân hệ quản trị Kho vận & Chuỗi cung ứng toàn diện chuẩn doanh nghiệp:

### 6.1 Danh sách 16 Module Kho Chi tiết
1. **Nhà Cung Cấp Chuẩn Pancake POS & VietQR API (`supplier.model.js`, `SupplierListPage.jsx`, `SupplierFormModal.jsx`)**:
   - **Phân loại & Công nợ**: Phân loại nhà cung cấp rõ ràng (`Sản phẩm / Nguyên vật liệu`, `Sản phẩm`, `Nguyên phụ liệu`). Tự động ghi nhận và quản lý công nợ NCC (`totalDebt`).
   - **Hệ thống Tab Trạng thái Pancake**: Cụm tab lọc trạng thái `Tất cả` [số lượng], `Đang hoạt động` [số lượng], `Không hoạt động` [số lượng] kèm aggregation đếm chính xác theo thời gian thực.
   - **Tích hợp Tài khoản Ngân hàng Chuẩn VietQR**: Kết nối trực tiếp API VietQR (`https://api.vietqr.io/v2/banks`) với dropdown tìm kiếm ngân hàng thông minh, hiển thị logo ngân hàng thực tế, tên viết tắt, mã bin, tự động chuẩn hóa tên chủ tài khoản viết hoa không dấu (`toUpperCase`), chi nhánh ngân hàng.
   - **Giao diện Bảng Đa Cột & Thống Kê Ghim Chân**: Hiển thị đầy đủ thông tin mã NCC, tên, loại, thông tin liên hệ, địa chỉ, thông tin ngân hàng VietQR kèm logo, công nợ, trạng thái. Thanh thống kê ghim chân bảng tính tổng công nợ cần thanh toán của toàn bộ danh sách nhà cung cấp. Bộ toggle ẩn/hiện cột linh hoạt.
   - **Modal Soạn Thảo Rộng Rãi 2 Cột (`max-w-5xl`)**: Thiết kế phẳng chống bí bách, công tắc trạng thái nhanh trên Header, khu vực upload logo thương hiệu rộng thoáng, tab chọn địa chỉ 2 chế độ (Địa chỉ mới 2 cấp GHN v3 & Địa chỉ cũ 3 cấp GHN v2) tự sinh chuỗi địa chỉ định dạng chuẩn.

2. **Quản Trị Đa Kho Hàng Vật Lý (Multi-Warehouse - `warehouse.model.js`, `WarehouseListPage.jsx`)**:
   - Quản lý mạng lưới chi nhánh kho hàng: Kho tổng, Kho miền Bắc, Kho miền Nam, Kho bán lẻ...
   - Thiết lập Kho mặc định (`isDefault`), phân công Thủ kho quản lý (`manager` liên kết với danh sách Staff có quyền), diện tích mặt bằng, sức chứa tối đa và địa chỉ vị trí kho.
   - Quản lý tồn kho phân tán theo từng kho (`productWarehouseStock.model.js`).
   - Thống kê chỉ số hiệu suất: Tỷ lệ lấp đầy, số lượng SKU lưu kho, giá trị tồn kho theo từng kho.

3. **Sơ Đồ Mặt Bằng Kho 2D Trực Quan (Interactive 2D Floor Plan - `WarehouseMapPage.jsx`)**:
   - Trình giả lập mặt bằng kho tương tác 2D trực quan theo chuẩn phần mềm ERP/WMS MISA AMIS.
   - Trực quan hóa mặt bằng lưới tọa độ: Khu vực dỡ hàng (Receiving Dock), Dãy kệ hàng (Racks), Tầng kệ (Shelves), Vị trí ô lưu trữ (Bins), Lối đi nội bộ (Aisles), Khu vực đóng gói (Packing Area), Cửa xuất hàng (Shipping Dock).
   - Tương tác click từng ô kệ để mở drawer/popover xem danh sách các mặt hàng SKU đang đặt tại ô đó, số lượng tồn thực tế, cảnh báo ô đầy/trống và trạng thái nhiệt độ bảo quản.
   - Hỗ trợ phóng to thu nhỏ (Zoom), kéo rê bản đồ (Pan), chuyển đổi nhanh giữa các chi nhánh kho.

4. **Điều Chuyển Kho Nội Bộ (Stock Transfers - `stockTransfer.model.js`, `StockTransferListPage.jsx`)**:
   - Lập phiếu điều chuyển hàng hóa giữa các kho chi nhánh (Kho xuất -> Kho nhập).
   - Quản lý danh sách sản phẩm/biến thể cần chuyển và số lượng.
   - Quy trình duyệt nghiêm ngặt: `Draft` (Dự thảo) -> `In Transit` (Đang vận chuyển) -> `Received` (Đã nhập kho đích) -> `Cancelled` (Hủy bỏ).
   - Tự động sinh giao dịch thẻ kho kép (`StockMovement`: 1 giao dịch OUT tại kho nguồn và 1 giao dịch IN tại kho đích) đảm bảo cân bằng số liệu kế toán kho.

5. **Đơn Nhập Hàng (Purchase Orders - PO - `purchaseOrder.model.js`, `PurchaseOrderListPage.jsx`, `PurchaseOrderCreatePage.jsx`)**:
   - Tạo đơn đặt hàng gửi nhà cung cấp: Chọn NCC, Chọn sản phẩm/biến thể, Giá nhập, Số lượng, Thuế VAT, Chiết khấu.
   - Luồng duyệt đơn PO nhiều cấp (`draft` -> `submitted` -> `approved` -> `completed` -> `cancelled`).
   - Hỗ trợ xuất template in phiếu PO chuyên nghiệp và tự sinh email gửi NCC.

6. **Phiếu Nhập Kho (Stock Receivings - `stockReceiving.model.js`, `StockReceivingListPage.jsx`, `StockReceivingCreatePage.jsx`)**:
   - Lập phiếu thực nhập hàng vào kho từ PO hoặc nhập trực tiếp.
   - Kiểm đếm số lượng thực nhận, ghi nhận chênh lệch so với PO, tự động cộng tồn kho thực tế (`stock`) và cập nhật giá vốn.

7. **Trả Hàng Nhà Cung Cấp (Purchase Returns - `purchaseReturn.model.js`, `PurchaseReturnListPage.jsx`, `PurchaseReturnCreatePage.jsx`)**:
   - Tạo phiếu xuất trả hàng lỗi/hỏng về nhà cung cấp, tự động trừ lại tồn kho và cập nhật trừ công nợ.

8. **Phiếu Xuất Kho (Stock Exports - `stockExport.model.js`, `StockExportListPage.jsx`)**:
   - Quản lý xuất kho theo nhiều mục đích: Xuất bán lẻ, Xuất điều chuyển kho, Xuất hủy hàng hư hỏng, Xuất hàng mẫu thử.
   - Cập nhật tồn kho tức thì sau khi xuất và ghi nhận chi phí hao hụt.

9. **Kiểm Kê Kho Định Kỳ (Stock Audits - `stockAudit.model.js`, `StockAuditListPage.jsx`)**:
   - Tạo phiếu kiểm kê kho theo từng danh mục hoặc toàn bộ kho.
   - Nhập số lượng thực tế kiểm đếm, hệ thống tự động so khớp với tồn kho phần mềm để tính chênh lệch thừa/thiếu.
   - Tự động tạo bút toán điều chỉnh cân bằng kho sau khi hoàn tất kiểm kê.

10. **Cảnh Báo Tồn Kho (Stock Alerts - `stockAlert.model.js`, `StockAlertPage.jsx`)**:
    - Tự động phát hiện và cảnh báo sản phẩm sắp hết hàng (dưới ngưỡng tồn tối thiểu).
    - Cảnh báo hàng tồn kho lâu ngày không phát sinh đơn hàng (Dead stock) và cảnh báo vượt định mức tồn (Overstock).

11. **Sổ Nhật Ký Thẻ Kho (Stock Movements - `stockMovement.model.js`, `StockMovementListPage.jsx`)**:
    - Ghi lại từng giao dịch biến động tồn kho chi tiết (Nhập, Xuất, Bán hàng, Trả hàng, Kiểm kê, Chuyển kho).
    - Lưu trữ số lượng tồn trước giao dịch, số lượng biến động và số lượng tồn sau giao dịch của từng biến thể.

12. **Báo Cáo Tồn Kho & Xuất Nhập Tồn (Inventory Reports - `inventoryReport.controller.js`, `InventoryReportPage.jsx`)**:
    - Thống kê tổng giá trị tài sản hàng tồn kho theo giá vốn và giá bán lẻ.
    - Báo cáo xuất - nhập - tồn chi tiết theo khoảng thời gian và phân tích tốc độ vòng quay hàng tồn kho.

13. **Quản Lý Chứng Từ Kho (Stock Documents - `stockDocument.model.js`, `StockDocumentListPage.jsx`)**:
    - Quản lý, lưu trữ và tra cứu toàn bộ hóa đơn, biên bản bàn giao, chứng từ đính kèm của các nghiệp vụ kho.

---

## 7. Phân hệ Thư viện Media & Quản lý Tài nguyên (Media Library & Cloudinary)

### 7.1 Backend (`BE/src/controllers/media.controller.js`, `folder.controller.js`, `media.service.js`)
- **Tích hợp Cloudinary CDN Storage**: Upload ảnh/video trực tiếp qua Multer memory storage.
- **Cấu trúc Thư mục Đa cấp (Folder Model)**: Hỗ trợ tạo thư mục lồng nhau dạng Cây để tổ chức ảnh ngăn nắp theo danh mục/thương hiệu.
- **Lưu trữ Metadata Chi tiết (Media Model)**: URL, public_id, kích thước file, định dạng (jpg, png, webp), dung lượng bytes, alt text, tag phân loại.
- **Service Quét và Dọn dẹp Ảnh Rác (Unused Media Service)**: Tự động đối soát toàn bộ cơ sở dữ liệu để tìm các file ảnh trên Cloudinary không còn được dùng trong Sản phẩm, Biến thể, Banner hay Bài viết nào, cho phép xóa dọn dẹp dung lượng.

### 7.2 Admin Portal (`Admin/src/pages/media/`)
- **Cây thư mục Media (`FolderTree.jsx`)**: Tạo thư mục mới, đổi tên, xóa thư mục, di chuyển ảnh giữa các thư mục.
- **Lưới hiển thị Media (`MediaGrid.jsx`, `MediaToolbar.jsx`)**: Xem trước ảnh phóng to, copy nhanh URL, xem chi tiết metadata, xóa nhiều ảnh cùng lúc.
- **Khu vực Upload kéo thả (`UploadZone.jsx`)**: Kéo thả nhiều ảnh cùng lúc với thanh tiến trình tải lên.
- **Modal Chọn ảnh Tái sử dụng (`MediaPickerModal.jsx`)**: Tích hợp trực tiếp vào Form Sản phẩm, Form Biến thể, Form Banner, Form Blog, Form Danh mục để chọn ảnh nhanh từ thư viện.
- **Trang Dọn dẹp Tài nguyên Rác (`UnusedMediaPage.jsx`)**: Quét và dọn sạch các ảnh thừa giải phóng dung lượng lưu trữ.

---

## 8. Phân hệ Bài viết, Tin tức & SEO (Blog & Content Management)

### 8.1 Backend (`BE/src/models/blogPost.model.js`, `blogCategory.model.js`, `blogSeo.service.js`)
- Quản lý Bài viết: Tiêu đề, Slug chuẩn SEO, Ảnh bìa đại diện, Tóm tắt ngắn, Nội dung Rich HTML, Danh mục bài viết, Thẻ Tags, Tác giả, Trạng thái (Draft, Published), Lượt xem (View count).
- Quản lý Danh mục Blog & Thẻ Tag Blog.
- Tự động chấm điểm SEO và sinh thẻ OpenGraph metadata cho bài viết.

### 8.2 Admin & Client
- **Admin (`Admin/src/pages/blog/`)**: Danh sách bài viết, Form soạn thảo tin tức với Rich Text Editor, Quản lý danh mục bài viết và thẻ bài viết.
- **Client (`client/src/app/blogs/`, `client/src/components/home/HomeTechNews.jsx`)**: Trang danh sách tin tức công nghệ, Khối tin tức khuyến mãi ở Trang chủ, Trang chi tiết bài viết chuẩn SEO với mục lục tự động và bài viết liên quan.

---

## 9. Phân hệ Đánh giá & Bình luận (Customer Reviews & Q&A)

### 9.1 Backend (`BE/src/models/comment.model.js`, `comment.service.js`)
- Đánh giá sao (1 đến 5 sao) và nhận xét nội dung chi tiết.
- Đính kèm hình ảnh thực tế của khách hàng.
- Huy hiệu "Đã mua hàng tại hệ thống" (Verified Purchase Badge) dựa trên lịch sử đơn hàng.
- Phản hồi bình luận đa cấp (Admin/CSKH trả lời khách hàng).
- Kiểm duyệt bình luận (Trạng thái: Chờ duyệt, Đã duyệt, Đã ẩn).

### 9.2 Client (`client/src/components/product/detail/ProductReviewsAndComments.jsx`)
- Thống kê tỷ lệ đánh giá sao trực quan (Thanh tiến trình 5 sao, 4 sao, 3 sao, 2 sao, 1 sao).
- Bộ lọc xem đánh giá: Lọc theo số sao, lọc đánh giá có kèm hình ảnh, lọc đánh giá của người đã mua.
- Form gửi đánh giá và nhận xét kèm tải ảnh thực tế.

---

## 10. Phân hệ Trợ lý AI & Động cơ Tìm kiếm Thông minh (Dual AI Chatbot, Visual Search & Recommendations)

### 10.1 Trợ lý Ảo AI Chatbot Đa Động Cơ & Nhận Diện Ngữ Cảnh Thời Gian Thực (`BE/src/services/chatbot.service.js`, `client/src/components/chat/`)
- **Kiến trúc Động cơ Kép (Dual AI Engine - Groq Llama 3 & Google Gemini)**:
  - Tích hợp động cơ kép: Mô hình Groq Llama 3 (xử lý phản hồi tốc độ cực cao) kết hợp cùng Google Gemini Pro AI (xử lý logic ngữ cảnh phức tạp và dự phòng tin cậy).
  - Tự động cơ chế chuyển đổi dự phòng (Fallback Mechanism) thông minh khi một trong hai dịch vụ gặp lỗi hoặc quá tải quota.
- **Truyền Dữ Liệu Dạng Luồng Server-Sent Events (SSE Streaming)**:
  - Tối ưu hóa phản hồi theo mili-giây, streaming từng từ trực tiếp xuống giao diện mà không phải chờ đợi toàn bộ văn bản sinh xong.
- **Nhận Diện Ngữ Cảnh Sản Phẩm Đang Xem Thời Gian Thực (`Viewed Product Context`)**:
  - Khi khách hàng nhắn tin trong lúc đang xem trang chi tiết sản phẩm (ví dụ: các dòng Samsung Galaxy, iPhone...), hệ thống tự động bóc tách ngữ cảnh sản phẩm hiện tại (ID, SKU, Tên, Giá, và Tồn kho khả dụng thực tế `availableStock`).
  - Chatbot lập tức phân tích và trả lời chính xác tình trạng còn hàng hoặc hết hàng dựa trên dữ liệu tồn kho thực tế, loại bỏ hoàn toàn hiện tượng ảo giác (hallucination) hoặc báo nhầm hết hàng.
- **Tương Tác Trực Quan Đa Năng**:
  - Trả về tin nhắn kèm **Thẻ sản phẩm tương tác trực tiếp (`ChatProductCard.jsx`)** cho phép xem nhanh thông tin, giá bán và thêm ngay vào giỏ hàng từ khung chat.
  - Tích hợp **Tra cứu Vận đơn Tự động (`ChatOrderLookup.jsx`)**: Khách hàng nhập mã đơn, Bot tự động truy vấn trạng thái đơn hàng và tiến trình vận chuyển thời gian thực.
  - Mascot hoạt hình thông minh kèm hiệu ứng âm thanh tương tác xúc giác (`MascotBot.jsx`, `AiChatWidget.jsx`).

### 10.2 Động cơ Tìm kiếm Nâng cao & Tìm kiếm bằng Hình ảnh (Visual Search)
- **Live Search Autocomplete (`client/src/components/header/SearchBar.jsx`)**: Debounce 300ms, gợi ý tức thì danh sách sản phẩm và bài viết liên quan kèm hình ảnh nhỏ và giá bán.
- **AI Search Enricher (`aiSearchEnricher.service.js`)**: Phân tích ngữ nghĩa từ khóa và tìm kiếm theo thuộc tính kỹ thuật.
- **Visual Search (Tìm kiếm bằng hình ảnh - `visualSearch.service.js`, `VisualSearchModal.jsx`)**:
  - Cho phép người dùng tải lên hình ảnh sản phẩm từ điện thoại hoặc máy tính.
  - Trích xuất đặc trưng hình ảnh để tìm kiếm các sản phẩm tương đồng về kiểu dáng và màu sắc trong kho.

### 10.3 Động cơ Gợi ý Thông minh (Recommendation Engine)
- **Item Similarity Model**: Gợi ý sản phẩm tương tự cùng tầm giá và danh mục.
- **Upsell Suggestion Model**: Gợi ý phụ kiện thường được mua kèm với sản phẩm đang xem.
- **Personalized Recommendation Feed**: Gợi ý sản phẩm cá nhân hóa tại Trang chủ dựa trên lịch sử xem hàng của người dùng (`userInteraction.model.js`).

---

## 11. Phân hệ Quản trị Nhân viên, Phân quyền Động & Nhật ký Hệ thống (RBAC & Audit Logs)

### 11.1 Phân quyền Động Đa cấp (RBAC - `role.model.js`, `permission.model.js`)
- Danh mục quyền hạn chi tiết theo dạng `resource:action` (VD: `product.create`, `product.edit`, `stock_audit.manage`, `purchase_order.approve`, `user.view`...).
- Quản lý Nhóm quyền (Roles: Super Admin, Quản lý kho, Kế toán, Nhân viên CSKH, Biên tập viên...).
- Gán phân quyền linh hoạt theo từng vai trò.
- Phân quyền giao diện phía Admin bằng HOC `PermissionGuard` và `Can.jsx` (tự động ẩn các nút thao tác và chặn truy cập trang nếu không có quyền).

### 11.2 Quản lý Nhân viên & Khách hàng
- **Quản lý Nhân viên (`StaffListPage.jsx`)**: Danh sách nhân viên, gán vai trò quyền hạn, khóa/mở tài khoản, mời nhân viên tham gia qua Email.
- **Quản lý Khách hàng (`CustomerListPage.jsx`)**: Danh sách khách hàng, thông tin liên hệ, tổng chi tiêu, tổng số đơn đã mua, lịch sử hoạt động.

### 11.3 Nhật ký Hoạt động Toàn hệ thống (Audit Logs - `auditLog.model.js`, `AuditLogListPage.jsx`)
- Tự động ghi lại mọi thao tác quan trọng trong hệ thống:
  - Ai thực hiện (User/Staff).
  - Hành động gì (Create, Update, Delete, Export, Login...).
  - Trên tài nguyên nào (Sản phẩm, Đơn hàng, Kho hàng, Quyền hạn...).
  - Thời gian, Địa chỉ IP, Trình duyệt.
  - Dữ liệu trước và sau khi thay đổi (Old Data vs New Data diff).
- Bảng tra cứu nhật ký có bộ lọc theo ngày, theo người thao tác và theo hành động.

---

## 12. Giao diện Trải nghiệm Khách hàng Storefront (Client Experience)

### 12.1 Header & Navigation
- Thanh Top Header: Cam kết chính hãng, Hotline, Đặt lịch hẹn, Tra cứu đơn.
- Live Search Bar kèm tìm kiếm hình ảnh Visual Search.
- Mega Menu & Category Drawer đa cấp.
- Account Dropdown Menu (Đơn hàng, Sổ địa chỉ, Đổi mật khẩu, Đăng xuất).
- Mini Cart Drawer thời gian thực.

### 12.2 Các Khối Giao diện Trang chủ (Homepage)
- Hero Banner Slider tự động cuộn.
- Promo Ticker Bar sao chép mã ưu đãi nhanh.
- Khối 4 Cam kết dịch vụ (Trust Badges).
- Khối Coupon Cards danh sách mã giảm giá.
- Khối Flash Sale đồng hồ đếm ngược và thanh tiến trình.
- Khối Danh mục ngành hàng bo tròn.
- Khối Tabbed Products (Sản phẩm mới / Bán chạy / Nổi bật).
- Khối Brand Marquee thương hiệu đối tác.
- Khối Bài viết tin tức khuyến mãi & công nghệ.
- Khối Đăng ký nhận bản tin khuyến mãi (Newsletter).

### 12.3 Toàn bộ các Trang Chức năng Client
- Trang chủ (`/`)
- Trang Danh mục / Bộ sưu tập (`/collections/[handle]`)
- Trang Chi tiết Sản phẩm (`/products/[handle]`)
- Trang So sánh Thông số (`/so-sanh`)
- Trang Giỏ hàng (`/cart`)
- Trang Chiến dịch Flash Sale (`/flash-sale`)
- Trang Danh sách Tin tức (`/blogs`) & Chi tiết Bài viết (`/blogs/[slug]`)
- Trang Tìm kiếm Kết quả Nâng cao (`/search`)
- Trang Tài khoản Khách hàng Cá nhân (`/tai-khoan`)
- Các trang Xác thực: Đăng nhập (`/login`), Đăng ký (`/register`), Quên mật khẩu (`/forgot-password`), Đặt lại mật khẩu (`/reset-password`).

---

## 13. Quy chuẩn Thiết kế Giao diện UI/UX Quản trị & Trải nghiệm Người dùng (Admin Design System & UX Standards)

Dự án áp dụng chặt chẽ triết lý thiết kế phẳng doanh nghiệp (Enterprise Flat Design) nhằm mang lại trải nghiệm chuyên nghiệp, tốc độ cao và loại bỏ hoàn toàn các phong cách AI-slop:

### 13.1 Triết lý Thiết kế Cốt lõi
- **Mặc định Flat & Solid Colors**: Sử dụng hệ màu đặc chuẩn mực (`bg-background`, `bg-surface`, `bg-card`). Tuyệt đối không dùng dải màu gradient loè loẹt hay màu nền bán trong suốt thiếu kiểm soát.
- **Không Glassmorphism**: Loại bỏ các hiệu ứng kính mờ (`backdrop-blur`, viền trắng mờ ảo) để giữ giao diện luôn sắc nét, hiệu năng cao trên mọi thiết bị.
- **Không Card Lồng Card**: Bố cục phẳng phân tầng bằng đường kẻ viền mảnh 1px (`border-slate-200 / border-border`), bảng biểu rõ ràng thay cho các khối hộp xếp lồng nhau gây rối mắt.
- **Bo Góc Cố Định 6px (`rounded-[6px]`)**: Đồng bộ 100% các thành phần UI (Nút bấm, Input, Modal, Badge, Dropdown, Khung Bảng) theo kích thước bo góc 6px tinh gọn, hiện đại.
- **Hệ Thống Khoảng Cách (Spacing System)**: Chuẩn hóa theo bội số của 4px (`gap-1` 4px, `gap-2` 8px, `gap-3` 12px, `gap-4` 16px, `gap-6` 24px).
- **Định Dạng Số Liệu Chuẩn Mực**: Luôn sử dụng `tabular-nums font-mono` cho các trường tiền tệ, mã đơn hàng, mã SKU, mã vận đơn GHN, số lượng tồn kho và công nợ để căn thẳng cột tuyệt đối.

### 13.2 Chuẩn Không Gian Làm Việc Siêu Rộng Cho Modal (Wide Workspace Standard)
- Nhằm xóa bỏ hoàn toàn cảm giác chật chội, bí bách trong các tác vụ quản trị kho vận và cấu hình sản phẩm phức tạp, toàn bộ các Modal nghiệp vụ chính đều được nâng cấp kích thước rộng rãi:
  - **Modal Nhà Cung Cấp (`SupplierFormModal.jsx`)**: Chiều rộng cực đại `max-w-5xl`, chia 2 cột rõ ràng, tách bạch giữa thông tin cơ bản, thông tin tài chính VietQR và sổ địa chỉ.
  - **Modal Combo Sản Phẩm (`ComboFormModal.jsx`)**: Chiều rộng cực đại `max-w-5xl xl:max-w-6xl`, hiển thị song song danh sách sản phẩm thành phần ma trận và bảng tính giá gợi ý từ Gemini AI.
  - **Modal Đơn PO & Phiếu Nhập Kho**: Không gian thoáng đãng, dễ dàng kiểm đếm bảng hàng chục sản phẩm mà không phải cuộn ngang.

### 13.3 Tương Tác Xúc Giác & Chống Nhảy Layout (Rule N1 & Micro-interactions)
- Mọi nút bấm và tương tác người dùng đều có phản hồi vật lý tinh tế (`active:scale-[0.98] transition-transform`).
- Cơ chế bảo vệ chống giật layout (Layout Shift Prevention): Khi chuyển đổi tab, kích hoạt dropdown hay trạng thái loading, kích thước phần tử được cố định để không làm dịch chuyển các thành phần lân cận.

---
*Tài liệu được trích xuất và đối soát trực tiếp 100% từ cấu trúc mã nguồn thực tế của dự án Clone Haravan.*
