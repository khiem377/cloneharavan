# Clone Haravan — Tài liệu tính năng tham khảo

> Tham khảo từ demo: [EGA Điện Máy](https://ega-dien-may.myharavan.com) — Haravan Theme

---

## Mục lục

1. [Header & Navigation](#1-header--navigation)
2. [Trang chủ (Homepage)](#2-trang-chủ-homepage)
3. [Trang danh sách sản phẩm (Collections)](#3-trang-danh-sách-sản-phẩm-collections)
4. [Trang chi tiết sản phẩm (Product Detail)](#4-trang-chi-tiết-sản-phẩm-product-detail)
5. [Giỏ hàng (Cart)](#5-giỏ-hàng-cart)
6. [Tài khoản (Account)](#6-tài-khoản-account)
7. [Trang Blog / Tin tức](#7-trang-blog--tin-tức)
8. [Trang tĩnh (Static Pages)](#8-trang-tĩnh-static-pages)
9. [Tìm kiếm (Search)](#9-tìm-kiếm-search)
10. [Footer](#10-footer)
11. [Các tính năng toàn cục](#11-các-tính-năng-toàn-cục)
12. [Kiến trúc & Logic Nghiệp vụ Backend (BE Core)](#12-kiến-trúc--logic-nghiệp-vụ-backend-be-core)
13. [Chi tiết Giao diện & Luồng xử lý Admin Panel](#13-chi-tiết-giao-diện--luồng-xử-lý-admin-panel)
14. [Động cơ Tìm kiếm & Gợi ý AI (Recommendation Engine)](#14-động-cơ-tìm-kiếm--gợi-ý-ai-recommendation-engine)
15. [Tổng hợp tính năng theo trạng thái & Ma trận Roadmap](#15-tổng-hợp-tính-năng-theo-trạng-thái--ma-trận-roadmap)

---

## 1. Header & Navigation

### Header chính
- **Logo** — Link về trang chủ
- **Thanh tìm kiếm** — Dropdown chọn danh mục + input `Tìm theo tên sản phẩm...` + nút search
- **Badge LIVE** — Hiển thị trạng thái live stream
- **Tài khoản / Đăng nhập** — Link đến `/account/login`+
- **Giỏ hàng** — Mini cart icon kèm số lượng sản phẩm

### Thanh điều hướng (Navbar)
- **Danh mục sản phẩm** — Mega menu dropdown hiển thị toàn bộ danh mục
- **⚡ Flash Sales** — Link tới trang flash sale, có dropdown
- **Trả góp 0%** — Link tới `/pages/huong-dan-tra-gop`
- **Đặt lịch sửa chữa** — Link tới `/pages/dat-lich-hen-bao-hanh-va-sua-chua`
- **Tin Khuyến Mãi** — Link tới `/blogs/news`
- **Hệ thống cửa hàng** — Link tới `/pages/he-thong-cua-hang`
- **Hotline** — Số điện thoại hotline hiển thị trực tiếp

---

## 2. Trang chủ (Homepage)

### Hero Banner
- **Carousel tự động** — Slider ảnh quảng cáo, có mũi tên điều hướng và dots indicator
- **Promo Ticker Bar** — Thanh thông báo mã giảm giá có nút "Sao chép" (copy to clipboard)
  - VD: `⚡ Ưu đãi sốc – Giảm ngay 50%! | EGA50 | Sao chép`

### Trust Badges (Cam kết dịch vụ)
- 🚀 **Giao hỏa tốc** — Nội thành TP. HCM trong 4h
- 🔄 **Đổi trả miễn phí** — Trong vòng 30 ngày
- 🎧 **Hỗ trợ 24/7**
- 💥 **Deal hot bùng nổ** — Flash sale

### Khuyến mãi Online (Coupon Cards)
- Grid thẻ mã giảm giá: tên mã (EGA15, EGA30, FSHIP, EGA50), điều kiện, hết hạn
- Nút `Sao chép` (active) hoặc `Hết hạn` (disabled)

### Campaign Banner
- Banner lớn theo chương trình (VD: "DẪN ĐẦU GIÁ RẺ")

### Flash Sale Widget
- Countdown timer đếm ngược
- Trạng thái: đang diễn ra / đã kết thúc
- Grid sản phẩm flash sale kèm badge `FLASH SALE`

### Grid Danh mục sản phẩm
- Grid icon tròn + tên: Sản phẩm Hot, Thiết bị giải trí, Điện lạnh, Gia dụng nhà bếp, Di động, Gia dụng sắc màu, Gia dụng sức khỏe

### Gợi ý cho bạn (Tabbed Products)
- **Tabs**: Loa Âm Thanh / Smart TV / Điện lạnh
- **Product Card**:
  - Brand tag, tên sản phẩm, giá bán / giá gốc gạch / % giảm
  - Badge thông số (VD: "400W", "Công suất")
  - Badge promo (FLASH SALE, GIAO HỎA TỐC 2H)
  - Color swatches (click → đổi ảnh)
  - Nút thêm giỏ / nút So sánh
- Nút `Xem tất cả`

### Multi-Banner Section
- Grid 4 banner quảng cáo chiến dịch (Tivi/Tủ lạnh, Trả chậm, Vay nhanh, Khách hàng mới)

### Tháng Thương Hiệu (Brand Month)
- Carousel sản phẩm theo thương hiệu nổi bật + badge promo riêng + nút `Xem tất cả`

### Featured Product Widget
- 1 sản phẩm nổi bật toàn trang:
  - Selector size (43", 50"...), bộ chọn số lượng, trạng thái tồn kho
  - Nút: `Thêm vào giỏ` / `Mua ngay` / `Trả góp 0%`
  - Gallery ảnh / video

### Nhãn hiệu tin dùng
- Grid logo đối tác (Xiaomi, Ariston, Daikin, Samsung...)

### Bảng tin Khuyến mãi
- Grid blog posts: thumbnail, tiêu đề, excerpt, ngày đăng, nút `Xem chi tiết`
- Nút `Xem tất cả`

---

## 3. Trang danh sách sản phẩm (Collections)

### Breadcrumb
- Trang chủ / Tên danh mục

### Coupon Bar
- Thanh mã giảm giá ngang phía trên danh sách + nút Sao chép

### Bộ lọc Sidebar

| Nhóm lọc | Chi tiết |
|---|---|
| **Giá** | Radio: Dưới 1tr / 1-2tr / 2-5tr / 5-10tr / Trên 10tr |
| **Hãng sản xuất** | Checkbox: Toshiba, Aqua, Samsung... + nút `Xem thêm` |
| **Loại sản phẩm** | Checkbox: TV, Loa, Tủ lạnh... |
| **Màu sắc** | Checkbox kèm icon màu: Trắng, Đen, Xám, Xanh, Đỏ... + `Xem thêm` |
| **Tags** | Checkbox: Flash Sale, Giao Nhanh 24h |

### Sắp xếp (Dropdown)
- Tên A→Z / Z→A, Giá tăng dần, Giá giảm dần, Mới nhất, Cũ nhất, Bán chạy nhất, Tồn kho giảm

### Product Card
- Ảnh sản phẩm (hover có thể show ảnh phụ)
- Tên sản phẩm (link)
- Giá bán + giá gốc gạch chân + badge `% giảm`
- Thông tin quà tặng kèm
- Nút thêm giỏ (icon) hoặc badge `Hết hàng`

### Phân trang
- Số trang (1, 2...) + Prev/Next arrow

---

## 4. Trang chi tiết sản phẩm (Product Detail)

### Breadcrumb
- Trang chủ / Danh mục / Tên sản phẩm

### Thông tin chính
- **Tên sản phẩm** (H1), **Thương hiệu** (link lọc), **SKU**, nút **So sánh**

### Gallery ảnh
- Ảnh chính lớn (zoom/lightbox khi click)
- Thumbnail slider ngang để chuyển ảnh

### Giá & Tồn kho
- Thông báo khan hàng: `Chỉ còn X sản phẩm`
- Countdown timer (Flash Sale)
- Giá bán + giá gốc gạch chân + badge `% giảm`

### Khuyến mãi & Coupon
- Danh sách ưu đãi/quà tặng (bullet points)
- Inline coupon cards + nút `Sao chép`

### Biến thể
- Pill buttons chọn size/màu (VD: 43", 50", 55")

### Số lượng
- Nút `-` / Input / Nút `+`

### Trạng thái tồn kho
- `Trạng thái: Sẵn trong kho` hoặc `Hết hàng`

### Nút hành động
- `Thêm vào giỏ` (Add to cart)
- `Mua ngay` (Buy now — thẳng checkout)
- `Trả góp 0%`

### Chia sẻ mạng xã hội
- TikTok, Facebook, Pinterest, Twitter, Copy link

### Cam kết dịch vụ
- Icon + text: Giao hàng 24h, Trả góp 0%, Đổi trả 30 ngày

### Tabs / Accordion nội dung

| Tab | Nội dung |
|---|---|
| **Thông số kỹ thuật** | Bảng dữ liệu specs + nút `Xem thêm` |
| **Mô tả sản phẩm** | Rich HTML description |
| **Đánh giá** | (Chưa có rating/review widget) |

### Cross-sell
- **Sản phẩm liên quan** — Carousel cùng danh mục
- **Sản phẩm cùng phân khúc** — Carousel giá tương đương
- **Sản phẩm đã xem** — Recently Viewed carousel (session)

---

## 5. Giỏ hàng (Cart)

### Progress Reward Banner
- Thanh tiến trình theo giá trị đơn hàng
- Hiển thị phần thưởng đạt được: `Chúc mừng! Đã nhận: Mã giảm giá 150k` + nút `Sao chép`

### Danh sách sản phẩm

| Cột | Chi tiết |
|---|---|
| Sản phẩm | Ảnh + tên (link) |
| Đơn giá | Giá bán + gạch giá gốc |
| Số lượng | Nút `-` / Input / Nút `+` |
| Tạm tính | Tổng dòng |
| Xóa | Icon trash |

### Tùy chọn bổ sung
- **Xuất hóa đơn VAT** — Toggle form, nút `Thay đổi`
- **Hẹn giờ nhận hàng** — Date-time picker, nút `Thay đổi`
- **Ghi chú đơn hàng** — Textarea, nút `Thay đổi`
- **Mã giảm giá** — Nút `Chọn` mở modal coupon

### Tổng & Checkout
- Hiển thị `TỔNG CỘNG: X,XXX,XXXđ`
- Nút `THANH TOÁN`

### Gợi ý sản phẩm
- Horizontal sliding list (sản phẩm liên quan)

---

## 6. Tài khoản (Account)

### Đăng nhập (`/account/login`)
- Breadcrumb: Trang chủ / Đăng nhập
- Link mời đăng ký
- **Form**: Email + Mật khẩu + nút `Đăng nhập`
- **Quên mật khẩu**: link → toggle form recover (Email + `Lấy lại mật khẩu` + link `Quay lại`)
- Không có Social Login

### Đăng ký (`/account/register`)
- Breadcrumb: Trang chủ / Đăng ký
- Link mời đăng nhập
- **Form**: Họ, Tên, Số điện thoại, Email, Mật khẩu + nút `Đăng ký`

### Dashboard tài khoản (sau đăng nhập)
- Xem / chỉnh sửa thông tin cá nhân
- Lịch sử đơn hàng (danh sách, trạng thái, chi tiết)
- Sổ địa chỉ (thêm / sửa / xóa / đặt mặc định)
- Đăng xuất

---

## 7. Trang Blog / Tin tức (`/blogs/news`)

### Layout 2 cột

**Cột trái (Content):**
- Breadcrumb: Trang chủ / Tin tức
- H1: "Tin tức"
- Grid bài viết: thumbnail, tiêu đề (link), excerpt, ngày đăng, nút `Xem chi tiết`
- Phân trang số (1, 2...) + Prev/Next

**Cột phải (Sidebar):**
- **Danh mục blog**: Tin tức, Kiến thức, Đánh giá, Kinh nghiệm, Khuyến mãi
- **Tin nổi bật**: thumbnail + link bài phổ biến
- **Tags cloud**: danh sách tag dạng link

---

## 8. Trang tĩnh (Static Pages)

### Hướng dẫn trả góp (`/pages/huong-dan-tra-gop`)
- Trả góp qua thẻ tín dụng: điều kiện (30 ngân hàng, đơn tối thiểu 3tr), kênh (online/offline)
- Trả góp qua công ty tài chính
- Cam kết "3 KHÔNG": Không lãi suất, Không phí trả trước, Không phí tất toán sớm

### Hệ thống cửa hàng (`/pages/he-thong-cua-hang`)
- Danh sách chi nhánh kèm địa chỉ, bản đồ

### Đặt lịch sửa chữa / bảo hành (`/pages/dat-lich-hen-bao-hanh-va-sua-chua`)
- Form đặt lịch (tên, SĐT, loại thiết bị, vấn đề, ngày hẹn)

---

## 9. Tìm kiếm (Search)

### Autocomplete (real-time)
- Gợi ý kết quả ngay khi nhập: tên sản phẩm + ảnh nhỏ
- Dropdown danh mục lọc kèm thanh search

### Trang kết quả (`/search?q=...&type=product`)
- Grid sản phẩm khớp từ khóa
- Hiển thị giá, tồn kho, nút thêm giỏ
- Cấu trúc tương tự trang Collections

---

## 10. Footer

| Cột | Nội dung |
|---|---|
| **Thông tin công ty** | Tên, địa chỉ, MST, hotline, email |
| **Mạng xã hội** | Facebook, YouTube, TikTok, Instagram, Zalo |
| **Hỗ trợ khách hàng** | Link: Chính sách đổi trả, Bảo hành, Giao hàng... |
| **Chính sách** | Link: Bảo mật, Điều khoản sử dụng... |
| **Dịch vụ** | Link: Trả góp, Đặt lịch sửa chữa... |
| **Tổng đài** | Số hotline + giờ làm việc |
| **Phương thức thanh toán** | Logo: Visa, Mastercard, MoMo, ZaloPay |
| **Copyright** | © Bản quyền thuộc về EGANY |

---

## 11. Các tính năng toàn cục

| Feature | Mô tả |
|---|---|
| **Social Proof Toast** | Popup góc trái dưới: "Khách hàng [X] tại [TP] vừa mua [SP] cách đây [Xp]" |
| **Chat / Zalo FAB** | Floating button góc phải dưới — link Zalo/CSKH |
| **Back to Top** | Nút cuộn lên đầu trang |
| **Coupon Copy** | Copy to clipboard trên mọi trang |
| **Color Swatches** | Chọn màu → đổi ảnh sản phẩm |
| **Recently Viewed** | Carousel session-based cuối trang product |
| **Compare** | So sánh thông số nhiều sản phẩm |
| **Live Badge** | Badge LIVE trên header khi có livestream |

---

## 12. Kiến trúc & Logic Nghiệp vụ Backend (BE Core)

Backend được xây dựng trên nền tảng Node.js / ExpressJS RESTful API, kết hợp MongoDB (Mongoose ORM), Cloudinary Storage, ExcelJS và Python Micro-service cho gợi ý sản phẩm AI.

### 12.1 Xác thực & Phân quyền RBAC (Auth & Security)
- **Token Mechanism**: Đăng nhập cấp cặp JWT Token (`accessToken` + `refreshToken`). Hỗ trợ Refresh Token rotation & Cookie HTTP-only.
- **Dynamic RBAC (Role-Based Access Control)**:
  - Phân quyền theo vai trò (Admin, Staff, Warehouse, Content, Customer...).
  - Danh mục quyền mịn (`permission.model.js`), ví dụ: `product.view`, `product.create`, `product.edit`, `product.delete`, `promotion.manage`, `media.manage`, `role.manage`...
  - Middleware `PermissionGuard` trên FE Admin & authorize middleware trên BE kiểm tra quyền trước khi xử lý request.
- **Audit Logging (`auditLog.model.js` & `auditLog.service.js`)**:
  - Ghi lại nhật ký toàn bộ thao tác quan trọng (thêm/sửa/xóa sản phẩm, đơn nhập kho, đổi quyền user, cấu hình giá...).
  - Lưu giữ IP, User Agent, Resource Target, Action Type, payload thay đổi.

### 12.2 Quản lý Sản phẩm, Biến thể & Batch Import/Export Excel
- **Sản phẩm (Product Schema)**: Tên, slug (slugify tự động), SKU, thương hiệu, cây danh mục (multi-category), mô tả HTML, thông số kỹ thuật (Specs Key-Value dạng mảng), giá gốc, giá khuyến mãi, tồn kho tổng, trạng thái (`published`, `draft`, `archived`), nhãn nổi bật (`isFeatured`, `isHot`), SEO metadata (title, description, keywords).
- **Biến thể sản phẩm (Product Variants)**: Quản lý theo thuộc tính linh hoạt (Màu sắc, Dung lượng, Kích thước...), SKU riêng cho từng variant, giá niêm yết/giá bán riêng, tồn kho riêng, trọng lượng/kích thước đóng gói, hình ảnh riêng theo từng màu.
- **Batch Excel Import/Export Engine (`product.import.service.js` & `excelTemplate.service.js`)**:
  - **Tạo mẫu Excel (`generateTemplate`)**: Xuất file Excel chuẩn (`.xlsx`) kèm Data Validation dropdown cho danh mục, thương hiệu, trạng thái, cờ `isFeatured/isHot` tránh nhập sai.
  - **Import Excel tự động (`importProducts`)**: Đọc từng dòng Excel, validate dữ liệu, tự động match Danh mục & Thương hiệu trong DB. Hỗ trợ tạo mới hoặc cập nhật sản phẩm theo SKU. Trả về báo cáo chi tiết các dòng lỗi.
  - **Tự động tải & Đồng bộ ảnh Cloudinary (`syncProductImages`)**: Quét các đường dẫn ảnh URL thô trong Excel, tự động tải về server, upload lên Cloudinary theo cấu trúc thư mục phân cấp `san-pham/{slug-danh-muc}/{slug-san-pham}`, tự động tạo các bản ghi `Media` & `Folder` tương ứng trong MongoDB.
  - **Export Excel (`exportProducts`)**: Xuất danh sách sản phẩm theo bộ lọc (danh mục, thương hiệu, trạng thái).

### 12.3 Chuỗi cung ứng & Quản lý Tồn kho Chuyên sâu (Inventory Management)
- **Nhà cung cấp (`supplier.model.js`)**: Quản lý thông tin nhà cung cấp (Mã NCC, Tên, Số điện thoại, Email, Mã số thuế, Địa chỉ).
- **Đơn đặt hàng nhập (Purchase Order - PO)**:
  - Tự động sinh mã PO chuẩn quy cách `PO-YYYYMMDD-XXX`.
  - Quản lý danh sách sản phẩm/biến thể cần nhập, số lượng dự kiến (expectedQty), số lượng thực nhập (actualQty), đơn giá nhập.
  - **Động cơ xuất file PO Excel chuẩn (`mau-don-dat-hang.xlsx`)**: Tự động điền dữ liệu động vào mẫu phiếu PO chuyên nghiệp (tính thuế VAT 10%, phí vận chuyển, địa điểm giao hàng, chữ ký).
  - **Email Dispatching & Cloud Archiving**: Xem trước giao diện email gửi NCC (`previewPOEmail`), gửi email trực tiếp qua SMTP (`sendPOToSupplier`) hoặc lưu nhật ký gửi thủ công (Zalo/SĐT). Tự động render file PO Excel & đẩy lên lưu trữ đám mây Cloudinary (`inventory_archives/purchase_orders`).
- **Phiếu Nhập kho (`stockReceiving.model.js`)**: Nhập hàng thực tế theo PO hoặc nhập lẻ. Khi hoàn tất, tự động tăng tồn kho cho Sản phẩm & Biến thể, đồng thời ghi lại nhật ký biến động kho `StockMovement`.
- **Phiếu Xuất kho (`stockExport.model.js`)**: Xuất hàng theo lý do (Bán hàng, Trả hàng NCC, Hư hỏng/Hao hụt, Chuyển kho). Tự động giảm tồn kho và ghi nhật ký `StockMovement`.
- **Phiếu Kiểm kê kho (`stockAudit.model.js`)**: So sánh số lượng tồn kho trên hệ thống (systemQty) và thực tế kiểm đếm (actualQty). Tự động tính chênh lệch và tạo thao tác điều chỉnh kho (Stock Adjustment).
- **Trả hàng Nhà cung cấp (`purchaseReturn.model.js`)**: Tạo phiếu trả hàng cho NCC, trừ tồn kho và ghi nhận lý do hoàn trả.
- **Cảnh báo tồn kho (`stockAlert.service.js`)**: Lọc và cảnh báo tự động danh sách sản phẩm/variant sắp hết hàng (tồn <= ngưỡng threshold) hoặc đã hết hàng (stock = 0).
- **Báo cáo kho & Định giá (`inventoryReport.service.js`)**: Thống kê tổng giá trị vốn tồn kho, tỷ lệ quay vòng kho (inventory turnover), báo cáo chi tiết lịch sử nhập-xuất-tồn.

### 12.4 Động cơ Khuyến mãi & Giảm giá 4 Cấp độ (Conflict-Free Discount Pipeline)
Hệ thống xử lý giảm giá theo đường ống 4 bước độc lập, chống xung đột giá tại `checkout.service.js`:
1. **Bước 1: Flash Sale (Đặc quyền giá sốc)**: Đổi giá sản phẩm trực tiếp. Ưu tiên cao nhất. Khi sản phẩm nằm trong Flash Sale đang diễn ra, sẽ sử dụng giá Flash Sale và đánh dấu cờ `isFlashSale`.
2. **Bước 2: Promotion (Khuyến mãi sản phẩm)**: Chỉ áp dụng cho các sản phẩm **KHÔNG** thuộc Flash Sale. Tự động tính toán và chọn chương trình khuyến mãi giảm sâu nhất theo danh mục hoặc theo từng sản phẩm cụ thể.
3. **Bước 3: Coupon (Mã giảm giá)**: Mã giảm giá áp dụng trên tổng tiền **SAU KHI** đã trừ giảm giá từ Flash Sale & Promotion. Hỗ trợ giảm theo %, giảm tiền cố định, giới hạn mức giảm tối đa, đơn tối thiểu, số lần sử dụng tổng & theo người dùng.
4. **Bước 4: Gift Program (Chương trình Quà tặng 0đ)**: Tự động kiểm tra điều kiện (mua sản phẩm X hoặc đạt tổng tiền đơn hàng Y) để tự động thêm các sản phẩm quà tặng giá 0đ vào giỏ hàng.

### 12.5 Hệ thống Quản trị Nội dung (CMS & Media System)
- **Tin tức & Blog (`blogPost.model.js`, `blogCategory.model.js`, `tag.model.js`)**:
  - Đăng bài viết hỗ trợ Rich HTML, ảnh đại diện, danh mục phân cấp, thẻ bài viết (Tags).
  - Tích hợp bộ đo SEO bài viết tự động (`blogSeo.service.js`): Phân tích tiêu đề, slug, mật độ từ khóa, thẻ alt ảnh, độ dài bài viết và đề xuất tối ưu SEO.
- **Quản lý Menu Navigation (`menu.model.js` & `menu.service.js`)**:
  - Bộ dựng Menu đa cấp (Header Menu, Footer Menu, Mega Menu).
  - Hỗ trợ liên kết động tới Sản phẩm, Danh mục, Bài viết, Trang tĩnh hoặc URL tùy chỉnh.
- **Banner Quảng cáo (`banner.model.js`)**: Quản lý Carousel Banner trang chủ, vị trí hiển thị, thứ tự sắp xếp, lịch ẩn/hiện tự động.
- **Thư viện Quản lý File Media (`media.service.js` & `folder.service.js`)**:
  - Quản lý cây thư mục lưu trữ media.
  - Tích hợp Cloudinary upload, tối ưu hóa kích thước & định dạng ảnh.
  - Thao tác kiểm tra an toàn trước khi xóa (`check-usages`): Quét xem file media đang được sử dụng ở Sản phẩm, Banner hay Bài viết nào để cảnh báo trước khi xóa.

---

## 13. Chi tiết Giao diện & Luồng xử lý Admin Panel

Giao diện Admin được phát triển bằng React, Vite, Tailwind CSS, Lucide Icons, React Router v6 và Zustand. Toàn bộ các trang điều hướng được bảo vệ bằng `ProtectedRoute` và `PermissionGuard`.

| Route | Trang / Module | Chức năng & Luồng nghiệp vụ |
|---|---|---|
| `/dashboard` | Dashboard Overview | Hiển thị tổng quan chỉ số (Doanh thu, Đơn hàng, Sản phẩm, Tồn kho thấp, Khách hàng, Bài viết, Dung lượng Media). Biểu đồ phân bổ danh mục & sản phẩm gần đây. Tìm kiếm toàn cục Quick Search. |
| `/media` | Quản lý Media | Thư viện quản lý file/ảnh dạng cây thư mục. Upload drag & drop, preview, copy URL, xóa kèm kiểm tra liên kết (check-usages), di chuyển folder. |
| `/banners` | Quản lý Banner | Danh sách & Modal CRUD Banner quảng cáo. Đổi vị trí (sort order), bật/tắt hiển thị, gắn link chuyển hướng. |
| `/categories` | Danh mục Sản phẩm | Quản lý cây danh mục đa cấp (Danh mục cha/con), ảnh đại diện, banner danh mục, slug, trạng thái. |
| `/brands` | Thương hiệu | CRUD Thương hiệu sản phẩm, logo, website chính thức, mô tả. |
| `/products` | Danh sách Sản phẩm | Bảng danh sách sản phẩm kèm bộ lọc (danh mục, thương hiệu, trạng thái, từ khóa). Nút xóa hàng loạt, xuất bản/ẩn nhanh. |
| `/products/new` & `:id/edit` | Form Sản phẩm | Form thêm/sửa sản phẩm đa tab (Thông tin chung, Ảnh & Gallery, Giá & Tồn kho, Thông số kỹ thuật Specs, SEO Meta). Tích hợp chọn ảnh từ Media Library. |
| `/products/:id/variants` | Quản lý Biến thể | Danh sách các biến thể (Màu sắc, Dung lượng...). Thêm mới, chỉnh sửa giá bán/tồn kho/SKU/ảnh theo từng biến thể. |
| `/products/import` | Import / Export Excel | Tải file Excel mẫu chuẩn (.xlsx), upload file Excel để import sản phẩm hàng loạt. Hiển thị bảng xem trước (preview) và danh sách dòng lỗi. Xuất dữ liệu SP ra Excel. |
| `/suppliers` | Nhà cung cấp | Danh sách & Modal CRUD thông tin Nhà cung cấp hàng hóa (Tên, Mã NCC, Điện thoại, Email, Mã số thuế, Địa chỉ). |
| `/purchase-orders` | Đơn nhập kho (PO) | Danh sách Đơn nhập kho. Bộ lọc theo trạng thái, NCC. Nút tạo PO, In phiếu PO Excel, Xem trước & Gửi Email PO cho NCC. |
| `/purchase-orders/create` | Tạo Đơn nhập kho | Chọn NCC, tìm chọn Sản phẩm/Biến thể, nhập số lượng dự kiến, đơn giá nhập. Lưu dạng Bản nháp (Draft) hoặc Hoàn thành (Completed) để tự động tăng kho. |
| `/stock-receivings` | Phiếu Nhập kho | Quản lý lịch sử các đợt thực nhận hàng vào kho. Kiểm đếm số lượng thực tế so với PO. |
| `/purchase-returns` | Trả hàng NCC | Lập phiếu hoàn trả hàng hóa cho nhà cung cấp khi hàng lỗi/hỏng, tự động trừ tồn kho. |
| `/stock-exports` | Phiếu Xuất kho | Quản lý việc xuất hàng ra khỏi kho (bán hàng, hư hỏng, chuyển kho). |
| `/stock-audits` | Kiểm kê kho | Lập phiếu kiểm kê kho định kỳ, ghi nhận số lượng thực tế, tự động tính chênh lệch thừa/thiếu và cân bằng kho. |
| `/stock-alerts` | Cảnh báo Tồn kho | Danh sách cảnh báo sản phẩm dưới ngưỡng an toàn hoặc đã hết hàng. Hỗ trợ tạo nhanh Đơn nhập kho PO từ danh sách cảnh báo. |
| `/stock-movements` | Lịch sử Biến động Kho | Nhật ký chi tiết mọi giao dịch Nhập/Xuất/Kiểm kê/Bán hàng làm thay đổi tồn kho (Lưu số lượng trước, thay đổi, và sau giao dịch). |
| `/inventory-report` | Báo cáo Tồn kho | Báo cáo tổng định giá kho hàng, số lượng tồn kho theo danh mục, tỷ lệ quay vòng kho. |
| `/promotions/coupons` | Mã giảm giá (Coupon) | CRUD Mã giảm giá (Code, loại giảm %, tiền cố định, mức giảm tối đa, đơn tối thiểu, hạn sử dụng, lượt dùng). |
| `/promotions/discounts` | Chương trình Khuyến mãi | CRUD Chương trình giảm giá trực tiếp theo sản phẩm/danh mục. |
| `/promotions/gifts` | Chương trình Quà tặng | Lập chương trình mua hàng tặng quà 0đ theo ngưỡng đơn hoặc sản phẩm kích hoạt. |
| `/promotions/flash-sales` | Flash Sale | Lập chiến dịch Flash Sale đếm ngược, cài đặt giá sốc và giới hạn số lượng bán. |
| `/blog/posts` & `/blog/posts/new` | Quản lý Bài viết Blog | Danh sách & Editor bài viết tin tức. Bộ công cụ phán đoán & gợi ý điểm chuẩn SEO (`blogSeo`). |
| `/blog/categories` & `/tags` | Danh mục & Tag Blog | Quản lý danh mục bài viết và thẻ từ khóa tag cloud. |
| `/menus` & `/menus/:id/edit` | Bộ dựng Menu Navigation | Giao diện kéo thả / sắp xếp cây Menu Header & Footer trực quan. |
| `/roles` | Phân quyền RBAC | Danh sách Vai trò (Roles) & Ma trận checkbox chọn từng Quyền hạn (Permissions) cho từng nhóm tài khoản. |
| `/audit-logs` | Nhật ký Hệ thống | Tra cứu lịch sử thao tác của các quản trị viên/nhân viên trên hệ thống. |

---

## 14. Động cơ Tìm kiếm & Gợi ý AI (Recommendation Engine)

Hệ thống tích hợp 2 bộ máy thông minh phục vụ trải nghiệm người dùng và tăng tỷ lệ chuyển đổi:

### 14.1 Bộ máy Tìm kiếm & Thống kê từ khóa (`search.service.js`)
- **Full-text Search & Real-time Autocomplete**: Phân tích từ khóa tìm kiếm, trả về gợi ý sản phẩm & bài viết ngay khi người dùng gõ phím.
- **Search Log Tracking (`searchLog.model.js`)**: Tự động lưu vết các từ khóa tìm kiếm của người dùng, số lượng kết quả trả về để hỗ trợ quản trị viên phân tích xu hướng mua sắm (Trending Search Keywords).

### 14.2 Động cơ Gợi ý Cá nhân hóa AI Machine Learning (`python-services/`)
- **Tập dữ liệu CSV Dataset (`data/`)**: Thư mục lưu trữ bộ dữ liệu thương mại điện tử chuyên sâu gồm các file `products.csv`, `users.csv`, `interactions.csv`, `orders.csv` và file xuất dự đoán `recommendations_output.csv`.
- **Kịch bản Khởi tạo & Đồng bộ (`generate_dataset.py` & `sync_dataset_to_db.py`)**: Cho phép tạo mới bộ dữ liệu CSV thực tế hoặc đồng bộ trực tiếp hai chiều với MongoDB collection `userinteractions`, `products`, `users`.
- **Mô hình Thuật toán SVD / ALS (`matrix_factorization.py`)**:
  - Đọc dữ liệu linh hoạt từ ma trận CSV Dataset hoặc MongoDB live data.
  - Sử dụng thư viện `numpy` tính toán ma trận nhân tố ẩn (Latent Factor Matrix) thông qua phân rã giá trị đơn lẻ SVD ($U, \Sigma, V^T$) với điểm đánh giá tương tác 4 cấp (`view`=1, `search_click`=2, `add_to_cart`=5, `purchase`=10).
  - Tự động dự đoán điểm số yêu thích của từng User/Session cho toàn bộ sản phẩm và chọn ra Top N gợi ý xuất ra CSV + đồng bộ vào MongoDB `personalizedrecommendations`.

---

## 15. Tổng hợp tính năng theo trạng thái & Ma trận Roadmap

### ✅ Đã hoàn thành 100% (Backend REST API + Admin Panel)

| Phân hệ / Feature | Chi tiết đã triển khai | Trạng thái BE | Trạng thái Admin |
|---|---|---|---|
| **Xác thực & RBAC** | JWT Auth, Refresh Token, User CRUD, Dynamic Roles & Permission Matrix, Audit Logs | ✅ Hoàn thành | ✅ Hoàn thành |
| **Sản phẩm & Biến thể** | Product CRUD, Specs Key-Value, Variants SKU/Price/Stock, Status workflow | ✅ Hoàn thành | ✅ Hoàn thành |
| **Excel Batch Engine** | Import/Export Excel, Sync Cloudinary Image Auto-folder, Error reporting | ✅ Hoàn thành | ✅ Hoàn thành |
| **Danh mục & Thương hiệu** | Tree Category CRUD, Brand CRUD, SEO Meta, Banner category | ✅ Hoàn thành | ✅ Hoàn thành |
| **Quản lý Tồn kho & PO** | PO Supplier (PO-YYYYMMDD-XXX), In Excel PO (`mau-don-dat-hang.xlsx`), Send Email PO, Cloud Archive PO | ✅ Hoàn thành | ✅ Hoàn thành |
| **Kho & Chuỗi cung ứng** | Stock Receivings, Stock Exports, Stock Audits, Purchase Returns, Stock Alerts, Stock Movements Log, Inventory Report | ✅ Hoàn thành | ✅ Hoàn thành |
| **Hệ thống Khuyến mãi 4 Cấp** | Flash Sale, Promotion, Coupon, Gift Program 0đ, Checkout Engine chống xung đột | ✅ Hoàn thành | ✅ Hoàn thành |
| **CMS Blog & SEO** | Blog Posts, Categories, Tags, Blog SEO Score Calculator & Auto-suggestions | ✅ Hoàn thành | ✅ Hoàn thành |
| **Navigation & Media** | Tree Menu Builder (Header/Footer), Media Manager with Usage Checker (`check-usages`), Banners Manager | ✅ Hoàn thành | ✅ Hoàn thành |
| **AI Recommendation & Search** | Matrix Factorization SVD Python Model, Interaction Weighting, Search Autocomplete & Search Logs | ✅ Hoàn thành | ✅ Hoàn thành |
| **Dashboard Analytics** | Tổng quan chỉ số, báo cáo tồn kho thấp, phân bổ danh mục, Quick Global Search | ✅ Hoàn thành | ✅ Hoàn thành |

### 🔲 Kế hoạch phát triển Giao diện Khách hàng (Storefront FE)

| Tính năng Storefront | Mô tả nghiệp vụ | Ưu tiên |
|---|---|---|
| **Trang chủ Storefront** | Full Homepage layout (Hero Carousel slider, Promo Ticker bar, Trust badges, Coupon Bar, Flash Sale Countdown, Tabbed Category Products, Month Brand Carousel, Featured Widget) | 🔴 Cao |
| **Trang Danh sách Sản phẩm** | Mega collection page (Breadcrumb, Coupon bar, Sidebar bộ lọc đa tiêu chí: Giá, Thương hiệu, Loại SP, Màu sắc, Tags; Sắp xếp A-Z/Giá/Bán chạy; Product cards + Quick Add) | 🔴 Cao |
| **Trang Chi tiết Sản phẩm** | Gallery ảnh thumbnail slider + zoom, Variant selector (Pill buttons đổi màu/size), Flash sale countdown, Coupon inline, Tabs Thông số/Mô tả, Cross-sell carousel (SP cùng loại, SP đã xem) | 🔴 Cao |
| **Giỏ hàng & Mini Cart** | Mini Cart dropdown, Cart page với Tiến trình nhận quà (Progress reward bar), chọn mã coupon modal, VAT invoice toggle, hẹn giờ giao hàng, ghi chú đơn hàng | 🔴 Cao |
| **Quy trình Thanh toán (Checkout)** | Form thông tin giao hàng, áp dụng Coupon, tích hợp cổng thanh toán (COD, Chuyển khoản, MoMo/VNPay), tích hợp Động cơ tính giá 4 cấp từ BE | 🔴 Cao |
| **Tài khoản Khách hàng** | Đăng ký / Đăng nhập / Quên mật khẩu, Dashboard khách hàng (Lịch sử đơn hàng, Sổ địa chỉ nhận hàng, đổi mật khẩu) | 🔴 Cao |
| **Bộ máy Tìm kiếm Real-time** | Search bar với Autocomplete dropdown gợi ý tức thì kết quả sản phẩm + ảnh | 🟡 Trung bình |
| **So sánh Sản phẩm & Color Swatches** | Modal so sánh thông số kỹ thuật giữa 2-4 sản phẩm; Click chọn màu swatch đổi ảnh tương ứng | 🟡 Trung bình |
| **Trang Tin tức / Blog** | Danh sách bài viết tin tức 2 cột (Content + Sidebar Tin nổi bật, Danh mục, Tags Cloud), Trang chi tiết bài viết HTML | 🟡 Trung bình |
| **Tính năng Phụ phụ trợ** | Social proof toast ("Khách X vừa mua"), Zalo Chat floating button, Back to Top, Live stream badge | 🟢 Thấp |

---

*Cập nhật toàn bộ kiến trúc Backend, Admin & Roadmap: 2026-08-29 — Hệ thống Clone Haravan Enterprise*
