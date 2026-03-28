from pydantic import BaseModel
from typing import List, Optional


class PipelineStage(BaseModel):
    label: str
    status: str  # "pending" | "active" | "done" | "error"
    duration_ms: Optional[float] = None


class Action(BaseModel):
    description: str
    type: str
    priority: str


class ProcessResponse(BaseModel):
    intent: str
    urgency: str
    entities: List[str] = []
    user_message: str
    actions: List[Action]
    pipeline: List[PipelineStage] = []
