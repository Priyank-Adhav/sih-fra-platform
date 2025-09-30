import os
from pdf2image import convert_from_path
from PIL import Image
import pytesseract

# Load paths from environment variables
POPPLER_PATH = os.getenv("POPPLER_PATH")

# Supported languages
SUPPORTED_LANGUAGES = {
    'eng': 'English',
    'hin': 'Hindi', 
    'ori': 'Oriya'
}

def detect_language(image):
    """
    Detect the language of the text in the image
    Input: PIL Image object
    Output: Language code (eng, hin, ori)
    """
    try:
        # Get available languages
        available_languages = pytesseract.get_languages()
        
        # Filter to only supported languages that are available
        available_supported = [lang for lang in SUPPORTED_LANGUAGES.keys() if lang in available_languages]
        
        if not available_supported:
            return 'eng'  # Default to English if no supported languages available
        
        # Get OCR data for each available supported language
        language_scores = {}
        
        for lang_code in available_supported:
            try:
                # Get detailed OCR data
                ocr_data = pytesseract.image_to_data(image, lang=lang_code, output_type=pytesseract.Output.DICT)
                
                # Count confident text detections (confidence > 30)
                confident_words = sum(1 for conf in ocr_data['conf'] if int(conf) > 30)
                language_scores[lang_code] = confident_words
                
            except Exception:
                language_scores[lang_code] = 0
        
        # Return the language with highest score, default to first available if no clear winner
        if language_scores:
            best_lang = max(language_scores, key=language_scores.get)
            if language_scores[best_lang] > 0:
                return best_lang
        
        return available_supported[0]  # Default to first available language
        
    except Exception:
        return 'eng'  # Default to English on any error

def extract_text_from_file(file_path):
    """
    Extract text from various file formats using OCR with automatic language detection
    Input: File path (string)
    Output: Dictionary with extracted text and detected language
    """
    result = {
        'text': '',
        'detected_language': 'eng',
        'language_name': 'English'
    }
    
    try:
        # Get file extension
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            # Handle PDF files
            images = convert_from_path(file_path, poppler_path=POPPLER_PATH)
            detected_languages = set()
            
            for i, img in enumerate(images):
                # Detect language for this page
                page_lang = detect_language(img)
                detected_languages.add(page_lang)
                
                # Extract text with detected language
                page_text = pytesseract.image_to_string(img, lang=page_lang)
                result['text'] += f"--- Page {i+1} ({SUPPORTED_LANGUAGES[page_lang]}) ---\n{page_text}\n\n"
            
            # Use the most common language detected across pages
            if detected_languages:
                result['detected_language'] = max(detected_languages, key=list(detected_languages).count)
                result['language_name'] = SUPPORTED_LANGUAGES[result['detected_language']]
                
        elif file_extension in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
            # Handle image files
            image = Image.open(file_path)
            
            # Convert to RGB if necessary (for some image formats)
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Detect language and extract text
            detected_lang = detect_language(image)
            result['detected_language'] = detected_lang
            result['language_name'] = SUPPORTED_LANGUAGES[detected_lang]
            result['text'] = pytesseract.image_to_string(image, lang=detected_lang)
            
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
            
    except Exception as e:
        raise RuntimeError(f"OCR processing failed: {str(e)}")
    
    result['text'] = result['text'].strip()
    return result

def validate_ocr_setup():
    """
    Validate that OCR dependencies are properly configured
    Returns: (is_valid, error_message)
    """
    try:
        # Test Tesseract
        pytesseract.get_tesseract_version()
        
        # Test Poppler (if path is set)
        if POPPLER_PATH and not os.path.exists(POPPLER_PATH):
            return False, f"Poppler path not found: {POPPLER_PATH}"
        
        # Test language data files
        available_languages = pytesseract.get_languages()
        missing_languages = []
        available_supported = []
        
        for lang_code in SUPPORTED_LANGUAGES.keys():
            if lang_code not in available_languages:
                missing_languages.append(f"{lang_code} ({SUPPORTED_LANGUAGES[lang_code]})")
            else:
                available_supported.append(f"{lang_code} ({SUPPORTED_LANGUAGES[lang_code]})")
        
        if missing_languages:
            return False, f"Missing language data files: {', '.join(missing_languages)}. Available: {', '.join(available_languages)}"
        
        return True, f"OCR setup is valid. Available supported languages: {', '.join(available_supported)}"
        
    except Exception as e:
        return False, f"OCR validation failed: {str(e)}"

if __name__ == "__main__":
    # Test OCR setup
    is_valid, message = validate_ocr_setup()
    print(f"OCR Setup: {'✓' if is_valid else '✗'} {message}")
