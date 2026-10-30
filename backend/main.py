import os
import uuid
import requests
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from fpdf import FPDF
from pydantic import BaseModel
from datetime import date
import ai_engine

app = FastAPI()

# 1. MOUNT STATIC FOLDER (old images stored before Supabase Storage)
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

# 3. SUPABASE (database + image storage)
# The publishable key is safe to ship: users are only reachable through the
# signup_student / login_student database functions, never directly.
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://csxfuythydeltmaxzver.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_yE1K7DLreKSVmddqOSURCw_GPa4DxGj")
IMAGE_BUCKET = "complaint-images"
HEADERS = {"apikey": SUPABASE_KEY, "Content-Type": "application/json"}

def db(method, path, **kwargs):
    res = requests.request(method, f"{SUPABASE_URL}/rest/v1/{path}", headers={**HEADERS, **kwargs.pop("headers", {})}, timeout=15, **kwargs)
    if res.status_code >= 400:
        print(f"Supabase error {res.status_code}: {res.text}")
        raise HTTPException(status_code=500, detail="Database error. Please try again.")
    return res.json() if res.text else None

def rpc(name, params):
    return db("POST", f"rpc/{name}", json=params)

def update_complaint_row(id, fields):
    rows = db("PATCH", f"complaints?id=eq.{id}", json=fields, headers={"Prefer": "return=representation"})
    if not rows:
        raise HTTPException(status_code=404, detail="Not found")
    return rows[0]

# --- MODELS ---
class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    roll_no: str
    name: str
    password: str

class UpdateSchema(BaseModel):
    status: str
    estimated_days: int

class RateRequest(BaseModel):
    rating: int
    feedback: str = ""

class ChatRequest(BaseModel):
    message: str
    history: list = []
    context: str

# --- API ENDPOINTS ---

@app.post("/login")
def login_user(req: LoginRequest):
    # Hardcoded Credentials for Demo
    if req.email == "admin@abes.edu" and req.password == "admin@123":
        return {
            "success": True,
            "role": "admin",
            "token": "fake-jwt-token-admin",
            "message": "Welcome Admin"
        }
    elif req.email == "student@abes.edu" and req.password == "student@123":
        return {
            "success": True,
            "role": "student",
            "token": "fake-jwt-token-student",
            "name": "Demo Student",
            "roll_no": "student@abes.edu",
            "message": "Welcome Student"
        }

    # Registered students (roll no + password)
    result = rpc("login_student", {"p_roll_no": req.email, "p_password": req.password})
    if not result.get("success"):
        raise HTTPException(status_code=401, detail="Invalid Roll No / Email or Password")
    return {
        "success": True,
        "role": result["role"],
        "token": "fake-jwt-token-student",
        "name": result["name"],
        "roll_no": result["roll_no"],
        "message": f"Welcome {result['name']}"
    }

@app.post("/signup/student")
def signup_student(req: SignupRequest):
    result = rpc("signup_student", {"p_roll_no": req.roll_no, "p_name": req.name, "p_password": req.password})
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("detail", "Registration failed"))
    return {"success": True, "message": "Registration successful"}

@app.get("/complaints")
def get_complaints(roll_no: str = None):
    # Students pass their roll_no to see only their own complaints; admin gets all
    if roll_no:
        return db("GET", "complaints", params={"select": "*", "order": "id.desc", "roll_no": f"eq.{roll_no}"})
    return db("GET", "complaints?select=*&order=id.desc")

