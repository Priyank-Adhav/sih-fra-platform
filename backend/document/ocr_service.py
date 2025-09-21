import os
from pdf2image import convert_from_path
from PIL import Image
import pytesseract

# Load paths from environment variables
POPPLER_PATH = os.getenv("POPPLER_PATH")

def extract_text_from_file(file_path):
    """
    Extract text from various file formats using OCR
    Input: File path (string)
    Output: Extracted text string
    """
    text = ""
    
    try:
        # Get file extension
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            # Handle PDF files
            images = convert_from_path(file_path, poppler_path=POPPLER_PATH)
            for i, img in enumerate(images):
                page_text = pytesseract.image_to_string(img, lang='eng')
                text += f"--- Page {i+1} ---\n{page_text}\n\n"
                
        elif file_extension in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
            # Handle image files
            image = Image.open(file_path)
            
            # Convert to RGB if necessary (for some image formats)
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            text = pytesseract.image_to_string(image, lang='eng')
            
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
            
    except Exception as e:
        raise RuntimeError(f"OCR processing failed: {str(e)}")
    
    return text.strip()

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
        
        return True, "OCR setup is valid"
        
    except Exception as e:
        return False, f"OCR validation failed: {str(e)}"

if __name__ == "__main__":
    # Test OCR setup
    is_valid, message = validate_ocr_setup()
    print(f"OCR Setup: {'✓' if is_valid else '✗'} {message}")
