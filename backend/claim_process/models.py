from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, JSON, ForeignKey
from .database import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum


class StepStatus(enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    AWAITING_REVIEW = "awaiting_review"
    COMPLETED = "completed"

class StepType(enum.Enum):
    GRAM_SABHA_MEETING = "gram_sabha_meeting"
    FRC_MEETING = "frc_meeting"
    VISUAL_MAPPING = "visual_mapping"
    NOC_PROCESS = "noc_process"
    VERIFICATION = "verification"
    GRAM_SABHA_PRESENTATION = "gram_sabha_presentation"
    SDLC_REVIEW = "sdlc_review"
    DLC_APPROVAL = "dlc_approval"

class ClaimCase(Base):
    __tablename__ = "claim_cases"
    
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(100), unique=True, index=True, nullable=False)
    village_name = Column(String(200), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    claim_type = Column(String(50), nullable=False)
    applicant_name = Column(String(200))
    applicant_contact = Column(String(100))
    
    # Use String instead of Enum for database compatibility
    current_step = Column(String(50), default=StepType.GRAM_SABHA_MEETING.value)
    overall_status = Column(String(50), default="draft")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    steps = relationship("StepInstance", back_populates="claim_case", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="claim_case", cascade="all, delete-orphan")

class StepInstance(Base):
    __tablename__ = "step_instances"
    
    id = Column(Integer, primary_key=True, index=True)
    claim_case_id = Column(Integer, ForeignKey("claim_cases.id"), nullable=False)
    
    # Use String instead of Enum for database compatibility
    step_type = Column(String(50), nullable=False)
    step_status = Column(String(50), default=StepStatus.NOT_STARTED.value)
    
    step_order = Column(Integer, nullable=False)
    meeting_date = Column(DateTime)
    meeting_location = Column(String(300))
    participants = Column(JSON)
    decisions_made = Column(Text)
    boundary_coordinates = Column(JSON)
    verification_notes = Column(Text)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    claim_case = relationship("ClaimCase", back_populates="steps")
    documents = relationship("Document", back_populates="step_instance")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    claim_case_id = Column(Integer, ForeignKey("claim_cases.id"), nullable=False)
    step_instance_id = Column(Integer, ForeignKey("step_instances.id"))
    filename = Column(String(300), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    document_type = Column(String(100), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    extracted_text = Column(Text)
    processed_data = Column(JSON)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    claim_case = relationship("ClaimCase", back_populates="documents")
    step_instance = relationship("StepInstance", back_populates="documents")

class Stakeholder(Base):
    __tablename__ = "stakeholders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    role = Column(String(100), nullable=False)
    contact_info = Column(JSON)
    jurisdiction = Column(String(200))
    is_active = Column(Boolean, default=True)

class ActionLog(Base):
    __tablename__ = "action_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    claim_case_id = Column(Integer, ForeignKey("claim_cases.id"), nullable=False)
    step_instance_id = Column(Integer, ForeignKey("step_instances.id"))
    action_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    performed_by = Column(String(200), nullable=False)
    performed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    claim_case = relationship("ClaimCase")
    step_instance = relationship("StepInstance")