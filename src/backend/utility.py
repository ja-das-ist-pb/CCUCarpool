import bcrypt
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import tzdata

def generate_hash(passwd: str):
    passwd = passwd.encode("utf-8")
    return bcrypt.hashpw(passwd, bcrypt.gensalt())

LOCAL_TZ = ZoneInfo("Asia/Taipei")
DB_TIME_FORMAT = "%Y-%m-%d %H:%M:%S"

def to_db_time(dt: datetime) -> str:
    """將 datetime 轉成 UTC 的字串，供寫入與查詢 SQLite 使用"""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=LOCAL_TZ)  # 沒有時區資訊時，假設為台北時間
    return dt.astimezone(timezone.utc).strftime(DB_TIME_FORMAT)

def from_db_time(s: str) -> datetime:
    """將資料庫的 UTC 字串還原為帶 UTC 時區的 datetime"""
    return datetime.strptime(s, DB_TIME_FORMAT).replace(tzinfo=timezone.utc)