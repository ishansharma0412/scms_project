# 🎓 Smart Complaint Management System (SCMS) - AI Powered

An intelligent, full-stack campus grievance management portal built for modern educational institutions. This platform leverages **Artificial Intelligence (Google Gemini NLP)** to automatically categorize complaints, assign priority, perform sentiment analysis, and suggest preliminary solutions. 

This project is built to represent an authentic **4th Year B.Tech Level Project**, complete with an administrative dashboard, automated escalation logic, a smart student chatbot, and PDF reporting.

---

## ✨ Key Features

### 🤖 AI Integration (Gemini NLP)
- **Auto-Categorization**: Automatically routes complaints to specific departments (e.g., Plumbing, IT, Maintenance) based on the textual description.
- **Priority Detection**: Predicts the urgency (Low, Medium, High) of an issue.
- **Sentiment Analysis**: Evaluates the tone of the complaint to help administrators handle sensitive issues better.
- **AI-Suggested Solutions**: Provides students with immediate, temporary workarounds or guidelines before the admin even sees the complaint.

### 🛡️ Smart Workflow & Automation
- **Auto-Escalation**: Critical (High Priority) issues that are not resolved within a specified time limit are automatically marked as `ESCALATED` to alert higher management.
- **Two-Step Resolution**: When an Admin marks an issue as `Resolved`, the student must verify it and mark it as `Closed` with a 1-5 Star Rating and feedback.

### 👥 Dual User Portals
- **Student Dashboard**: Submit complaints with image evidence, track real-time status, verify resolved issues, and chat with the AI assistant.
- **Admin Operations Center**: A comprehensive dashboard featuring real-time analytics charts (Recharts), category distribution, active grievance tracking, and one-click **PDF Report Generation**.

---

## 🛠️ Technology Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS (for modern, responsive, and dynamic UI)
- Lucide React (for premium iconography)
- Recharts (for data visualization)
- React Router (for protected routing)

**Backend:**
- Python (FastAPI)
- Uvicorn (ASGI Server)
- Google Generative AI (Gemini SDK)
- FPDF (for PDF generation)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python 3.9+

### 1. Clone the repository
```bash
git clone https://github.com/ishansharma0412/scms_project.git
cd scms_project
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory and add your Gemini API Key:
```env
GEMINI_API_KEY=your_google_gemini_key_here
```

Start the FastAPI backend server:
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
Open a new terminal window.
```bash
cd frontend
npm install
npm run dev
```

---

## 📸 Usage

- **Student Login**: Use any valid Roll Number (e.g., `2300320100107`) and Name (`Ishan`).
- **Admin Login**: Use ID `admin` and Password `admin123`.

---

## 💡 Architecture & Logic Highlights
- The React frontend uses state-of-the-art hooks and HMR (Hot Module Replacement) for immediate UI feedback.
- The Backend uses a JSON-based local database (`complaints.json`, `users.json`) to keep the setup minimal and extremely portable.
- Strict route protection prevents students from accessing the admin dashboard and vice versa.

---

*Made for modern campuses to resolve issues faster and smarter.*
