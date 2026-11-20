import smtplib
from email.message import EmailMessage
from src.backend.text import password
from . import crud
import random
from src.backend.model import *
from datetime import datetime


def send_vertification_code(email: str):
    msg = EmailMessage()
    msg["From"] = "ccucarpoolboot@gmail.com"
    msg["To"] = email
    msg["Subject"] = "【CCU Carpool】驗證碼通知"
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.set_debuglevel(1)
        server.starttls()
        server.login(msg["From"], password)
        
        code = random.randint(100000, 999999)
        msg.set_content(f"您好:\n\n驗證碼為: {code}\n\n謝謝")
        server.send_message(msg)
    return str(code)

def send_post_successful_message(req: CarpoolPost):
    email = crud.search_email(req.poster_id)
    msg = EmailMessage()
    msg["From"] = "ccucarpoolboot@gmail.com"
    msg["To"] = email
    msg["Subject"] = "【CCU Carpool】已新增共乘"
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        # server.set_debuglevel(1)
        server.starttls()
        server.login(msg["From"], password)
        
        msg.set_content(f"""
共乘資訊 :
From: {req.origin}
To: {req.destination}
Departure Date: {req.departure_time.strftime("%Y/%m/%d")}
Departure Time: {req.departure_time.strftime("%H:%M")}
Total Seats: {req.seats_total}

感謝您的支持
Best Regards
""")
        server.send_message(msg)


# send_vertification_code("paulpb0725@alum.ccu.edu.tw")