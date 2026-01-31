from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import certifi
import logging
logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None

db = MongoDB()

async def get_database():
    if db.client is None:
        uri = f"mongodb+srv://{settings.MONGO_USER}:{settings.MONGO_PASSWORD}@{settings.MONGO_ADDRESS}/?appName={settings.MONGO_CLUSTER}"
        try:
            # Use certifi for SSL certificate verification to fix SSL handshake issues
            db.client = AsyncIOMotorClient(
                uri, 
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=5000,  # Reduce timeout for faster feedback
                connectTimeoutMS=5000,
            )
            # Test the connection
            await db.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            db.client = None
            raise
    return db.client.get_database("hackathon")

async def close_mongo_connection():
    if db.client:
        db.client.close()
