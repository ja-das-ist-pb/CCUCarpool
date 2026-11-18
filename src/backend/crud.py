import sqlite3
from pathlib import Path
from src.backend.model import User, LoginFormat
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

def email_exist(email: str):
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

def create_user(user: User):
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.execute(
            """
            INSERT INTO user (email, password, name, student_id, department)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user.email, user.password, user.name, user.student_id, user.department),
        )
        conn.commit()
        user.id = cursor.lastrowid
        return user
    finally:
        conn.close()

def check_password(query: LoginFormat):
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

init_user()
init_carpool()