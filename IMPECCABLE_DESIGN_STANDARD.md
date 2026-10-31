# IMPECCABLE DESIGN STANDARD — HỆ QUY CHUẨN THIẾT KẾ TOÀN DIỆN

> **Tài liệu tham chiếu chuẩn hóa toàn bộ tư duy thiết kế, từ điển câu lệnh và quy chuẩn phòng chống "AI Slop" (rác giao diện do AI sinh ra) dựa trên đặc tả chính thức của [pbakaus/impeccable](https://github.com/pbakaus/impeccable) & [impeccable.style](https://impeccable.style/).**
> 
> *Áp dụng bắt buộc cho toàn bộ lập trình viên và AI Agent khi xây dựng giao diện Client (Storefront, Flash Sale, PDP, Cart) và Admin (Dashboard, OMS, WMS, CRM).*

---

## 1. Triết Lý Cốt Lõi: Anti-AI-Slop & Out-of-Distribution Craft

Giao diện mặc định do các mô hình AI sinh ra thường rơi vào một lối mòn dễ đoán (AI Slop):
- Nền màu kem nhạt, tiêu đề serif mỏng với chữ nghiêng accent.
- Nút bấm hình con nhộng (pill button), gradient tím sang xanh dương hoặc cam sang đỏ.
- Hộp lồng trong hộp (card-in-card), khối icon vuông xám cạnh từng con số.
- "Bát súp nhãn dán" (status-chip soup) gắn badge khắp nơi.

**Impeccable** thiết lập kỷ luật loại bỏ hoàn toàn các thói quen mặc định này, thay thế bằng tư duy của một Design Director: **Thiết kế phẳng sắc nét (Flat), có lập trường rõ ràng (Point of View), tôn trọng sự thật sản phẩm và hoàn thiện tỉ mỉ đến từng chi tiết (Craft Floor).**

---

## 2. Phân Loại 4 Bề Mặt Trải Nghiệm (Operational Modes)

Mỗi bề mặt giao diện trong dự án phải được xác định rõ thuộc 1 trong 4 chế độ để điều chỉnh mức độ biểu cảm thị giác:

| Chế độ (Mode) | Phạm vi áp dụng | Đặc tính cốt lõi | Nguyên tắc thiết kế |
| :--- | :--- | :--- | :--- |
| **Persuade** | Flash Sale, Landing Page, PDP, Trang Chiến dịch | Khách truy cập đến để **đánh giá và hành động**. Cần tính thuyết phục cao. | Mở màn phải làm cho ưu đãi **dễ hiểu và khao khát ngay trong 1 dòng (Hook)**. Mở sẵn hành động cốt lõi (Add to Cart / Mua ngay) trong tầm mắt đầu tiên. Tiêu điểm thị giác duy nhất (Hero Banner). |
| **Operate** | Admin Dashboard, WMS Kho hàng, OMS Đơn hàng, Cấu hình | Người dùng thực hiện **tác vụ lặp lại hàng ngày**. Đòi hỏi sự ổn định và tốc độ. | Tối đa hóa khả năng quét mắt (Scanability), mật độ thông tin cao, cấu trúc bảng phẳng phân tách bằng đường kẻ 1px, số liệu dùng `tabular-nums font-mono`. Tuyệt đối không gây bất ngờ về mặt tương tác. |
| **Read** | Chính sách bảo hành, Hướng dẫn, Điều khoản | Người dùng tập trung **tiếp nhận thông tin dạng văn bản dài**. | Kiểm soát độ dài dòng văn bản tối ưu `45–75ch`. Không dùng các yếu tố đồ họa làm xao nhãng việc đọc. |
| **Experience** | Triển lãm số, Visual Showcases, Mini-game | Người dùng đến để **thưởng thức và khám phá**. | Thế giới thị giác làm chủ ngay từ khung nhìn đầu tiên (Viewport). Tận dụng hoạt họa mượt mà có kiểm soát. |

---

## 3. The Craft Floor — Những Điều Cấm Kỵ Tuyệt Đối (Absolute Bans & Refusals)

Bộ lọc chất lượng sàn bắt buộc kiểm tra trước khi nghiệm thu bất kỳ dòng code UI nào:

### A. Những điều CẤM TUYỆT ĐỐI (Absolute Bans)
1. ❌ **CẤM Card lồng trong Card (Nested Cards)**: *"Cards are the lazy container; nested cards are always wrong"*. Tuyệt đối không bọc một card nhỏ bên trong một card lớn. Dùng khoảng cách (spacing), căn gióng (alignment) và đường kẻ phẳng `border-b` hoặc `divide-y divide-slate-200` để phân cấp.
2. ❌ **CẤM Kicker / Eyebrow phía trên tiêu đề**: *"A kicker or eyebrow above a heading is a ban, not a default: no brief earns it back. The heading carries its own weight"*. Không gắn các dòng nhãn phụ nhỏ tí ("HOT DEAL", "KHUYẾN MÃI", "FEATURE") nằm trên tiêu đề chính. Tiêu đề phải tự mang sức nặng của chính nó.
3. ❌ **CẤM Chữ chuyển màu (Gradient Text)**: Nhấn mạnh văn bản bằng cỡ chữ (size), độ đậm (weight), hoặc sắc độ màu (tone), không dùng gradient chữ loè loẹt.
4. ❌ **CẤM Glassmorphism trang trí**: Không dùng `backdrop-blur` hoặc viền trắng mờ vô tội vạ.
5. ❌ **CẤM Status-Chip Soup (Bát súp nhãn dán)**: Không gắn badge màu sắc cho từng hàng dữ liệu hoặc dán 3-4 badge chồng chất lên ảnh sản phẩm. Chỉ dùng màu nổi bật cho các trạng thái thực sự cần xử lý gấp (Hết hàng, Chờ duyệt).
6. ❌ **CẤM Viền màu dày > 1px**: Không dùng `border-l-4`, `border-l-2` ở cạnh card, alert hay danh sách.
7. ❌ **CẤM Emoji thay thế cho Icon**: Icon bắt buộc phải là vector SVG chuẩn từ thư viện đồng nhất (Lucide Icons), đồng nhất độ dày nét (stroke-width) và kích thước.
8. ❌ **CẤM Đổ bóng khối giả Neobrutalist**: Cấm `box-shadow: 4px 4px 0` màu đen cứng trừ khi toàn bộ sản phẩm theo phong cách Neobrutalism có chủ đích.
9. ❌ **Quy tắc Elevation duy nhất (Border HOẶC Shadow)**: Chọn đường viền 1px HOẶC bóng đổ mờ nhẹ (`shadow-2xs`), không kết hợp viền 1px đè lên bóng mờ nhạt (Ghost card).

### B. Chuẩn hóa Bề mặt Trình duyệt (Browser Surfaces)
Những phần tử trình duyệt mặc định bắt buộc phải được điều chỉnh đồng bộ theo palette của hệ thống:
- Số liệu, tiền tệ, thời gian: Bắt buộc dùng `tabular-nums font-mono` để số nhảy không làm rung giật layout.
- Vùng chọn văn bản (`::selection`): Đồng màu thương hiệu nhẹ.
- Đường viền Focus (`focus-visible:ring-1 focus-visible:ring-slate-900`): Tinh tế, rõ ràng cho người dùng bàn phím.
- Cuộn trang: `scrollbar-thin` thanh lịch, không dùng thanh cuộn to dày của trình duyệt cũ.

---

## 4. Danh Mục 24 Câu Lệnh & Quy Trình Impeccable

Hệ thống Impeccable chia 24 kỹ năng thành 5 nhóm công năng chuyên biệt:

```
                            IMPECCABLE (24 Commands)
       ┌──────────────┬──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼              ▼
   1. STEER       2. REVIEW      3. FINISH      4. ITERATE     5. PLAN & SETUP
   • bolder       • critique     • polish       • live         • shape
   • quieter      • audit        • harden       • generate     • init
   • distill                     • clarify                     • document
   • colorize                    • adapt                       • extract
   • typeset                     • optimize
   • layout                      • onboard
   • animate
   • delight
   • overdrive
```

### Chi tiết các lệnh then chốt:

### A. Nhóm Steer (Điều hướng phong cách)
- `/distill`: **Thanh lọc triệt để**. Loại bỏ các thành phần dư thừa, các container lồng nhau, các thông tin lặp lại. Giữ lại duy nhất 1 mục tiêu người dùng cốt lõi, 1 hành động chính.
- `/typeset`: **Hiệu chỉnh Typography**. Cỡ chữ body web tối thiểu 16px (14px chỉ cho text phụ). Sử dụng `text-wrap: balance` cho Heading và `text-wrap: pretty` cho Body text. Chiều dài dòng tối ưu 45–75 ký tự (`ch`).
- `/layout`: **Nhịp điệu và Không gian**. Xây dựng nhịp điệu từ độ tương phản giữa khoảng cách dày và thưa theo hệ bội số 4px (`gap-1` 4px, `gap-2` 8px, `gap-4` 16px, `gap-6` 24px). Áp dụng Squint Test: Khi mờ mắt vẫn nhận diện được thứ tự đọc và khối chính.
- `/bolder`: Tăng cường độ nhận diện và bản lĩnh thương hiệu của một khu vực mà không làm phá vỡ hệ thống của trang.
- `/quieter`: Giảm âm lượng thị giác của khu vực đang quá chói gắt hoặc ồn ào.
- `/animate`: Thêm micro-animation có chủ đích, sử dụng easing hàm mũ (`ease-out`), phản hồi xúc giác bấm nút `active:scale-[0.98]`.

### B. Nhóm Finish (Hoàn thiện xuất xưởng)
- `/harden`: **Gia cố độ bền dữ liệu**.
  - Phòng chống tràn chữ: Bắt buộc bọc `min-w-0 truncate` hoặc `line-clamp-2` cho tên sản phẩm, văn bản động.
  - Định dạng số và tiền tệ: Dùng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` kết hợp `tabular-nums font-mono`.
  - Xử lý đủ **4 trạng thái bắt buộc**: `Loading` (Skeleton khớp 1:1 với wireframe thật), `Error` (Thông báo nguyên nhân + nút thử lại), `Empty` (Chỉ dẫn hành động kế tiếp), `Success`.
- `/polish`: **Chà nhám chi tiết cuối cùng**. Thống nhất bo góc cố định `rounded-[6px]`, viền mảnh 1px `border-slate-200`, chống rung giật layout khi chuyển trạng thái (hover, active, countdown tick).
- `/clarify`: Rà soát câu từ nút bấm và tiêu đề. Nút bấm phải nêu rõ hành động và số tiền (`Thêm vào giỏ hàng`, `Thanh toán ngay — 350.000₫`), không viết chung chung.
- `/adapt`: Đảm bảo độ mượt mà từ Mobile 375px đến Màn hình lớn 1920px. Trên di động, vùng thao tác chính phải nằm trong "Thumb Zone" (nửa dưới màn hình), nút chạm tối thiểu `44x44px`.

### C. Nhóm Review (Đánh giá chất lượng)
- `/critique`: Chấm điểm theo **10 Heuristics của Nielsen (thang điểm 0–4)** và kiểm thử qua **5 Persona người dùng**:
  1. *Alex (Power User)*: Tìm phím tắt, thao tác hàng loạt, ghét rườm rà.
  2. *Jordan (Người mới)*: Cần chỉ dẫn rõ ràng, sợ bấm nhầm.
  3. *Sam (Accessibility)*: Dùng bàn phím/Screen Reader, độ tương phản chuẩn WCAG AA >= 4.5:1.
  4. *Riley (Stress Tester)*: Nhập chuỗi siêu dài, đổi mạng gián đoạn, kiểm tra ranh giới dữ liệu.
  5. *Casey (Mobile vội vã)*: Thao tác 1 tay bằng ngón cái, mạng 3G, dễ bị phân tâm.
- `/audit`: Báo cáo kỹ thuật phân loại theo độ nghiêm trọng từ **P0** (Chặn tác vụ, mất dữ liệu), **P1** (Vỡ layout, hiểu nhầm nghiêm trọng), **P2** (Lệch chuẩn thiết kế, khó chịu nhỏ) đến **P3** (Chà nhám vi mô).

---

## 5. Quy Chuẩn Áp Dụng Thực Tế Vào Trang Flash Sale

Áp dụng toàn bộ chuẩn mực Impeccable vào việc xây dựng trang Flash Sale:

### 1. Khung nhìn đầu tiên (First Viewport & Hero Banner)
- **Tỉ lệ chuẩn 16:9 Full-width**: Chiếm 100% chiều ngang khung chứa, co giãn tự nhiên không tạo khoảng viền đen (no letterbox).
- **Banner sạch, không gắn đè phụ kiện**: Ảnh banner hiển thị trọn vẹn thông điệp, không dán thêm badge hay thanh slogan giả lập đè lên trên.
- **Tiêu đề chiến dịch**: Gọn gàng, loại bỏ kicker rác, hiển thị `text-wrap: balance`.
- **Bộ đếm ngược giờ vàng**: Đóng trong khung viền phẳng 1px tinh tế, font số `tabular-nums font-mono font-bold text-red-600` chống rung giật tuyệt đối khi nhảy từng giây.

### 2. Thanh điều hướng & Lọc danh mục (Toolbar)
- Thiết kế dạng tab phẳng tối giản, ngăn cách bởi đường viền `border-b border-slate-200`.
- Phản hồi chuyển tab tức thì, không làm nhảy layout các phần tử bên dưới.
- Tích hợp bộ lọc sắp xếp trực quan: `% Giảm giá nhiều nhất`, `Giá tăng/giảm`, `Bán chạy nhất`.

### 3. Thẻ Sản Phẩm Flash Sale (FlashSaleProductCard)
- **Khung thẻ**: `bg-white border border-slate-200 rounded-[6px] overflow-hidden transition-all duration-200 hover:border-slate-300`.
- **Hình ảnh**: Tỉ lệ 1:1 vuông vức, zoom vi mô khi hover (`hover:scale-105 transition-transform duration-300`).
- **Huy hiệu duy nhất**: 1 nhãn giảm giá đỏ nổi bật ở góc (`-35%`), không nhồi nhét nhiều nhãn phụ.
- **Tên sản phẩm**: `font-medium text-slate-800 line-clamp-2 min-w-0 text-sm`.
- **Khối giá tương phản cao**: Giá Flash Sale màu đỏ đậm `tabular-nums font-bold text-red-600 text-base` đặt cạnh Giá gốc gạch ngang màu xám `tabular-nums text-slate-400 text-xs`.
- **Thanh tiến độ kho hàng**: Thanh phẳng mỏng tinh tế (`h-1.5 bg-slate-100 rounded-full overflow-hidden`), hiển thị số lượng `Đã bán X/Y` hoặc `Cháy hàng`.
- **Nút CTA Thêm vào giỏ**: Full-width, dứt khoát "Thêm vào giỏ", có hiệu ứng xúc giác `active:scale-[0.98]`.

### 4. Khung Skeleton (Loading State)
- Mô phỏng chính xác 100% wireframe thật của Product Card: khung ảnh vuông, 2 dòng tiêu đề, khối giá và nút bấm xám nhạt chuyển động shimmer nhẹ, giữ khung trang ổn định tuyệt đối khi đang nạp dữ liệu.

---

## 6. Lời Thề Kỷ Luật (Engineering Pledge)

Mỗi khi chỉnh sửa hoặc phát triển giao diện trong dự án này:
1. Đọc lại quy chuẩn này trước khi viết code.
2. Không sáng tạo thêm các hiệu ứng rác ngoài phạm vi (No gradient text, no glassmorphism, no nested cards).
3. Mỗi file component tuân thủ nghiêm ngặt **dưới 250 dòng**.
4. Luôn kiểm tra đủ 4 trạng thái và kiểm thử thực tế trên màn hình di động (375px) lẫn máy tính (1440px).
