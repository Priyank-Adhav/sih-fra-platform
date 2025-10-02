#!/usr/bin/env python3
"""
Test script to validate the document processing setup
"""
import os
from dotenv import load_dotenv
from ocr_service import validate_ocr_setup
from gemini_ner_service import validate_gemini_setup

# Load environment variables
load_dotenv()

def main():
    print("🔍 Document Processing Setup Validation")
    print("=" * 50)
    
    # Check environment variables
    print("\n📋 Environment Variables:")
    print(f"  GEMINI_API_KEY: {'✓ Set' if os.getenv('GEMINI_API_KEY') else '✗ Not Set'}")
    print(f"  POPPLER_PATH: {'✓ Set' if os.getenv('POPPLER_PATH') else '✗ Not Set (optional)'}")
    print(f"  TESSERACT_PATH: {'✓ Set' if os.getenv('TESSERACT_PATH') else '✗ Not Set (optional)'}")
    
    # Validate OCR setup
    print("\n🔤 OCR Setup:")
    ocr_valid, ocr_msg = validate_ocr_setup()
    print(f"  Status: {'✓ Valid' if ocr_valid else '✗ Invalid'}")
    print(f"  Message: {ocr_msg}")
    
    # Validate Gemini setup
    print("\n🤖 Gemini AI Setup:")
    gemini_valid, gemini_msg = validate_gemini_setup()
    print(f"  Status: {'✓ Valid' if gemini_valid else '✗ Invalid'}")
    print(f"  Message: {gemini_msg}")
    
    # Overall status
    print("\n📊 Overall Status:")
    if ocr_valid and gemini_valid:
        print("  🎉 All systems ready! You can start the Flask app.")
        print("  🚀 Run: python app.py")
    else:
        print("  ⚠️  Some issues found. Please fix them before starting the app.")
    
    print("\n🌐 Supported Languages:")
    print("  - English (eng)")
    print("  - Hindi (hin)")
    print("  - Oriya (ori)")
    print("  - Automatic language detection enabled")
    
    print("\n📚 Next Steps:")
    print("  1. Set GEMINI_API_KEY if not set")
    print("  2. Install dependencies: pip install -r requirements.txt")
    print("  3. Start the app: python app.py")
    print("  4. Test with Postman using the endpoints:")
    print("     - GET  http://localhost:5000/health")
    print("     - POST http://localhost:5000/process-document")
    print("     - POST http://localhost:5000/extract-text-only")
    print("\n💡 The API will automatically detect the language of your documents!")

if __name__ == "__main__":
    main()
