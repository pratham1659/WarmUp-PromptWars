from fastapi import APIRouter, HTTPException
from schemas.request import ProcessRequest
from schemas.response import ProcessResponse, Action
from services.gemini import extract_intent, generate_actions

router = APIRouter()


@router.post("/api/process", response_model=ProcessResponse)
async def process_input(body: ProcessRequest):
    """
    Two-step pipeline:
      1. Extract intent, entities and urgency from the raw user input.
      2. Validate intent data and generate concrete actions.
    """
    # ── Step 1: Intent extraction ──────────────────────────────────────────
    try:
        intent_data = extract_intent(body.input)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Intent extraction failed: {exc}",
        )

    # ── Step 2: Action generation ──────────────────────────────────────────
    try:
        action_data = generate_actions(intent_data)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Action generation failed: {exc}",
        )

    # ── Assemble response ─────────────────────────────────────────────────
    try:
        actions = [
            Action(
                description=a.get("description", ""),
                type=a.get("type", "other"),
                priority=a.get("priority", "medium"),
            )
            for a in action_data.get("actions", [])
        ]

        return ProcessResponse(
            intent=intent_data.get("intent", ""),
            urgency=intent_data.get("urgency", "medium"),
            user_message=action_data.get("user_message", ""),
            actions=actions,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Response assembly failed: {exc}",
        )
