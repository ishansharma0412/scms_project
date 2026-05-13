import json
import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import date
import ai_engine 

app = FastAPI() 

# 1. MOUNT STATIC FOLDER (For Images)
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 2. CORS SETTINGS (Fixed: No duplicates)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "complaints.json"

def load_db():
    if not os.path.exists(DB_FILE):
        return []
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

# --- MODELS ---
class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateSchema(BaseModel):
    status: str
    estimated_days: int

class ChatRequest(BaseModel):
    message: str
    history: list = []
    context: str

# --- API ENDPOINTS ---

@app.post("/login")
def login_user(req: LoginRequest):
    # Hardcoded Credentials for Demo
    if req.email == "admin@abes.edu" and req.password == "admin123":
        return {
            "success": True, 
            "role": "admin", 
            "token": "fake-jwt-token-admin",
            "message": "Welcome Admin"
        }
    elif req.email == "student@abes.edu" and req.password == "student123":
        return {
            "success": True, 
            "role": "student", 
            "token": "fake-jwt-token-student",
            "message": "Welcome Student"
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid Email or Password")

@app.get("/complaints")
def get_complaints():
    return load_db()

@app.post("/complaints")
async def create_complaint(
    title: str = Form(...), 
    description: str = Form(...),
    image: UploadFile = File(None)
):
    current_db = load_db()
    
    # Image Handling (Fixed: Relative URL for Render)
    image_url = None
    if image:
        file_extension = image.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"uploads/{unique_filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/{unique_filename}" # Removed 127.0.0.1

    # AI Analysis (NLP)
    ai_result = ai_engine.analyze_text(description)
    
    new_complaint = {
        "id": len(current_db) + 1,
        "title": title,
        "description": description,
        "image": image_url,
        "category": ai_result["category"],
        "sentiment": ai_result["sentiment"],
        "priority": ai_result["priority"],
        "ai_solution": ai_result["solution"],
        "status": "Pending",
        "admin_viewed": False,
        "estimated_days": 0,
        "date": str(date.today())
    }
    
    current_db.insert(0, new_complaint)
    save_db(current_db)
    return new_complaint

@app.put("/complaints/{id}")
def update_complaint(id: int, update: dict):
    db = load_db()
    for c in db:
        if c["id"] == id:
            c["status"] = update.get("status", c["status"])
            c["estimated_days"] = update.get("estimated_days", c["estimated_days"])
            c["admin_viewed"] = True 
            save_db(db)
            return c
    raise HTTPException(status_code=404, detail="Not found")

@app.put("/complaints/{id}/verify")
def verify_complaint(id: int):
    db = load_db()
    for c in db:
        if c["id"] == id:
            c["status"] = "Closed"
            save_db(db)
            return c
    raise HTTPException(status_code=404, detail="Not found")

@app.put("/complaints/{id}/reopen")
def reopen_complaint(id: int):
    db = load_db()
    for c in db:
        if c["id"] == id:
            c["status"] = "Reopened"
            c["priority"] = "High"
            c["admin_viewed"] = False
            save_db(db)
            return c
    raise HTTPException(status_code=404, detail="Not found")

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    response_text = ai_engine.chat_with_ai(req.message, req.history, req.context)
    return {"response": response_text}