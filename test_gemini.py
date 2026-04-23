# test_gemini.py
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(
    api_key=os.getenv("AIML_API_KEY"),
    base_url="https://api.aimlapi.com/v1"
)

resp = client.chat.completions.create(
    model="google/gemini-2.5-pro",
    messages=[
        {"role": "user", "content": 'Respond only in JSON: {"base_price": 0.001, "category": "coding", "complexity": "Low"}'}
    ]
)
print(resp.choices[0].message.content)
