from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Response model from Firebase usually includes these fields
class FirebaseTokenResponse(BaseModel):
    idToken: str
    email: EmailStr
    refreshToken: str
    expiresIn: str
    localId: str

class EmailRequest(BaseModel):
    email: EmailStr
