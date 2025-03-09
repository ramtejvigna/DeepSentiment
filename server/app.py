# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pickle
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import re
import uvicorn

# Initialize FastAPI app
app = FastAPI(title="Sentiment Analysis API")

# Add CORS middleware to allow cross-origin requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://deep-sentiment.vercel.app"],  # For production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# Load the saved model
try:
    with open("model.pkl", "rb") as file:
        model = pickle.load(file)
except FileNotFoundError:
    raise Exception("Model file not found. Make sure to run the training script first.")

# Text preprocessing function (same as in the notebook)
regex_pattern = re.compile(r'[^a-zA-Z\s]')

def preprocess_text(text):
    text = str(text).lower()  # Convert to lowercase
    text = regex_pattern.sub('', text)  # Remove special characters
    words = word_tokenize(text)  # Tokenization
    stop_words = set(stopwords.words('english'))
    words = [word for word in words if word not in stop_words]  # Remove stopwords
    return ' '.join(words)

# Define request models
class TextInput(BaseModel):
    text: str

class BatchTextInput(BaseModel):
    texts: List[str]

class SentimentResponse(BaseModel):
    text: str
    sentiment: float
    sentiment_label: str

class BatchSentimentResponse(BaseModel):
    results: List[SentimentResponse]
    
# Mapping for sentiment labels
def get_sentiment_label(sentiment_score):
    if sentiment_score == 1.0:
        return "Positive"
    elif sentiment_score == 0.0:
        return "Neutral" 
    else:
        return "Negative"

@app.get("/")
async def root():
    return {"message": "Welcome to the Sentiment Analysis API"}

@app.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(input_data: TextInput):
    try:
        # Preprocess the text
        preprocessed_text = preprocess_text(input_data.text)
        
        # Make prediction
        sentiment = model.predict([preprocessed_text])[0]
        
        # Return the result
        return SentimentResponse(
            text=input_data.text,
            sentiment=float(sentiment),
            sentiment_label=get_sentiment_label(sentiment)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during sentiment analysis: {str(e)}")

@app.post("/analyze-batch", response_model=BatchSentimentResponse)
async def analyze_sentiment_batch(input_data: BatchTextInput):
    try:
        results = []
        
        # Preprocess all texts
        preprocessed_texts = [preprocess_text(text) for text in input_data.texts]
        
        # Make batch predictions
        sentiments = model.predict(preprocessed_texts)
        
        # Return the results
        for i, text in enumerate(input_data.texts):
            results.append(
                SentimentResponse(
                    text=text,
                    sentiment=float(sentiments[i]),
                    sentiment_label=get_sentiment_label(sentiments[i])
                )
            )
            
        return BatchSentimentResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during batch sentiment analysis: {str(e)}")

# Add an endpoint for recent analyses statistics
class AnalysisStats(BaseModel):
    facial_count: int
    text_count: int
    positive_percentage: float
    neutral_percentage: float
    negative_percentage: float

@app.get("/stats", response_model=AnalysisStats)
async def get_stats():
    
    return AnalysisStats(
        facial_count=24,
        text_count=36,
        positive_percentage=45.0,
        neutral_percentage=30.0,
        negative_percentage=25.0
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)