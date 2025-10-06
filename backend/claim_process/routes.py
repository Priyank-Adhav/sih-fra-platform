from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from datetime import datetime

from .models import ClaimCase, StepInstance, Document, ActionLog
from .schemas import (
    ClaimCaseCreate, ClaimCaseResponse, ClaimCaseUpdate,
    StepInstanceCreate, StepInstanceResponse, StepInstanceUpdate,
    DocumentResponse, ActionLogResponse,
    StepStatus, StepType, WORKFLOW_STEPS
)
from .services.workflow_service import WorkflowService
from .services.document_service import DocumentService
from .config import settings

# Import database dependency (you'll need to set this up)
# from your_common_db_module import get_db

router = APIRouter(prefix="/api/claim-process", tags=["claim-process"])
logger = logging.getLogger(__name__)

from .database import get_db

def get_workflow_service(db: Session = Depends(get_db)) -> WorkflowService:
    return WorkflowService(db)

def get_document_service(db: Session = Depends(get_db)) -> DocumentService:
    return DocumentService(db, settings.UPLOAD_DIR)

# Claim Cases Endpoints
@router.post("/cases", response_model=ClaimCaseResponse, status_code=status.HTTP_201_CREATED)
async def create_claim_case(
    case_data: ClaimCaseCreate,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Create a new claim case and initialize workflow"""
    try:
        # Generate case number
        case_number = f"FRA-{datetime.now().strftime('%Y%m%d')}-{db.query(ClaimCase).count() + 1:04d}"
        
        # Create claim case
        claim_case = ClaimCase(
            case_number=case_number,
            **case_data.dict()
        )
        db.add(claim_case)
        db.commit()
        db.refresh(claim_case)
        
        # Initialize workflow steps
        workflow_service.initialize_workflow(claim_case)
        
        return claim_case
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating claim case: {str(e)}")
        raise HTTPException(status_code=500, detail="Could not create claim case")

@router.get("/cases", response_model=List[ClaimCaseResponse])
async def get_claim_cases(
    skip: int = 0,
    limit: int = 100,
    state: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get paginated list of claim cases with filters"""
    query = db.query(ClaimCase)
    
    if state:
        query = query.filter(ClaimCase.state == state)
    if district:
        query = query.filter(ClaimCase.district == district)
    if status:
        query = query.filter(ClaimCase.overall_status == status)
    
    cases = query.offset(skip).limit(limit).all()
    return cases

@router.get("/cases/{case_id}", response_model=ClaimCaseResponse)
async def get_claim_case(case_id: int, db: Session = Depends(get_db)):
    """Get specific claim case with all steps and documents"""
    case = db.query(ClaimCase).filter(ClaimCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Claim case not found")
    return case

@router.put("/cases/{case_id}", response_model=ClaimCaseResponse)
async def update_claim_case(
    case_id: int,
    case_update: ClaimCaseUpdate,
    db: Session = Depends(get_db)
):
    """Update claim case information"""
    case = db.query(ClaimCase).filter(ClaimCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Claim case not found")
    
    for field, value in case_update.dict(exclude_unset=True).items():
        setattr(case, field, value)
    
    case.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(case)
    
    return case

# Workflow Steps Endpoints
@router.get("/cases/{case_id}/steps", response_model=List[StepInstanceResponse])
async def get_case_steps(case_id: int, db: Session = Depends(get_db)):
    """Get all workflow steps for a claim case"""
    steps = db.query(StepInstance)\
        .filter(StepInstance.claim_case_id == case_id)\
        .order_by(StepInstance.step_order)\
        .all()
    return steps

@router.get("/cases/{case_id}/steps/current", response_model=StepInstanceResponse)
async def get_current_step(
    case_id: int,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Get the current active step for a claim case"""
    current_step = workflow_service.get_current_step(case_id)
    if not current_step:
        raise HTTPException(status_code=404, detail="No active step found")
    return current_step

@router.put("/steps/{step_id}/status", response_model=StepInstanceResponse)
async def update_step_status(
    step_id: int,
    status_update: StepInstanceUpdate,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Update the status of a workflow step"""
    try:
        step = workflow_service.update_step_status(
            step_id, 
            status_update.step_status,
            status_update.verification_notes
        )
        return step
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/cases/{case_id}/next-step", response_model=StepInstanceResponse)
async def proceed_to_next_step(
    case_id: int,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Mark current step as completed and proceed to next step"""
    next_step = workflow_service.proceed_to_next_step(case_id)
    if not next_step:
        raise HTTPException(status_code=404, detail="No next step available or workflow completed")
    return next_step

@router.get("/cases/{case_id}/progress")
async def get_workflow_progress(
    case_id: int,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Get workflow progress summary"""
    progress = workflow_service.get_workflow_progress(case_id)
    return progress

# Documents Endpoints
@router.post("/cases/{case_id}/documents", response_model=DocumentResponse)
async def upload_document(
    case_id: int,
    file: UploadFile = File(...),
    step_instance_id: Optional[int] = Query(None),
    document_service: DocumentService = Depends(get_document_service)
):
    """Upload document for a claim case"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    try:
        document = await document_service.save_uploaded_file(
            file, case_id, step_instance_id
        )
        return document
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail="Could not upload document")

@router.get("/cases/{case_id}/documents", response_model=List[DocumentResponse])
async def get_case_documents(
    case_id: int,
    document_service: DocumentService = Depends(get_document_service)
):
    """Get all documents for a claim case"""
    documents = document_service.get_documents_by_case(case_id)
    return documents

@router.get("/steps/{step_id}/documents", response_model=List[DocumentResponse])
async def get_step_documents(
    step_id: int,
    document_service: DocumentService = Depends(get_document_service)
):
    """Get all documents for a specific workflow step"""
    documents = document_service.get_documents_by_step(step_id)
    return documents

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: int,
    document_service: DocumentService = Depends(get_document_service)
):
    """Delete a document"""
    success = document_service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}

# Action Logs Endpoints
@router.get("/cases/{case_id}/actions", response_model=List[ActionLogResponse])
async def get_case_actions(
    case_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get action log for a claim case"""
    actions = db.query(ActionLog)\
        .filter(ActionLog.claim_case_id == case_id)\
        .order_by(ActionLog.performed_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return actions

# Workflow Templates Endpoints
@router.get("/workflow-templates")
async def get_workflow_templates():
    """Get the standard FRA workflow template"""
    return {
        "steps": WORKFLOW_STEPS,
        "total_steps": len(WORKFLOW_STEPS),
        "description": "Standard FRA Claim Process Workflow"
    }

# Utility Endpoints
@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "claim-process-tracker",
        "timestamp": datetime.utcnow().isoformat()
    }