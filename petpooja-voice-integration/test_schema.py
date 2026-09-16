import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import certifi

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")

async def check_schema():
    if not MONGODB_URI:
        print("MONGODB_URI not found in environment.")
        return

    print(f"Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
    db = client.dineops_db
    
    collections = await db.list_collection_names()
    print("\n--- Collections Found ---")
    for col in collections:
        print(f"- {col}")
        
    print("\n--- Testing Specific Data Shapes ---")
    
    # Check users
    try:
        user = await db["users"].find_one({})
        print(f"Sample User Keys: {list(user.keys()) if user else 'No user found'}")
    except Exception as e:
        print("Error reading users:", e)
        
    # Check VoiceOrder
    try:
        order = await db["VoiceOrder"].find_one({})
        print(f"Sample VoiceOrder Keys: {list(order.keys()) if order else 'No orders found'}")
    except Exception as e:
        print("Error reading VoiceOrder:", e)
        
    # Check Category
    try:
        cat = await db["Category"].find_one({})
        print(f"Sample Category Keys: {list(cat.keys()) if cat else 'No categories found'}")
    except Exception as e:
        print("Error reading Category:", e)

    # Check FoodItem
    try:
        food = await db["FoodItem"].find_one({})
        print(f"Sample FoodItem Keys: {list(food.keys()) if food else 'No food items found'}")
    except Exception as e:
        print("Error reading FoodItem:", e)

    # Check Combo
    try:
        combo = await db["Combo"].find_one({})
        print(f"Sample Combo Keys: {list(combo.keys()) if combo else 'No combos found'}")
    except Exception as e:
        print("Error reading Combo:", e)

asyncio.run(check_schema())
