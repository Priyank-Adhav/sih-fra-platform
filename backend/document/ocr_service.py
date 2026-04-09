import os
from pdf2image import convert_from_path
from PIL import Image
import pytesseract

# Load paths from environment variables (optional for Windows only)
POPPLER_PATH = os.getenv("POPPLER_PATH")

# Supported languages
SUPPORTED_LANGUAGES = {
    'eng': 'English',
    'hin': 'Hindi', 
    'ori': 'Oriya'
}

def detect_language(image):
    try:
        available_languages = pytesseract.get_languages()

        available_supported = [
            lang for lang in SUPPORTED_LANGUAGES.keys()
            if lang in available_languages
        ]

        if not available_supported:
            return 'eng'

        language_scores = {}

        for lang_code in available_supported:
            try:
                ocr_data = pytesseract.image_to_data(
                    image,
                    lang=lang_code,
                    output_type=pytesseract.Output.DICT
                )

                confident_words = sum(
                    1 for conf in ocr_data['conf'] if int(conf) > 30
                )

                language_scores[lang_code] = confident_words

            except Exception:
                language_scores[lang_code] = 0

        if language_scores:
            best_lang = max(language_scores, key=language_scores.get)
            if language_scores[best_lang] > 0:
                return best_lang

        return available_supported[0]

    except Exception:
        return 'eng'


def extract_text_from_file(file_path):
    result = {
        'text': '',
        'detected_language': 'eng',
        'language_name': 'English'
    }

    try:
        file_extension = os.path.splitext(file_path)[1].lower()

        # ================================
        # ✅ FIXED PART (Poppler handling)
        # ================================
        def get_pdf_images(path):
            if POPPLER_PATH:
                return convert_from_path(path, poppler_path=POPPLER_PATH)
            else:
                return convert_from_path(path)

        # ================================

        if file_extension == '.pdf':
            images = get_pdf_images(file_path)

            detected_languages = []

            for i, img in enumerate(images):
                page_lang = detect_language(img)
                detected_languages.append(page_lang)

                page_text = pytesseract.image_to_string(img, lang=page_lang)

                result['text'] += (
                    f"--- Page {i+1} ({SUPPORTED_LANGUAGES[page_lang]}) ---\n"
                    f"{page_text}\n\n"
                )

            if detected_languages:
                result['detected_language'] = max(
                    set(detected_languages),
                    key=detected_languages.count
                )
                result['language_name'] = SUPPORTED_LANGUAGES[result['detected_language']]

        elif file_extension in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
            image = Image.open(file_path)

            if image.mode != 'RGB':
                image = image.convert('RGB')

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
    try:
        pytesseract.get_tesseract_version()

        # Only check poppler if path is explicitly set
        if POPPLER_PATH and not os.path.exists(POPPLER_PATH):
            return False, f"Poppler path not found: {POPPLER_PATH}"

        available_languages = pytesseract.get_languages()

        missing_languages = []
        available_supported = []

        for lang_code in SUPPORTED_LANGUAGES.keys():
            if lang_code not in available_languages:
                missing_languages.append(
                    f"{lang_code} ({SUPPORTED_LANGUAGES[lang_code]})"
                )
            else:
                available_supported.append(
                    f"{lang_code} ({SUPPORTED_LANGUAGES[lang_code]})"
                )

        if missing_languages:
            return False, (
                f"Missing language data files: {', '.join(missing_languages)}. "
                f"Available: {', '.join(available_languages)}"
            )

        return True, (
            f"OCR setup is valid. Available supported languages: "
            f"{', '.join(available_supported)}"
        )

    except Exception as e:
        return False, f"OCR validation failed: {str(e)}"


if __name__ == "__main__":
    is_valid, message = validate_ocr_setup()
    print(f"OCR Setup: {'✓' if is_valid else '✗'} {message}")