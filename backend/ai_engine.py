import os
import json
import joblib
from textblob import TextBlob
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-flash-latest')
    print("Gemini API configured successfully.")
else:
    gemini_model = None
    print("Warning: GEMINI_API_KEY not found. Will use fallback logic.")

# Load fallback models safely at startup
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    category_model = joblib.load(os.path.join(BASE_DIR, 'category_model.pkl'))
    priority_model = joblib.load(os.path.join(BASE_DIR, 'priority_model.pkl'))
    fallback_models_loaded = True
except Exception as e:
    print(f"Fallback ML Models not found: {e}")
    fallback_models_loaded = False


def fallback_analyze_text(text: str):
    """Old keyword/RF based logic as a safety net."""
    text_lower = text.lower()
    
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    sentiment = "Negative" if polarity < -0.1 else "Positive" if polarity > 0.1 else "Neutral"
    
    category = "General"
    priority = "Low"
    solution = "Your complaint has been logged. The admin team will review it shortly."

    if any(w in text_lower for w in ["fire", "smoke", "spark", "gas"]):
        solution = "⚠️ URGENT: Evacuate immediately. Pull the nearest fire alarm."
    elif any(w in text_lower for w in ["wifi", "internet", "network", "slow"]):
        solution = "Try 'Forgetting' the network and re-joining or flushing DNS."

    if fallback_models_loaded:
        try:
            category = category_model.predict([text])[0]
            priority = priority_model.predict([text])[0]
        except:
            pass
            
    return {
        "category": category,
        "sentiment": sentiment,
        "priority": priority,
        "solution": solution
    }


def analyze_text(text: str):
    """Primary logic: Uses Gemini API. If it fails, uses fallback."""
    if gemini_model:
        try:
            prompt = f"""
            You are an AI assistant for a campus complaint management system.
            Analyze the following student complaint and extract the details in pure JSON format.
            The JSON must have exactly these 4 keys: "category", "sentiment", "priority", "solution".
            
            "category" options: Safety, Technical, Electrical, Maintenance, Plumbing, Infrastructure, Academic, Library, Housekeeping, Canteen, General.
            "sentiment" options: Positive, Neutral, Negative.
            "priority" options: Low, Medium, High.
            "solution" should be a helpful, direct 1-2 sentence advice or immediate action step for the student.

            Complaint: "{text}"
            
            Return ONLY valid JSON.
            """
            response = gemini_model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Remove markdown formatting if Gemini adds it (e.g. ```json ... ```)
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
                
            ai_data = json.loads(response_text)
            
            return {
                "category": ai_data.get("category", "General"),
                "sentiment": ai_data.get("sentiment", "Neutral"),
                "priority": ai_data.get("priority", "Low"),
                "solution": ai_data.get("solution", "Your complaint has been processed by AI and logged.")
            }
        except Exception as e:
            print(f"Gemini API failed: {e}. Falling back to old logic.")
            return fallback_analyze_text(text)
    else:
        return fallback_analyze_text(text)

def chat_with_ai(message: str, history: list, context: str):
    if gemini_model:
        try:
            prompt = f"Context about complaints: {context}\nUser: {message}\nProvide a short, helpful response:"
            response = gemini_model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Chat Exception: {e}")
            if "429" in str(e):
                return "You are asking too many questions too quickly! Please wait 1 minute for the AI limit to reset."
            return "I am currently offline or experiencing issues."
    return "I am your local SCMS AI assistant. I can categorize your complaints."