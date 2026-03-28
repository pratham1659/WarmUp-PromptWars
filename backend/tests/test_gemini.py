import asyncio
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from services.gemini import process_all_in_one_async, _build_image_part

# ── Utility tests ──────────────────────────────────────────────────────

def test_build_image_part():
    """Test accurate dictionary creation for multimodal parts."""
    image_dict = _build_image_part(b"mock_bytes", "image/png")
    assert "inline_data" in image_dict
    assert image_dict["inline_data"]["mime_type"] == "image/png"
    assert image_dict["inline_data"]["data"] == b"mock_bytes"

# ── Async API Integration tests (Mocked) ───────────────────────────────

@patch("services.gemini._get_model")
def test_process_all_in_one_success(mock_get_model):
    """Test the complete fast path for standard text to ensure prompts format natively."""
    mock_model = MagicMock()
    
    # Mock the returned GenerativeModel response
    mock_response = MagicMock()
    mock_response.text = '{"intent": "mocked text", "urgency": "medium", "actions": [{"description": "do task"}]}'
    
    # Generate content async must return immediately in test execution
    mock_model.generate_content_async = AsyncMock(return_value=mock_response)
    mock_get_model.return_value = mock_model
    
    result = asyncio.run(process_all_in_one_async("Do this amazing mocked task"))
    
    # Verify exact JSON dictionary returned
    assert result["intent"] == "mocked text"
    assert len(result["actions"]) == 1
    assert result["actions"][0]["description"] == "do task"
    
    # Verify the Generative API was properly appended with the prompt string
    mock_model.generate_content_async.assert_called_once()
    call_args = mock_model.generate_content_async.call_args[0][0]
    assert "User input: Do this amazing mocked task" in call_args[0]


@patch("services.gemini._get_model")
def test_process_all_in_one_error(mock_get_model):
    """Test edge case: The API throws rate limit or key error."""
    mock_model = MagicMock()
    mock_model.generate_content_async = AsyncMock(side_effect=Exception("429 Rate limited backend"))
    mock_get_model.return_value = mock_model
    
    with pytest.raises(ValueError, match="Rate limit exceeded"):
        asyncio.run(process_all_in_one_async("Try again fast"))
