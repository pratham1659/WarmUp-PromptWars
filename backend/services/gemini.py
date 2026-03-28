import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
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
    prompt = INTENT_PROMPT_TEMPLATE.format(user_input=user_input)
    response = _model.generate_content(prompt)
    return _safe_parse(response.text)


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
    prompt = ACTION_PROMPT_TEMPLATE.format(
        intent_json=json.dumps(intent_data, indent=2)
    )
    response = _model.generate_content(prompt)
    return _safe_parse(response.text)
