import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Using 'gemini-1.5-flash' as it is more stable and widely supported
    _model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config={"response_mime_type": "application/json"},
    )
else:
    # Do not crash during import if API key is missing.
    # We will check it later when the service is actually called.
    _model = None

# --------------------------------------------------------------------------- #
#  Helpers
# --------------------------------------------------------------------------- #

def _safe_parse(text: str) -> dict:
    """Try to extract valid JSON from the model's response."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Grab the first {...} block if the model wraps JSON in markdown fences
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse JSON from Gemini response: {text!r}")


# --------------------------------------------------------------------------- #
#  Step 1 – Intent extraction
# --------------------------------------------------------------------------- #

INTENT_PROMPT_TEMPLATE = """
You are an intent extraction engine. Analyze the user's raw input and return ONLY valid JSON — no markdown, no explanation.

User input: {user_input}

Return exactly this JSON shape:
{{
  "intent": "<short label for what the user wants to accomplish>",
  "entities": ["<key noun / entity 1>", "<key noun / entity 2>"],
  "urgency": "<low | medium | high>"
}}
"""


def extract_intent(user_input: str) -> dict:
    """Call Gemini to extract intent, entities and urgency from raw input."""
    if _model is None:
        raise ValueError("GEMINI_API_KEY not configured in .env file")
    
    prompt = INTENT_PROMPT_TEMPLATE.format(user_input=user_input)
    try:
        response = _model.generate_content(prompt)
        return _safe_parse(response.text)
    except Exception as e:
        error_msg = str(e)
        if "403" in error_msg:
            raise ValueError("Gemini API Key is invalid or has been reported as leaked. Please generate a new key at https://aistudio.google.com/app/apikey")
        if "404" in error_msg:
            raise ValueError(f"Model 'gemini-1.5-flash' not found or not supported. Error: {error_msg}")
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


def generate_actions(intent_data: dict) -> dict:
    """Call Gemini to validate intent data and produce actionable steps."""
    if _model is None:
        raise ValueError("GEMINI_API_KEY not configured in .env file")
    
    prompt = ACTION_PROMPT_TEMPLATE.format(
        intent_json=json.dumps(intent_data, indent=2)
    )
    try:
        response = _model.generate_content(prompt)
        return _safe_parse(response.text)
    except Exception as e:
        error_msg = str(e)
        if "403" in error_msg:
            raise ValueError("Gemini API Key is invalid or has been reported as leaked. Please generate a new key at https://aistudio.google.com/app/apikey")
        if "404" in error_msg:
            raise ValueError(f"Model 'gemini-1.5-flash' not found or not supported. Error: {error_msg}")
        raise ValueError(f"Gemini API Error: {error_msg}")
