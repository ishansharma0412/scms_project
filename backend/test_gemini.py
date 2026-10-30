import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"Key loaded: {api_key[:5]}...{api_key[-5:]}")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-flash-latest')
try:
    response = model.generate_content("Hello, world!")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
