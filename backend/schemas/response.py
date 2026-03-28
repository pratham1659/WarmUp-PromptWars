from pydantic import BaseModel
from typing import List


class Action(BaseModel):
    description: str
    type: str
    priority: str


class ProcessResponse(BaseModel):
    intent: str
    urgency: str
    user_message: str
    actions: List[Action]
