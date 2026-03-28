import os
from google.cloud import vision

async def analyze_image(image_content: bytes) -> dict:
    """
    Analyzes an image using Google Cloud Vision API.
    Extracts labels and text (OCR).
    """
    if not image_content:
        return {}

    try:
        # Initialize the async client
        client = vision.ImageAnnotatorAsyncClient()
        
        # Create an Image object from the content
        image = vision.Image(content=image_content)
        
        # Prepare the features we want to extract
        features = [
            vision.Feature(type_=vision.Feature.Type.LABEL_DETECTION),
            vision.Feature(type_=vision.Feature.Type.TEXT_DETECTION)
        ]
        
        request = vision.AnnotateImageRequest(image=image, features=features)
        
        # Make the API call
        response = await client.annotate_image(request=request)
        
        # Check for API error response
        if response.error.message:
            print(f"Vision API Warning: {response.error.message}")
            return {}
            
        result = {}
        
        # Extract Labels
        if response.label_annotations:
            labels = [label.description for label in response.label_annotations]
            result['labels'] = labels
            
        # Extract Text
        if response.text_annotations:
            # The first element contains the entire text found in the image.
            text = response.text_annotations[0].description
            result['text'] = text
            
        return result
        
    except Exception as e:
        print(f"Vision API Integration Error: {e}")
        return {}
