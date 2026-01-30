from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, words, podcasts
from app.db.mongodb import close_mongo_connection

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(words.router, prefix="/words", tags=["words"])
app.include_router(podcasts.router, prefix="/podcasts", tags=["podcasts"])

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
def read_root():
    return {"message": "Hello from backend!"}
