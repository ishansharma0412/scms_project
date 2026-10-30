import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro-latest')
try:
    response = model.generate_content("Hello, world!")
    print("SUCCESS: " + response.text)
except Exception as e:
    print(f"Error: {e}")
