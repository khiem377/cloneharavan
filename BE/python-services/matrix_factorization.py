"""Entry point: huấn luyện Implicit ALS và tính gợi ý cá nhân hóa.

Chạy: python matrix_factorization.py [--no-eval] [--top-n 15]
Logic nằm trong package recsys/ (config, weights, data_loader,
interaction_matrix, als, recommend, evaluate, exporter).
"""
import argparse
import time

from recsys.config import setup_utf8_output

setup_utf8_output()

from recsys.als import train_als  # noqa: E402
from recsys.data_loader import load_interactions, load_product_titles  # noqa: E402
from recsys.evaluate import evaluate  # noqa: E402
from recsys.exporter import export_csv, sync_mongo  # noqa: E402
from recsys.interaction_matrix import build_interaction_data  # noqa: E402
from recsys.recommend import iter_top_n  # noqa: E402

LINE = '=' * 76
EVAL_MAX_INTERACTIONS = 200_000  # dữ liệu lớn hơn thì bỏ qua bước đánh giá để chạy nhanh


def _print_eval(metrics):
    k = metrics['k']
    print(f"-> Hold-out ({metrics['users']} user): "
          f"HitRate@{k} ALS={metrics['hit_als']:.3f} vs Popular={metrics['hit_pop']:.3f} | "
          f"NDCG@{k} ALS={metrics['ndcg_als']:.3f} vs Popular={metrics['ndcg_pop']:.3f}")


def run(top_n=15, do_eval=True):
    print(LINE)
    print('RECOMMENDATION ENGINE - Implicit ALS + Time-Decay + Negative Feedback')
    print(LINE)
    started = time.time()

    interactions, source = load_interactions()
    print(f'-> Đã nạp {len(interactions)} tương tác từ [{source}]')
    if not interactions:
        print('-> Không có dữ liệu tương tác. Kết thúc.')
        return

    data = build_interaction_data(interactions)
    density = len(data.rows) / max(1, data.n_users * data.n_items)
    print(f'-> Ma trận: {data.n_users} user x {data.n_items} sản phẩm | '
          f'{len(data.rows)} cặp positive | độ thưa {100 * (1 - density):.2f}%')
    if len(data.rows) == 0:
        print('-> Không có cặp positive nào. Kết thúc.')
        return

    if do_eval and len(interactions) <= EVAL_MAX_INTERACTIONS:
        metrics = evaluate(data)
        if metrics:
            _print_eval(metrics)
        else:
            print('-> Bỏ qua đánh giá: chưa đủ user có từ 3 sản phẩm quan tâm.')

    users, items = train_als(data.rows, data.cols, data.conf, data.n_users, data.n_items)
    print(f'-> ALS xong: k={users.shape[1]} yếu tố ẩn')

    recommendations = {}
    for u_idx, item_idx, scores in iter_top_n(
            users, items, data.excl_rows, data.excl_cols, top_n=top_n):
        recommendations[data.user_keys[u_idx]] = [
            (data.prod_keys[i], float(s)) for i, s in zip(item_idx, scores)
        ]

    titles = load_product_titles()
    exported = export_csv(recommendations, titles)
    print(f'-> Đã xuất {exported} gợi ý ra [data/recommendations_output.csv]')

    synced = sync_mongo(recommendations)
    if synced is not None:
        print(f'-> Đã đồng bộ {synced} document vào MongoDB.')

    print(f'-> Hoàn tất trong {time.time() - started:.2f}s cho {len(recommendations)} user')
    print(LINE)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Tính gợi ý cá nhân hóa bằng Implicit ALS')
    parser.add_argument('--top-n', type=int, default=15)
    parser.add_argument('--no-eval', action='store_true', help='Bỏ bước đánh giá hold-out')
    args = parser.parse_args()
    run(top_n=args.top_n, do_eval=not args.no_eval)
