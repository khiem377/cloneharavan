"""Cấu hình dùng chung cho python-services.

Kết nối MongoDB chỉ đọc từ biến môi trường MONGO_URI (hoặc BE/.env).
Không có giá trị mặc định hardcode: thiếu biến thì báo rõ thay vì âm thầm
kết nối tới một database không mong muốn.
"""
import os
import sys

# python-services/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
ENV_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', '.env'))

_env_loaded = False


def setup_utf8_output():
    """Tránh lỗi cp1252 trên Windows khi in tiếng Việt."""
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8')


def _load_env_file(env_path):
    if not os.path.exists(env_path):
        return
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, value = line.split('=', 1)
                key = key.strip()
                if key.startswith('export '):
                    key = key[len('export '):].strip()
                value = value.strip().strip("'\"")
                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        pass


def load_env():
    """Nạp BE/.env một lần. Biến đã có trong môi trường (do Node truyền) được ưu tiên."""
    global _env_loaded
    if not _env_loaded:
        _load_env_file(ENV_PATH)
        _env_loaded = True


def get_mongo_uri(required=False):
    """Trả về MONGO_URI. required=True thì thiếu sẽ raise RuntimeError."""
    load_env()
    uri = os.getenv('MONGO_URI', '').strip()
    if not uri and required:
        raise RuntimeError(
            'Thiếu biến môi trường MONGO_URI. Khai báo trong BE/.env hoặc export trước khi chạy.'
        )
    return uri or None
