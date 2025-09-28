from fastapi import FastAPI
from google import genai
from pydantic import BaseModel
from config.config import Settings

app = FastAPI(title="PaperTalk")
settings = Settings()
client = genai.Client(api_key=settings.GEMINI_API_KEY)

@app.get("/")
def hello():
    print("Hello World")
    return {"running..."}

class AskBody(BaseModel):
    query: str

@app.post("/ask")
def ask(body: AskBody):
    res = client.models.generate_content(
        model="gemini-2.5-flash", contents=body.query
    )
    return {"res": res.text}