from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class StepStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    AWAITING_REVIEW = "awaiting_review"
    COMPLETED = "completed"

class StepType(str, Enum):
    GRAM_SABHA_MEETING = "gram_sabha_meeting"
    FRC_MEETING = "frc_meeting"
    VISUAL_MAPPING = "visual_mapping"
    NOC_PROCESS = "noc_process"
    VERIFICATION = "verification"
    GRAM_SABHA_PRESENTATION = "gram_sabha_presentation"
    SDLC_REVIEW = "sdlc_review"
    DLC_APPROVAL = "dlc_approval"

# Base Schemas
class ClaimCaseBase(BaseModel):
    village_name: str
    district: str
    state: str
    claim_type: str
    applicant_name: Optional[str] = None
    applicant_contact: Optional[str] = None

class ClaimCaseCreate(ClaimCaseBase):
    pass

class ClaimCaseUpdate(BaseModel):
    current_step: Optional[StepType] = None
    overall_status: Optional[str] = None

class StepInstanceBase(BaseModel):
    step_type: StepType
    step_status: StepStatus = StepStatus.NOT_STARTED
    meeting_date: Optional[datetime] = None
    meeting_location: Optional[str] = None
    participants: Optional[List[Dict[str, Any]]] = None
    decisions_made: Optional[str] = None
    boundary_coordinates: Optional[Dict[str, Any]] = None
    verification_notes: Optional[str] = None

class StepInstanceCreate(StepInstanceBase):
    claim_case_id: int
    step_order: int

class StepInstanceUpdate(BaseModel):
    step_status: Optional[StepStatus] = None
    meeting_date: Optional[datetime] = None
    meeting_location: Optional[str] = None
    participants: Optional[List[Dict[str, Any]]] = None
    decisions_made: Optional[str] = None
    boundary_coordinates: Optional[Dict[str, Any]] = None
    verification_notes: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class DocumentBase(BaseModel):
    filename: str
    file_type: str
    document_type: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None

class DocumentCreate(DocumentBase):
    claim_case_id: int
    step_instance_id: Optional[int] = None
    file_path: str

class ActionLogBase(BaseModel):
    action_type: str
    description: str
    performed_by: str

class ActionLogCreate(ActionLogBase):
    claim_case_id: int
    step_instance_id: Optional[int] = None

# Response Schemas
class DocumentResponse(DocumentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    claim_case_id: int
    step_instance_id: Optional[int] = None
    uploaded_at: datetime
    extracted_text: Optional[str] = None
    processed_data: Optional[Dict[str, Any]] = None

class StepInstanceResponse(StepInstanceBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    claim_case_id: int
    step_order: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    documents: List[DocumentResponse] = []

class ClaimCaseResponse(ClaimCaseBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    case_number: str
    current_step: StepType
    overall_status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    steps: List[StepInstanceResponse] = []
    documents: List[DocumentResponse] = []

class ActionLogResponse(ActionLogBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    claim_case_id: int
    step_instance_id: Optional[int] = None
    performed_at: datetime

# Workflow Templates
WORKFLOW_STEPS = [
    {
        "step_type": StepType.GRAM_SABHA_MEETING,
        "step_order": 1,
        "name": "Gram Sabha Meeting",
        "description": "Convene gram sabha to initiate CFRR claim and establish FRC"
    },
    {
        "step_type": StepType.FRC_MEETING,
        "step_order": 2,
        "name": "FRC Meeting & Planning",
        "description": "FRC meeting to discuss claims preparation and distribute responsibilities"
    },
    {
        "step_type": StepType.VISUAL_MAPPING,
        "step_order": 3,
        "name": "Visual Map of Village Boundaries",
        "description": "Determine village boundaries with community participation"
    },
    {
        "step_type": StepType.NOC_PROCESS,
        "step_order": 4,
        "name": "No Objection Certificate",
        "description": "Obtain NOC from neighboring villages and prepare maps"
    },
    {
        "step_type": StepType.VERIFICATION,
        "step_order": 5,
        "name": "Verification Group",
        "description": "SDLC verification group examines claims and evidence"
    },
    {
        "step_type": StepType.GRAM_SABHA_PRESENTATION,
        "step_order": 6,
        "name": "Presentation to Gram Sabha",
        "description": "Present prepared claims to gram sabha for approval"
    },
    {
        "step_type": StepType.SDLC_REVIEW,
        "step_order": 7,
        "name": "Subdivisional Level Committee",
        "description": "SDLC investigates claims and forwards to DLC"
    },
    {
        "step_type": StepType.DLC_APPROVAL,
        "step_order": 8,
        "name": "District Level Committee",
        "description": "DLC issues authorization letters for valid claims"
    }
]