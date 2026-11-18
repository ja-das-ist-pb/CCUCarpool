from fastapi import FastAPI
from src.backend.model import EmailVertification, CodeVertification, LoginFormat, CarpoolFilter
from src.backend.crud import *
from . import smtp

app = FastAPI()
EMAILVERTIFICATION_CODE = None

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
        create_user(req.user)
        return {"status": True}
    else:
        # print("req.code= ", req.code)
        # print("EMAILVERTIFICATION_CODE= ", EMAILVERTIFICATION_CODE)
        # print("equal,", req.code==EMAILVERTIFICATION_CODE)
        
        return {"status": False}

@app.post("/login")
def login(req: LoginFormat):
    # print("pwd in db:", check_password(req))
    # print("input pwd:", req.password)
    if check_password(req):
        return {"login": True}
    return {"login": False}

@app.post("/carpool")
def carpool_filter(req:CarpoolFilter):
    ...

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host= "0.0.0.0", port= 8000)