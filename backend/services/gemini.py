import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

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


def _get_model(model_name: str = None):
    """Get a GenerativeModel instance for the given model name."""
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured in .env file")
    name = model_name or DEFAULT_MODEL
    return genai.GenerativeModel(
        model_name=name,
        generation_config={"response_mime_type": "application/json"},
    )


# --------------------------------------------------------------------------- #
#  Helpers
# --------------------------------------------------------------------------- #

def _safe_parse(text: str) -> dict:
    """Try to extract valid JSON from the model's response."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse JSON from Gemini response: {text!r}")


def _build_image_part(image_bytes: bytes, mime_type: str) -> dict:
    """Create an inline image part for Gemini multimodal calls."""
    return {
        "inline_data": {
            "mime_type": mime_type,
            "data": image_bytes,
        }
    }


# --------------------------------------------------------------------------- #
#  Step 1 – Intent extraction (supports text + optional image)
# --------------------------------------------------------------------------- #

INTENT_PROMPT_TEMPLATE = """
You are an intent extraction engine. Analyze the user's raw input and return ONLY valid JSON — no markdown, no explanation.

User input: {user_input}

{image_context}

Return exactly this JSON shape:
{{
  "intent": "<short label for what the user wants to accomplish>",
  "entities": ["<key noun / entity 1>", "<key noun / entity 2>"],
  "urgency": "<low | medium | high>"
}}
"""


def extract_intent(user_input: str, image_bytes: bytes = None, image_mime: str = None, model_name: str = None) -> dict:
    """Call Gemini to extract intent, entities and urgency from raw input.
    Supports multimodal: text-only or text + image.
    """
    model = _get_model(model_name)

    image_context = "An image has also been provided by the user. Analyze it together with the text." if image_bytes else ""
    prompt_text = INTENT_PROMPT_TEMPLATE.format(user_input=user_input or "(no text provided, analyze the image)", image_context=image_context)

    content_parts = [prompt_text]
    if image_bytes and image_mime:
        content_parts.append(_build_image_part(image_bytes, image_mime))

    try:
        response = model.generate_content(content_parts)
        return _safe_parse(response.text)
    except Exception as e:
        error_msg = str(e)
        if "403" in error_msg:
            raise ValueError("Gemini API Key is invalid or has been reported as leaked. Please generate a new key at https://aistudio.google.com/app/apikey")
        if "404" in error_msg:
            raise ValueError(f"Model '{model_name or DEFAULT_MODEL}' not found. Error: {error_msg}")
        if "429" in error_msg:
            raise ValueError(f"Rate limit exceeded for model '{model_name or DEFAULT_MODEL}'. Try a different model or wait a moment.")
        raise ValueError(f"Gemini API Error: {error_msg}")


# --------------------------------------------------------------------------- #
#  Step 2 – Action generation
# --------------------------------------------------------------------------- #

ACTION_PROMPT_TEMPLATE = """
You are an action planning engine. Given structured intent data, return ONLY valid JSON — no markdown, no explanation.

Intent data:
{intent_json}

Return exactly this JSON shape:
{{
  "user_message": "<a one-sentence friendly summary of what will be done for the user>",
  "actions": [
    {{
      "description": "<what to do>",
      "type": "<calendar | email | reminder | task | search | other>",
      "priority": "<low | medium | high>"
    }}
  ]
}}

Generate 1-4 concrete, actionable steps. Infer priority from the urgency field.
"""


def generate_actions(intent_data: dict, model_name: str = None) -> dict:
    """Call Gemini to validate intent data and produce actionable steps."""
    model = _get_model(model_name)

    prompt = ACTION_PROMPT_TEMPLATE.format(
        intent_json=json.dumps(intent_data, indent=2)
    )
    try:
        response = model.generate_content(prompt)
        return _safe_parse(response.text)
    except Exception as e:
        error_msg = str(e)
        if "403" in error_msg:
            raise ValueError("Gemini API Key is invalid or has been reported as leaked. Please generate a new key at https://aistudio.google.com/app/apikey")
        if "404" in error_msg:
            raise ValueError(f"Model '{model_name or DEFAULT_MODEL}' not found. Error: {error_msg}")
        if "429" in error_msg:
            raise ValueError(f"Rate limit exceeded for model '{model_name or DEFAULT_MODEL}'. Try a different model or wait a moment.")
        raise ValueError(f"Gemini API Error: {error_msg}")
