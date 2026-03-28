from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app
import json
import io

client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer mock-token-for-tests"}

# ── Route Integration Tests ──────────────────────────────────────────

def test_process_unauthorized():
    """Test 403/401 when attempting to use API without authentication."""
    response = client.post("/api/process")
    assert response.status_code in [401, 403]
    assert "Not authenticated" in response.json()["detail"]


def test_process_empty_request():
    """Test 400 when no text, location, or image is provided."""
    response = client.post("/api/process", headers=AUTH_HEADERS)
    assert response.status_code == 400
    assert "Provide at least text, an image, or a location" in response.json()["detail"]


@patch("routes.process.process_all_in_one_async", new_callable=AsyncMock)
def test_process_successful_text(mock_process):
    """Test standard valid text processing path."""
    mock_process.return_value = {
        "intent": "Booking flight",
        "entities": ["flight", "NY"],
        "urgency": "high",
        "user_message": "Let me arrange that flight to NY for you.",
        "actions": [
            {"description": "Find NY flights tonight", "type": "search", "priority": "high"}
        ]
    }
    response = client.post("/api/process", data={"text": "Book me a flight to NY tonight!"}, headers=AUTH_HEADERS)
    
    # Verifying HTTP 200
    assert response.status_code == 200
    data = response.json()
    
    # Assert correct response mapping
    assert data["intent"] == "Booking flight"
    assert data["urgency"] == "high"
    assert len(data["entities"]) == 2
    assert len(data["actions"]) == 1
    assert data["actions"][0]["description"] == "Find NY flights tonight"
    
    # Assert dual pipeline preservation output
    assert len(data["pipeline"]) == 4  # Received, Intent, Action, Ready
    assert data["pipeline"][1]["label"] == "Intent Extraction"
    assert data["pipeline"][2]["label"] == "Action Generation"


@patch("routes.process.process_all_in_one_async", new_callable=AsyncMock)
def test_process_invalid_image_mime(mock_process):
    """Test that submitting an unsupported image type fails securely."""
    fake_file = io.BytesIO(b"fake data")
    response = client.post(
        "/api/process", 
        data={"text": "Look at my document"},
        files={"image": ("my_doc.pdf", fake_file, "application/pdf")},
        headers=AUTH_HEADERS
    )
    assert response.status_code == 415
    assert "Unsupported image type" in response.json()["detail"]


@patch("routes.process.process_all_in_one_async", new_callable=AsyncMock)
def test_process_ai_failure(mock_process):
    """Test resilient handling of AI layer crashes."""
    mock_process.side_effect = ValueError("Gemini API Error: Rate limit exceeded")
    
    response = client.post("/api/process", data={"text": "test error handling"}, headers=AUTH_HEADERS)
    assert response.status_code == 502
    
    assert "Gemini API Error: Rate limit exceeded" in response.text
