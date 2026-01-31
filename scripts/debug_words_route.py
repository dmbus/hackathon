
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
# Import the route handler directly
# We need to hack the path to make imports work if running from root
import sys
sys.path.append(os.getcwd())

from app.routers.words import get_word_decks
from app.core.config import settings

load_dotenv()

class MockDB:
    def __init__(self, client):
        self.client = client
        
    def __getitem__(self, item):
        return self.client.get_database("hackathon")[item]
        
    def aggregate(self, pipeline):
        return self.client.get_database("hackathon")["words"].aggregate(pipeline)

async def debug_route():
    try:
        user = os.getenv("MONGO_USER")
        password = os.getenv("MONGO_PASSWORD")
        address = os.getenv("MONGO_ADDRESS")
        cluster = os.getenv("MONGO_CLUSTER")
        uri = f"mongodb+srv://{user}:{password}@{address}/?appName={cluster}"
        
        print("Connecting to DB...")
        client = AsyncIOMotorClient(uri)
        db = client.get_database("hackathon")
        
        print("Calling get_word_decks directly...")
        # get_word_decks expects 'db' argument which is the database object
        decks = await get_word_decks(db=db)
        
        print("\nResult:")
        for deck in decks:
            print(f"- {deck['title']} (Count: {deck['wordCount']})")
            
    except Exception as e:
        print(f"\nCRASHED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_route())
