import sqlite3
from pathlib import Path
from src.backend.model import *
from . import utility

DB_PATH = Path(__file__).resolve().parent / "database" / "app.db"

def init_user():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS user (
            id              INTEGER PRIMARY KEY,
            email           TEXT NOT NULL UNIQUE,
            password        TEXT NOT NULL,
            name            TEXT NOT NULL,
            student_id      TEXT UNIQUE,
            department      TEXT,
            created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def init_carpool():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS carpool (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            poster_id       INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
            origin          TEXT NOT NULL,
            destination     TEXT NOT NULL,
            departure_time  TIMESTAMP NOT NULL,
            seats_total     INTEGER NOT NULL CHECK (seats_total > 0),
            seats_left      INTEGER NOT NULL CHECK (seats_left >= 0),
            cost            INTEGER DEFAULT 0,
            note            TEXT,
            status          TEXT NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open', 'full', 'closed', 'cancelled')),
            created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CHECK (seats_left <= seats_total)
        );
    """)
    conn.commit()
    conn.close()

def init_carpool_member():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS carpool_member (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            carpool_id      INTEGER NOT NULL REFERENCES carpool(id) ON DELETE CASCADE,
            user_id         INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
            status          TEXT NOT NULL DEFAULT 'joined'
                            CHECK (status IN ('joined', 'cancelled')),
            joined_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (carpool_id, user_id)
        )
    """)
    conn.commit()
    conn.close()

def email_exist(email: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        cur.execute(
            f"SELECT EXISTS(SELECT 1 FROM user WHERE email = ?)",
            (email,)
        )
        return bool(cur.fetchone()[0])
    finally:
        conn.close()

def create_user(user: User) -> User:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        row = conn.execute(
            """
            INSERT INTO user (email, password, name, student_id, department)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id, email, password, name, student_id, department, created_at
            """,
            (user.email, user.password, user.name, user.student_id, user.department),
        ).fetchone()
        conn.commit()

        data = dict(row)
        data["password"] = ""  # 不把密碼回傳出去
        return User(**data)
    finally:
        conn.close()

def check_password(query: LoginFormat) -> str:
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.execute(
            "SELECT password FROM user WHERE email = ?",
            (query.email,)
        )
        row = cursor.fetchone()
        if row is None:
            return False
        stored_hash = row[0]
        # return stored_hash == utility.generate_hash(query.password)
        return stored_hash
    finally:
        conn.close()

def get_user(req: LoginFormat) -> User:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        row = conn.execute(
            """
            SELECT * FROM user WHERE email = ?
            """,
            (req.email,),
        ).fetchone()

        data = dict(row)
        data["password"] = ""  # 不把密碼回傳出去
        return User(**data)
    finally:
        conn.close()

def create_post(query: CarpoolPost) -> Carpool:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        row = conn.execute(
            """
            INSERT INTO carpool (poster_id, origin, destination, departure_time,
                                 seats_total, seats_left, cost, note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id, poster_id, origin, destination, departure_time,
                      seats_total, seats_left, cost, note, status, created_at, updated_at
            """,
            (query.poster_id, query.origin, query.destination,
             utility.to_db_time(query.departure_time),          # 轉成 UTC 字串
             query.seats_total, query.seats_left, query.cost, query.note),
        ).fetchone()
        conn.commit()

        data = dict(row)
        data["departure_time"] = utility.from_db_time(data["departure_time"])
        return Carpool(**data)
    finally:
        conn.close()

def search_post(query: CarpoolFilter) -> list[Carpool]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute(
            """
            SELECT * FROM carpool
            WHERE origin = ?
              AND destination = ?
              AND departure_time >= ?
              AND seats_left > 0
            ORDER BY departure_time ASC
            """,
            (query.origin, query.destination, utility.to_db_time(query.departure_time)),
        ).fetchall()

        results = []
        for row in rows:
            data = dict(row)
            data["departure_time"] = utility.from_db_time(data["departure_time"])
            results.append(Carpool(**data))
        return results
    finally:
        conn.close()

def search_email(id: int) -> str:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        row = conn.execute("SELECT email FROM user WHERE id = ?",
                     (id,)).fetchone()
        return dict(row)["email"]
    finally:
        conn.close()

def join_user(req: CarpoolJoin):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("""
            INSERT INTO carpool_user (carpool_id, user_id)
            VALUES (?, ?)
            """, (req.carpool_id, req.user_id)
        )
        conn.commit()
        row = conn.execute("SELECT seats_left FROM carpool WHERE id = ?",
                                      (req.carpool_id,)).fetchone()
        original_seats = dict(row)["seats_left"]
        conn.execute("""
            UPDATE carpool
            SET seats_left = ?
            WHERE id = ?    
        """, (original_seats-1, req.carpool_id))
        conn.commit()
    finally:
        conn.close()

init_user()
init_carpool()
init_carpool_member()