import json
import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import date, datetime, timedelta
import ai_engine 
from fpdf import FPDF

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
USERS_FILE = "users.json"

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

def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def save_users(data):
    with open(USERS_FILE, "w") as f:
        json.dump(data, f, indent=4)

# --- MODELS ---
class LoginRequest(BaseModel):
    email: str # Used as Roll No for students, Admin ID for admins
    password: str

class SignupRequest(BaseModel):
    roll_no: str
    name: str
    password: str

class UpdateSchema(BaseModel):
    status: str
    estimated_days: int

class ChatRequest(BaseModel):
    message: str
    history: list = []
    context: str

# --- API ENDPOINTS ---

@app.post("/signup/student")
def signup_student(req: SignupRequest):
    users = load_users()
    for u in users:
        if u["roll_no"] == req.roll_no:
            raise HTTPException(status_code=400, detail="Roll No already registered")
    
    new_user = {
        "roll_no": req.roll_no,
        "name": req.name,
        "password": req.password,
        "role": "student"
    }
    users.append(new_user)
    save_users(users)
    return {"success": True, "message": "Student registered successfully"}

@app.post("/login")
def login_user(req: LoginRequest):
    # Admin Check
    if req.email == "admin" and req.password == "admin123":
        return {
            "success": True, 
            "role": "admin", 
            "token": "fake-jwt-token-admin",
            "name": "Admin",
            "message": "Welcome Admin"
        }
    
    # Student Check
    users = load_users()
    for u in users:
        if u["roll_no"] == req.email and u["password"] == req.password:
            return {
                "success": True,
                "role": "student",
                "token": "fake-jwt-token-" + u["roll_no"],
                "name": u["name"],
                "roll_no": u["roll_no"],
                "message": "Welcome Student"
            }
            
    raise HTTPException(status_code=401, detail="Invalid Credentials")

@app.get("/complaints")
def get_complaints():
    db = load_db()
    modified = False
    now = datetime.now()
    for c in db:
        if c.get("status") in ["Pending", "Reopened"] and c.get("priority") == "High":
            ts_str = c.get("timestamp")
            if ts_str:
                try:
                    ts = datetime.fromisoformat(ts_str)
                    if now - ts > timedelta(minutes=2): # 2 mins for demo
                        c["status"] = "ESCALATED"
                        modified = True
                except:
                    pass
    if modified:
        save_db(db)
    return db

@app.post("/complaints")
async def create_complaint(
    title: str = Form(...), 
    description: str = Form(...),
    roll_no: str = Form(...),
    student_name: str = Form(...),
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
        "roll_no": roll_no,
        "student_name": student_name,
        "image": image_url,
        "category": ai_result["category"],
        "sentiment": ai_result["sentiment"],
        "priority": ai_result["priority"],
        "ai_solution": ai_result["solution"],
        "status": "Pending",
        "admin_viewed": False,
        "estimated_days": 0,
        "date": str(date.today()),
        "timestamp": datetime.now().isoformat(),
        "rating": 0,
        "feedback": ""
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

@app.delete("/complaints/{id}")
def withdraw_complaint(id: int):
    db = load_db()
    for i, c in enumerate(db):
        if c["id"] == id:
            del db[i]
            save_db(db)
            return {"success": True, "message": "Complaint withdrawn successfully"}
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

class RateSchema(BaseModel):
    rating: int
    feedback: str = ""

@app.put("/complaints/{id}/rate")
def rate_complaint(id: int, req: RateSchema):
    db = load_db()
    for c in db:
        if c["id"] == id:
            c["rating"] = req.rating
            c["feedback"] = req.feedback
            save_db(db)
            return c
    raise HTTPException(status_code=404, detail="Not found")

@app.get("/report/download")
def download_report():
    db = load_db()
    total = len(db)
    resolved = len([c for c in db if c.get("status") in ["Closed", "Resolved"]])
    escalated = len([c for c in db if c.get("status") == "ESCALATED"])
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="SCMS Admin Analytics Report", ln=True, align='C')
    
    pdf.set_font("Arial", size=12)
    pdf.ln(10)
    pdf.cell(200, 10, txt=f"Total Complaints: {total}", ln=True)
    pdf.cell(200, 10, txt=f"Resolved/Closed: {resolved}", ln=True)
    pdf.cell(200, 10, txt=f"Escalated (Critical): {escalated}", ln=True)
    
    pdf.ln(10)
    pdf.cell(200, 10, txt="End of Report", ln=True)
    
    report_path = "uploads/admin_report.pdf"
    pdf.output(report_path)
    return FileResponse(report_path, filename="SCMS_Admin_Report.pdf", media_type="application/pdf")