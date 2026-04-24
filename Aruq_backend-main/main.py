from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
import io
import os
import base64
from PyPDF2 import PdfReader

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aruq-forked.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "https://aruq-palestinian-heritage.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


class ModerateRequest(BaseModel):
    text: str


def fast_filter(text: str):
    forbidden_words = [
        "spam",
        "illegal",
        "copyright-infringement",
        "advertisement",
        "hate",
        "violence",
    ]

    lowered = text.lower()
    for word in forbidden_words:
        if word in lowered:
            return {
                "status": "flagged",
                "category": "unsafe",
                "reason": f"Contains forbidden keyword: {word}"
            }

    return None


def parse_json_response(content: str):
    try:
        return json.loads(content)
    except Exception:
        return {
            "status": "error",
            "reason": "Model did not return valid JSON",
            "details": content
        }


def groq_chat_completion(model: str, messages: list, timeout: int = 30):
    if not GROQ_API_KEY:
        return {
            "status": "error",
            "reason": "GROQ_API_KEY is missing"
        }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": 0
            },
            timeout=timeout
        )

        if response.status_code != 200:
            return {
                "status": "error",
                "reason": f"Groq API error: {response.status_code}",
                "details": response.text
            }

        result = response.json()
        content = result["choices"][0]["message"]["content"].strip()
        return parse_json_response(content)

    except Exception as e:
        return {
            "status": "error",
            "reason": f"AI request failed: {str(e)}"
        }


def text_safety_check(text: str):
    messages = [
        {
            "role": "system",
            "content": (
                "You are a STRICT text safety moderation system.\n\n"
                "FLAG the text if it contains ANY of the following:\n"
                "- insults, harassment, bullying, or degrading language\n"
                "- profanity or cuss words\n"
                "- rude, disrespectful, or offensive tone\n"
                "- hate speech or violent content\n"
                "- spam, illegal, or inappropriate promotional content\n"
                "- sexually explicit content\n\n"
                "Return ONLY valid JSON in exactly one of these forms:\n"
                "{\"status\": \"approved\"}\n"
                "or\n"
                "{\"status\": \"flagged\", \"reason\": \"brief reason\"}\n\n"
                "Do not add markdown. Do not add explanations outside the JSON."
            )
        },
        {
            "role": "user",
            "content": text
        }
    ]

    return groq_chat_completion("llama-3.1-8b-instant", messages, timeout=20)


def extract_pdf_text(file_bytes):
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    return text.strip()


def image_safety_check(encoded_image: str, mime_type: str):
    messages = [
        {
            "role": "system",
            "content": (
                "You are a STRICT image safety moderation system.\n\n"
                "FLAG the image if it contains ANY of the following:\n"
                "- blood, wounds, visible injury, or physical harm\n"
                "- violence, assault, attack, fighting, or abuse\n"
                "- explosions, fire, destruction, disaster, or crash aftermath\n"
                "- weapons shown in a threatening, violent, or attack context\n"
                "- dangerous, criminal, disturbing, or offensive activity\n"
                "- hate symbols, extremist imagery, or offensive visual content\n"
                "- nudity, sexual content, or sexually explicit imagery\n\n"
                "Be conservative.\n"
                "If the image suggests harmful, threatening, disturbing, explicit, or unsafe content, FLAG it.\n"
                "If uncertain, prefer FLAGGED.\n\n"
                "Return ONLY valid JSON in exactly one of these forms:\n"
                "{\"status\": \"approved\"}\n"
                "or\n"
                "{\"status\": \"flagged\", \"reason\": \"brief reason\"}\n\n"
                "Do not add markdown. Do not add explanations outside the JSON."
            )
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Moderate this uploaded image strictly for safety."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime_type};base64,{encoded_image}"
                    }
                }
            ]
        }
    ]

    return groq_chat_completion(
        "meta-llama/llama-4-scout-17b-16e-instruct",
        messages,
        timeout=30
    )


@app.get("/")
async def root():
    return {"message": "A'ruq moderation backend is running"}


@app.post("/moderate")
async def moderate(request: ModerateRequest):
    fast_result = fast_filter(request.text)
    if fast_result:
        return fast_result

    safety_result = text_safety_check(request.text)
    if safety_result.get("status") == "error":
        return safety_result

    if safety_result.get("status") == "flagged":
        return {
            "status": "flagged",
            "category": "unsafe",
            "reason": safety_result.get("reason", "unsafe text")
        }

    return {
        "status": "approved",
        "category": "safe"
    }


@app.post("/moderate-document")
async def moderate_document(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        text = extract_pdf_text(file_bytes)

        if not text:
            return {
                "status": "flagged",
                "category": "unsafe",
                "reason": "Could not extract text from document"
            }

        fast_result = fast_filter(text)
        if fast_result:
            return fast_result

        safety_result = text_safety_check(text)
        if safety_result.get("status") == "error":
            return safety_result

        if safety_result.get("status") == "flagged":
            return {
                "status": "flagged",
                "category": "unsafe",
                "reason": safety_result.get("reason", "unsafe document content")
            }

        return {
            "status": "approved",
            "category": "safe"
        }

    except Exception as e:
        return {
            "status": "error",
            "reason": f"Document processing failed: {str(e)}"
        }


@app.post("/moderate-image")
async def moderate_image(file: UploadFile = File(...)):
    if not GROQ_API_KEY:
        return {
            "status": "error",
            "reason": "GROQ_API_KEY is missing"
        }

    try:
        file_bytes = await file.read()
        encoded_image = base64.b64encode(file_bytes).decode("utf-8")
        mime_type = file.content_type if file.content_type else "image/jpeg"

        safety_result = image_safety_check(encoded_image, mime_type)
        if safety_result.get("status") == "error":
            return safety_result

        if safety_result.get("status") == "flagged":
            return {
                "status": "flagged",
                "category": "unsafe",
                "reason": safety_result.get("reason", "unsafe image")
            }

        return {
            "status": "approved",
            "category": "safe"
        }

    except Exception as e:
        return {
            "status": "error",
            "reason": f"Image moderation failed: {str(e)}"
        }
