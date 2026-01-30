from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import UserCreate, UserLogin, FirebaseTokenResponse
from app.services.firebase_auth import sign_up_with_email, sign_in_with_email
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=FirebaseTokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    # 1. Sign up with Firebase
    firebase_response = await sign_up_with_email(user.email, user.password)
    
    # 2. Store in MongoDB
    # We use the 'localId' from firebase as the unique identifier
    user_doc = {
        "_id": firebase_response["localId"],
        "email": firebase_response["email"],
        "created_at": datetime.utcnow()
    }
    
    # Using upsert=True just in case of retry/race conditions, though Firebase should handle uniqueness
    await db["users"].update_one(
        {"_id": user_doc["_id"]}, 
        {"$set": user_doc}, 
        upsert=True
    )
    
    return firebase_response

@router.post("/login", response_model=FirebaseTokenResponse)
async def login(user: UserLogin):
    return await sign_in_with_email(user.email, user.password)
