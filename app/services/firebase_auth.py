import httpx
from app.core.config import settings
from fastapi import HTTPException, status

FIREBASE_AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts"

async def sign_up_with_email(email: str, password: str):
    url = f"{FIREBASE_AUTH_URL}:signUp?key={settings.FIREBASE_API}"
    payload = {"email": email, "password": password, "returnSecureToken": True}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)
        
    if response.status_code != 200:
        error_data = response.json()
        error_msg = error_data.get("error", {}).get("message", "Unknown error")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Firebase Register Error: {error_msg}"
        )
    return response.json()

async def sign_in_with_email(email: str, password: str):
    url = f"{FIREBASE_AUTH_URL}:signInWithPassword?key={settings.FIREBASE_API}"
    payload = {"email": email, "password": password, "returnSecureToken": True}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)

    if response.status_code != 200:
        error_data = response.json()
        error_msg = error_data.get("error", {}).get("message", "Unknown error")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Firebase Login Error: {error_msg}"
        )
    return response.json()
