from pydantic import BaseModel


class ProcessRequest(BaseModel):
    input: str
