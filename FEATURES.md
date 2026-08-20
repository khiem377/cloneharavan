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
12. [Tổng hợp tính năng theo trạng thái](#12-tổng-hợp-tính-năng-theo-trạng-thái)

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

## 12. Tổng hợp tính năng theo trạng thái

### ✅ Đã có (BE + Admin Panel)

| Tính năng | Module |
|---|---|
| Đăng ký / Đăng nhập / Refresh / Logout | Auth |
| Quản lý user, địa chỉ | Users & Addresses |
| Banner quảng cáo (CRUD, reorder, ẩn/hiện) | Banners |
| Thư viện media (upload, folder, search, xóa, check-usages) | Media |
| Danh mục sản phẩm (tree, CRUD) | Categories |
| Thương hiệu (CRUD) | Brands |
| Sản phẩm (CRUD, import/export Excel, specs, images) | Products |
| Biến thể sản phẩm (attributes, giá riêng, ảnh riêng) | Product Variants |
| Mã giảm giá | Coupons |
| Khuyến mãi | Promotions |
| Chương trình quà tặng | Gift Programs |

### 🔲 Cần phát triển thêm (Storefront FE)

| Tính năng | Ưu tiên |
|---|---|
| Trang chủ Storefront (homepage đầy đủ) | 🔴 Cao |
| Trang danh sách SP + filter/sort/pagination | 🔴 Cao |
| Trang chi tiết sản phẩm | 🔴 Cao |
| Giỏ hàng | 🔴 Cao |
| Checkout | 🔴 Cao |
| Tài khoản (dashboard, đơn hàng, địa chỉ) | 🔴 Cao |
| Flash Sale (countdown timer, badge) | 🟡 Trung bình |
| So sánh sản phẩm | 🟡 Trung bình |
| Recently Viewed | 🟡 Trung bình |
| Color Swatches (đổi màu → đổi ảnh) | 🟡 Trung bình |
| Search Autocomplete (real-time) | 🟡 Trung bình |
| Social Proof Toast | 🟡 Trung bình |
| Blog / Tin tức | 🟡 Trung bình |
| Progress Reward Bar giỏ hàng | 🟢 Thấp |
| Trang tĩnh (trả góp, cửa hàng, đặt lịch) | 🟢 Thấp |
| Xuất hóa đơn VAT từ cart | 🟢 Thấp |
| Hẹn giờ nhận hàng | 🟢 Thấp |
| Chia sẻ mạng xã hội | 🟢 Thấp |
| Live badge | 🟢 Thấp |

---

*Cập nhật: 2026-08-20 — Khảo sát trực tiếp [ega-dien-may.myharavan.com](https://ega-dien-may.myharavan.com)*
