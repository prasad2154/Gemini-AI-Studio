from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
import os

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=" + GEMINI_API_KEY


def summarize(text: str = Form(...)):
    prompt = f"Summarize the following paragraph:\n{text}"
    response = requests.post(GEMINI_API_URL, json={"contents": [{"parts": [{"text": prompt}]}]})
    data = response.json()
    return data

respoonse = summarize("My self prasad savale. i am ai engineer. i am working in ai field from last 1 years. i have good knowledge of ai and ml. i have worked on many projects related to ai and ml. i have good knowledge of python, java, c++ and other programming languages. i have good knowledge of data structures and algorithms. i have good knowledge of database management systems. i have good knowledge of web development. i have good knowledge of cloud computing. i have good knowledge of devops. i have good knowledge of software engineering principles. i have good knowledge of software development life cycle. i have good knowledge of agile methodologies. i have good knowledge of project management. i have good knowledge of team management. i have good knowledge of communication skills. i have good knowledge of problem solving skills. i have good knowledge of analytical skills. i have good knowledge of critical thinking skills. i have good knowledge of decision making skills. i have good knowledge of leadership skills. i have good knowledge of time management skills. i have good knowledge of stress management skills. i have good knowledge of conflict resolution skills. i have good knowledge of negotiation skills. i have good knowledge of presentation skills. i have good knowledge of public speaking skills. i have good knowledge of interpersonal skills. i have good knowledge of emotional intelligence skills.")

# print(respoonse)
print(respoonse.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Error")    )
