from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
from datetime import datetime
from ocr_service import extract_text_from_file
from gemini_ner_service import extract_entities_gemini

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) 

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Document Processing API is running",
        "supported_formats": list(ALLOWED_EXTENSIONS),
        "supported_languages": {
            "eng": "English",
            "hin": "Hindi",
            "ori": "Oriya"
        },
        "features": [
            "Automatic language detection",
            "OCR text extraction",
            "AI entity extraction",
            "Multilingual support"
        ]
    })

@app.route('/process-document', methods=['POST'])
def process_document():
    """
    Process uploaded document - extract text and entities
    Accepts: PDF, PNG, JPG, JPEG, TIFF, BMP files
    Returns: Extracted text and categorized entities
    """
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({
                "error": "No file provided",
                "message": "Please upload a file using 'file' parameter"
            }), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                "error": "No file selected",
                "message": "Please select a file to upload"
            }), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({
                "error": "File type not supported",
                "message": f"Supported formats: {', '.join(ALLOWED_EXTENSIONS)}",
                "received": file.filename
            }), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Step 1: Extract text using OCR with language detection
            ocr_result = extract_text_from_file(filepath)
            extracted_text = ocr_result['text']
            # Use the language code from OCR result
            detected_language = ocr_result['detected_language']
            
            if not extracted_text or extracted_text.strip() == '':
                return jsonify({
                    "error": "No text extracted",
                    "message": "Could not extract any text from the document",
                    "filename": filename,
                    "detectedLanguage": detected_language
                }), 400
            
            # Step 2: Extract entities using Gemini AI
            entities = extract_entities_gemini(extracted_text)
            
            # Clean up temporary file
            os.remove(filepath)
            
            # Generate unique ID and timestamp
            document_id = str(int(datetime.now().timestamp() * 1000))
            processed_at = datetime.now().isoformat()
            
            # Return results with camelCase field names matching frontend
            return jsonify({
                "success": True,
                "id": document_id,
                "filename": filename,
                "extractedText": extracted_text,
                "detectedLanguage": detected_language,
                "entities": entities,
                "processedAt": processed_at,
                "aiProvider": "gemini"
            })
            
        except Exception as processing_error:
            # Clean up file on error
            if os.path.exists(filepath):
                os.remove(filepath)
            raise processing_error
            
    except Exception as e:
        return jsonify({
            "error": "Processing failed",
            "message": str(e),
            "filename": file.filename if 'file' in locals() else "unknown"
        }), 500

@app.route('/extract-text-only', methods=['POST'])
def extract_text_only():
    """
    Extract only text from document (no entity extraction)
    Useful for testing OCR functionality
    """
    try:
        if 'file' not in request.files:
            return jsonify({
                "error": "No file provided",
                "message": "Please upload a file using 'file' parameter"
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                "error": "No file selected",
                "message": "Please select a file to upload"
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                "error": "File type not supported",
                "message": f"Supported formats: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            ocr_result = extract_text_from_file(filepath)
            extracted_text = ocr_result['text']
            # Use the language code from OCR result
            detected_language = ocr_result['detected_language']
            
            os.remove(filepath)
            
            # Generate unique ID and timestamp
            document_id = str(int(datetime.now().timestamp() * 1000))
            processed_at = datetime.now().isoformat()
            
            # Return with camelCase field names
            return jsonify({
                "success": True,
                "id": document_id,
                "filename": filename,
                "extractedText": extracted_text,
                "detectedLanguage": detected_language,
                "processedAt": processed_at,
                "aiProvider": "text-only"
            })
            
        except Exception as processing_error:
            if os.path.exists(filepath):
                os.remove(filepath)
            raise processing_error
            
    except Exception as e:
        return jsonify({
            "error": "Text extraction failed",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Document Processing API...")
    print("📁 Upload folder:", os.path.abspath(UPLOAD_FOLDER))
    print("🔑 API Key status:", "✓ Set" if os.getenv('GEMINI_API_KEY') else "✗ Not Set")
    print("🌐 API will be available at: http://localhost:5001")
    print("📋 Endpoints:")
    print("  - GET  /health - Health check")
    print("  - POST /process-document - Full processing (OCR + NER)")
    print("  - POST /extract-text-only - OCR only")
    
    app.run(debug=True, host='0.0.0.0', port=5001)