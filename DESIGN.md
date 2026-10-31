# Haravan E-Commerce — Unified Design System & Recommendation Architecture

> **Tài liệu quy chuẩn kỹ thuật toàn diện (Technical Master Specification)**:
> 1. **Design System & Semantic Tokens (Anti-Slop Standard)**: Chuẩn hóa toàn bộ màu sắc, typography, spacing và components cho Client Storefront (Next.js) và Admin OMS/WMS (Vite/React).
> 2. **Kiến Trúc Động Cơ Gợi Ý (Recommendation System & Hot Trend)**: Cơ chế luân chuyển dữ liệu từ Real-time CSV, Python Implicit ALS đến Express MongoDB Aggregation; giải mã và khắc phục triệt để lỗi rỗng dữ liệu Hot Trend.
> 3. **Quy Trình Phát Triển & Kế Thừa (Engineering Discipline Runbook)**: Kim chỉ nam cho lập trình viên và AI Agent khi mở rộng hoặc thêm tính năng mới.

---

## MỤC LỤC
1. [Triết Lý Thiết Kế Cốt Lõi (Anti-Slop Philosophy)](#1-triết-lý-thiết-kế-cốt-lõi-anti-slop-philosophy)
2. [Hệ Thống Phối Màu Chuẩn (Role-Based Color System 60 - 30 - 10)](#2-hệ-thống-phối-màu-chuẩn-role-based-color-system-60---30---10)
3. [Quy Chuẩn Typography (Strict Type Scale)](#3-quy-chuẩn-typography-strict-type-scale)
4. [Hệ Thống Spacing & Bố Cục (Bội Số 4px)](#4-hệ-thống-spacing--bố-cục-bội-số-4px)
5. [Quy Chuẩn Các Thành Phần Giao Diện (UI Components Standard)](#5-quy-chuẩn-các-thành-phần-giao-diện-ui-components-standard)
6. [Kiến Trúc Động Cơ Gợi Ý & Xử Lý Lỗi Hot Trend (RecSys Deep Dive)](#6-kiến-trúc-động-cơ-gợi-ý--xử-lý-lỗi-hot-trend-recsys-deep-dive)
7. [Bảng Tra Cứu Do's & Don'ts (Cấm vs Nên)](#7-bảng-tra-cứu-dos--donts-cấm-vs-nên)
8. [Hướng Dẫn Dành Cho Lập Trình Viên & AI Agent Sau Này](#8-hướng-dẫn-dành-cho-lập-trình-viên--ai-agent-sau-này)

---

## 1. Triết Lý Thiết Kế Cốt Lõi (Anti-Slop Philosophy)

Được kế thừa từ bộ tiêu chuẩn **Impeccable** (`pbakaus/impeccable`) và quy tắc **Engineering Discipline** của dự án:

1. **Mặc định Flat & Solid Colors**:
   - Sử dụng màu đặc chuẩn chỉ (`bg-white`, `bg-slate-50`, `bg-brand`, `bg-card`).
   - Tuyệt đối **KHÔNG dùng dải chuyển màu (gradients)** loè loẹt, tím-xanh rẻ tiền, hoặc màu mè vô cớ trên nền và thẻ.
2. **Nói KHÔNG với Glassmorphism**:
   - Cấm dùng hiệu ứng kính mờ `backdrop-blur`, nền bán trong suốt `bg-.../10` kết hợp viền trắng mờ hoặc giả lập chiều sâu nhân tạo.
3. **Nói KHÔNG với Card lồng Card (Anti-Box-in-a-Box)**:
   - Tránh cấu trúc chia hộp vụn vặt hộp lồng trong hộp.
   - Ưu tiên đường phân cách 1px mỏng (`border-b`, `divide-y divide-slate-100`) hoặc Data Table phẳng liền mạch.
4. **Viền Mảnh 1px Thay Cho Bóng Đổ Nặng**:
   - Không lạm dụng bóng đổ (`shadow-md`, `shadow-xl`, `shadow-2xl`).
   - Ưu tiên đường viền sắc nét 1px (`border border-slate-200`).
   - Chỉ dùng `shadow-2xs` hoặc `shadow-xs` cho các phần tử nổi (Dropdown, Popover, Modal, Toast).
5. **Chỉ 1 Nút Chính (Single Primary Action)**:
   - Mỗi khu vực nhìn chỉ có duy nhất **1 nút chính** mang màu thương hiệu (`bg-brand text-white`) để điều hướng thị giác người dùng.
   - Các nút phụ bắt buộc dùng viền mảnh (`variant="outline"`) hoặc dạng phẳng không viền (`variant="ghost"`).
6. **Bo Góc Cố Định 6px (`rounded-[6px]`)**:
   - Toàn bộ UI components (button, input, card, modal, badge, table, select, dropdown) dùng cố định `rounded-[6px]`.
   - Chỉ dùng `rounded-full` duy nhất cho avatar tròn hoặc nút điều hướng tròn (prev/next slide).
7. **Số Liệu & Mã Định Danh Bắt Buộc Monospace**:
   - Dùng `tabular-nums font-mono` cho toàn bộ tiền tệ (`1.250.000₫`), số lượng, SKU, mã đơn hàng (`ORD-123456`), phần trăm giảm giá.
8. **Chống Nhảy Layout Khi Đổi Trạng Thái (Rule N1)**:
   - Chuyển tab, focus input, hover, active nút bấm không làm giật hoặc xê dịch các phần tử lân cận.
9. **Mobile Viewport Hiện Đại**:
   - Sử dụng `min-h-[100dvh]` thay cho `h-screen` hay `min-h-screen` để tránh bị thanh điều hướng di động che khuất.

---

## 2. Hệ Thống Phối Màu Chuẩn (Role-Based Color System 60 - 30 - 10)

Hệ thống phân định rạch ròi vai trò của từng họ màu, loại bỏ hoàn toàn sự xung đột giữa Xanh Hoàng Gia và Đỏ Bán Lẻ:

```
┌─────────────────────────────────────────────────────────────┐
│ 60% NỀN & CẤU TRÚC (Neutral Slate)                           │
│ White (#ffffff) + Slate-50 (#f8fafc) + Border Slate-200     │
├────────────────────────────────────────┬────────────────────┤
│ 30% BRAND PRIMARY (Navy Blue #284ea1)  │ 10% ACCENT HOT     │
│ Header, Nút Submit, Tab Active, Checkbox│ Giá Sale, Mua Ngay │
└────────────────────────────────────────┴────────────────────┘
```

### A. Bảng Semantic Tokens (Cấu hình chính thức trong `client/src/app/globals.css`)

```css
@theme inline {
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-active: var(--brand-active);
  --color-brand-light: var(--brand-light);
  --color-brand-border: var(--brand-border);

  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-light: var(--accent-light);
  --color-accent-border: var(--accent-border);

  --color-surface: var(--surface);
  --color-surface-subtle: var(--surface-subtle);
  --color-border: var(--border);
  --color-border-subtle: var(--border-subtle);
}

:root {
  --background: #ffffff;
  --foreground: #0f172a;

  /* Brand Primary: Xanh Hoàng Gia Haravan */
  --brand: #284ea1;
  --brand-hover: #1e3b82;
  --brand-active: #172e66;
  --brand-light: #eff4fc;
  --brand-border: #93c5fd;

  /* Accent Highlight: Đỏ Bán Lẻ Bùng Nổ */
  --accent: #dc2626;
  --accent-hover: #b91c1c;
  --accent-light: #fef2f2;
  --accent-border: #fecaca;

  /* Surfaces & Structural Borders */
  --surface: #ffffff;
  --surface-subtle: #f8fafc;
  --border: #e2e8f0;
  --border-subtle: #f1f5f9;
}
```

### B. Vai Trò Ứng Dụng Của Từng Token

| Token Class | Mã Hex | Phạm Vi Áp Dụng | Tuyệt Đối Cấm Dùng Cho |
| :--- | :--- | :--- | :--- |
| **`bg-brand`** / **`text-brand`** | `#284ea1` | - HeaderTop, Search Button, Icon Giỏ hàng<br>- Nút chính trang Auth (Đăng nhập, Đăng ký, Quên MK)<br>- Tab đang active, Checkbox checked<br>- Slider trượt giá, Liên kết điều hướng chính | Giá tiền khuyến mãi, nhãn Flash Sale, nút Hủy đơn |
| **`bg-brand-hover`** | `#1e3b82` | Trạng thái hover của các phần tử Brand | |
| **`bg-brand-light`** | `#eff4fc` | Nền icon tròn, nền badge danh mục, pill bộ lọc đang chọn | |
| **`text-accent`** / **`bg-accent`** | `#dc2626` | - Giá bán lẻ sản phẩm (`text-accent font-mono font-bold`)<br>- Badge phần trăm giảm giá (`-50%`)<br>- Nút "MUA NGAY VỚI GIÁ NÀY" tại trang chi tiết<br>- Countdown Flash Sale, Nút Hủy đơn hàng | Header, Menu, Nút điều hướng bình thường, Trang login |
| **`bg-accent-light`** | `#fef2f2` | Nền hộp voucher giảm giá, nền badge cảnh báo lỗi | |
| **`border-slate-200`** | `#e2e8f0` | Toàn bộ đường viền 1px của Card, Input, Table, Modal | Không dùng border màu loè loẹt (`#609afa`) |
| **`bg-slate-50`** | `#f8fafc` | Nền trang tổng thể, nền dải cam kết, nền input form | |
| **`text-slate-900`** | `#0f172a` | Tiêu đề H1, H2, Tên sản phẩm chính | |
| **`text-slate-600`** | `#475569` | Nội dung mô tả sản phẩm, thông số kỹ thuật, body text | |
| **`text-slate-400`** | `#94a3b8` | Placeholder input, ngày tạo đơn, breadcrumb phụ | |

---

## 3. Quy Chuẩn Typography (Strict Type Scale)

### A. Font Gia Đình (Font Family)
- **`Be Vietnam Pro`**: Tối ưu chuẩn chỉ cho tiếng Việt (dấu hỏi, ngã, nặng, ơ, ư không bị lệch chân chữ hoặc thụt lề).
- Khai báo: `font-sans: 'Be Vietnam Pro', sans-serif;`

### B. Thang Cỡ Chữ Chuẩn (Strict Type Scale — 7 Cấp Độ Duy Nhất)

> **Cấm**: Tuyệt đối không dùng các cỡ chữ pixel tùy hứng như `text-[11px]`, `text-[13px]`, `text-[15px]`. Chỉ dùng 7 cấp độ sau:

| Bậc Thang | Cỡ chữ / Line Height | Tailwind Class | Ứng Dụng Thực Tế |
| :--- | :--- | :--- | :--- |
| **1. Display / Hero** | 28px / 36px | `text-2xl lg:text-3xl font-bold tracking-tight` | Tiêu đề Banner khuyến mãi lớn, Trang chủ Hero Headline |
| **2. Page Title (H1)** | 20px / 28px | `text-xl font-bold tracking-tight text-slate-900` | Tiêu đề trang chi tiết sản phẩm, Tiêu đề Giỏ hàng, Tài khoản |
| **3. Section Title (H2)**| 16px / 24px | `text-base font-bold text-slate-900 tracking-tight` | Tiêu đề khối (Hot Trend, Thông số kỹ thuật, Đánh giá) |
| **4. Card Title (H3)** | 14px / 20px | `text-sm font-medium text-slate-900 line-clamp-2` | Tên sản phẩm trên Grid Card, tiêu đề bài viết blog |
| **5. Body Standard** | 14px / 22px | `text-sm text-slate-600 leading-relaxed` | Đoạn văn mô tả, hướng dẫn sử dụng, nội dung bảng |
| **6. Caption / Sub** | 12px / 16px | `text-xs text-slate-500` | Mã SKU, ngày giờ, nhãn meta, ghi chú phụ |
| **7. Số Liệu / Giá Tiền** | Tabular Mono | `font-mono tabular-nums font-bold` | Giá bán, giá gốc gạch ngang, số lượng tồn kho |

---

## 4. Hệ Thống Spacing & Bố Cục (Bội Số 4px)

Tuyệt đối không hardcode khoảng cách lẻ (`p-[13px]`, `gap-[7px]`). Luôn sử dụng hệ số chuẩn của 4:

| Khoảng Cách | Class Tailwind | Ý Nghĩa Sử Dụng |
| :--- | :--- | :--- |
| **4px** | `p-1`, `gap-1` | Khoảng cách vi mô (icon cạnh text, các sao đánh giá rating) |
| **8px** | `p-2`, `gap-2` | Khoảng cách giữa label và input, giữa các tag biến thể (màu sắc/size) |
| **12px** | `p-3`, `gap-3` | Padding của item giỏ hàng nhỏ, dropdown menu, alert thông báo |
| **16px** | `p-4`, `gap-4` | Padding chuẩn của Card, khoảng cách giữa các field trong form nhập liệu |
| **20px - 24px** | `p-5`, `p-6`, `gap-6` | Khoảng cách giữa các cột trong Product Grid, padding của Modal |
| **32px** | `py-8`, `gap-8` | Khoảng cách giữa các Section bình thường trên trang |
| **48px** | `py-12` | Khoảng cách giữa các Section lớn (Hero, Flash Sale, Footer) |

---

## 5. Quy Chuẩn Các Thành Phần Giao Diện (UI Components Standard)

### A. Nút Bấm (`Button`)
- **Default (Primary)**: `bg-brand text-white hover:bg-brand-hover active:scale-[0.98] rounded-[6px] shadow-xs font-semibold`
- **Accent (Urgent CTA)**: `bg-accent text-white hover:bg-accent-hover active:scale-[0.98] rounded-[6px] shadow-xs font-bold`
- **Outline (Secondary)**: `border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 rounded-[6px]`
- **Ghost**: `text-slate-700 hover:bg-slate-100 rounded-[6px]`
- **Link**: `text-brand hover:underline font-semibold`

### B. Form & Input
- **Input Field**: `h-10 text-xs sm:text-sm bg-white border border-slate-300 rounded-[6px] focus:border-brand focus:ring-1 focus:ring-brand`
- **Checkbox**: `h-3.5 w-3.5 rounded-[3px] border-slate-300 text-brand accent-brand focus:ring-1 focus:ring-brand`
- **Label**: `text-xs font-semibold text-slate-700 mb-1.5`
- **Dấu bắt buộc (*)**: `text-accent font-bold` (màu đỏ cảnh báo)

### C. Khối Card & Container
- `bg-white border border-slate-200 rounded-[6px] p-4 sm:p-5 shadow-2xs`
- **Tuyệt đối không lồng Card trong Card**: Bên trong chỉ dùng đường kẻ mỏng `border-b border-slate-100` để chia dòng.

---

## 6. Kiến Trúc Động Cơ Gợi Ý & Xử Lý Lỗi Hot Trend (RecSys Deep Dive)

Đây là tài liệu phân tích kỹ thuật giải đáp câu hỏi: *"Dữ liệu tương tác đã đổ liên tục theo thời gian thực về `interactions.csv` và có Python xử lý, tại sao khối Trending trên trang chủ từng bị rỗng?"*

```
┌────────────────────────────────────────────────────────────────────────┐
│ LUỒNG DỮ LIỆU TƯƠNG TÁC & HỆ THỐNG GỢI Ý 2 TẦNG (TWO-TIER RECSYS)      │
└────────────────────────────────────────────────────────────────────────┘

                           [Người dùng click / xem / mua]
                                        │
                                        ▼
                   POST /api/v1/recommendations/interactions
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
     [TẦNG 1: Python ML Offline]                         [TẦNG 2: Real-time Express]
     Ghi real-time append vào:                           Ghi đồng thời vào Mongo:
     `BE/python-services/data/interactions.csv`          Collection `ProductInteraction`
             │                                                     │
             ▼                                                     ▼
     Chạy định kỳ (Cron / Batch):                        Hàm `getTrendingRecommendations()`
     `matrix_factorization.py` (Implicit ALS)            Aggregate tương tác trong 24 Giờ
             │                                                     │
             ▼                                                     ▼
     Sinh bảng ma trận điểm User-Item:                   Tính điểm: view:1, cart:3, buy:5
     Lưu vào Mongo `personalizedrecommendations`         Lấy Top sản phẩm HOT
             │                                                     │
             ▼                                                     ▼
     Dùng cho: "Gợi ý cho bạn",                          Dùng cho: "SẢN PHẨM HOT TREND"
     "Có thể bạn thích" khi user đăng nhập.              ở trang chủ cho toàn bộ khách.
```

### A. Phân Biệt 2 Động Cơ Gợi Ý Trong Hệ Thống

1. **Động cơ 1: Cá nhân hóa người dùng (Personalized RecSys via Python)**:
   - Dữ liệu `interactions.csv` được ghi nhận theo dòng thời gian (`userId, productId, interactionType, timestamp, rating`).
   - Python script `matrix_factorization.py` áp dụng mô hình Implicit ALS (Alternating Least Squares) với các siêu tham số `factors=64`, `regularization=0.05`, `iterations=50`.
   - Kết quả được xuất sang MongoDB collection `personalizedrecommendations`.
   - **Mục đích**: Phục vụ các block cá nhân hóa khi người dùng đã đăng nhập hoặc có định danh. Không chịu trách nhiệm hiển thị khối Trending toàn cầu trên trang chủ.

2. **Động cơ 2: Xu hướng thời gian thực (Global Trending via Express & MongoDB)**:
   - Được xử lý trực tiếp bởi Backend Express.js tại `BE/src/services/recommendation.service.js` qua hàm `getTrendingRecommendations()`.
   - Chạy pipeline MongoDB Aggregation đếm tổng điểm tương tác trong vòng **24 giờ gần nhất** (`timestamp >= yesterday`).
   - **Mục đích**: Hiển thị các sản phẩm được quan tâm nhiều nhất trong ngày trên toàn hệ thống cho mọi khách ghé thăm (kể cả khách vãng lai).

---

### B. Nguyên Nhân Gốc Rễ (Root Cause) Khiến Hot Trend Bị Rỗng

Trước khi refactor, khối Trending bị rỗng do chuỗi 4 điểm nghẽn tương hỗ:

1. **Bộ lọc thời gian 24h quá hẹp**:
   - Ở môi trường thử nghiệm hoặc khi mới khởi động ngày mới, số lượng tương tác phát sinh trong 24h qua thường ít hơn 5 sản phẩm (ví dụ chỉ có 1 sản phẩm được xem).
   - Hàm `getTrendingRecommendations` chỉ trả về 1 item duy nhất.
2. **Kiểm tra điều kiện cứng nhắc ở Frontend (`client/src/app/page.jsx`)**:
   - Client có dòng code:
     ```javascript
     if (trendingProds && trendingProds.length >= 5) {
       finalTrendingProds = trendingProds;
     } else {
       // Cố gắng fallback
     }
     ```
   - Khi Backend trả về 1–4 sản phẩm, Frontend coi như "không đủ số lượng", loại bỏ toàn bộ dữ liệu này và chuyển sang gọi fallback.
3. **Fallback `isHot: true` rỗng trong Database**:
   - Fallback đầu tiên gọi `productService.getAllProducts({ isHot: true })`. Tuy nhiên trong Database MongoDB, các sản phẩm không được gắn cờ `isHot: true` mà dùng `status: 'active'`. Kết quả trả về `[]`.
4. **Mismatch tham số sắp xếp giữa Frontend và Backend**:
   - Khi `isHot` thất bại, Frontend gọi tiếp `getAllProducts({ sort: 'createdAt', sortOrder: 'desc' })`.
   - Nhưng `BE/src/services/product.service.js` chỉ đọc `req.query.sortBy`, dẫn đến biến `sortBy` bị `undefined`, hệ thống query fallback không sắp xếp đúng và trả về kết quả không như ý, khiến toàn bộ khối Trending bị ẩn hoặc rỗng.

---

### C. Giải Pháp Kỹ Thuật Đã Triển Khai (The Resilient Fix)

Hệ thống đã được gia cố vững chắc tại cả 4 tầng:

#### 1. Backend Auto-Backfill (`BE/src/services/recommendation.service.js`)
Hàm `getTrendingRecommendations` được bổ sung cơ chế tự động đắp đầy thông minh:
```javascript
// Nếu số lượng sản phẩm trending trong 24h < 10, tự động lấy sản phẩm nổi bật đắp vào
if (trendingProducts.length < targetLimit) {
  const needed = targetLimit - trendingProducts.length;
  const existingIds = trendingProducts.map(p => p._id.toString());
  const fallbackProducts = await getFallbackFeaturedProducts(needed, existingIds);
  trendingProducts = [...trendingProducts, ...fallbackProducts];
}
```
*Kết quả*: Đảm bảo API luôn trả về đủ 10 sản phẩm chất lượng cao, không bao giờ bị rỗng dù ngày hôm đó có bao nhiêu tương tác.

#### 2. Backend Sort Aliasing (`BE/src/services/product.service.js`)
Bổ sung bí danh cho tham số sắp xếp:
```javascript
const aliasSort = sortBy || sort; // Tương thích cả query sortBy lẫn sort
```

#### 3. Client Fallback & Resiliency (`client/src/app/page.jsx`)
Sửa đổi query parameters và ưu tiên dữ liệu thực tế:
```javascript
// Nếu có bất kỳ trending products nào, sử dụng ngay
if (trendingProds && trendingProds.length > 0) {
  finalTrendingProds = trendingProds;
} else if (newArrivalsProds && newArrivalsProds.length > 0) {
  finalTrendingProds = newArrivalsProds;
}
```

#### 4. UI Refactor Chống Slop (`client/src/components/home/HomeTrendingAndNewArrivals.jsx`)
- Loại bỏ toàn bộ viền xanh loè loẹt `#609afa` và gradient container rẻ tiền.
- Thiết kế thẻ trắng phẳng `bg-white border border-slate-200 rounded-[6px]`.
- Phân đoạn tab chuyển mạch mượt mà giữa **SẢN PHẨM HOT TREND** (Icon `Flame`) và **HÀNG MỚI VỀ** (Icon `Sparkles`), active tab mang màu Brand `bg-brand text-white`.
- 100% không rung giật layout khi nạp sản phẩm.

---

## 7. Bảng Tra Cứu Do's & Don'ts (Cấm vs Nên)

| KHÔNG ĐƯỢC LÀM (Anti-Pattern / Slop) | BẮT BUỘC LÀM (Impeccable Standard) |
| :--- | :--- |
| ❌ Hardcode mã hex lung tung (`#e30019`, `#284ea1`, `#609afa`) |  Dùng semantic tokens: `bg-brand`, `text-brand`, `text-accent` |
| ❌ Dùng lẫn lộn 4 họ xám `slate`, `gray`, `zinc`, `#333`, `#666` |  Khóa chặt vào họ **`slate-*`** (`slate-50`, `slate-200`, `slate-600`, `slate-900`) |
| ❌ Dùng dải màu gradient trên banner hoặc khung sản phẩm |  Dùng nền phẳng sạch sẽ `bg-white` hoặc `bg-slate-50` viền `border-slate-200` |
| ❌ Trang Auth nút đỏ, Trang Blog nút xanh, Trang Search checkbox đỏ |  Đồng bộ 100% nút chính, link, checkbox về màu Brand Xanh Navy |
| ❌ Dùng bo góc to `rounded-2xl`, `rounded-3xl` làm nhão giao diện |  Cố định toàn hệ thống **`rounded-[6px]`** |
| ❌ Dùng cỡ chữ lẻ: `text-[11px]`, `text-[13px]`, `text-[15px]` |  Dùng chuẩn Type Scale: `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-xl` (20px) |
| ❌ Giá tiền hiển thị bằng font thường làm lệch dòng |  Luôn thêm `font-mono tabular-nums` cho mọi con số và giá tiền |
| ❌ Dùng spinner tròn đơn độc khi đang tải dữ liệu |  Dùng Skeleton mockup theo đúng khung thật của component |
| ❌ Lồng Card trong Card (Card-in-a-card) |  Dùng đường kẻ phẳng `border-b border-slate-100` hoặc Table |

---

## 8. Hướng Dẫn Dành Cho Lập Trình Viên & AI Agent Sau Này

### A. Khi Tạo Mới Một Component UI Hoặc Trang Mới
1. **Luôn tái sử dụng component nền tảng**:
   - Sử dụng `<Button>` từ `@/components/ui/button`.
   - Sử dụng `<Checkbox>` từ `@/components/ui/checkbox`.
2. **Quy tắc phối màu nút bấm**:
   - Nút hành động chính (Submit form, Đăng ký, Lọc, Tìm kiếm): `<Button variant="default">` (`bg-brand`).
   - Nút hành động gấp / mua bán (Mua ngay, Flash sale CTA): `<Button variant="destructive">` hoặc `bg-accent`.
   - Nút phụ: `<Button variant="outline">` hoặc `<Button variant="ghost">`.
3. **Quy tắc hiển thị giá**:
   - Giá bán chính: `text-accent font-mono tabular-nums font-bold text-base sm:text-lg`.
   - Giá gốc so sánh: `text-slate-400 line-through font-mono tabular-nums text-xs`.

### B. Khi Làm Việc Với Hệ Thống Gợi Ý & Dữ Liệu Tương Tác
1. **Ghi nhận tương tác**:
   - Mọi hành động của người dùng (xem chi tiết, thêm giỏ, mua hàng) đều gọi qua hook/service `recommendationService.trackInteraction({ productId, interactionType })`.
   - Backend sẽ tự động ghi đồng thời vào cả MongoDB `ProductInteraction` và file CSV `interactions.csv`.
2. **Huấn luyện lại mô hình Python ALS**:
   - Chạy script huấn luyện định kỳ:
     ```bash
     cd BE/python-services
     python matrix_factorization.py
     ```
   - Script sẽ đọc `data/interactions.csv`, tính toán ma trận tương quan và cập nhật kết quả vào MongoDB.
3. **Độ an toàn dữ liệu Hot Trend**:
   - Không được xóa bỏ hàm backfill `getFallbackFeaturedProducts` trong `recommendation.service.js`. Hàm này là lưới an toàn để storefront không bao giờ bị rỗng.

---

> *Tài liệu được cập nhật và kiểm thử trực tiếp trên hệ thống ngày 31/10/2026.*  
> *Mọi thay đổi tiếp theo bắt buộc phải tuân thủ nguyên tắc thiết kế phẳng (Flat Design) và kỷ luật kiểm chứng (Engineering Discipline).*
