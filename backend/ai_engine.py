from textblob import TextBlob

def analyze_text(text: str):
    text_lower = text.lower()
    
    # 1. SENTIMENT ANALYSIS
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    if polarity < -0.1: sentiment = "Negative"
    elif polarity > 0.1: sentiment = "Positive"
    else: sentiment = "Neutral"

    # 2. INTELLIGENT KNOWLEDGE BASE
    # Default Response
    category = "General"
    priority = "Low"
    solution = "Your complaint has been logged. The admin team will review it shortly."

    # --- A. SAFETY & EMERGENCIES (HIGHEST PRIORITY) ---
    if any(w in text_lower for w in ["fire", "smoke", "spark", "burning smell", "gas leak"]):
        category = "Safety"
        priority = "High"
        solution = "⚠️ URGENT: Evacuate immediately via stairs. Do not use elevators. Pull the nearest fire alarm."
    
    elif any(w in text_lower for w in ["stuck", "elevator", "lift"]):
        category = "Safety"
        priority = "High"
        solution = "Stay calm. Do not force the doors. Press the Emergency Bell button for 3 seconds to alert security."
    
    elif any(w in text_lower for w in ["theft", "stolen", "fight", "ragging", "harassment"]):
        category = "Safety"
        priority = "High"
        solution = "Security has been alerted. Please stay in a safe location and document any evidence if safe to do so."

    # --- B. IT & TECHNICAL ---
    elif any(w in text_lower for w in ["wifi", "internet", "connect", "network", "slow"]):
        category = "Technical"
        priority = "Medium"
        solution = "Try 'Forgetting' the network and re-joining. If on a laptop, clear your DNS cache (ipconfig /flushdns)."
    
    elif any(w in text_lower for w in ["projector", "hdmi", "display", "screen"]):
        category = "Technical"
        priority = "Medium"
        solution = "Check HDMI cable connection. Press 'Windows + P' to duplicate screen. Ensure the projector source is set to 'Computer'."
    
    elif any(w in text_lower for w in ["printer", "paper", "jam", "ink"]):
        category = "Technical"
        priority = "Low"
        solution = "Check paper tray alignment. If jammed, do not pull forcefully. Use the secondary printer in the Lab while we fix this."

    elif "login" in text_lower or "password" in text_lower or "portal" in text_lower:
        category = "Technical"
        priority = "Medium"
        solution = "Ensure Caps Lock is off. You can reset your password at student-portal.edu/reset. IT is notified."

    # --- C. ELECTRICAL ---
    elif any(w in text_lower for w in ["light", "bulb", "dark", "tube", "flicker"]):
        category = "Electrical"
        priority = "Low"
        solution = "Use natural light or a desk lamp temporarily. Electrician will be dispatched to replace the fixture."
    
    elif any(w in text_lower for w in ["power", "outage", "blackout", "electricity", "socket", "plug"]):
        category = "Electrical"
        priority = "High"
        solution = "Check if the breaker has tripped. Do not touch exposed wires. Use emergency exits if visibility is low."
    
    elif any(w in text_lower for w in ["fan", "regulator", "noisy"]):
        category = "Electrical"
        priority = "Low"
        solution = "Switch off the fan to prevent overheating. Use windows for ventilation until the bearing is fixed."

    # --- D. HVAC (AC & COOLING) ---
    elif any(w in text_lower for w in ["ac", "air conditioner", "cooling", "hot", "warm"]):
        category = "Maintenance"
        priority = "Medium"
        solution = "Ensure all windows are closed. Set thermostat to 24°C. If leaking water, switch it off immediately."

    # --- E. PLUMBING & WATER ---
    elif any(w in text_lower for w in ["leak", "drip", "pipe", "flood"]):
        category = "Plumbing"
        priority = "High"
        solution = "Turn off the isolation valve (usually behind the fixture). Place a bucket to catch water and prevent slipping."
    
    elif any(w in text_lower for w in ["water", "supply", "tank", "tap"]):
        category = "Plumbing"
        priority = "High"
        solution = "Water supply issue noted. Please use the reserve tank water sparingly. Tankers have been ordered."
    
    elif any(w in text_lower for w in ["flush", "toilet", "clog", "block"]):
        category = "Plumbing"
        priority = "High"
        solution = "Do not flush again to prevent overflow. Use the adjacent stall. Housekeeping is on the way."

    # --- F. CLASSROOM & FURNITURE ---
    elif any(w in text_lower for w in ["chair", "table", "desk", "broken", "furniture"]):
        category = "Infrastructure"
        priority = "Low"
        solution = "Do not use the broken furniture to avoid injury. Move it to the corner. Carpenter will repair it."
    
    elif any(w in text_lower for w in ["board", "chalk", "marker", "duster"]):
        category = "Academic"
        priority = "Low"
        solution = "Please collect supplies from the Admin Office (Room 101). We will refill the classroom stock shortly."

    # --- G. LIBRARY & BOOKS ---
    elif any(w in text_lower for w in ["book", "library", "noise", "librarian"]):
        category = "Library"
        priority = "Low"
        solution = "For missing books, check the OPAC online catalog. For noise complaints, alert the desk staff immediately."

    # --- H. HOSTEL & HYGIENE ---
    elif any(w in text_lower for w in ["garbage", "dustbin", "smell", "dirty", "clean"]):
        category = "Housekeeping"
        priority = "Medium"
        solution = "Please seal the bag if possible. Cleaning staff has been assigned to this zone for immediate action."
    
    elif any(w in text_lower for w in ["pest", "rat", "insect", "bug", "cockroach"]):
        category = "Housekeeping"
        priority = "Medium"
        solution = "Avoid leaving food open. Pest control spray is scheduled. Housekeeping will clean the area."
    
    elif any(w in text_lower for w in ["food", "canteen", "mess", "meal"]):
        category = "Canteen"
        priority = "Medium"
        solution = "Feedback noted. If food is spoiled, do not consume. Report to the Mess Manager immediately."

    # 3. SENTIMENT OVERRIDE
    # If the user is very angry (Negative sentiment), bump priority up one level
    if sentiment == "Negative" and priority == "Low":
        priority = "Medium"
    elif sentiment == "Negative" and priority == "Medium":
        priority = "High"

    return {
        "category": category,
        "sentiment": sentiment,
        "priority": priority,
        "solution": solution
    }