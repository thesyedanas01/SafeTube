import base64
import io
import json
import logging
from typing import Optional, Dict

import google.generativeai as genai
from PIL import Image
import requests

from app.config.settings import settings
from app.models.schemas import AnalysisRequest

logger = logging.getLogger(__name__)

# Initialize Gemini
if settings.GEMINI_API_KEY:
    logger.info("Initializing Gemini Vision API...")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    # We use gemini-2.5-flash as it is fast and supports image inputs
    generation_config = {
        "temperature": 0.1,
        "response_mime_type": "application/json",
    }
    _model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config=generation_config
    )
else:
    logger.warning("No GEMINI_API_KEY found. Unified scoring will be disabled.")
    _model = None


def _get_image_from_url(url: str) -> Optional[Image.Image]:
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content)).convert("RGB")
    except Exception as e:
        logger.warning("Failed to fetch image from %s: %s", url, e)
        return None


def _get_image_from_base64(b64_string: str) -> Optional[Image.Image]:
    try:
        if "," in b64_string:
            b64_string = b64_string.split(",", 1)[1]
        
        image_data = base64.b64decode(b64_string)
        return Image.open(io.BytesIO(image_data)).convert("RGB")
    except Exception as e:
        logger.warning("Failed to decode base64 image: %s", e)
        return None


def _prepare_text(request: AnalysisRequest) -> str:
    """Combine all text fields into a single string for Gemini context."""
    parts = []
    if request.channel_name:
        parts.append(f"Channel Name: {request.channel_name}")
    if request.title:
        parts.append(f"Title: {request.title}")
    if request.description:
        parts.append(f"Description: {request.description}")
    if request.transcript:
        words = request.transcript.split()
        truncated = " ".join(words[: settings.TRANSCRIPT_WORD_LIMIT])
        parts.append(f"Transcript: {truncated}")
        
    return "\n\n".join(parts)


def analyze_multimodal(request: AnalysisRequest) -> Dict[str, float]:
    """
    Analyzes the entire video (text context + images) using Gemini 2.5 Flash.
    Returns risk scores and educational score.
    """
    if not _model:
        # Fallback empty scores if no API key
        return {
            "violence": 0.0, "profanity": 0.0, "sexual_content": 0.0,
            "drugs": 0.0, "hate_speech": 0.0, "scary_content": 0.0,
            "educational_score": 0.0
        }

    text_context = _prepare_text(request)
    
    prompt = f"""
    You are a content safety AI. Analyze the following context from a YouTube video (text + provided images) and provide risk scores from 0 to 100 for the following categories:
    - "violence": blood, weapons, physical fighting, injury, gore (visual or described in detail).
    - "profanity": swear words, offensive gestures, explicit language in transcript.
    - "sexual_content": nudity, sexually suggestive poses, explicit sexual language.
    - "drugs": drug use, drug paraphernalia, pills, glorified smoking/vaping, alcohol abuse, or references in lyrics/transcript.
    - "hate_speech": hate symbols, slurs, attacks against protected groups.
    - "scary_content": horror elements, jump scares, disturbing imagery, monsters, excessive darkness/tension.
    
    Also, provide an "educational_score" from 0 to 100.
    - "educational_score": 100 means highly educational (coding tutorials, science docs, math lessons). 0 means purely entertainment (music videos, gaming let's plays without teaching).
    
    TEXT CONTEXT:
    {text_context}
    
    Return a JSON object where keys are the exact category names above, and values are the float scores from 0.0 to 100.0.
    """
    
    contents = [prompt]
    
    if request.thumbnail_url:
        img = _get_image_from_url(request.thumbnail_url)
        if img:
            contents.append(img)
            
    if request.video_frames_b64:
        for b64 in request.video_frames_b64:
            img = _get_image_from_base64(b64)
            if img:
                contents.append(img)

    try:
        response = _model.generate_content(contents)
        scores = json.loads(response.text)
        
        # Ensure all keys exist and are floats
        return {
            "violence": float(scores.get("violence", 0.0)),
            "profanity": float(scores.get("profanity", 0.0)),
            "sexual_content": float(scores.get("sexual_content", 0.0)),
            "drugs": float(scores.get("drugs", 0.0)),
            "hate_speech": float(scores.get("hate_speech", 0.0)),
            "scary_content": float(scores.get("scary_content", 0.0)),
            "educational_score": float(scores.get("educational_score", 0.0)),
        }
    except Exception as e:
        logger.error("Error scoring with Gemini: %s", e)
        # Raise the error so the frontend knows the API failed (e.g. quota limit)
        raise RuntimeError(f"Gemini API Error: {str(e)}")
