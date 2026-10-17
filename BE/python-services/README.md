# Recommendation Engine (`python-services`)

Gợi ý sản phẩm cá nhân hóa bằng **Implicit ALS** + time-decay + tín hiệu âm. **Chỉ dùng dữ liệu thật trong MongoDB**:
không CSV, không dữ liệu sinh giả, không fallback nguồn khác. Thiếu cấu hình hoặc lỗi kết nối thì script báo lỗi.

## Luồng dữ liệu

```
Client -> BE (userinteractions) -> matrix_factorization.py -> personalizedrecommendations -> BE API
```

- Đọc: collection `userinteractions` (trong 90 ngày gần nhất).
- Ghi: collection `personalizedrecommendations` (`bulk_write`, upsert theo `userId` hoặc `sessionId`).
- BE tự chạy script qua `cronJobs.js` (mỗi 4 giờ, khi đủ 100 tương tác mới, và lúc khởi động nếu kết quả trống hoặc cũ hơn 12 giờ). Có khoá chống chạy chồng và cooldown 10 phút.

## Scripts

### `matrix_factorization.py` (entry) + package `recsys/`

| Module | Vai trò |
|---|---|
| `recsys/config.py` | Đọc `MONGO_URI` từ biến môi trường hoặc `BE/.env`. Không có URI mặc định. |
| `recsys/weights.py` | Trọng số hành vi và time-decay (half-life 7 ngày, bỏ dữ liệu quá 90 ngày). |
| `recsys/data_loader.py` | Nạp tương tác từ MongoDB. |
| `recsys/interaction_matrix.py` | Gom tương tác thành ma trận thưa bằng numpy. |
| `recsys/als.py` | Huấn luyện ALS. |
| `recsys/recommend.py` | Top-N theo lô (`argpartition`), loại sản phẩm đã mua / điểm âm. |
| `recsys/evaluate.py` | Hold-out leave-one-out: HitRate@K, NDCG@K so với baseline phổ biến. |
| `recsys/exporter.py` | Ghi kết quả vào MongoDB bằng `bulk_write`. |

```bash
python matrix_factorization.py            # chạy kèm đánh giá hold-out
python matrix_factorization.py --no-eval  # bỏ bước đánh giá
```

### `upsell_engine.py`
Tính gợi ý nâng cấp (up-sell) theo biến thể/danh mục, đọc `products`, `productvariants` và ghi `upsellsuggestions`.

## Chạy thủ công

```bash
pip install numpy pymongo
python python-services/matrix_factorization.py
```

Cần `MONGO_URI` trong `BE/.env` hoặc biến môi trường.
