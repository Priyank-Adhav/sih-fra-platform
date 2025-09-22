import os
import json
from google import genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def extract_entities_gemini(text):
    """
    Extract structured entities from text using Gemini AI
    Input: Raw text string
    Output: Dictionary with extracted entities
    """
    # Check if API key is available
    if not GEMINI_API_KEY:
        return {
            "error": "GEMINI_API_KEY not found", 
            "message": "Please set GEMINI_API_KEY environment variable. Get a free API key from https://makersuite.google.com/app/apikey"
        }
    
    prompt = f"""
You are an expert at extracting structured information from Forest Rights Act (FRA) documents. The document text may be in English, Hindi, or Oriya language.

Extract the following fields from the provided text and return ONLY valid JSON format:

{{
    "Name of Right Holder": "string or null",
    "Serial No. of FRA Patta": "string or null", 
    "Family Members": "string or null",
    "Caste": "string or null",
    "Address": "string or null",
    "Status": "string or null",
    "Fees": "string or null",
    "Specific Details": "string or null"
}}

Instructions:
- The text may be in English, Hindi, or Oriya language
- Return null for fields where information is not found
- Keep extracted text as close to original as possible
- If multiple family members, list them separated by commas
- For addresses, include the complete address information
- For fees, include currency and amount if mentioned
- If text is in Hindi/Oriya, extract the information as it appears in the document

Text to process:
\"\"\"{text}\"\"\"

Respond with ONLY the JSON object, no additional text or explanations.
"""
    
    try:
        # Initialize Gemini client
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Create a chat session
        chat = client.chats.create(model="gemini-2.0-flash-exp")
        
        # Send the prompt
        response = chat.send_message_stream(prompt)
        
        # Collect the full response
        result_text = ""
        for chunk in response:
            result_text += chunk.text
        
        # Clean up the response text
        result_text = result_text.strip()
        
        # Remove markdown formatting if present
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        result_text = result_text.strip()
        
        # Parse the JSON response
        try:
            entities = json.loads(result_text)
            
            # Validate that we have the expected structure
            expected_fields = [
                "Name of Right Holder", "Serial No. of FRA Patta", 
                "Family Members", "Caste", "Address", 
                "Status", "Fees", "Specific Details"
            ]
            
            # Ensure all expected fields are present
            for field in expected_fields:
                if field not in entities:
                    entities[field] = None
            
            return entities
            
        except json.JSONDecodeError as json_error:
            return {
                "error": "Failed to parse Gemini response as JSON",
                "raw_output": result_text,
                "parse_error": str(json_error)
            }
        
    except Exception as e:
        error_msg = str(e).lower()
        
        if "api key" in error_msg or "unauthorized" in error_msg:
            return {
                "error": "Invalid Gemini API Key",
                "message": "Please check your GEMINI_API_KEY environment variable. Get a free API key from https://makersuite.google.com/app/apikey"
            }
        elif "quota" in error_msg or "limit" in error_msg:
            return {
                "error": "Gemini API quota exceeded",
                "message": str(e)
            }
        elif "network" in error_msg or "connection" in error_msg:
            return {
                "error": "Network connection failed",
                "message": "Unable to connect to Gemini API. Please check your internet connection."
            }
        else:
            return {
                "error": "Gemini API processing failed",
                "message": str(e)
            }

def validate_gemini_setup():
    """
    Validate that Gemini API is properly configured
    Returns: (is_valid, error_message)
    """
    if not GEMINI_API_KEY:
        return False, "GEMINI_API_KEY not set"
    
    try:
        # Test with a simple request
        client = genai.Client(api_key=GEMINI_API_KEY)
        chat = client.chats.create(model="gemini-2.0-flash-exp")
        response = chat.send_message_stream("Hello, this is a test.")
        
        # Consume the response to test connection
        test_response = ""
        for chunk in response:
            test_response += chunk.text
        
        return True, "Gemini API setup is valid"
        
    except Exception as e:
        return False, f"Gemini API validation failed: {str(e)}"

if __name__ == "__main__":
    # Test Gemini setup
    is_valid, message = validate_gemini_setup()
    print(f"Gemini Setup: {'✓' if is_valid else '✗'} {message}")
