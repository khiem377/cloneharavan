# Ghi chu Refactor & Dinh huong Kien truc

Ngay ghi: 2026-10-16. Tong hop tu cac buoi thao luan, dung lam tai lieu tham khao khi bat dau refactor.

---

## 1. Hien trang du an

- Backend Express.js: **349 API endpoints** trong **42 route files** (`BE/src/routes/`).
- Kien truc hien tai: Layered theo loai file (`routes -> controllers -> services -> models`).
- Xac thuc co san: Google, Zalo, TikTok, Passkey (WebAuthn), OTP admin.
- Module lon nhat: `auth` (41), `product` (24), `user` (22), `media` (15), `cart` (12).
- Du kien phinh len 450-500+ API khi them: checkout, payment, order lifecycle, shipping tracking.

---

## 2. Cac cach to chuc thu muc da thao luan

| Cach | Mo ta | Phu hop |
| :--- | :--- | :--- |
| 1. Layered theo loai file | Hien tai. `controllers/`, `services/`, `models/`... | Duoi 30 module |
| 2. Feature-based / Modular Monolith | Moi nghiep vu 1 thu muc `modules/<ten>/` | 30-100 module (**khuyen nghi**) |
| 3. Module long nhieu tang con | Module lon chia `core/`, `checkout/`, `shipping/`... | Module tren 30 API |
| 4. Clean Architecture | `domain/`, `application/`, `infrastructure/`, `presentation/` | He thong tai chinh, doi tren 10 nguoi |

### Khuyen nghi: ket hop Cach 2 + Cach 3

- Module nho (`tag`, `brand`, `banner`, `menu`): cau truc phang
  ```text
  src/modules/tag/
  ├── tag.routes.js
  ├── tag.controller.js
  ├── tag.service.js
  ├── tag.model.js
  ├── tag.validator.js
  └── index.js
  ```
- Module lon (`order`, `auth`, `product`, `shipping`): chia thu muc con
  ```text
  src/modules/order/
  ├── core/
  ├── checkout/
  │   └── payment-methods/   (vietqr, momo, vnpay adapter)
  ├── fulfillment/
  ├── shipping/
  │   └── carriers/          (ghn, ghtk, viettel adapter)
  ├── returns/
  ├── order.routes.js
  └── index.js
  ```
- Thu muc dung chung: `src/shared/` (middleware, utils, config).

### Quy tac bat buoc

- Module khac chi import qua `index.js` cua module, cam truy cap sau vao model/service noi bo.
- Chuyen tung module mot, chay on dinh roi moi chuyen module tiep theo. Khong refactor ca du an cung luc.
- Giu rule hien co: controller bao boc `catchAsync`, khong query Mongoose trong controller, response `{ success, data, message }`.

---

## 3. Cac kien truc nang cao co the ap dung sau

- **Event-Driven (BullMQ / Redis)**: dua tac vu nang ra khoi luong HTTP (gui email, bat don sang hang van chuyen, dong bo san, doi soat VietQR). Tao don chi publish su kien `ORDER_CREATED`.
- **CQRS**: tach doc/ghi. Doc di qua cache/Read Replica, ghi di qua nghiep vu day du. Chi can khi luong doc rat lon.
- **Clean Architecture / Use Case**: moi hanh dong 1 file (`create-order.usecase.js`). Chi dung cho module can test doc lap cao (payment, inventory).
- **Microservices**: chua can. Chi xem xet khi doi tren 20 nguoi.
- **NestJS**: lua chon neu muon co san DI, Module, Repository theo chuan.

---

## 4. Ke hoach tach Service theo mien (Order)

Thay `order.service.js` mot file lon bang:

- `orderCreation.service.js`: tao don, ap ma, tinh thue.
- `orderPayment.service.js`: thanh toan, doi soat.
- `orderFulfillment.service.js`: dong goi, xuat kho, goi shipper.

---

## 5. Tinh nang tuong lai: tich hop san TMDT (Shopee / TikTok Shop / Lazada)

### Nen tang can co

- **Adapter / Anti-Corruption Layer**: moi san 1 file `*.transformer.js`, dich du lieu san sang chuan noi bo. Core Service khong biet Shopee la gi.
- **Bang mapping `ChannelMapping`**: `productId`, `variantId`, `sku`, `channel`, `shopId`, `channelItemId`, `channelModelId`. Khop bang SKU, khong khop theo ten.
- **Bang anh xa trang thai** moi san sang trang thai noi bo.

### Rui ro ky thuat phai xu ly

1. Ban am kho (race condition): Redis distributed lock, kho du phong (safety stock).
2. Webhook trung / sai thu tu: idempotency key, kiem tra thu tu trang thai.
3. Rate limit cua san: dung message queue throttle 5-10 request/giay.
4. Huy don sat gio dong goi: canh bao khan o man hinh dong goi.
5. Token het han ngam: worker health check, bao qua Email/Telegram.

### Shopee Open Platform

- Can: `partner_id`, `partner_key` (secret), `redirect_url`; moi shop co `shop_id`, `access_token` (4 gio), `refresh_token` (30 ngay).
- Moi request ky HMAC-SHA256: `partner_id + path + timestamp + access_token + shop_id`. Lech gio qua 5 phut bi tu choi.
- Module API: `v2.product`, `v2.order`, `v2.logistics`, `v2.sellerchat`, `v2.returns`, `v2.payment`, comment.
- Sandbox: tao Test App va Test Shop tren open.shopee.com, khong can giay phep. Production can GPKD va duyet app.
- Bao gia freelancer tham khao: goi co ban (don hang) 10-15 trieu, tieu chuan (don + ton kho 2 chieu + keo san pham) 25-35 trieu, nang cao 45-60 trieu. Day san pham len Shopee tinh rieng. Thu tuc duyet Live thuoc khach hang.

---

## 6. Thanh toan va dang nhap (ghi chu nhanh)

- **VietQR chuan**: khong co webhook. De doi soat tu dong dung **SePay** hoac **PayOS**.
- **VNeID**: khong tich hop duoc voi website thuong (can C06 Bo Cong An tham dinh).
- **MoMo**: khong co OAuth login cho website ngoai, chi dung cho thanh toan. Login chi co trong Mini App.
- Co the them: dang nhap SDT + OTP qua Zalo ZNS, Apple Sign In, Facebook, Telegram.

---

## 7. Viec uu tien khi bat dau refactor

- [ ] Chon 1 module nho (`tag` hoac `brand`) lam thu cau truc Cach 2.
- [ ] Tao `src/shared/` va chuyen middleware, utils, config dung chung.
- [ ] Chuyen module `order` sang Cach 3, tach service theo mien.
- [ ] Them BullMQ cho tac vu nen (email, shipping, sync).
- [ ] Gioi han file component FE toi da 250 dong, tach subcomponent.
- [ ] Rat gon cac file service lon, bo sung test cho nghiep vu ton kho va gia.
