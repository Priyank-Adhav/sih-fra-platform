from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
from datetime import datetime
from ocr_service import extract_text_from_file
# SWITCHED: Importing Groq service instead of Gemini
from groq_ner_service import extract_entities_groq, validate_groq_setup

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) 

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    groq_valid, _ = validate_groq_setup()
    return jsonify({
        "status": "healthy",
        "api_provider": "groq",
        "provider_connected": groq_valid,
        "supported_languages": {"eng": "English", "hin": "Hindi", "ori": "Oriya"}
    })

@app.route('/process-document', methods=['POST'])
def process_document():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({"error": "Invalid file"}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # OCR Step
            ocr_result = extract_text_from_file(filepath)
            extracted_text = ocr_result['text']
            detected_language = ocr_result['detected_language']
            
            if not extracted_text:
                return jsonify({"error": "No text extracted"}), 400
            
            # NER Step - Now using Groq
            entities = extract_entities_groq(extracted_text)
            
            os.remove(filepath)
            
            return jsonify({
                "success": True,
                "id": str(int(datetime.now().timestamp() * 1000)),
                "filename": filename,
                "extractedText": extracted_text,
                "detectedLanguage": detected_language,
                "entities": entities,
                "processedAt": datetime.now().isoformat(),
                "aiProvider": "groq"
            })
            
        except Exception as processing_error:
            if os.path.exists(filepath): os.remove(filepath)
            raise processing_error
            
    except Exception as e:
        return jsonify({"error": "Processing failed", "message": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Document Processing API (Groq Edition)...")
    print("🔑 Groq Key status:", "✓ Set" if os.getenv('GROQ_API_KEY') else "✗ Not Set")
    app.run(debug=True, host='0.0.0.0', port=5001)