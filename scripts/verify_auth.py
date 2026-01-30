import httpx
import asyncio
import os
import random
import string
from dotenv import load_dotenv

# Load env to get API key if needed, or just test local server
load_dotenv()

BASE_URL = "http://127.0.0.1:8000"

def generate_random_email():
    domain = "example.com"
    username = ''.join(random.choice(string.ascii_lowercase) for _ in range(10))
    return f"{username}@{domain}"

async def verify_auth():
    async with httpx.AsyncClient() as client:
        # 1. Health verify
        print("Checking health...")
        try:
            resp = await client.get(f"{BASE_URL}/")
            print(f"Root: {resp.status_code} {resp.json()}")
        except Exception as e:
            print(f"Failed to connect to server: {e}")
            return

        # 2. Register
        email = generate_random_email()
        password = "Password123!"
        print(f"\nRegistering user: {email}")
        
        resp = await client.post(f"{BASE_URL}/auth/register", json={
            "email": email, 
            "password": password
        })
        print(f"Register status: {resp.status_code}")
        if resp.status_code == 201:
            print("Register Success:", resp.json().keys())
        else:
            print("Register Failed:", resp.text)
            return

        # 3. Login
        print(f"\nLogging in user: {email}")
        resp = await client.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        print(f"Login status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            id_token = data.get("idToken")
            print("Login Success. Token prefix:", id_token[:20])
            
            # 4. Request Password Reset
            print(f"\nRequesting password reset for: {email}")
            resp = await client.post(f"{BASE_URL}/auth/password-reset-request", json={"email": email})
            print(f"Password Reset Status: {resp.status_code}")
            print("Response:", resp.json())

            # 5. Request Email Verification
            print(f"\nRequesting email verification...")
            resp = await client.post(
                f"{BASE_URL}/auth/verify-email", 
                headers={"Authorization": f"Bearer {id_token}"}
            )
            print(f"Email Verify Status: {resp.status_code}")
            print("Response:", resp.json())
            
            # 6. Logout
            print(f"\nLogging out...")
            resp = await client.post(f"{BASE_URL}/auth/logout")
            print(f"Logout Status: {resp.status_code}")
            print("Response:", resp.json())

        else:
            print("Login Failed:", resp.text)

if __name__ == "__main__":
    asyncio.run(verify_auth())
