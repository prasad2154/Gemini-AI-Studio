# pip install fastapi uvicorn requests
# pip install python-multipart
# to run: uvicorn main:app --reload
# “Uvicorn is a high-performance ASGI(Asynchronous Server Gateway Interface.) server 
# used to run FastAPI applications. 
# It receives HTTP requests, passes them to FastAPI, 
# and returns the generated response to the client.”

"""
Client
   ↓ HTTP request
Uvicorn — ASGI Server
   ↓ ASGI communication
FastAPI — ASGI Application
   ↓
Your API function
"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
import logging 


logging.basicConfig(level=logging.INFO)


logging.info("Starting Gemini API Backend...")
app = FastAPI()

# Allow frontend to access backend
# CORS- Cross-Origin Resource Sharing (CORS) is a security feature implemented by web browsers 
# to restrict web pages from making requests to a different domain than the one that served the web page. 
# This is done to prevent malicious websites from accessing sensitive data on other domains without permission.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.info("Gemini API Backend initialized successfully.")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" + GEMINI_API_KEY

@app.get("/")
def read_root():
    return {"message": "Welcome to the Gemini API Backend!"}
    
# 1. Text Summarization Endpoint
@app.post("/summarize")
def summarize(text: str = Form(...)):
    print('Received text for summarization:', text)
    prompt = f"Summarize the following paragraph:\n{text}"
    logging.info("Sending summarization request to Gemini API...")
    response = requests.post(GEMINI_API_URL, json={"contents": [{"parts": [{"text": prompt}]}]})
    data = response.json()
    logging.info("Received response from Gemini API: %s", data)
    if "candidates" in data:
        summary = data["candidates"][0].get("content", {}).get("parts", [{}])[0].get("text", "Error")
        return JSONResponse({"summary": summary})
        logging.info("Summarization successful.")
    else:
        error_msg = data.get("error", {}).get("message", str(data))
        logging.error("Summarization failed: %s", error_msg)
        return JSONResponse({"summary": f"Gemini API Error: {error_msg}"})

# 2. Image Explanation Endpoint
@app.post("/explain-image")
def explain_image(file: UploadFile = File(...)):
    image_bytes = file.file.read()
    # Gemini expects base64-encoded image
    import base64
    image_b64 = base64.b64encode(image_bytes).decode()
    prompt = "Explain the content of this image."
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": file.content_type, "data": image_b64}}
            ]
        }]
    }
    response = requests.post(GEMINI_API_URL, json=payload)
    data = response.json()
    if "candidates" in data:
        explanation = data["candidates"][0].get("content", {}).get("parts", [{}])[0].get("text", "Error")
        return JSONResponse({"explanation": explanation})
    else:
        error_msg = data.get("error", {}).get("message", str(data))
        return JSONResponse({"explanation": f"Gemini API Error: {error_msg}"})

# 3. Chatbot Endpoint
@app.post("/chat")
def chat(message: str = Form(...)):
    if message.lower() in ["quit", "exit"]:
        return JSONResponse({"response": "Session ended."})
    prompt = f"You are a helpful QA bot. Answer the following:\n{message}"
    response = requests.post(GEMINI_API_URL, json={"contents": [{"parts": [{"text": prompt}]}]})
    data = response.json()
    if "candidates" in data:
        answer = data["candidates"][0].get("content", {}).get("parts", [{}])[0].get("text", "Error")
        return JSONResponse({"response": answer})
    else:
        error_msg = data.get("error", {}).get("message", str(data))
        return JSONResponse({"response": f"Gemini API Error: {error_msg}"})