@app.post("/complaints")
async def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    roll_no: str = Form(None),
    student_name: str = Form(None),
    image: UploadFile = File(None)
):
    # Image goes to Supabase Storage so it survives redeploys
    image_url = None
    if image and image.filename:
        file_extension = image.filename.split(".")[-1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        res = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/{IMAGE_BUCKET}/{unique_filename}",
            headers={"apikey": SUPABASE_KEY, "Content-Type": image.content_type or "application/octet-stream"},
            data=await image.read(),
            timeout=30,
        )
        if res.status_code >= 400:
            print(f"Image upload failed {res.status_code}: {res.text}")
            raise HTTPException(status_code=500, detail="Image upload failed. Please try again.")
        image_url = f"{SUPABASE_URL}/storage/v1/object/public/{IMAGE_BUCKET}/{unique_filename}"

    # AI Analysis (NLP)
    ai_result = ai_engine.analyze_text(description)

    rows = db("POST", "complaints", headers={"Prefer": "return=representation"}, json={
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
        "date": str(date.today())
    })
    return rows[0]

@app.put("/complaints/{id}")
def update_complaint(id: int, update: dict):
    fields = {"admin_viewed": True}
    if "status" in update:
        fields["status"] = update["status"]
    if "estimated_days" in update:
        fields["estimated_days"] = int(update["estimated_days"] or 0)
    return update_complaint_row(id, fields)

@app.put("/complaints/{id}/verify")
def verify_complaint(id: int):
    return update_complaint_row(id, {"status": "Closed"})

@app.put("/complaints/{id}/reopen")
def reopen_complaint(id: int):
    return update_complaint_row(id, {"status": "Reopened", "priority": "High", "admin_viewed": False})

@app.put("/complaints/{id}/rate")
def rate_complaint(id: int, req: RateRequest):
    if not 1 <= req.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    return update_complaint_row(id, {"rating": req.rating, "feedback": req.feedback})

@app.delete("/complaints/{id}")
def delete_complaint(id: int):
    rows = db("DELETE", f"complaints?id=eq.{id}", headers={"Prefer": "return=representation"})
    if not rows:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}

@app.get("/report/download")
def download_report():
    complaints = db("GET", "complaints?select=*&order=id.asc")

    def clean(text, limit):
        # Core PDF fonts only support Latin-1
        text = str(text or "-").encode("latin-1", "replace").decode("latin-1")
        return text if len(text) <= limit else text[:limit - 3] + "..."

    pdf = FPDF(orientation="L")
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "FixFlow - Campus Complaint Report", ln=1)
    pdf.set_font("Arial", "", 10)
    total = len(complaints)
    closed = sum(1 for c in complaints if c["status"] == "Closed")
    pending = sum(1 for c in complaints if c["status"] in ("Pending", "Reopened"))
    pdf.cell(0, 7, f"Generated on {date.today()}   |   Total: {total}   Closed: {closed}   Pending/Reopened: {pending}", ln=1)
    pdf.ln(3)

    columns = [("ID", 12), ("Date", 24), ("Title", 70), ("Category", 35), ("Priority", 22), ("Status", 28), ("Days", 14), ("Rating", 16), ("Feedback", 56)]
    pdf.set_font("Arial", "B", 9)
    pdf.set_fill_color(13, 148, 136)
    pdf.set_text_color(255, 255, 255)
    for name, width in columns:
        pdf.cell(width, 8, name, border=1, fill=True)
    pdf.ln()

    pdf.set_font("Arial", "", 8)
    pdf.set_text_color(0, 0, 0)
    for c in complaints:
        values = [c["id"], c["date"], c["title"], c["category"], c["priority"], c["status"], c["estimated_days"], f"{c['rating']}/5" if c["rating"] else "-", c["feedback"]]
        for (name, width), value in zip(columns, values):
            pdf.cell(width, 7, clean(value, int(width / 1.7)), border=1)
        pdf.ln()

    if not complaints:
        pdf.cell(0, 8, "No complaints yet.", ln=1)

    data = pdf.output(dest="S")
    if isinstance(data, str):
        data = data.encode("latin-1")
    return Response(content=bytes(data), media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename=fixflow-report-{date.today()}.pdf"})

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    response_text = ai_engine.chat_with_ai(req.message, req.history, req.context)
    return {"response": response_text}
