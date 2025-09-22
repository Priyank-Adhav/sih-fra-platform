#!/usr/bin/env python3
"""
Script to check available Tesseract languages and help with setup
"""
import pytesseract
import os

def check_tesseract_languages():
    """Check what languages are available in Tesseract"""
    print("🔍 Checking Tesseract Languages...")
    print("=" * 50)
    
    try:
        # Get version
        version = pytesseract.get_tesseract_version()
        print(f"Tesseract Version: {version}")
        
        # Get available languages
        available_languages = pytesseract.get_languages()
        print(f"\n📋 Available Languages ({len(available_languages)} total):")
        
        # Check our supported languages
        supported_languages = {
            'eng': 'English',
            'hin': 'Hindi', 
            'ori': 'Oriya'
        }
        
        print("\n🎯 Our Supported Languages Status:")
        for code, name in supported_languages.items():
            status = "✓ Available" if code in available_languages else "✗ Missing"
            print(f"  {code} ({name}): {status}")
        
        print(f"\n📝 All Available Languages:")
        for i, lang in enumerate(available_languages, 1):
            marker = "🎯" if lang in supported_languages else "  "
            print(f"  {marker} {i:2d}. {lang}")
        
        # Check environment variables
        print(f"\n🔧 Environment Variables:")
        print(f"  TESSERACT_PATH: {'✓ Set' if os.getenv('TESSERACT_PATH') else '✗ Not Set'}")
        print(f"  POPPLER_PATH: {'✓ Set' if os.getenv('POPPLER_PATH') else '✗ Not Set'}")
        
        return available_languages
        
    except Exception as e:
        print(f"❌ Error checking Tesseract: {e}")
        return []

def check_gemini_api():
    """Check Gemini API key status"""
    print(f"\n🤖 Gemini API Status:")
    print("=" * 50)
    
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        # Mask the key for security
        masked_key = api_key[:8] + "..." + api_key[-4:] if len(api_key) > 12 else "***"
        print(f"✓ GEMINI_API_KEY: Set ({masked_key})")
    else:
        print("✗ GEMINI_API_KEY: Not Set")
        print("\n🔑 To set your Gemini API key:")
        print("1. Go to: https://makersuite.google.com/app/apikey")
        print("2. Create a new API key")
        print("3. Set it in your environment:")
        print("   - PowerShell: $env:GEMINI_API_KEY='your_key_here'")
        print("   - Command Prompt: set GEMINI_API_KEY=your_key_here")
        print("   - Or create a .env file with: GEMINI_API_KEY=your_key_here")

def main():
    print("🚀 Document Processing Setup Checker")
    print("=" * 50)
    
    # Check Tesseract
    available_langs = check_tesseract_languages()
    
    # Check Gemini
    check_gemini_api()
    
    # Summary
    print(f"\n📊 Setup Summary:")
    print("=" * 50)
    
    supported_languages = {'eng': 'English', 'hin': 'Hindi', 'ori': 'Oriya'}
    available_supported = [lang for lang in supported_languages.keys() if lang in available_langs]
    
    print(f"OCR Languages Ready: {len(available_supported)}/{len(supported_languages)}")
    print(f"Gemini API Ready: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")
    
    if len(available_supported) > 0 and os.getenv('GEMINI_API_KEY'):
        print("\n🎉 Ready to start! Run: python app.py")
    else:
        print("\n⚠️  Please fix the issues above before starting the app.")

if __name__ == "__main__":
    main()

