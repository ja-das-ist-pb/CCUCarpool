from fastapi import FastAPI
from src.backend.model import *
from src.backend.crud import *
from . import smtp
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
EMAILVERTIFICATION_CODE = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/apitest")
def apitest():
    return {"all":"good"}

@app.post("/vertify/email")
def vertify_email(req: EmailVertification):
    global EMAILVERTIFICATION_CODE
    if email_exist(req.email):
        return {"exist": True}
    EMAILVERTIFICATION_CODE = smtp.send_vertification_code(req.email)
    return {"exist": False}

@app.post("/vertify/code")
def vertify_code(req: CodeVertification):
    if (req.code == EMAILVERTIFICATION_CODE):
        retUser = create_user(req.user)
        return {"status": True,
                "user": retUser}
    else:
        return {"status": False}

@app.post("/login")
def login(req: LoginFormat):
    # print("pwd in db:", check_password(req))
    # print("input pwd:", req.password)
    if check_password(req) == req.password:
        thisUser = get_user(req)
        return {"login": True,
                "user": thisUser}
    return {"login": False}

@app.post("/carpool/post")
def carpool_post(req: CarpoolPost):
    try:
        create_post(req)
        smtp.send_post_successful_message(req)
        return {"success": True}
    except Exception:
        return {"success": False}

@app.post("/carpool/filter")
def carpool_filter(req: CarpoolFilter):
    return {"posts": search_post(req)}

@app.post("/carpool/join")
def carpool_join(req: CarpoolJoin):
    join_user(req)
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host= "0.0.0.0", port= 8000)