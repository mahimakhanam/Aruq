from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from PyPDF2 import PdfReader

import base64
import io
import json
import logging
import os
import requests
from typing import Optional

load_dotenv()

# --------------------------------------------------
# App + Logging
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger("aruq-backend")

app = FastAPI(
    title="A'ruq Moderation Backend",
    version="2.0.0"
)

# --------------------------------------------------
# Environment / Config
# --------------------------------------------------

DEFAULT_ALLOWED_ORIGINS = [
    "https://aruq-forked.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://aruq-palestinian-heritage.vercel.app",
]

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
ALLOWED_ORIGINS = (
    [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
    if allowed_origins_env
    else DEFAULT_ALLOWED_ORIGINS
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

MAX_PDF_SIZE_MB = 20
MAX_IMAGE_SIZE_MB = 10

FORBIDDEN_WORDS = [
    "spam",
    "illegal",
    "copyright-infringement",
    "advertisement",
    "hate",
    "violence",
]

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("Allowed origins: %s", ALLOWED_ORIGINS)

# --------------------------------------------------
# Models
# --------------------------------------------------

class ModerateRequest(BaseModel):
    text: str


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def success_response(category: str = "safe", reason: Optional[str] = None, status_code: int = 200):
    payload = {
        "status": "approved",
        "category": category,
    }
    if reason:
        payload["reason"] = reason
    return JSONResponse(status_code=status_code, content=payload)


def flagged_response(reason: str, category: str = "unsafe", status_code: int = 200):
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "flagged",
            "category": category,
            "reason": reason,
        },
    )


def error_response(reason: str, details: Optional[str] = None, status_code: int = 500):
    payload = {
        "status": "error",
        "reason": reason,
    }
    if details:
        payload["details"] = details
    return JSONResponse(status_code=status_code, content=payload)


def fast_filter(text: str):
    lowered = text.lower()

    for word in FORBIDDEN_WORDS:
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
            logger.error("Groq API error %s: %s", response.status_code, response.text)
            return {
                "status": "error",
                "reason": f"Groq API error: {response.status_code}",
                "details": response.text
            }

        result = response.json()
        content = result["choices"][0]["message"]["content"].strip()
        return parse_json_response(content)

    except requests.RequestException as exc:
        logger.exception("Groq API request failed")
        return {
            "status": "error",
            "reason": f"AI request failed: {str(exc)}"
        }
    except Exception as exc:
        logger.exception("Unexpected Groq error")
        return {
            "status": "error",
            "reason": f"Unexpected AI error: {str(exc)}"
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


def extract_pdf_text(file_bytes: bytes):
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


def is_pdf_file(uploaded_file: UploadFile):
    filename = (uploaded_file.filename or "").lower()
    content_type = (uploaded_file.content_type or "").lower()

    return filename.endswith(".pdf") or content_type == "application/pdf"


def is_image_file(uploaded_file: UploadFile):
    content_type = (uploaded_file.content_type or "").lower()
    return content_type.startswith("image/")


def validate_file_size(file_bytes: bytes, max_size_mb: int):
    max_bytes = max_size_mb * 1024 * 1024
    return len(file_bytes) <= max_bytes


# --------------------------------------------------
# Routes
# --------------------------------------------------

@app.get("/")
async def root():
    return {"message": "A'ruq moderation backend is running"}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "A'ruq moderation backend",
        "groq_configured": bool(GROQ_API_KEY),
        "allowed_origins": ALLOWED_ORIGINS,
    }


@app.post("/moderate")
async def moderate(request: ModerateRequest):
    text = request.text.strip()

    if not text:
        return error_response("Text input is required", status_code=400)

    logger.info("Text moderation request received")

    fast_result = fast_filter(text)
    if fast_result:
        return flagged_response(fast_result["reason"])

    safety_result = text_safety_check(text)
    if safety_result.get("status") == "error":
        return error_response(
            safety_result.get("reason", "Text moderation failed"),
            safety_result.get("details"),
            status_code=500
        )

    if safety_result.get("status") == "flagged":
        return flagged_response(
            safety_result.get("reason", "Unsafe text")
        )

    return success_response()


@app.post("/moderate-document")
async def moderate_document(file: UploadFile = File(...)):
    try:
        logger.info("Document moderation request received: %s", file.filename)

        if not is_pdf_file(file):
            return error_response(
                "Only PDF files are supported for document moderation",
                status_code=400
            )

        file_bytes = await file.read()

        if not file_bytes:
            return error_response("Uploaded document is empty", status_code=400)

        if not validate_file_size(file_bytes, MAX_PDF_SIZE_MB):
            return error_response(
                f"PDF file is too large. Maximum size is {MAX_PDF_SIZE_MB} MB",
                status_code=400
            )

        text = extract_pdf_text(file_bytes)

        if not text:
            return flagged_response("Could not extract text from document")

        fast_result = fast_filter(text)
        if fast_result:
            return flagged_response(fast_result["reason"])

        safety_result = text_safety_check(text)
        if safety_result.get("status") == "error":
            return error_response(
                safety_result.get("reason", "Document moderation failed"),
                safety_result.get("details"),
                status_code=500
            )

        if safety_result.get("status") == "flagged":
            return flagged_response(
                safety_result.get("reason", "Unsafe document content")
            )

        return success_response()

    except Exception as exc:
        logger.exception("Document processing failed")
        return error_response(f"Document processing failed: {str(exc)}", status_code=500)


@app.post("/moderate-image")
async def moderate_image(file: UploadFile = File(...)):
    try:
        logger.info("Image moderation request received: %s", file.filename)

        if not GROQ_API_KEY:
            return error_response("GROQ_API_KEY is missing", status_code=500)

        if not is_image_file(file):
            return error_response(
                "Only image files are supported for image moderation",
                status_code=400
            )

        file_bytes = await file.read()

        if not file_bytes:
            return error_response("Uploaded image is empty", status_code=400)

        if not validate_file_size(file_bytes, MAX_IMAGE_SIZE_MB):
            return error_response(
                f"Image file is too large. Maximum size is {MAX_IMAGE_SIZE_MB} MB",
                status_code=400
            )

        encoded_image = base64.b64encode(file_bytes).decode("utf-8")
        mime_type = file.content_type if file.content_type else "image/jpeg"

        safety_result = image_safety_check(encoded_image, mime_type)
        if safety_result.get("status") == "error":
            return error_response(
                safety_result.get("reason", "Image moderation failed"),
                safety_result.get("details"),
                status_code=500
            )

        if safety_result.get("status") == "flagged":
            return flagged_response(
                safety_result.get("reason", "Unsafe image")
            )

        return success_response()

    except Exception as exc:
        logger.exception("Image processing failed")
        return error_response(f"Image moderation failed: {str(exc)}", status_code=500)
