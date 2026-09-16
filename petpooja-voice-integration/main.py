import os
import json
import base64
import asyncio
from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import HTMLResponse, Response
import uvicorn
from dotenv import load_dotenv

from agent import ConversationManager
from audio import DeepgramTranscriber, DeepgramSynthesizer, TranslatorAndLanguageDetector
load_dotenv()

app = FastAPI(title="Dineops AI Voice Agent")

# Twilio Configuration
TWILIO_SERVER_HOST = os.getenv("TWILIO_SERVER_HOST", "unsashed-crenulate-vince.ngrok-free.dev")

@app.get("/")
async def root():
    return {"message": "Dineops AI Voice Agent is running"}

@app.post("/incoming-call")
async def incoming_call(request: Request):
    """
    Twilio Webhook for incoming calls.
    Returns TwiML to connect to the /media-stream WebSocket.
    """
    form_data = await request.form()
    
    # If the call was initiated by our Outbound script, the user's number is in 'To'
    direction = form_data.get("Direction", "inbound")
    if direction == "outbound-api":
        caller_number = form_data.get("To", "Unknown")
    else:
        caller_number = form_data.get("From", "Unknown")
    print(f"[Twilio] Webhook triggered. User phone number parsed as: {caller_number}")

    host_no_protocol = TWILIO_SERVER_HOST.replace("https://", "").replace("http://", "")
    
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="wss://{host_no_protocol}/media-stream">
            <Parameter name="caller" value="{caller_number}"/>
        </Stream>
    </Connect>
</Response>"""
    return Response(content=twiml_response, media_type="text/xml")

@app.websocket("/media-stream")
async def media_stream(websocket: WebSocket):
    """
    WebSocket endpoint for Twilio Media Streams.
    Pipes audio to Deepgram (STT), text to Groq (LLM), and output text to ElevenLabs (TTS),
    then back to Twilio as audio.
    """
    await websocket.accept()
    print("[WebSocket] Connection accepted from Twilio")

    stream_sid = None
    caller_number = "Unknown"
    agent = None
    
    # In a fully production system, you would:
    # 1. Connect to Deepgram LiveClient here.
    # 2. Start a background task to receive Deepgram transcripts.
    # 3. For every final transcript, send to Groq Agent.
    # 4. Stream Groq's response chunks to ElevenLabs WebSocket.
    # 5. Receive mu-law audio from ElevenLabs and send to Twilio.

    # Initialize the Synthesizer and Translator
    synthesizer = DeepgramSynthesizer()
    translator = TranslatorAndLanguageDetector()

    async def send_audio_to_twilio(base64_audio: str):
        if stream_sid:
            msg = {
                "event": "media",
                "streamSid": stream_sid,
                "media": {
                    "payload": base64_audio
                }
            }
            await websocket.send_json(msg)

    async def send_clear_to_twilio():
        """Send a Clear message to instantly halt currently playing audio in Twilio."""
        if stream_sid:
            msg = {
                "event": "clear",
                "streamSid": stream_sid
            }
            await websocket.send_json(msg)

    # Callback when Deepgram hears speech
    agent_is_speaking = False
    
    async def on_transcript(transcript: str, is_final: bool):
        nonlocal agent_is_speaking
        
        # If user starts speaking while AI is speaking, interrupt it!
        if transcript and not is_final:
            if agent_is_speaking:
                print(f"[Interruption Detected] User started speaking: '{transcript}'")
                await send_clear_to_twilio()
                agent_is_speaking = False
            return # Wait for final transcript before passing to LLM
            
        if not is_final or not transcript.strip():
            return
            
        print(f"[User Original]: {transcript}")
        agent_is_speaking = False # User just finished talking
        
        # 1. Detect language and translate to English for LLM
        # user_lang = translator.detect_language(transcript)
        # english_transcript = translator.translate_to_english(transcript, user_lang)
        # if user_lang != 'en':
        #     print(f"[Translated to English for LLM]: {english_transcript}")
        user_lang = 'en'
        english_transcript = transcript
        
        # 2. Get LLM Response
        ai_response_english = await agent.process_user_input(english_transcript)
        print(f"[Agent thinking in English]: {ai_response_english}")
        
        # 3. Translate back to user's language
        # ai_response_localized = translator.translate_from_english(ai_response_english, user_lang)
        # if user_lang != 'en':
        #     print(f"[Agent speaking in {user_lang}]: {ai_response_localized}")
        # else:
        #     print(f"[Agent speaking]: {ai_response_localized}")
        ai_response_localized = ai_response_english
        print(f"[Agent speaking]: {ai_response_localized}")
        
        # 4. Synthesize and Stream Audio
        agent_is_speaking = True
        audio_bytes = await synthesizer.synthesize_to_mulaw(ai_response_localized)
        if audio_bytes and agent_is_speaking:
            b64_audio = base64.b64encode(audio_bytes).decode('utf-8')
            await send_audio_to_twilio(b64_audio)
            
    # Initialize STT
    deepgram_ws = DeepgramTranscriber(on_transcript)

    try:
        while True:
            # Receive message from Twilio
            message = await websocket.receive_text()
            data = json.loads(message)

            if data['event'] == 'start':
                stream_sid = data['start']['streamSid']
                caller_number = data['start'].get('customParameters', {}).get("caller", "Unknown")
                print(f"[Twilio] Stream started. Stream SID: {stream_sid}, Caller: {caller_number}")
                
                # Re-initialize agent with caller number
                agent = ConversationManager(phone_number=caller_number)
                
                # Initialize Deepgram STT stream here
                await deepgram_ws.connect()
                
                # Say initial greeting via Deepgram TTS
                intro_text = await agent.get_initial_greeting()
                print(f"[Agent speaking]: {intro_text}")
                audio_bytes = await synthesizer.synthesize_to_mulaw(intro_text)
                if audio_bytes:
                    b64_audio = base64.b64encode(audio_bytes).decode('utf-8')
                    await send_audio_to_twilio(b64_audio)
                
            elif data['event'] == 'media':
                # The payload contains base64 encoded audio from Twilio (8000Hz mulaw)
                audio_payload_base64 = data['media']['payload']
                audio_bytes = base64.b64decode(audio_payload_base64)
                
                # Send audio_bytes to Deepgram STT WebSocket
                await deepgram_ws.send_audio(audio_bytes)
                
            elif data['event'] == 'stop':
                print("[Twilio] Stream stopped.")
                if agent:
                    await agent.save_call_transcript()
                break

    except Exception as e:
        print(f"[WebSocket] Error: {e}")
    finally:
        print("[WebSocket] Connection closed.")
        if agent:
            await agent.save_call_transcript()
        await deepgram_ws.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
