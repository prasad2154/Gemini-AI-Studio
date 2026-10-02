# pip install fastapi uvicorn requests 
from fastapi import FastAPI

# create an object of FastAPI class
app = FastAPI()
print("FastAPI app created successfully.....Thank You!!!!")
@app.get("/")
def read_root():
    return {"message": "Good morning, G-38 group welcome to FAST API"}
