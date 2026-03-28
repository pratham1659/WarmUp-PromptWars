import os
import json
import google.generativeai as genai
from typing import List, TypedDict
from dotenv import load_dotenv


class ActionSchema(TypedDict):
    description: str
    type: str  # 'calendar', 'email', 'reminder', 'task', 'search', 'other'
    priority: str  # 'low', 'medium', 'high'


class OutputSchema(TypedDict):
    intent: str
    entities: List[str]
    urgency: str  # 'low', 'medium', 'high'
    user_message: str
    actions: List[ActionSchema]


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Default model
DEFAULT_MODEL = "gemini-2.5-flash"

# Available models for user selection
AVAILABLE_MODELS = [
    {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "tier": "free"},
    {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "tier": "paid"},
    {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "tier": "free"},
    {"id": "gemini-2.0-flash-lite", "name": "Gemini 2.0 Flash Lite", "tier": "free"},
]


def _get_model(model_name: str = None, system_instruction: str = None):
    """Get a GenerativeModel instance for the given model name."""
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured in .env file")
    name = model_name or DEFAULT_MODEL
    
    config = {
        "response_mime_type": "application/json",
        "response_schema": OutputSchema,
    }
    
    return genai.GenerativeModel(
        model_name=name,
        system_instruction=system_instruction,
        generation_config=config,
    )


# --------------------------------------------------------------------------- #
#  Helpers
# --------------------------------------------------------------------------- #

# `_safe_parse` has been removed as we use native JSON response_schema


def _build_image_part(image_bytes: bytes, mime_type: str) -> dict:
    """Create an inline image part for Gemini multimodal calls."""
    return {
        "inline_data": {
            "mime_type": mime_type,
            "data": image_bytes,
        }
    }


# --------------------------------------------------------------------------- #
#  Unified Pipeline – Process All in One
# --------------------------------------------------------------------------- #

SYSTEM_INSTRUCTION = """
You are an intent extraction and action planning engine.
Analyze the user's raw input (and optional image).

Return ONLY valid JSON matching this exact shape — no markdown, no explanation:
{
  "intent": "<short label for what the user wants to accomplish>",
  "entities": ["<key noun / entity 1>", "<key noun / entity 2>"],
  "urgency": "<low | medium | high>",
  "user_message": "<a one-sentence friendly summary of what will be done for the user>",
  "actions": [
    {
      "description": "<what to do>",
      "type": "<calendar | email | reminder | task | search | other>",
      "priority": "<low | medium | high>"
    }
  ]
}

Generate 1-4 concrete, actionable steps. Infer priority from the urgency field.
"""

async def process_all_in_one_async(user_input: str, image_bytes: bytes = None, image_mime: str = None, model_name: str = None, vision_context: dict = None) -> dict:
    """Call Gemini to extract intent and generate actions in a single async network request."""
    model = _get_model(model_name, system_instruction=SYSTEM_INSTRUCTION)

    image_context = "An image has also been provided by the user. Analyze it together with the text." if image_bytes else ""
    if vision_context:
        vision_info = "Google Cloud Vision API has analyzed the image and found the following:\n"
        if "labels" in vision_context:
            vision_info += f"Labels: {', '.join(vision_context['labels'])}\n"
        if "text" in vision_context:
            vision_info += f"Extracted Text:\n{vision_context['text']}\n"
        image_context += f"\n\n{vision_info}"

    prompt = f"User input: {user_input or '(no text provided, analyze the image)'}\n\n{image_context}"

    content_parts = [prompt]
    if image_bytes and image_mime:
        content_parts.append(_build_image_part(image_bytes, image_mime))

    try:
        # Utilize ASYNC generation to unblock FastAPI's event loop
        response = await model.generate_content_async(content_parts)
        return json.loads(response.text)
    except Exception as e:
        error_msg = str(e)
        if "403" in error_msg:
            raise ValueError("Gemini API Key is invalid or has been reported as leaked.")
        if "404" in error_msg:
            raise ValueError(f"Model '{model_name or DEFAULT_MODEL}' not found.")
        if "429" in error_msg:
            raise ValueError(f"Rate limit exceeded for model '{model_name or DEFAULT_MODEL}'.")
        raise ValueError(f"Gemini API Error: {error_msg}")
