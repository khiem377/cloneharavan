# Haravan AI Recommendation Engine & Dataset Pipeline (`python-services`)

Hệ thống Gợi ý Sản phẩm Cá nhân hóa (Personalized E-Commerce AI Recommendation Engine) được thiết kế cho hệ thống Clone Haravan, kết hợp **Matrix Factorization (SVD / ALS)** và dữ liệu tương tác thực tế từ CSV Dataset & MongoDB.

---

## 📂 Thư mục dữ liệu Dataset (`data/`)

Thư mục `python-services/data/` chứa toàn bộ bộ dữ liệu thương mại điện tử chuyên sâu (CSV Datasets):

| Tên file CSV | Mô tả dữ liệu | Trường dữ liệu chính |
|---|---|---|
| `products.csv` | Danh mục sản phẩm điện máy / gia dụng thực tế | `product_id`, `sku`, `title`, `category`, `brand`, `price`, `sale_price`, `stock`, `rating` |
| `users.csv` | Hồ sơ người dùng & phân hạng khách hàng | `user_id`, `full_name`, `email`, `gender`, `age`, `city`, `customer_tier` |
| `interactions.csv` | Nhật ký hành vi mua sắm & clickstream | `interaction_id`, `user_id`, `session_id`, `product_id`, `event_type`, `weight`, `timestamp` |
| `orders.csv` | Lịch sử đơn hàng mua thực tế | `order_id`, `user_id`, `product_id`, `quantity`, `unit_price`, `total_amount`, `payment_method`, `created_at` |
| `recommendations_output.csv` | **Kết quả dự đoán AI cho từng User** | `user_id`, `product_id`, `title`, `predicted_score`, `rank` |

---

## ⚙️ Các Kịch bản Python (`Python Scripts`)

### 1. `generate_dataset.py`
Kịch bản khởi tạo / làm mới bộ dữ liệu CSV chuẩn trong thư mục `data/` với dữ liệu thực tế về sản phẩm (Smart TV, Tủ lạnh, Máy giặt, Loa Bluetooth, Nồi chiên không dầu...), người dùng và ma trận hành vi người dùng.

```bash
python generate_dataset.py
```

### 2. `matrix_factorization.py`
Mô hình thuật toán AI Machine Learning chính:
* Tự động đọc dữ liệu từ `data/interactions.csv` và `data/products.csv` (hoặc kết nối live MongoDB nếu khả dụng).
* Xây dựng ma trận tương tác User-Product $R_{m \times n}$.
* Thực hiện phân rã giá trị đơn lẻ **SVD (Singular Value Decomposition)** thông qua `numpy.linalg.svd`.
* Dự đoán điểm số yêu thích của từng User đối với tất cả sản phẩm.
* Xuất file kết quả dự đoán ra `data/recommendations_output.csv` và tự động đẩy dữ liệu dự đoán vào MongoDB collection `personalizedrecommendations`.

```bash
python matrix_factorization.py
```

### 3. `sync_dataset_to_db.py`
Kịch bản đồng bộ dữ liệu từ các file CSV trong `data/` vào MongoDB database (`cloneharavan`), đảm bảo Node.js Backend API có ngay dữ liệu sản phẩm, user và nhật ký tương tác thực tế.

```bash
python sync_dataset_to_db.py
```

---

## 🔄 Tích hợp với Node.js Backend API

Khi khách hàng truy cập giao diện Storefront FE hoặc gọi API `/api/v1/recommendations/personalized`:
1. Node.js Service (`recommendation.service.js`) truy vấn trực tiếp bảng `personalizedrecommendations` trong MongoDB (đã được Python SVD model tính toán và lưu sẵn).
2. Trả về cho giao diện danh sách sản phẩm gợi ý cá nhân hóa kèm điểm số dự đoán (`predictedScore`) và lý do gợi ý (`reason`).
3. Nếu là khách hàng mới (Cold-start), hệ thống tự động fallback về danh sách sản phẩm Nổi bật / Hot nhất.

---

## 🚀 Hướng dẫn Chạy Hệ thống

1. **Cài đặt thư viện Python (nếu chưa có):**
   ```bash
   pip install numpy pymongo
   ```

2. **Khởi tạo dữ liệu CSV Dataset:**
   ```bash
   python python-services/generate_dataset.py
   ```

3. **Huấn luyện Mô hình SVD & Tính toán Gợi ý:**
   ```bash
   python python-services/matrix_factorization.py
   ```

4. **(Tùy chọn) Đồng bộ CSV vào MongoDB:**
   ```bash
   python python-services/sync_dataset_to_db.py
   ```
