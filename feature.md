# Hệ Thống Clone Haravan (E-Commerce Enterprise) — Tổng Hợp Tính Năng Hoàn Chỉnh

> **Phiên bản tài liệu**: 2.1 (Cập nhật ngày 12/10/2026 — Bổ sung Combo AI, Pancake Supplier, VietQR, Đa Kho Hàng, Sơ đồ Kho 2D, GHN v3 2 cấp & Chuẩn UI Flat)  
> **Tham chiếu nghiệp vụ & UI/UX**: [EGA Điện Máy / Haravan Enterprise Theme](https://ega-dien-may.myharavan.com)  
> **Cấu trúc dự án**: Gồm 3 khối chính: **Backend REST & AI Engine (`BE`)**, **Admin Dashboard Quản trị (`Admin`)**, và **Client Storefront Bán hàng (`client`)**.

---

## 📑 Mục Lục Tính Năng

1. [Phân Hệ Backend (BE & AI Services)](#1-phân-hệ-backend-be--ai-services)
   - [1.1 Xác thực, Phân quyền & Quản lý Người dùng (Auth, RBAC & Security)](#11-xác-thực-phân-quyền--quản-lý-người-dùng-auth-rbac--security)
   - [1.2 Quản lý Sản phẩm, Danh mục & Combo AI (PIM & Gemini Bundles)](#12-quản-lý-sản-phẩm--danh-mục-pim---product-information-management)
   - [1.3 Quản lý Kho Vận & Chuỗi Cung Ứng (Inventory & Supply Chain)](#13-quản-lý-kho-vận--chuỗi-cung-ứng-inventory--supply-chain)
   - [1.4 Khuyến mãi, Mã giảm giá & Flash Sale (Marketing & Promotions)](#14-khuyến-mãi-mã-giảm-giá--flash-sale-marketing--promotions)
   - [1.5 Giỏ hàng, Đơn hàng & Vận chuyển GHN v2/v3 (Cart, Order & Logistics)](#15-giỏ-hàng-đơn-hàng--vận-chuyển-cart-order--logistics)
   - [1.6 Trợ lý AI & Động cơ Tìm kiếm Thông minh (AI Chatbot, Search & Visual Search)](#16-trợ-lý-ai--động-cơ-tìm-kiếm-thông-minh-ai-chatbot-search--visual-search)
   - [1.7 Động cơ Gợi ý Cá nhân hóa (Personalized Recommendation Engine)](#17-động-cơ-gợi-ý-cá-nhân-hóa-personalized-recommendation-engine)
   - [1.8 CMS Nội dung, Thư viện Media, Banner & Blog (Content Management)](#18-cms-nội-dung-thư-viện-media-banner--blog-content-management)
   - [1.9 Nhật ký Hoạt động & Giám sát Hệ thống (Audit Log & Monitoring)](#19-nhật-ký-hoạt-động--giám-sát-hệ-thống-audit-log--monitoring)
2. [Phân Hệ Admin Panel (Trang Quản Trị Doanh Nghiệp)](#2-phân-hệ-admin-panel-trang-quản-trị-doanh-nghiệp)
   - [2.1 Bảng điều khiển Tổng quan (Executive Dashboard)](#21-bảng-điều-khiển-tổng-quan-executive-dashboard)
   - [2.2 Quản lý Danh mục, Sản phẩm & Combo AI Chuyên sâu](#22-quản-lý-danh-mục--sản-phẩm-chuyên-sâu)
   - [2.3 Quản trị Kho hàng, Sơ đồ 2D & Nhà Cung Cấp Pancake Toàn diện](#23-quản-trị-kho-hàng--nhà-cung-cấp-toàn-diện)
   - [2.4 Thiết lập Chiến dịch Khuyến mãi & Flash Sale](#24-thiết-lập-chiến-dịch-khuyến-mãi--flash-sale)
   - [2.5 Quản lý Thư viện Media & Quản lý Cây Thư mục](#25-quản-lý-thư-viện-media--quản-lý-cây-thư-mục)
   - [2.6 Quản lý Khách hàng, Nhân sự & Phân quyền Ma trận (RBAC)](#26-quản-lý-khách-hàng-nhân-sự--phân-quyền-ma-trận-rbac)
   - [2.7 CMS Menu Đa cấp, Banner & Blog Chuyên nghiệp](#27-cms-menu-đa-cấp-banner--blog-chuyên-nghiệp)
   - [2.8 Trung tâm Bảo mật & Nhật ký Kiểm toán (Audit Logs)](#28-trung-tâm-bảo-mật--nhật-ký-kiểm-toán-audit-logs)
3. [Phân Hệ Client Storefront (Giao Diện Khách Hàng)](#3-phân-hệ-client-storefront-giao-diện-khách-hàng)
   - [3.1 Đầu trang Thông minh & Thanh Điều Hướng (Header & Navigation)](#31-đầu-trang-thông-minh--thanh-điều-hướng-header--navigation)
   - [3.2 Trang Chủ Đa Khối Năng Động (Homepage Blocks)](#32-trang-chủ-đa-khối-năng-động-homepage-blocks)
   - [3.3 Trang Danh mục & Bộ lọc Đa Tiêu chí (Collections & Faceted Filters)](#33-trang-danh-mục--bộ-lọc-đa-tiêu-chí-collections--faceted-filters)
   - [3.4 Trang Chi Tiết Sản Phẩm Chuẩn Thương Mại (Product Detail Page)](#34-trang-chi-tiết-sản-phẩm-chuẩn-thương-mại-product-detail-page)
   - [3.5 Trang So Sánh Sản Phẩm Song Song (Product Comparison)](#35-trang-so-sánh-sản-phẩm-song-song-product-comparison)
   - [3.6 Trang Chiến Dịch Flash Sale Khung Giờ (Flash Sale Landing)](#36-trang-chiến-dịch-flash-sale-khung-giờ-flash-sale-landing)
   - [3.7 Phân Hệ Giỏ Hàng Thông Minh (Smart Cart System)](#37-phân-hệ-giỏ-hàng-thông-minh-smart-cart-system)
   - [3.8 Trợ Lý AI Mascot & Chatbot Trực Tuyến (Interactive Mascot Chatbot)](#38-trợ-lý-ai-mascot--chatbot-trực-tuyến-interactive-mascot-chatbot)
   - [3.9 Hệ Thống Tin Tức & Blog Chuẩn SEO (Blog & Knowledge Hub)](#39-hệ-thống-tin-tức--blog-chuẩn-seo-blog--knowledge-hub)
   - [3.10 Trung Tâm Quản Lý Tài Khoản Khách Hàng (Customer Account Center)](#310-trung-tâm-quản-lý-tài-khoản-khách-hàng-customer-account-center)
   - [3.11 Xác Thực Đa Phương Thức Hiện Đại (Modern Authentication Suite)](#311-xác-thực-đa-phương-thức-hiện-đại-modern-authentication-suite)
4. [Quy Chuẩn Thiết Kế Giao Diện UI/UX Quản Trị (Admin Enterprise Design System)](#4-quy-chuẩn-thiết-kế-giao-diện-uiux-quản-trị-admin-enterprise-design-system)

---

## 1. Phân Hệ Backend (BE & AI Services)

### 1.1 Xác thực, Phân quyền & Quản lý Người dùng (Auth, RBAC & Security)
- **Đăng nhập / Đăng ký truyền thống**: Email & Password mã hóa bcrypt, sinh cặp JWT `accessToken` (thời hạn ngắn) và `refreshToken` (HTTP-only secure cookie).
- **Đăng nhập không mật khẩu (Passkeys / WebAuthn)**: Tích hợp xác thực sinh trắc học (FIDO2, Fingerprint, FaceID, Windows Hello) bằng WebAuthn challenge-response.
- **Xác thực 2 yếu tố (2FA / MFA)**: Tạo secret TOTP, mã QR tương thích Google Authenticator/Authy, mã dự phòng khẩn cấp (Backup codes).
- **Đăng nhập Mạng xã hội (Social OAuth)**: Google OAuth, TikTok Login, Zalo Login qua cơ chế OAuth Popup window và callback an toàn.
- **Quản lý Phiên đăng nhập & Thiết bị (Active Sessions Tracking)**:
  - Tự động bóc tách thông tin User-Agent (Thiết bị, Hệ điều hành, Trình duyệt, Địa chỉ IP).
  - Cho phép người dùng xem danh sách thiết bị đang hoạt động.
  - Hủy phiên đăng nhập từ xa (Remote Session Revoke) với cơ chế Server-Sent Events (SSE) đẩy lệnh đăng xuất thời gian thực tới trình duyệt bị hủy.
- **Khôi phục mật khẩu an toàn**: Gửi mã OTP / Token xác thực qua email SMTP Nodemailer có hạn dùng 15 phút.
- **Hệ thống Phân quyền Ma trận (RBAC - Role-Based Access Control)**:
  - Định nghĩa nhóm quyền chi tiết theo từng Resource (`products`, `inventory`, `orders`, `promotions`, `media`, `users`, `roles`, `audit_logs`, `settings`).
  - Phân quyền theo Action (`create`, `read`, `update`, `delete`, `import`, `export`, `approve`).
  - Middleware kiểm tra quyền truy cập nghiêm ngặt (`requirePermission`).
- **Sổ địa chỉ hành chính**: Lưu trữ đa địa chỉ, tích hợp dữ liệu 63 tỉnh/thành phố, quận/huyện, phường/xã của Việt Nam.

---

### 1.2 Quản lý Sản phẩm & Danh mục (PIM - Product Information Management)
- **Cấu trúc Dữ liệu Sản phẩm Đa tầng**:
  - Tên, slug tự động, mã SKU chính, Barcode, Thương hiệu (Brand), Danh mục chính & danh mục phụ (Categories).
  - Thông số kỹ thuật động (Specs / Attributes) dạng key-value (Công suất, Kích thước, Dung tích, Xuất xứ...).
  - Thẻ phân loại (Tags), Trạng thái (Draft, Active, Archived), Thứ tự hiển thị, Cờ nổi bật (Featured/Hot).
- **Quản lý Biến thể (Variants) Đa chiều**:
  - Hỗ trợ nhiều nhóm thuộc tính (Màu sắc, Dung lượng, Bộ nhớ, Kích cỡ...).
  - Quản lý độc lập từng biến thể: SKU riêng, Barcode riêng, Giá niêm yết (Original Price), Giá bán (Price), Giá so sánh (Compare at Price), Giá vốn (Cost Price), Số lượng tồn kho (Stock quantity), Ảnh đại diện biến thể.
  - Trình tự động sinh ma trận biến thể (Variant Matrix Generator) từ các giá trị thuộc tính.
- **Import / Export Excel Chuyên sâu**:
  - Đọc và xuất file Excel `.xlsx` với thư viện ExcelJS.
  - Validate tính hợp lệ của từng dòng dữ liệu, kiểm tra trùng SKU, mã danh mục, thương hiệu.
  - Cung cấp tính năng xem trước dữ liệu trước khi nạp vào DB (Excel Preview).
  - Service tự động sửa lỗi và chuẩn hóa danh mục (`productCatalogFix.service.js`).
- **Cây Danh mục Đa cấp (Category Hierarchy)**:
  - Hỗ trợ danh mục lồng nhau không giới hạn cấp (Parent-Child Tree).
  - Tự động tính toán đường dẫn danh mục (breadcrumb path), icon, ảnh banner danh mục.
- **Combo Sản Phẩm & Trí Tuệ Nhân Tạo Gemini Định Giá (Gemini Bundles & AI Pricing Engine)**:
  - Model `combo.model.js`: Mã combo tự sinh (`CB-`), tên, slug, mô tả, danh sách items (liên kết product/variant và số lượng).
  - Tồn kho ảo thông minh (`virtualStock`): Tự động tính toán theo sản phẩm thành phần có số lượng nhỏ nhất, đảm bảo không bao giờ bán vượt tồn kho thực tế.
  - Tự động cộng dồn giá gốc (`originalPrice`), áp dụng chiết khấu linh hoạt (% hoặc số tiền), tính số tiền tiết kiệm (`savingsAmount`) và % tiết kiệm (`savingsPercent`), cờ freeship.
  - **Gemini AI Gợi Ý Định Giá (`POST /api/v1/combos/ai-suggest-pricing`)**: Kết nối Google Gemini Pro AI phân tích giá vốn, giá bán lẻ và biên lợi nhuận của từng món để đưa ra 3 kịch bản định giá (Kích cầu tối đa, Cân bằng tối ưu, Định vị cao cấp).
  - **Gemini AI Gợi Ý Combo Tiềm Năng (`GET /api/v1/combos/ai-suggest-bundles`)**: Quét catalog và lịch sử bán hàng để gợi ý các gói bundle có xác suất bán chéo cao.

---

### 1.3 Quản lý Kho Vận & Chuỗi Cung Ứng (Inventory & Supply Chain)
- **Quản lý Nhà Cung Cấp Chuẩn Pancake POS & VietQR (`supplier.model.js`)**:
  - Lưu trữ mã NCC, tên công ty, số điện thoại, email, địa chỉ, mã số thuế, loại NCC (`Sản phẩm / Nguyên vật liệu`, `Sản phẩm`, `Nguyên phụ liệu`), công nợ (`totalDebt`) và trạng thái (`active`, `inactive`).
  - Hệ thống Tab trạng thái Pancake: Tất cả, Đang hoạt động, Không hoạt động kèm aggregation đếm chính xác và tính tổng công nợ toàn sàn ghim chân bảng.
  - Tích hợp tài khoản Ngân hàng chuẩn VietQR: Kết nối API VietQR (`https://api.vietqr.io/v2/banks`), chọn ngân hàng kèm logo, tự động viết hoa tên tài khoản không dấu (`toUpperCase`), chi nhánh.
  - Hỗ trợ chọn địa chỉ 2 chế độ: Địa chỉ mới 2 cấp GHN v3 và Địa chỉ cũ 3 cấp GHN v2.
- **Quản Trị Đa Kho Hàng Vật Lý (Multi-Warehouse - `warehouse.model.js`)**:
  - Quản lý mạng lưới chi nhánh kho vật lý: Kho tổng, Kho miền Bắc, Kho miền Nam, Kho bán lẻ...
  - Thiết lập kho mặc định (`isDefault`), phân công Thủ kho quản lý (`manager`), diện tích, sức chứa.
  - Quản lý tồn kho phân tán theo từng kho (`productWarehouseStock.model.js`).
- **Sơ Đồ Mặt Bằng Kho 2D Trực Quan (Interactive 2D Floor Plan - MISA AMIS Standard - `WarehouseMapPage.jsx`)**:
  - Trình giả lập mặt bằng kho tương tác 2D trực quan theo chuẩn ERP/WMS MISA AMIS.
  - Trực quan hóa mặt bằng lưới tọa độ: Khu dỡ hàng, Dãy kệ (Racks), Tầng kệ (Shelves), Vị trí ô lưu trữ (Bins), Lối đi nội bộ, Khu đóng gói, Cửa xuất hàng.
  - Click từng ô kệ để mở popover xem danh sách các SKU, số lượng tồn thực tế, cảnh báo lấp đầy và nhiệt độ bảo quản.
- **Điều Chuyển Kho Nội Bộ (Stock Transfers - `stockTransfer.model.js`)**:
  - Lập phiếu điều chuyển hàng hóa giữa các kho chi nhánh (Kho xuất -> Kho nhập).
  - Quy trình duyệt nghiêm ngặt: `Draft` -> `In Transit` -> `Received` -> `Cancelled`.
  - Tự động sinh giao dịch thẻ kho kép (`StockMovement`: OUT tại kho nguồn và IN tại kho đích).
- **Đơn Đặt Hàng Nhập (Purchase Orders - PO)**:
  - Tạo đơn nhập từ nhà cung cấp với nhiều biến thể sản phẩm, đơn giá nhập, thuế VAT, chiết khấu.
  - Luồng trạng thái chuẩn: `Draft` (Dự thảo) -> `Ordered` (Đã đặt hàng) -> `Partial Received` (Nhập kho một phần) -> `Completed` (Hoàn thành) -> `Cancelled` (Đã hủy).
  - Tự động xuất email template HTML gửi đơn đặt hàng chính thức tới Nhà cung cấp.
  - Hỗ trợ chuyển đổi số tiền thành chữ tiếng Việt (`vnNumberToWords.js`).
- **Phiếu Nhập Kho (Stock Receiving)**:
  - Ghi nhận số lượng thực nhập theo từng đợt của PO.
  - Tự động cộng số lượng tồn kho thực tế của các biến thể tương ứng.
  - Cập nhật giá vốn trung bình hoặc giá vốn mới nhất.
- **Phiếu Trả Hàng Nhà Cung Cấp (Purchase Returns)**:
  - Xử lý hoàn trả hàng lỗi/hỏng về nhà cung cấp.
  - Tự động trừ tồn kho, tính toán giảm trừ công nợ hoặc hoàn tiền.
- **Sổ Kho & Lịch Sử Biến Động (Stock Movements)**:
  - Ghi nhận chi tiết mọi giao dịch làm thay đổi kho: `IN` (Nhập hàng), `OUT` (Xuất bán), `ADJUST` (Cân bằng kiểm kê), `RETURN` (Trả hàng), `SCRAP` (Xuất hủy).
  - Lưu trữ: Số tồn trước khi đổi -> Số lượng thay đổi -> Số tồn sau khi đổi -> Mã chứng từ tham chiếu -> Người thực hiện.
- **Phiếu Kiểm Kê Kho (Stock Audits)**:
  - Kiểm đếm thực tế so với số liệu trên hệ thống.
  - Tự động tính toán số lượng chênh lệch (Thừa / Thiếu) và giá trị chênh lệch.
  - Chức năng "Cân bằng kho" (Balance Stock) tự sinh movement điều chỉnh kho về đúng thực tế.
- **Phiếu Xuất Kho (Stock Exports)**:
  - Xuất kho với nhiều lý do: Xuất hủy hàng hư hỏng, xuất sử dụng nội bộ, xuất hàng mẫu, xuất chuyển kho.
  - Trừ tồn kho và ghi nhận chi phí hao hụt.
- **Cảnh Báo Tồn Kho (Stock Alerts)**:
  - Tự động quét và phát hiện các mặt hàng: Sắp hết hàng (Dưới định mức tối thiểu), Hết hàng (Out of Stock), Vượt định mức tồn (Overstock).
- **Báo Cáo Tồn Kho & Giá Trị Kho (Inventory Reports)**:
  - Thống kê tổng số lượng tồn, tổng giá trị kho theo Giá Vốn và theo Giá Bán.
  - Báo cáo tốc độ luân chuyển hàng hóa, mặt hàng bán chạy vs tồn đọng.

---

### 1.4 Khuyến mãi, Mã giảm giá & Flash Sale (Marketing & Promotions)
- **Mã Giảm Giá / Coupon**:
  - Giảm theo phần trăm (`%`) có giới hạn mức giảm tối đa, hoặc giảm theo số tiền cố định (`VNĐ`), hoặc Miễn phí vận chuyển (Freeship).
  - Điều kiện áp dụng: Giá trị đơn hàng tối thiểu, giới hạn tổng lượt sử dụng toàn sàn, giới hạn số lần dùng trên mỗi khách hàng, thời gian bắt đầu - kết thúc.
  - Phân loại mã công khai (hiển thị trên website) hoặc mã bí mật (chỉ áp dụng khi nhập tay).
- **Chương Trình Khuyến Mãi (Promotions)**:
  - Áp dụng giảm giá trực tiếp theo danh mục sản phẩm, theo thương hiệu, hoặc danh sách sản phẩm chỉ định.
  - Chiết khấu bậc thang theo số lượng mua (Mua nhiều giảm sâu).
- **Chiến Dịch Flash Sale (Giá Sốc Khung Giờ)**:
  - Quản lý theo từng khung giờ (Time Slots): 00:00 - 09:00, 09:00 - 12:00, 12:00 - 18:00, 18:00 - 24:00...
  - Thiết lập giá bán sốc và hạn ngạch số lượng bán ưu đãi riêng cho từng biến thể.
  - Cron Job tự động cập nhật trạng thái chiến dịch: `Upcoming` -> `Active` -> `Ended`.
- **Chương Trình Quà Tặng Kèm 0đ (Gift Programs)**:
  - Mua sản phẩm A tặng kèm sản phẩm B (0đ).
  - Mua đơn hàng đạt giá trị X tặng quà tặng chỉ định.

---

### 1.5 Giỏ hàng, Đơn hàng & Vận chuyển (Cart, Order & Logistics)
- **Quản lý Giỏ hàng Đồng bộ**:
  - Hỗ trợ giỏ hàng khách vãng lai (Guest Cart qua Session Cookie) và Khách hàng thành viên (User Cart lưu DB).
  - Tự động hợp nhất (Merge) giỏ hàng vãng lai vào tài khoản khi người dùng đăng nhập.
  - Kiểm tra tồn kho thời gian thực khi thêm sản phẩm hoặc thay đổi số lượng.
- **Động cơ Bán Chéo & Bán Thêm (Upsell / Cross-sell Engine)**:
  - Tự động gợi ý phụ kiện mua kèm, combo giảm giá khi mua cùng sản phẩm chính.
- **Hệ thống Quản lý Đơn hàng (OMS)**:
  - Tạo đơn hàng, tự sinh mã đơn hàng độc nhất (`DH-YYYYMMDD-XXXX`).
  - Quy trình trạng thái chuẩn: Chờ xác nhận -> Đã xác nhận -> Đang chuẩn bị -> Đang giao hàng -> Đã giao thành công -> Đã hủy -> Hoàn tiền.
  - Lưu trữ chi tiết snapshot giá tại thời điểm mua, thông tin người nhận, ghi chú giao hàng.
- **Tích hợp Vận Chuyển Giao Hàng Nhanh (GHN Integration v2 & v3)**:
  - Đồng bộ bảng mã Tỉnh/Thành, Quận/Huyện, Phường/Xã từ GHN API v2 (Cấu trúc cũ 3 cấp).
  - Tích hợp chuẩn bưu chính 2 cấp GHN v3 (Tỉnh mới -> Phường mới) theo Nghị quyết 202/2025/QH15 (`/new-provinces`, `/new-wards`).
  - Động cơ đối soát và tự động ánh xạ địa chỉ sáp nhập (`/post-merger-lookup`).
  - Tự động tính phí vận chuyển chính xác dựa trên trọng lượng, kích thước gói hàng và khoảng cách địa lý.
  - Tạo mã vận đơn GHN, tra cứu trạng thái đơn vận thời gian thực.
- **Phương Thức Thanh Toán Đa Dạng**:
  - Thanh toán khi nhận hàng (COD).
  - Thanh toán chuyển khoản tự động qua VietQR (NAPAS 247 Dynamic QR Code chứa sẵn số tài khoản, số tiền và nội dung mã đơn hàng).

---

### 1.6 Trợ lý AI & Động cơ Tìm kiếm Thông minh (AI Chatbot, Search & Visual Search)
- **Trợ lý Bán Hàng AI Thông Minh Đa Động Cơ (Dual AI Engine & SSE Streaming)**:
  - Kiến trúc Động cơ Kép: Kết hợp mô hình Groq Llama 3 (phản hồi siêu tốc) và Google Gemini Pro AI (xử lý logic phức tạp và dự phòng tin cậy). Tự động chuyển đổi Fallback khi một trong hai dịch vụ quá tải.
  - Truyền dữ liệu luồng Server-Sent Events (SSE) từng từ theo mili-giây, trải nghiệm đàm thoại mượt mà không độ trễ.
  - **Nhận Diện Ngữ Cảnh Sản Phẩm Đang Xem Thời Gian Thực (`Viewed Product Context`)**: Khi khách hàng đang mở trang sản phẩm (Samsung, iPhone...), chatbot tự động bóc tách SKU, giá và tồn kho khả dụng thực tế (`availableStock`) để trả lời chính xác còn/hết hàng, loại bỏ triệt để lỗi báo nhầm hết hàng.
  - Tự động ghi nhớ hồ sơ khách hàng tích lũy (`Customer Intelligence Profile`): Học mức giá quan tâm, thương hiệu yêu thích, nhu cầu sử dụng qua từng lượt chat.
  - Lưu trữ phiên hội thoại bền vững (`ChatSession`) trong MongoDB kết hợp In-Memory Cache.
  - Trả về danh sách thẻ sản phẩm tương tác mua ngay (`ChatProductCard.jsx`) và Tra cứu vận đơn nhanh (`ChatOrderLookup.jsx`) trực tiếp trong tin nhắn.
- **Động cơ Tìm kiếm Đa Chế độ (Multi-modal Search Engine)**:
  - **Live Search Autocomplete**: Gợi ý tức thì sản phẩm, bài viết, danh mục có debounce 300ms.
  - **Tìm kiếm Ngữ âm / Không dấu Tiếng Việt**: Tự động bóc tách token tiếng Việt có dấu và không dấu, hỗ trợ fuzzy matching chống gõ sai chính tả.
  - **Visual Search (Tìm kiếm bằng hình ảnh)**: Khách hàng upload ảnh sản phẩm chụp thực tế hoặc ảnh mạng, hệ thống trích xuất vector đặc trưng và tìm kiếm các sản phẩm tương đồng về kiểu dáng, màu sắc.
  - **AI Search Enricher**: Sử dụng LLM để hiểu ý định tìm kiếm phức tạp của khách hàng (ví dụ: *"tìm tủ lạnh dưới 10 triệu tiết kiệm điện cho gia đình 4 người"*).
  - **Search Log & Trending Engine**: Ghi nhận từ khóa tìm kiếm, tính toán điểm xu hướng theo thời gian thực để hiển thị thanh "Từ khóa tìm kiếm thịnh hành".

---

### 1.7 Động cơ Gợi ý Cá nhân hóa (Personalized Recommendation Engine)
- **Thu thập Tín hiệu Ngầm (Implicit Feedback Tracking)**:
  - Ghi nhận mọi hành vi tương tác của khách hàng vào model `UserInteraction`: Xem sản phẩm (View), Nhấp chuột (Click), Thêm giỏ hàng (Add to cart), Mua hàng (Purchase), Tìm kiếm (Search), So sánh (Compare), Đánh giá (Review).
  - Áp dụng ma trận trọng số tương tác chuẩn Amazon / Netflix.
- **Thuật toán Ma trận Nhân tử (Matrix Factorization / Collaborative Filtering)**:
  - Script Python (`matrix_factorization.py`) tính toán ma trận tương đồng sản phẩm (Item-to-Item Similarity) và ma trận sở thích người dùng.
  - Đồng bộ dữ liệu định kỳ qua Cron Jobs vào model `ItemSimilarity` và `PersonalizedRecommendation`.
- **Đa Dạng Luồng Gợi Ý**:
  - Gợi ý cá nhân hóa riêng cho từng khách hàng ("Dành riêng cho bạn").
  - Sản phẩm tương tự về cấu hình & giá ("Sản phẩm tương tự").
  - Sản phẩm thường được mua cùng nhau ("Frequently Bought Together").
  - Sản phẩm xu hướng thịnh hành ("Trending Now").

---

### 1.8 CMS Nội dung, Thư viện Media, Banner & Blog (Content Management)
- **Thư viện Quản lý File & Media (Cloudinary Integration)**:
  - Tải lên ảnh / video lên Cloudinary qua stream an toàn.
  - Quản lý cấu trúc cây thư mục ảo đa cấp (Folder Tree).
  - Phát hiện và dọn dẹp ảnh mồ côi (Unused Media) không gắn vào sản phẩm hay bài viết nào.
  - Truy vết nơi sử dụng của từng file ảnh (Media Usage Tracker).
- **Hệ thống Menu Đa cấp (Mega Menu Builder)**:
  - Tạo và sắp xếp cấu trúc menu cha - con trực quan.
  - Hỗ trợ liên kết URL tùy biến, liên kết danh mục, bài viết hoặc landing page.
- **Hệ thống Banner & Slider**:
  - Quản lý Hero Sliders trang chủ, Banner quảng cáo phụ, Ticker thông báo khuyến mãi, Popup quảng cáo.
  - Thiết lập thời gian hiển thị và thứ tự ưu tiên.
- **Hệ thống Blog & Tin Tức Chuẩn SEO**:
  - Quản lý bài viết với trình soạn thảo Rich Text Editor (hỗ trợ định dạng HTML, chèn ảnh, nhúng video).
  - Cấu hình SEO chuyên sâu: Meta Title, Meta Description, OpenGraph Image, Canonical URL, Slug chuẩn SEO.
  - Hệ thống Danh mục Blog & Thẻ Tags Blog.
  - Tự động sinh Mục lục bài viết (Table of Contents) dựa trên các thẻ heading H2/H3.
  - Hệ thống Bình luận & Đánh giá (Comments) phân cấp (Reply lồng nhau), tích hợp Bộ lọc chặn từ ngữ tục tĩu / nhạy cảm (`profanityFilter.js`).

---

### 1.9 Nhật ký Hoạt động & Giám sát Hệ thống (Audit Log & Monitoring)
- **Ghi nhận Mọi Thao tác Quản trị (Comprehensive Audit Logging)**:
  - Tự động bắt giữ: Người thực hiện (User), Module tác động (`PRODUCTS`, `INVENTORY`, `ORDERS`, `AUTH`, `ROLES`...), Hành động (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `EXPORT`...), Địa chỉ IP, Trình duyệt.
  - Lưu trữ chi tiết Dữ liệu trước khi sửa (Before) và Dữ liệu sau khi sửa (After) để so sánh Diff thay đổi trực quan.

---

## 2. Phân Hệ Admin Panel (Trang Quản Trị Doanh Nghiệp)

### 2.1 Bảng điều khiển Tổng quan (Executive Dashboard)
- **Bộ Thẻ Chỉ Số KPI Trọng Yếu**: Tổng doanh thu (kèm % tăng trưởng so với kỳ trước), Tổng đơn hàng mới, Tổng số lượng tồn kho & giá trị kho, Số lượng khách hàng đăng ký mới.
- **Biểu đồ Doanh Thu & Đơn Hàng (Recharts Interactive Charts)**:
  - Biểu đồ miền (Area Chart) theo dõi biến động doanh thu theo ngày/tuần/tháng.
  - Biểu đồ cột (Bar Chart) so sánh số lượng đơn hàng hoàn thành vs hủy.
- **Biểu đồ Cơ Cấu Kho Hàng (Stock Donut Chart)**: Phân bổ tỷ trọng tồn kho theo từng ngành hàng / danh mục.
- **Bảng Cảnh Báo Hàng Sắp Hết (Low Stock Alert Widget)**: Danh sách các sản phẩm chạm ngưỡng tồn tối thiểu kèm nút tạo đơn nhập nhanh.
- **Khối Danh Sách Hoạt Động Gần Đây**:
  - Top 5 sản phẩm bán chạy nhất kỳ.
  - Các giao dịch nhập/xuất kho mới nhất.
  - Khách hàng mới đăng ký tài khoản.
  - Bài viết blog mới xuất bản.
- **Bộ Mascots Động (Dashboard Mini Mascots)**: Tạo điểm nhấn sinh động, biểu cảm thay đổi theo tình trạng kinh doanh.

---

### 2.2 Quản lý Danh mục & Sản phẩm Chuyên sâu
- **Danh sách Sản phẩm Nâng cao**:
  - Tìm kiếm theo từ khóa, mã SKU, barcode.
  - Lọc theo Danh mục, Thương hiệu, Trạng thái (Active/Draft), Khoảng giá.
  - Tùy biến ẩn/hiển thị các cột trong bảng dữ liệu (Column Toggle Dropdown).
  - Phân trang chuẩn dữ liệu lớn (Pagination).
- **Form Tạo / Chỉnh sửa Sản phẩm Đa Phân Hệ**:
  - Card Thông tin cơ bản: Tên, Slug, Mô tả ngắn, Trình soạn thảo mô tả chi tiết Rich Text.
  - Card Phân loại: Chọn thương hiệu, Tree Picker chọn nhiều danh mục lồng nhau trực quan, nhập tags.
  - Card Thông số kỹ thuật (Specs Editor): Thêm/xóa các cặp thông số (Key - Value) linh hoạt.
  - Card Thư viện Ảnh (Product Media): Tích hợp Modal chọn ảnh từ Cloudinary Media Picker, kéo thả đổi thứ tự ảnh chính/phụ.
  - Card Bộ Sinh Biến Thể (Variant Matrix Generator): Nhập các tùy chọn (Màu sắc, Dung lượng...), bấm sinh tự động ma trận biến thể, chỉnh sửa nhanh giá bán, giá vốn, tồn kho hàng loạt.
- **Quản lý Biến thể Riêng Biệt (`VariantEditPage`)**: Chỉnh sửa chi tiết từng biến thể (ảnh đại diện, SKU, barcode, giá, cân nặng để tính ship).
- **Quản lý Combo Sản Phẩm & Gợi Ý Định Giá AI (`ComboListPage` & `ComboFormModal`)**:
  - Giao diện bảng dữ liệu chuẩn Pancake POS hiển thị đầy đủ 14 cột nghiệp vụ (Mã, Tên, Thành phần món kèm ảnh/số lượng, Tồn kho ảo `virtualStock`, Loại combo, Miễn phí vận chuyển, Giá bán, % Tiết kiệm, Tiền tiết kiệm, Thời gian, Ngày tạo, Ngày sửa, Trạng thái, Thao tác).
  - Bộ toggle bật/tắt cột linh hoạt (`ColumnToggleDropdown`).
  - Modal tạo/sửa siêu rộng (`max-w-5xl xl:max-w-6xl`) 2 cột phẳng, tích hợp nút "Gợi ý định giá AI" kết nối Google Gemini Pro AI phân tích chi phí và đề xuất 3 mức giá tối ưu.
- **Trang Import / Export Excel (`ImportExportPage`)**: Tải template mẫu, tải lên file Excel, xem trước dữ liệu với `ExcelPreviewModal`, xuất danh sách sản phẩm toàn sàn ra Excel.

---

### 2.3 Quản trị Kho hàng & Nhà Cung Cấp Toàn diện
- **Quản lý Nhà Cung Cấp Chuẩn Pancake POS (`SupplierListPage` & `SupplierFormModal`)**:
  - Hệ thống Tab trạng thái Pancake: Tất cả, Đang hoạt động, Không hoạt động (kèm badge đếm số lượng bản ghi chính xác).
  - Bảng dữ liệu hiển thị thông tin ngân hàng VietQR kèm logo, công nợ, phân loại NCC, thanh thống kê ghim chân trang tính tổng công nợ toàn bộ danh sách NCC.
  - Modal thêm/sửa rộng rãi 2 cột (`max-w-5xl`), công tắc trạng thái nhanh trên Header, tích hợp API VietQR tìm kiếm ngân hàng và tự động chuẩn hóa tên tài khoản viết hoa, bộ chọn địa chỉ 2 chế độ (Địa chỉ mới 2 cấp GHN v3 & Địa chỉ cũ 3 cấp GHN v2).
- **Quản Trị Đa Kho Hàng Vật Lý (`WarehouseListPage`)**: Quản lý mạng lưới chi nhánh kho, thiết lập kho mặc định, phân công thủ kho quản lý từ danh sách nhân viên có quyền, theo dõi diện tích, sức chứa và tỷ lệ lấp đầy.
- **Sơ Đồ Mặt Bằng Kho 2D Trực Quan (`WarehouseMapPage`)**: Trình giả lập mặt bằng lưới tọa độ kho tương tác chuẩn ERP MISA AMIS (Dãy kệ Racks, Tầng Shelves, Ô Bins, Cửa xuất nhập, Lối đi), click từng ô xem chi tiết SKU và tồn kho thực tế.
- **Quản lý Điều Chuyển Kho Nội Bộ (`StockTransferListPage`)**: Lập và duyệt phiếu điều chuyển hàng giữa các kho chi nhánh, tự động sinh thẻ kho kép OUT/IN.
- **Quản lý Đơn Nhập Hàng (`PurchaseOrderListPage` & `PurchaseOrderCreatePage`)**:
  - Tạo đơn nhập hàng: Chọn NCC, chọn danh sách biến thể sản phẩm, nhập số lượng và đơn giá nhập, tính thuế VAT, chiết khấu.
  - In / Xem trước phiếu nhập, gửi email đơn hàng tự động cho NCC.
  - Chuyển trạng thái đơn nhập và tạo phiếu nhập kho.
- **Quản lý Phiếu Nhập Kho (`StockReceivingListPage` & `StockReceivingCreatePage`)**: Nhập hàng thực tế theo PO, cập nhật tồn kho tức thì.
- **Quản lý Trả Hàng NCC (`PurchaseReturnListPage` & `PurchaseReturnCreatePage`)**: Hoàn trả hàng lỗi, trừ tồn kho và giảm công nợ.
- **Sổ Kho Biến Động (`StockMovementListPage`)**: Tra cứu toàn bộ lịch sử xuất/nhập/kiểm của từng SKU theo mốc thời gian.
- **Quản lý Kiểm Kê Kho (`StockAuditListPage`)**: Tạo phiếu kiểm kê, nhập số lượng thực đếm, hiển thị chênh lệch, nút "Cân bằng kho" tự động.
- **Phiếu Xuất Kho (`StockExportListPage`)**: Tạo phiếu xuất hủy, xuất mẫu, xuất nội bộ.
- **Trang Cảnh Báo Kho (`StockAlertPage`)**: Tab phân loại: Hàng sắp hết, Hết hàng, Tồn vượt mức, kèm nút tạo nhanh đơn PO.
- **Báo Cáo Tồn Kho (`InventoryReportPage`)**: Báo cáo tổng giá trị tài sản trong kho, phân tích luân chuyển SKU.

---

### 2.4 Thiết lập Chiến dịch Khuyến mãi & Flash Sale
- **Quản lý Mã Giảm Giá (`CouponPage`)**:
  - Tạo mã coupon: Đặt mã code, loại giảm (% hoặc tiền), giá trị giảm, giảm tối đa, đơn tối thiểu, tổng lượt dùng, lượt dùng/khách.
  - Bật/tắt trạng thái hiển thị công khai trên website.
- **Quản lý Khuyến Mãi (`PromotionPage`)**:
  - Tạo chiến dịch giảm giá theo danh mục, thương hiệu hoặc sản phẩm chỉ định.
  - Thiết lập chiết khấu theo số lượng mua (Volume discount).
- **Quản lý Flash Sale (`FlashSalePage` & `FlashSaleFormModal`)**:
  - Thiết lập các khung giờ Flash Sale trong ngày.
  - Chọn sản phẩm, đặt giá bán sốc và số lượng bán giới hạn trong khung giờ.
- **Quản lý Quà Tặng Kèm (`GiftProgramPage`)**:
  - Cấu hình chương trình mua sản phẩm tặng quà hoặc đơn hàng đạt mức tặng quà.

---

### 2.5 Quản lý Thư viện Media & Quản lý Cây Thư mục
- **Cây Thư Mục Ảo (`FolderTree`)**: Tạo, đổi tên, xóa thư mục con lồng nhau.
- **Lưới Quản Lý File (`MediaGrid`)**: Xem thumbnail ảnh, dung lượng, định dạng, ngày tải lên.
- **Vùng Tải Lên (`UploadZone`)**: Kéo thả nhiều file cùng lúc, upload trực tiếp lên Cloudinary.
- **Quản lý Ảnh Rác (`UnusedMediaPage`)**: Bộ lọc tự động tìm các file ảnh không được sử dụng ở bất kỳ sản phẩm hay bài viết nào để xóa giải phóng dung lượng.
- **Modal Kiểm Tra Vị Trí Sử Dụng (`MediaUsageModal`)**: Xem chi tiết ảnh này đang được gắn vào những sản phẩm, danh mục, hay bài viết nào.

---

### 2.6 Quản lý Khách hàng, Nhân sự & Phân quyền Ma trận (RBAC)
- **Quản lý Khách Hàng (`CustomerListPage`)**: Xem thông tin khách hàng, số điện thoại, email, tổng số đơn đã mua, tổng tiền đã chi tiêu, lịch sử đơn hàng.
- **Quản lý Nhân Viên (`StaffListPage`)**: Tạo tài khoản nhân viên nội bộ, phân quyền vai trò (Role), kích hoạt/khóa tài khoản.
- **Ma Trận Phân Quyền (`RoleListPage`)**:
  - Tạo vai trò mới (ví dụ: Quản lý kho, Kế toán, Nhân viên Marketing, CSKH...).
  - Bảng checklist chọn quyền chi tiết theo từng module: Xem, Thêm, Sửa, Xóa, Nhập/Xuất Excel, Phê duyệt.

---

### 2.7 CMS Menu Đa cấp, Banner & Blog Chuyên nghiệp
- **Trình Soạn Thảo Menu (`MenuEditorPage`)**: Kéo thả sắp xếp thứ tự menu, tạo menu đa cấp (cấp 1, cấp 2, cấp 3), gắn link danh mục hoặc custom URL.
- **Quản lý Banners (`BannerPage` & `BannerFormModal`)**: Thêm/sửa banner hero, promo ticker, popup kèm link điều hướng và thời gian hiển thị.
- **Quản lý Bài Viết Blog (`BlogPostListPage` & `BlogPostFormPage`)**:
  - Soạn thảo bài viết với Rich Text Editor, định dạng văn bản, chèn ảnh, nhúng video.
  - Cấu hình thông số SEO: Slug, Meta Title, Meta Description, ảnh thumbnail, gán danh mục & tags.
- **Quản lý Danh Mục & Tags Blog (`BlogCategoryPage`, `BlogTagPage`)**: Phân loại chuyên mục tin tức (Mẹo vặt, Đánh giá, Khuyến mãi...).

---

### 2.8 Trung tâm Bảo mật & Nhật ký Kiểm toán (Audit Logs)
- **Trang Hồ Sơ Cá Nhân (`AdminProfilePage`)**: Đổi thông tin cá nhân, avatar, đổi mật khẩu.
- **Thiết lập Đăng nhập Không Mật khẩu (Passkeys)**: Đăng ký thiết bị sinh trắc học vào tài khoản admin.
- **Thiết lập Xác thực 2 Bước (2FA)**: Quét mã QR Authenticator, kích hoạt mã bảo vệ 6 số.
- **Nhật Ký Kiểm Toán (`AuditLogListPage`)**:
  - Tra cứu toàn bộ lịch sử thao tác của tất cả nhân viên trên hệ thống.
  - Lọc theo Người dùng, Module, Hành động, Khoảng ngày.
  - Xem chi tiết bảng so sánh Diff JSON (Dữ liệu cũ vs Dữ liệu mới).

---

## 3. Phân Hệ Client Storefront (Giao Diện Khách Hàng)

### 3.1 Đầu trang Thông minh & Thanh Điều Hướng (Header & Navigation)
- **Header Topbar**: Thông báo chương trình ưu đãi, hotline đặt hàng, hệ thống cửa hàng.
- **Thanh Tìm Kiếm Trực Tiếp (Live Search Bar)**:
  - Input nhập từ khóa có debounce tìm kiếm nhanh.
  - Dropdown hiển thị ngay kết quả: Sản phẩm gợi ý kèm ảnh và giá bán, bài viết liên quan.
  - Bộ chọn danh mục tìm kiếm (`SearchCategoryPicker`): Tìm kiếm trong toàn bộ cửa hàng hoặc giới hạn trong 1 danh mục cụ thể.
  - Khối từ khóa thịnh hành (`SearchTrendingPills`): Hiển thị các từ khóa hot được tìm nhiều nhất.
  - **Nút Tìm Kiếm Bằng Hình Ảnh (`VisualSearchModal`)**: Chụp hoặc tải ảnh lên để AI tìm sản phẩm tương tự.
- **Drawer Danh Mục Đa Cấp (`CategoryDrawer`)**: Menu trượt mở danh mục sản phẩm lồng nhau chuyên nghiệp.
- **Menu Tài Khoản Thông Minh (`AccountMenu`)**:
  - Chưa đăng nhập: Nút Đăng nhập / Đăng ký.
  - Đã đăng nhập: Avatar, tên người dùng, menu rút gọn dẫn tới Đơn hàng, Sổ địa chỉ, Trung tâm bảo mật, Nút Đăng xuất.
- **Nút Giỏ Hàng & Badge Số Lượng**: Cập nhật số lượng món trong giỏ theo thời gian thực.

---

### 3.2 Trang Chủ Đa Khối Năng Động (Homepage Blocks)
- **Hero Banner Slider (`HeroBannerSliderClient`)**: Carousel banner sự kiện/chiến dịch tự động cuộn mượt mà.
- **Promo Ticker Bar**: Dải băng mã ưu đãi có nút "Sao chép mã" nhanh với hiệu ứng thông báo toast.
- **Khối Cam Kết Thương Hiệu (Trust Badges)**: 100% Chính hãng, Giao hàng 24h, Đổi trả 30 ngày, Trả góp 0%.
- **Khối Khuyến Mãi Online (Coupon Cards Grid)**: Danh sách phiếu giảm giá phân theo loại (Giảm tiền, Giảm %, Freeship) có điều kiện đơn tối thiểu và nút nhận mã.
- **Khối Flash Sale Nổi Bật (`HomeFlashSaleSection`)**: Đồng hồ đếm ngược Flip Card, thanh tiến trình số lượng đã bán / còn lại, giá ưu đãi sốc.
- **Khối Phím Tắt Danh Mục (`HomeCategoryShortcuts`)**: Icon tròn trực quan dẫn nhanh tới các nhóm sản phẩm (Tủ lạnh, Máy giặt, Tivi, Điều hòa, Gia dụng...).
- **Khối Showcase Danh Mục Dạng Tab (`HomeCategoryShowcase`)**: Chuyển tab ngành hàng mượt mà không reload trang.
- **Dải Băng Thương Hiệu Nổi Bật (`HomeBrandMarquee`)**: Hiệu ứng cuộn vô tận logo các thương hiệu đối tác (Samsung, LG, Xiaomi, Daikin, Panasonic...).
- **Khối Sản Phẩm Mới & Xu hướng (`HomeTrendingAndNewArrivals`)**: Hiển thị các sản phẩm hot đang được quan tâm nhiều nhất.
- **Khối Gợi Ý Cho Bạn (`HomeRecommendationFeed`)**: Danh sách sản phẩm được cá nhân hóa bởi thuật toán AI gợi ý.
- **Khối Tin Tức & Mẹo Công Nghệ (`HomeTechNews`)**: Grid các bài viết tin tức mới nhất, đánh giá kinh nghiệm sử dụng thiết bị điện máy.
- **Khối Đăng Ký Bản Tin (`HomeNewsletterBanner`)**: Nhập email nhận voucher ưu đãi thành viên mới.

---

### 3.3 Trang Danh mục & Bộ lọc Đa Tiêu chí (Collections & Faceted Filters)
- **Breadcrumbs Điều Hướng**: Phân cấp rõ ràng (Trang chủ / Tên danh mục).
- **Bộ Lọc Sidebar Đa Chiều (Multi-facet Filter Bar)**:
  - Lọc theo Khoảng giá (Dưới 1 triệu, 1-3 triệu, 3-5 triệu, 5-10 triệu, Trên 10 triệu hoặc nhập khoảng giá tùy chỉnh).
  - Lọc theo Thương hiệu (Checkbox đa chọn kèm ô tìm kiếm thương hiệu nhanh).
  - Lọc theo Phân loại danh mục con.
  - Lọc theo Bảng màu sắc (Color Swatches hình tròn màu).
  - Lọc theo Tiêu chí đặc biệt: Hàng Flash Sale, Hàng có quà tặng 0đ, Hàng còn tồn kho.
- **Thanh Sắp Xếp (Sorting Bar)**: Giá tăng dần, Giá giảm dần, Mới nhất, Bán chạy nhất, Tên A-Z, Tên Z-A.
- **Thẻ Sản Phẩm Chuẩn Thương Mại (`ProductCard`)**:
  - Ảnh đại diện chính + hiệu ứng hover đổi ảnh phụ.
  - Nhãn giảm giá `%`, badge Flash Sale, nhãn Quà tặng kèm 0đ.
  - Tên sản phẩm, Thương hiệu, SKU.
  - Giá bán hiện tại, giá gốc gạch ngang.
  - Nút thêm nhanh vào giỏ (Quick Add) & Nút Xem nhanh modal (Quick View).
- **Modal Xem Nhanh Sản Phẩm (`QuickViewModal`)**: Xem gallery ảnh, chọn biến thể màu/dung lượng và thêm giỏ hàng ngay tại chỗ không cần rời trang danh mục.
- **Khối Cam Kết & Nội Dung SEO**: Chân trang danh mục có khối cam kết chất lượng và đoạn văn bản chuẩn SEO hỗ trợ Google Indexing.

---

### 3.4 Trang Chi Tiết Sản Phẩm Chuẩn Thương Mại (Product Detail Page)
- **Gallery Hình Ảnh Chuyên Sâu (`ProductGallery`)**:
  - Khung ảnh lớn trung tâm có tính năng Zoom phóng to chi tiết khi rê chuột.
  - Thumbnail Carousel nằm ngang bên dưới, bấm đổi ảnh mượt mà.
  - Tự động nhảy ảnh tương ứng với Màu sắc biến thể được khách hàng chọn.
- **Khu Vực Giá & Ưu Đãi (`ProductInfo`)**:
  - Hiển thị giá Flash Sale (nếu đang trong chiến dịch) kèm Countdown Timer riêng.
  - Giá khuyến mãi, giá gốc, tính toán chính xác số tiền tiết kiệm được.
- **Bộ Chọn Biến Thể Trực Quan**:
  - Chọn Màu sắc (Color Swatches có ảnh thumbnail nhỏ).
  - Chọn Phiên bản / Dung lượng / Kích cỡ.
  - Tự động làm mờ và khóa các biến thể đã hết hàng trong kho.
- **Khối Khuyến Mãi & Quà Tặng Đi Kèm (`ProductPromotions`)**: Danh sách voucher áp dụng được và quà tặng 0đ nhận kèm.
- **Khối Mua Kèm Deal Sốc / Bán Thêm Phụ Kiện (`ProductUpsell`)**: Gợi ý các phụ kiện liên quan (Cáp sạc, Giá treo, Ốp lưng...) mua kèm với giá ưu đãi.
- **Bảng Tóm Tắt Thông Số Kỹ Thuật (`ProductSpecsSummary`)**: Bảng thông số chi tiết (Kích thước, Điện năng tiêu thụ, Công nghệ...) dạng bảng kẻ sọc rõ ràng.
- **Khối Cam Kết & Chính Sách (`ProductTrustBadges`)**: Đổi mới 30 ngày nếu lỗi, Bảo hành chính hãng 24 tháng, Miễn phí lắp đặt tận nhà.
- **Thanh Mua Hàng Ghim Đáy Màn Hình (`StickyPurchaseBar`)**: Tự động trượt lên khi người dùng cuộn qua nút mua chính, giúp khách hàng bấm Mua Ngay bất cứ lúc nào.
- **Đánh Giá & Bình Luận Người Dùng (`ProductReviewsAndComments`)**:
  - Đánh giá sao (1-5 sao) và tỷ lệ hài lòng trung bình.
  - Gửi bình luận và đính kèm ảnh chụp thực tế.
  - Trả lời bình luận (Reply lồng nhau).
  - Tích hợp bộ lọc từ ngữ nhạy cảm.
- **Khối Gợi Ý Sản Phẩm Tương Tự & Dành Riêng Cho Bạn**: Kết nối trực tiếp thuật toán AI gợi ý các sản phẩm cùng tầm giá hoặc cùng ngành hàng.

---

### 3.5 Trang So Sánh Sản Phẩm Song Song (Product Comparison)
- **Thanh Ghim So Sánh Đáy Màn Hình (`CompareBar`)**: Khách hàng có thể bấm "So sánh" trên các thẻ sản phẩm để gom tối đa 4 sản phẩm.
- **Trang So Sánh Chi Tiết (`/so-sanh`)**:
  - Hiển thị bảng so sánh song song theo cột: Hình ảnh, Giá bán, Thương hiệu, Trạng thái tồn kho.
  - So sánh chi tiết từng dòng thông số kỹ thuật (Kích thước, Trọng lượng, Công suất, Tính năng nổi bật...).
  - Đánh dấu điểm khác biệt giữa các sản phẩm để khách hàng dễ ra quyết định.

---

### 3.6 Trang Chiến Dịch Flash Sale Khung Giờ (Flash Sale Landing)
- **Phân Khung Giờ Trong Ngày**: Tab chuyển đổi giữa các khung giờ: Đang diễn ra (Active) và Sắp diễn ra (Upcoming).
- **Đồng Hồ Đếm Ngược Thời Gian Thực**: Hiển thị chính xác thời gian còn lại của khung giờ hiện tại.
- **Thẻ Sản Phẩm Flash Sale Riêng Biệt (`FlashSaleProductCard`)**:
  - Nhãn giảm giá sốc hình tia chớp đỏ.
  - Thanh tiến trình nhiệt kế "Đã bán X / Còn lại Y sản phẩm".
  - Hiển thị trạng thái "Cháy hàng" khi hết hạn ngạch.

---

### 3.7 Phân Hệ Giỏ Hàng Thông Minh (Smart Cart System)
- **Giao Diện Giỏ Hàng Toàn Diện (`CartView`)**:
  - Danh sách sản phẩm trong giỏ (`CartItemList`, `CartItemRow`).
  - Tăng/giảm số lượng, xóa sản phẩm, đổi biến thể trực tiếp ngay trong giỏ hàng.
- **Thanh Tiến Trình Nhận Thưởng (`CartRewardBar`)**: Thanh đo giá trị đơn hàng để nhận ưu đãi: Mua thêm X đồng để được Miễn phí vận chuyển (Freeship), Mua thêm Y đồng để nhận Quà tặng 0đ.
- **Chọn Quà Tặng Kèm 0đ (`CartGiftItems`)**: Danh sách quà tặng đủ điều kiện nhận, cho phép khách tích chọn nhận quà.
- **Mua Thêm Phụ Kiện Giá Sốc (`CartAddons`)**: Khối gợi ý mua thêm các sản phẩm phụ kiện giá rẻ.
- **Trung Tâm Áp Dụng Mã Giảm Giá (`CartVoucherModal`, `CartVoucherCard`)**:
  - Danh sách tất cả mã giảm giá khả dụng.
  - Ô nhập mã voucher thủ công.
  - Kiểm tra điều kiện và tính toán số tiền giảm trừ ngay lập tức.
- **Khối Tóm Tắt Đơn Hàng (`CartOrderSummary`)**: Tạm tính tiền hàng, Tiền giảm giá voucher, Phí vận chuyển ước tính, Tổng tiền thanh toán cuối cùng, Nút chuyển sang bước Đặt Hàng.
- **Giao Diện Giỏ Hàng Trống Sinh Động (`CartEmptyState` & `MascotCartEmpty`)**: Mascot hoạt hình vui nhộn và nút "Tiếp tục mua sắm" dẫn về trang chủ.

---

### 3.8 Trợ Lý AI Mascot & Chatbot Trực Tuyến (Interactive Mascot Chatbot)
- **Mascot Động Đa Ngữ Cảnh**:
  - Mascot góc phải màn hình (`MascotBot`) với các biểu cảm nhấp nháy, vẫy tay chào.
  - Mascot giỏ hàng trống (`MascotCartEmpty`).
  - Mascot trang không tìm thấy (`MascotNotFound`).
  - Mascot trang bảo mật đăng nhập (`MascotSecurityAuth`).
  - Mascot chiến dịch Flash Sale (`MascotFlashSale`).
- **Cửa Sổ Trò Chuyện Trực Tuyến (`AiChatWidget`)**:
  - Nút kích hoạt nổi bật kèm âm thanh tương tác (`ChatSound.js`).
  - Trợ lý AI tư vấn mua sắm 24/7 trả lời mượt mà qua cơ chế Streaming.
  - Render Card sản phẩm tương tác trực tiếp trong khung chat (`ChatProductCard`).
  - Tra cứu thông tin đơn hàng nhanh bằng mã đơn (`ChatOrderLookup`).
  - Danh sách câu hỏi gợi ý nhanh (`ChatQuickPrompts`).
  - Hỗ trợ định dạng văn bản Markdown chuẩn mực (`ChatMarkdown.jsx`).

---

### 3.9 Hệ Thống Tin Tức & Blog Chuẩn SEO (Blog & Knowledge Hub)
- **Trang Danh Sách Bài Viết (`/blogs`)**:
  - Khối bài viết nổi bật tiêu điểm (`BlogHeroFeatured`).
  - Lọc bài viết theo danh mục và thẻ tags (`BlogFilterBar`, `BlogSubNav`).
  - Phân trang bài viết (`BlogPaginationWrapper`).
- **Trang Chi Tiết Bài Viết (`/blogs/[category]/[slug]`)**:
  - Đầu trang bài viết: Tên tác giả, ngày đăng, thời gian đọc ước tính, lượt xem (`BlogDetailHeader`, `BlogViewTracker`).
  - Khối Mục Lục Tự Động (`BlogTableOfContents`): Tự động quét các thẻ H2/H3 trong bài để tạo mục lục cuộn tới nhanh.
  - Nội dung bài viết định dạng chuẩn SEO (`BlogDetailContent`).
  - Sidebar bài viết hot và danh mục liên quan (`BlogSidebar`).
  - Khối Bài viết cùng chủ đề (`BlogRelatedPosts`).
  - Khối Bình luận & Thảo luận (`BlogCommentsSection`): Cho phép độc giả bình luận, trả lời bình luận, đính kèm ảnh.

---

### 3.10 Trung Tâm Quản Lý Tài Khoản Khách Hàng (Customer Account Center)
- **Sidebar Điều Hướng Tài Khoản (`AccountSidebar`)**: Chuyển đổi nhanh giữa các tab chức năng.
- **Tab Tổng Quan Tài Khoản (`AccountOverviewTab`)**: Thống kê nhanh số đơn hàng đã đặt, tổng chi tiêu, địa chỉ mặc định, trạng thái bảo mật.
- **Tab Quản Lý Đơn Hàng (`AccountOrdersTab`)**: Danh sách tất cả đơn hàng đã mua, bộ lọc trạng thái đơn (Chờ xử lý, Đang giao, Hoàn thành, Đã hủy), xem chi tiết sản phẩm và mã vận đơn.
- **Tab Hồ Sơ Cá Nhân (`AccountProfileTab`)**: Cập nhật họ tên, email, số điện thoại, ngày sinh, giới tính, ảnh đại diện.
- **Tab Sổ Địa Chỉ (`AccountAddressesTab`, `AddressModal`)**: Thêm mới, chỉnh sửa, xóa địa chỉ nhận hàng, đặt địa chỉ mặc định, chọn nhanh Tỉnh/Thành -> Quận/Huyện -> Phường/Xã từ dữ liệu chuẩn.
- **Tab Trung Tâm Bảo Mật (`AccountSecurityTab`)**:
  - Đổi mật khẩu tài khoản (`AccountChangePasswordTab`, `PasswordModal`).
  - Quản lý Khóa bảo mật Passkeys (Thêm vân tay / FaceID để đăng nhập không cần mật khẩu).
  - Cài đặt Xác thực 2 bước 2FA Authenticator.
  - Quản lý danh sách các thiết bị & phiên đăng nhập đang hoạt động (`SessionsModal`), nút đăng xuất từ xa từng thiết bị hoặc tất cả thiết bị khác.
- **Tab Tra Cứu Bảo Hành (`AccountWarrantyTab`)**: Tra cứu thông tin thời hạn bảo hành của các thiết bị điện máy đã mua.

---

### 3.11 Xác Thực Đa Phương Thức Hiện Đại (Modern Authentication Suite)
- **Đăng Nhập / Đăng Ký Đa Dạng**:
  - Đăng nhập email & mật khẩu có ghi nhớ tài khoản.
  - Đăng nhập bằng Passkeys sinh trắc học 1 chạm.
  - Đăng nhập qua mạng xã hội: Nút Google (`GoogleLoginButton`), Nút TikTok (`TikTokLoginButton`), Nút Zalo (`ZaloLoginButton`).
- **Quên Mật Khẩu & Đặt Lại Mật Khẩu**:
  - Nhập email nhận mã OTP xác thực hoặc đường dẫn khôi phục mật khẩu.
  - Đặt mật khẩu mới an toàn với thanh đo độ mạnh mật khẩu.

---

## 4. Quy Chuẩn Thiết Kế Giao Diện UI/UX Quản Trị (Admin Enterprise Design System)

Dự án áp dụng chặt chẽ triết lý thiết kế phẳng doanh nghiệp (Enterprise Flat Design) nhằm mang lại trải nghiệm chuyên nghiệp, tốc độ cao và loại bỏ hoàn toàn các phong cách AI-slop:

### 4.1 Triết lý Thiết kế Cốt lõi
- **Mặc định Flat & Solid Colors**: Sử dụng hệ màu đặc chuẩn mực (`bg-background`, `bg-surface`, `bg-card`). Tuyệt đối không dùng dải màu gradient loè loẹt hay màu nền bán trong suốt thiếu kiểm soát.
- **Không Glassmorphism**: Loại bỏ các hiệu ứng kính mờ (`backdrop-blur`, viền trắng mờ ảo) để giữ giao diện luôn sắc nét, hiệu năng cao trên mọi thiết bị.
- **Không Card Lồng Card**: Bố cục phẳng phân tầng bằng đường kẻ viền mảnh 1px (`border-slate-200 / border-border`), bảng biểu rõ ràng thay cho các khối hộp xếp lồng nhau gây rối mắt.
- **Bo Góc Cố Định 6px (`rounded-[6px]`)**: Đồng bộ 100% các thành phần UI (Nút bấm, Input, Modal, Badge, Dropdown, Khung Bảng) theo kích thước bo góc 6px tinh gọn, hiện đại.
- **Hệ Thống Khoảng Cách (Spacing System)**: Chuẩn hóa theo bội số của 4px (`gap-1` 4px, `gap-2` 8px, `gap-3` 12px, `gap-4` 16px, `gap-6` 24px).
- **Định Dạng Số Liệu Chuẩn Mực**: Luôn sử dụng `tabular-nums font-mono` cho các trường tiền tệ, mã đơn hàng, mã SKU, mã vận đơn GHN, số lượng tồn kho và công nợ để căn thẳng cột tuyệt đối.

### 4.2 Chuẩn Không Gian Làm Việc Siêu Rộng Cho Modal (Wide Workspace Standard)
- Nhằm xóa bỏ hoàn toàn cảm giác chật chội, bí bách trong các tác vụ quản trị kho vận và cấu hình sản phẩm phức tạp, toàn bộ các Modal nghiệp vụ chính đều được nâng cấp kích thước rộng rãi:
  - **Modal Nhà Cung Cấp (`SupplierFormModal.jsx`)**: Chiều rộng cực đại `max-w-5xl`, chia 2 cột rõ ràng, tách bạch giữa thông tin cơ bản, thông tin tài chính VietQR và sổ địa chỉ.
  - **Modal Combo Sản Phẩm (`ComboFormModal.jsx`)**: Chiều rộng cực đại `max-w-5xl xl:max-w-6xl`, hiển thị song song danh sách sản phẩm thành phần ma trận và bảng tính giá gợi ý từ Gemini AI.
  - **Modal Đơn PO & Phiếu Nhập Kho**: Không gian thoáng đãng, dễ dàng kiểm đếm bảng hàng chục sản phẩm mà không phải cuộn ngang.

### 4.3 Tương Tác Xúc Giác & Chống Nhảy Layout (Rule N1 & Micro-interactions)
- Mọi nút bấm và tương tác người dùng đều có phản hồi vật lý tinh tế (`active:scale-[0.98] transition-transform`).
- Cơ chế bảo vệ chống giật layout (Layout Shift Prevention): Khi chuyển đổi tab, kích hoạt dropdown hay trạng thái loading, kích thước phần tử được cố định để không làm dịch chuyển các thành phần lân cận.

---
*Tài liệu được cập nhật và kiểm duyệt đối soát trực tiếp 100% từ cấu trúc mã nguồn thực tế của dự án Clone Haravan.*
