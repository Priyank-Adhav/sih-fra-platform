import os
import uuid
from sqlalchemy.orm import Session
from typing import List, Optional
import aiofiles
from fastapi import UploadFile, HTTPException
import logging

from ..models import Document
from ..schemas import DocumentCreate

logger = logging.getLogger(__name__)

class DocumentService:
    def __init__(self, db: Session, upload_dir: str):
        self.db = db
        self.upload_dir = upload_dir
        self._ensure_upload_dir()

    def _ensure_upload_dir(self):
        """Ensure upload directory exists"""
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_uploaded_file(self, file: UploadFile, claim_case_id: int, 
                               step_instance_id: Optional[int] = None) -> Document:
        """Save uploaded file and create document record"""
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(self.upload_dir, unique_filename)

        # Save file
        try:
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
        except Exception as e:
            logger.error(f"Error saving file {file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail="Could not save file")

        # Create document record
        document_data = DocumentCreate(
            filename=file.filename,
            file_path=file_path,
            file_type=file_extension.lower().lstrip('.'),
            document_type=self._infer_document_type(file.filename),
            file_size=len(content),
            mime_type=file.content_type,
            claim_case_id=claim_case_id,
            step_instance_id=step_instance_id
        )

        document = Document(**document_data.dict())
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)

        logger.info(f"Document {file.filename} saved for case {claim_case_id}")
        return document

    def _infer_document_type(self, filename: str) -> str:
        """Infer document type from filename"""
        filename_lower = filename.lower()
        
        if any(term in filename_lower for term in ['minutes', 'proceeding', 'resolution']):
            return 'meeting_minutes'
        elif any(term in filename_lower for term in ['map', 'boundary', 'coordinate']):
            return 'map'
        elif any(term in filename_lower for term in ['noc', 'objection', 'certificate']):
            return 'noc'
        elif any(term in filename_lower for term in ['application', 'claim', 'form']):
            return 'application_form'
        elif any(term in filename_lower for term in ['photo', 'image', 'picture']):
            return 'photograph'
        elif any(term in filename_lower for term in ['video', 'recording']):
            return 'video_recording'
        elif any(term in filename_lower for term in ['audio', 'recording']):
            return 'audio_recording'
        else:
            return 'other'

    def get_documents_by_case(self, claim_case_id: int) -> List[Document]:
        """Get all documents for a claim case"""
        return self.db.query(Document)\
            .filter(Document.claim_case_id == claim_case_id)\
            .order_by(Document.uploaded_at.desc())\
            .all()

    def get_documents_by_step(self, step_instance_id: int) -> List[Document]:
        """Get all documents for a specific step"""
        return self.db.query(Document)\
            .filter(Document.step_instance_id == step_instance_id)\
            .order_by(Document.uploaded_at.desc())\
            .all()

    def delete_document(self, document_id: int) -> bool:
        """Delete document record and file"""
        document = self.db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return False

        # Delete physical file
        try:
            if os.path.exists(document.file_path):
                os.remove(document.file_path)
        except Exception as e:
            logger.warning(f"Could not delete file {document.file_path}: {str(e)}")

        # Delete database record
        self.db.delete(document)
        self.db.commit()
        
        return True