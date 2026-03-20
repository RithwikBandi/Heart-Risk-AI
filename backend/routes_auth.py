"""
Auth routes: register and login.
These routes do not affect the /predict endpoint behavior.
"""

from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from bson import ObjectId

from db import get_database
from models.user import create_user, authenticate_user
from auth import issue_access_token


router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterBody(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


def _stringify_id(doc: Dict[str, Any]) -> Dict[str, Any]:
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc


@router.post("/register")
async def register(body: RegisterBody):
    db = get_database()
    try:
        user = await create_user(db, name=body.name, email=body.email, password=body.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    token = await issue_access_token(str(user["_id"]), user["email"], bool(user.get("isAdmin")))
    return {"token": token, "user": _stringify_id(user)}


@router.post("/login")
async def login(body: LoginBody):
    db = get_database()
    user = await authenticate_user(db, email=body.email, password=body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = await issue_access_token(str(user["_id"]), user["email"], bool(user.get("isAdmin")))
    return {"token": token, "user": _stringify_id(user)}

