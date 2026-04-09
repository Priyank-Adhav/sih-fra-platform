import os
import json
from groq import Groq

# Get API Key from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def extract_entities_groq(text):
    """
    Extract structured entities from FRA text using Groq (Llama 3.3)
    Input: Raw text string (English, Hindi, or Oriya)
    Output: Dictionary with extracted entities
    """
    if not GROQ_API_KEY:
        return {
            "error": "GROQ_API_KEY not found",
            "message": "Please set the GROQ_API_KEY environment variable."
        }

    if not text or text.strip() == "":
        return {"error": "Empty text provided"}

    client = Groq(api_key=GROQ_API_KEY)

    # Specific prompt for FRA documents
    prompt = f"""
You are an expert at extracting structured information from Forest Rights Act (FRA) documents. 
The document text may be in English, Hindi, or Oriya language.

Extract the following fields from the provided text and return ONLY a valid JSON object:

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
- Return null for fields where information is not found.
- Keep extracted text as close to original as possible.
- If multiple family members, list them separated by commas.
- For Hindi/Oriya text, extract the data exactly as it appears in those languages.
- Do NOT include any explanations or markdown formatting outside the JSON.

Text to process:
\"\"\"{text}\"\"\"
"""

    try:
        # Using Llama 3.3 70B for high-quality extraction
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a precise data extraction assistant. You output strictly valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Low temperature for consistency
            response_format={"type": "json_object"}  # Native JSON enforcement
        )

        result_text = completion.choices[0].message.content
        entities = json.loads(result_text)

        # Standardize field presence
        expected_fields = [
            "Name of Right Holder", "Serial No. of FRA Patta", 
            "Family Members", "Caste", "Address", 
            "Status", "Fees", "Specific Details"
        ]
        
        for field in expected_fields:
            if field not in entities:
                entities[field] = None
        
        return entities

    except Exception as e:
        return {
            "error": "Groq extraction failed",
            "message": str(e)
        }

def validate_groq_setup():
    """Verify API connectivity"""
    if not GROQ_API_KEY:
        return False, "GROQ_API_KEY is missing"
    try:
        client = Groq(api_key=GROQ_API_KEY)
        # Attempt to list models as a lightweight auth check
        client.models.list()
        return True, "Groq API setup is valid"
    except Exception as e:
        return False, f"Groq validation failed: {str(e)}"