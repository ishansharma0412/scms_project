import google.generativeai as genai

# PASTE YOUR NEW KEY HERE
KEY = "PASTE_YOUR_NEW_KEY_HERE"

genai.configure(api_key=KEY)

try:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Say Hello")
    print("✅ SUCCESS! The AI replied:", response.text)
except Exception as e:
    print("❌ FAILURE. The Error is:", e)