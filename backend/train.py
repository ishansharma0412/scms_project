import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
import joblib
import os

def train_model():
    print("Loading dataset...")
    # Load dataset
    df = pd.read_csv('dataset.csv')
    
    X = df['text']
    y_category = df['category']
    y_priority = df['priority']
    
    # Create Pipeline for Category Prediction
    category_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english')),
        ('clf', RandomForestClassifier(random_state=42))
    ])
    
    # Create Pipeline for Priority Prediction
    priority_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english')),
        ('clf', RandomForestClassifier(random_state=42))
    ])
    
    print("Training Category Model...")
    category_pipeline.fit(X, y_category)
    
    print("Training Priority Model...")
    priority_pipeline.fit(X, y_priority)
    
    # Save the trained models in the current directory so ai_engine can find them easily
    joblib.dump(category_pipeline, 'category_model.pkl')
    joblib.dump(priority_pipeline, 'priority_model.pkl')
    
    print("Models saved successfully in the backend directory!")

if __name__ == '__main__':
    train_model()
