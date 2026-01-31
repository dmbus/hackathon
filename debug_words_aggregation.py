
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def debug_mongo():
    user = os.getenv("MONGO_USER")
    password = os.getenv("MONGO_PASSWORD")
    address = os.getenv("MONGO_ADDRESS")
    cluster = os.getenv("MONGO_CLUSTER")
    
    if not all([user, password, address, cluster]):
        print("Missing Mongo env vars!")
        return

    # Construct URI exactly as in app/db/mongodb.py
    uri = f"mongodb+srv://{user}:{password}@{address}/?appName={cluster}"
    print(f"Connecting to: {uri.replace(password, '****')}")

    try:
        client = AsyncIOMotorClient(uri)
        # Using "hackathon" database as in app/db/mongodb.py
        db = client.get_database("hackathon")
        
        print(f"Connected to database: {db.name}")
        
        count = await db["words"].count_documents({})
        print(f"Total words in collection: {count}")
        
        if count == 0:
            print("Collection is empty!")
            return

        pipeline = [
            { "$match": { "cerf_level": "A1" } },
            { "$limit": 10 }
        ]
        cursor = db["words"].aggregate(pipeline)
        
        print("\nChecking audio for first 10 A1 words:")
        async for doc in cursor:
            word = doc.get('word')
            audio = doc.get('audio', {})
            print(f"Word: {word}")
            print(f"  Audio: {audio}")
            
            # Simulate words.py extraction
            for gender, url in audio.items():
                if url:
                    filename = url.split("/")[-1] if "/" in url else url
                    print(f"  -> Extracted {gender}: {filename}")

            
        if not found_any:
            print("Aggregation returned no results. Checking field names...")
            sample = await db["words"].find_one()
            print("\nSample document keys:", list(sample.keys()))
            if "cerf_level" not in sample:
                print("CRITICAL: 'cerf_level' field is missing!")
                
                # Check for typo (e.g. cefr_level)
                if "cefr_level" in sample:
                    print(f"Found 'cefr_level' instead! Value: {sample['cefr_level']}")
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_mongo())
