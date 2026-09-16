import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_PHONE_NUMBER')

client = Client(account_sid, auth_token) if account_sid and auth_token else None

def send_order_sms(to_number: str, order_id: str, total_price: float, call_successful: bool = True):
    if not client or not twilio_number:
        print("[Twilio SMS] Credentials not configured properly. Cannot send SMS.")
        return False
        
    if call_successful:
        message_body = f"Thank you for your order from Dineops!\nOrder ID: {order_id}\nTotal Bill: ₹{total_price}\nYour delicious food will be on its way shortly."
    else:
        message_body = "We're sorry, we couldn't complete your order from Dineops at this time. Please try calling back later."
    
    try:
        message = client.messages.create(
            body=message_body,
            from_=twilio_number,
            to=to_number
        )
        print(f"[Twilio SMS] Successfully sent order receipt to {to_number}. SID: {message.sid}")
        return True
    except Exception as e:
        print(f"[Twilio SMS] Error sending SMS: {e}")
        return False
