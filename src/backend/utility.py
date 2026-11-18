import bcrypt

def generate_hash(passwd: str):
    passwd = passwd.encode("utf-8")
    return bcrypt.hashpw(passwd, bcrypt.gensalt())

# import sqlite3
# conn = sqlite3.connect("src/backend/database/app.db")
# conn.execute("""
# SELECT password FROM user WHERE email = ?
# """, ("paulpb0725@alum.ccu.edu.tw",))
# print(conn.fetchone())
# conn.close()