from fastapi import FastAPI
from app.routers import auth
from app.db.mongodb import close_mongo_connection

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
def read_root():
    return {"message": "Hello from backend!"}
