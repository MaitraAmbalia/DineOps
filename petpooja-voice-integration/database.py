import os
from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from dotenv import load_dotenv

load_dotenv()

# --- Setup MongoDB Connection ---
MONGODB_URI = os.getenv("MONGODB_URI")
client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
db = client.dineops_db  # Using 'dineops_db' as default database for writes
test_db = client.test  # Using 'test' database for reading datasets

# --- Database Collections ---
users_collection = db["users"]
restaurants_collection = db["restaurants"]
menu_collection = test_db["fooditems"]      # Food items in test dataset
categories_collection = test_db["categories"]
combos_collection = test_db["combos"]       # Combos in test dataset
orders_collection = db["VoiceOrder"]
transcripts_collection = db["Transcript"]
tables_collection = db["tables"]


# --- Database Operations (CRUD) ---

async def get_menu() -> List[Dict]:
    """Retrieve all food items from the menu."""
    cursor = menu_collection.find({}, {"_id": 0})
    return await cursor.to_list(length=100)

async def get_combos() -> List[Dict]:
    """Retrieve all combos."""
    cursor = combos_collection.find({}, {"_id": 0})
    return await cursor.to_list(length=100)

async def check_table_availability(time_str: str, persons: int) -> Dict:
    """ Check if any table is available for a given time. """
    tables = await tables_collection.find({}).to_list(length=100)
    for table in tables:
        if time_str not in table.get("time_slots_booked", []):
            return {"available": True, "table_no": table["table_no"]}
    
    # If not available, find available slots
    # Simple dummy logic for available slots:
    all_slots = ["18:00", "19:00", "20:00", "21:00", "22:00"]
    available_slots = []
    for table in tables:
        for slot in all_slots:
            if slot not in table.get("time_slots_booked", []) and slot not in available_slots:
                available_slots.append(slot)
            if len(available_slots) >= 2:
                break
    return {"available": False, "alternate_slots": available_slots[:2]}

async def book_table(table_no: int, time_str: str) -> bool:
    """Book a time slot for a table"""
    result = await tables_collection.update_one(
        {"table_no": table_no},
        {"$push": {"time_slots_booked": time_str}}
    )
    return result.modified_count > 0

async def create_order(
    phone_no: str, 
    customer_name: str, 
    order_type: str, 
    address: str, 
    items: List[Dict], 
    total_price: float, 
    call_successful: bool = True,
    upsell_successful: bool = False
) -> str:
    """ Create a new order according to the VoiceOrder schema """
    import uuid
    import difflib
    order_id = str(uuid.uuid4())[:8] # Simple short order id
    
    # Process items to ensure they match: foodId, name, qty, price
    processed_items = []
    
    # Pre-fetch all available menu items and combos for fuzzy matching
    all_menu_items = await menu_collection.find({}, {"name": 1, "foodId": 1, "price": 1}).to_list(length=1000)
    all_combos = await combos_collection.find({}, {"name": 1, "comboId": 1, "totalPrice": 1}).to_list(length=1000)
    
    name_map = {}
    for doc in all_menu_items:
        if doc.get("name"):
            name_map[doc["name"].lower()] = {"id": doc.get("foodId", ""), "price": doc.get("price"), "actual_name": doc["name"]}
            
    for doc in all_combos:
        if doc.get("name"):
            name_map[doc["name"].lower()] = {"id": doc.get("comboId", ""), "price": doc.get("totalPrice"), "actual_name": doc["name"]}
            
    available_names = list(name_map.keys())
    
    for item in items:
        food_name = item.get("name", "")
        food_id = str(uuid.uuid4())
        actual_name = food_name
        actual_price = float(item.get("price", 0))
        
        matches = difflib.get_close_matches(food_name.lower(), available_names, n=1, cutoff=0.5)
        
        if matches:
            matched_doc = name_map[matches[0]]
            food_id = matched_doc["id"] or food_id
            actual_name = matched_doc["actual_name"]
            
            # Use price from database if available
            db_price = matched_doc["price"]
            if db_price is not None:
                try:
                    actual_price = float(db_price)
                except ValueError:
                    pass
        
        # In schema VoiceOrder: items -> [{ foodId, name, qty, price }]
        processed_items.append({
            "foodId": food_id,
            "name": actual_name,
            "qty": int(item.get("quantity", item.get("qty", 1))),
            "price": actual_price
        })

    # Store exact JSON VoiceOrder schema asked by user
    order = {
        "orderId": order_id,
        "phoneNo": phone_no,
        "customerName": customer_name,
        "orderType": order_type if order_type in ["delivery", "pickup", "dine-in"] else "delivery",
        "address": address if order_type.lower() == "delivery" else "",
        "time": datetime.utcnow().strftime("%I:%M %p"),
        "status": "pending",
        "kotStatus": "pending",
        "items": processed_items,
        "totalPrice": float(total_price),
        "callSuccessful": call_successful,
        "upsellSuccessful": upsell_successful,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    await orders_collection.insert_one(order)
    return order_id

async def save_transcript(phone_no: str, messages: List[Dict], order_id: Optional[str] = None):
    """ Save the conversation transcript """
    import uuid
    transcript_id = str(uuid.uuid4())
    
    # Format messages to {speaker, text}
    formatted_messages = []
    for msg in messages:
        formatted_messages.append({
            "speaker": "agent" if msg.get("role") == "assistant" else "user",
            "text": msg.get("text", msg.get("content", ""))
        })

    transcript = {
        "transcriptId": transcript_id,
        "phoneNo": phone_no,
        "orderId": order_id if order_id else "",
        "timestamp": datetime.utcnow(),
        "messages": formatted_messages,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    await transcripts_collection.insert_one(transcript)
    return transcript_id

async def cancel_order(order_id: str) -> Dict:
    """Cancel an order only if it exists. (5 mins logic can be handled by the caller or AI agent context)"""
    order = await orders_collection.find_one({"orderId": order_id})
    if not order:
        return {"success": False, "message": "Order does not exist"}
    
    # Check 5 minutes rule
    time_diff = datetime.utcnow() - order.get("createdAt", datetime.utcnow())
    if time_diff.total_seconds() > 300: # 5 minutes
        return {"success": False, "message": "Order cannot be cancelled after 5 minutes"}
    
    await orders_collection.update_one(
        {"orderId": order_id},
        {"$set": {"status": "cancelled"}}
    )
    return {"success": True, "message": f"Order {order_id} cancelled successfully."}

async def get_user_by_phone(phone: str) -> Optional[Dict]:
    # Looking up user by phoneNo index
    return await users_collection.find_one({"phoneNo": phone}, {"_id": 0})
