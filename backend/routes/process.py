import time
import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from schemas.response import ProcessResponse, Action, PipelineStage
from services.gemini import extract_intent, generate_actions, AVAILABLE_MODELS

router = APIRouter()

# Allowed image MIME types
ALLOWED_MIMES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/heic"}


@router.get("/api/models")
async def list_models():
    """Return the list of available Gemini models."""
    return {"models": AVAILABLE_MODELS}


@router.post("/api/process", response_model=ProcessResponse)
async def process_input(
    text: str = Form(""),
    image: UploadFile = File(None),
    model: str = Form(""),
    location: str = Form(""),
):
    """
    Multipart/form-data endpoint.
    Accepts:
      - text  (optional form field)
      - image (optional file upload)
      - model (optional model id)

    Two-step pipeline:
      1. Extract intent, entities and urgency (multimodal if image provided).
      2. Generate concrete actions from the intent data.
    """
    pipeline: list[PipelineStage] = []
    selected_model = model.strip() if model else None

    # ── Validate inputs ────────────────────────────────────────────────────
    if not text.strip() and image is None and not location.strip():
        raise HTTPException(status_code=400, detail="Provide at least text, an image, or a location.")

    # ── Parse location if provided ─────────────────────────────────────────
    location_context = ""
    if location.strip():
        try:
            loc_data = json.loads(location)
            lat = loc_data.get("lat")
            lng = loc_data.get("lng")
            if lat is not None and lng is not None:
                location_context = f"\n\nUser's current location: latitude {lat}, longitude {lng} (Google Maps: https://www.google.com/maps?q={lat},{lng})"
        except (json.JSONDecodeError, AttributeError):
            pass

    # ── Read image bytes if provided ───────────────────────────────────────
    image_bytes = None
    image_mime = None
    if image is not None:
        image_mime = image.content_type
        if image_mime not in ALLOWED_MIMES:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported image type '{image_mime}'. Allowed: {', '.join(ALLOWED_MIMES)}",
            )
        image_bytes = await image.read()

    # ── Pipeline stage: Input Received ─────────────────────────────────────
    pipeline.append(PipelineStage(label="Input Received", status="done", duration_ms=0))

    # ── Step 1: Intent extraction ──────────────────────────────────────────
    t0 = time.perf_counter()
    try:
        intent_data = extract_intent(text + location_context, image_bytes=image_bytes, image_mime=image_mime, model_name=selected_model)
    except Exception as exc:
        pipeline.append(PipelineStage(label="Intent Extraction", status="error", duration_ms=(time.perf_counter() - t0) * 1000))
        raise HTTPException(status_code=502, detail=f"Intent extraction failed: {exc}")
    t1 = time.perf_counter()
    pipeline.append(PipelineStage(label="Intent Extraction", status="done", duration_ms=round((t1 - t0) * 1000, 1)))

    # ── Step 2: Action generation ──────────────────────────────────────────
    t2 = time.perf_counter()
    try:
        action_data = generate_actions(intent_data, model_name=selected_model)
    except Exception as exc:
        pipeline.append(PipelineStage(label="Action Generation", status="error", duration_ms=(time.perf_counter() - t2) * 1000))
        raise HTTPException(status_code=502, detail=f"Action generation failed: {exc}")
    t3 = time.perf_counter()
    pipeline.append(PipelineStage(label="Action Generation", status="done", duration_ms=round((t3 - t2) * 1000, 1)))

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

        pipeline.append(PipelineStage(label="Response Ready", status="done", duration_ms=0))

        return ProcessResponse(
            intent=intent_data.get("intent", ""),
            urgency=intent_data.get("urgency", "medium"),
            entities=intent_data.get("entities", []),
            user_message=action_data.get("user_message", ""),
            actions=actions,
            pipeline=pipeline,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Response assembly failed: {exc}")
