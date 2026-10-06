# UI Design Principles & Standards (Bản sắc thiết kế riêng biệt)

Quy chuẩn thiết kế giao diện bắt buộc cho toàn bộ dự án để tạo sản phẩm chuyên nghiệp, tinh tế và **TUYỆT ĐỐI KHÔNG mang phong cách AI generic/AI-generated**.

---

## 1. Các điều cấm kỵ (Strict Don'ts)

- ❌ **KHÔNG Gradient**: Không dùng dải chuyển màu lòe loẹt, sặc sỡ (no colorful gradients, no `bg-gradient-to-r`). Sử dụng màu đặc (solid colors), màu trung tính phối hợp điểm nhấn thương hiệu chuẩn xác.
- ❌ **KHÔNG Glassmorphism**: Không dùng hiệu ứng kính mờ, giả kính (`backdrop-blur`, nền bán trong suốt `bg-.../10`, viền trắng mờ...).
- ❌ **KHÔNG Card lồng Card**: Tránh cấu trúc nhiều tầng hộp bọc trong hộp (nested cards). Nếu đã có Card/Container thì bên trong dùng cấu trúc bảng (Table), danh sách phẳng (List rows), phân cách bằng đường kẻ phân tách (`border-b`, `divide-y`), không bọc thêm Card con.
- ❌ **KHÔNG Shadow khắp nơi**: Không lạm dụng bóng đổ (`shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`). Ưu tiên phân tách các khối bằng đường viền tinh tế (`border border-slate-200` hoặc border token), giao diện sắc nét, phẳng (flat/clean). Chỉ dùng shadow cực nhẹ (`shadow-xs` hoặc `shadow-sm`) khi thực sự cần nổi (như Popover, Dropdown, Modal).

---

## 2. Quy chuẩn Bo góc (Border Radius)

- 🎯 **Bo góc cố định: 6px** (`rounded-[6px]` hoặc token `rounded-md` tương ứng 6px).
- Toàn bộ button, input, card, modal, badge, dropdown đều tuân thủ bo góc 6px.
- Không bo góc to tròn 12px, 16px, 24px hay pill bo tròn nếu không có yêu cầu đặc thù. Giữ đường nét sắc sảo, dứt khoát.

---

## 3. Một hệ thống Spacing đồng nhất (Single Spacing System)

- Tuân thủ nghiêm ngặt thang khoảng cách chuẩn bội số 4px (Base-4):
  - **4px** (`p-1`, `gap-1`, `m-1`)
  - **8px** (`p-2`, `gap-2`, `m-2`)
  - **12px** (`p-3`, `gap-3`, `m-3`)
  - **16px** (`p-4`, `gap-4`, `m-4`)
  - **20px** (`p-5`, `gap-5`, `m-5`)
  - **24px** (`p-6`, `gap-6`, `m-6`)
  - **32px** (`p-8`, `gap-8`, `m-8`)
- Tuyệt đối không dùng số lẻ tùy tiện (như `p-[13px]`, `gap-[7px]`, `m-[19px]`).
- Phân tầng padding nội tại và margin giữa các section theo quy tắc cố định để toàn bộ hệ thống đạt độ nhịp nhàng (visual rhythm).

---

## 4. Tinh thần thẩm mỹ (Design Vibe)

- **Clean, Sharp & Functional**: Tinh gọn, thực dụng, sắc nét, mật độ thông tin cân đối.
- **Human Handcrafted**: Bố cục rõ ràng, typography có thứ bậc chuẩn mực (Hierarchy), tương phản tốt, mang cảm giác sản phẩm thương mại cao cấp hoàn thiện thủ công bởi kỹ sư UX/UI giàu kinh nghiệm.
