from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class User(BaseModel):
    id: int | None = None
    email: str
    password: str
    name: str = Field(max_length=50)
    student_id: str | None = Field(default=None, max_length=20)
    department: str | None = Field(default=None, max_length=100)
    created_at: datetime | None = None

    # @field_validator("email")
    # @classmethod
    # def check_ccu_email(cls, v: str) -> str:
    #     if not v.endswith("@ccu.edu.tw"):
    #         raise ValueError("必須使用中正大學信箱 (@ccu.edu.tw)")
    #     return v

class Carpool(BaseModel):
    id: int | None = None
    poster_id: int
    origin: str = Field(max_length=100)
    destination: str = Field(max_length=100)
    departure_time: datetime
    seats_total: int = Field(gt=0)
    seats_left: int = Field(ge=0)                    
    cost: int = Field(default=0, ge=0)
    note: str | None = None
    status: Literal["open", "full", "closed", "cancelled"] = "open"
    created_at: datetime | None = None
    updated_at: datetime | None = None

    # @model_validator(mode="after")
    # def check_seats(self):
    #     if self.seats_left > self.seats_total:
    #         raise ValueError("剩餘座位不可超過總座位數")
    #     return self


# class CarpoolCreate(BaseModel):
#     """使用者發布共乘時前端送來的資料"""
#     origin: str = Field(max_length=100)
#     destination: str = Field(max_length=100)
#     departure_time: datetime
#     seats_total: int = Field(gt=0)
#     cost: int = Field(default=0, ge=0)
#     note: str | None = None

class EmailVertification(BaseModel):
    email: str

class CodeVertification(BaseModel):
    code: str
    user: User

class LoginFormat(BaseModel):
    email: str
    password: str

class CarpoolFilter(BaseModel):
    origin: str = Field(max_length=100)
    destination: str = Field(max_length=100)
    departure_time: datetime