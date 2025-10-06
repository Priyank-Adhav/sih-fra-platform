from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
try:
    from .models import ClaimCase, StepInstance, Document, Stakeholder, ActionLog
except ImportError:
    from models import ClaimCase, StepInstance, Document, Stakeholder, ActionLog

# Define step types and statuses as strings (not enums)
STEP_TYPES = {
    'GRAM_SABHA_MEETING': 'gram_sabha_meeting',
    'FRC_MEETING': 'frc_meeting', 
    'VISUAL_MAPPING': 'visual_mapping',
    'NOC_PROCESS': 'noc_process',
    'VERIFICATION': 'verification',
    'GRAM_SABHA_PRESENTATION': 'gram_sabha_presentation',
    'SDLC_REVIEW': 'sdlc_review',
    'DLC_APPROVAL': 'dlc_approval'
}

STEP_STATUSES = {
    'NOT_STARTED': 'not_started',
    'IN_PROGRESS': 'in_progress',
    'AWAITING_REVIEW': 'awaiting_review',
    'COMPLETED': 'completed'
}

def create_mock_stakeholders(db: Session):
    """Create realistic government officials and stakeholders"""
    stakeholders = [
        Stakeholder(
            name="Rajesh Kumar",
            role="panchayat_secretary",
            contact_info={"phone": "+91-9876543210", "email": "rajesh.kumar@mp.gov.in"},
            jurisdiction="Bichhiya Block, Mandla District"
        ),
        Stakeholder(
            name="Anita Verma",
            role="forest_guard", 
            contact_info={"phone": "+91-9876543211", "email": "anita.verma@mpforest.gov.in"},
            jurisdiction="Mandla Forest Range"
        ),
        Stakeholder(
            name="Dr. Sanjay Patel",
            role="sdlc_chairman",
            contact_info={"phone": "+91-9876543212", "email": "sanjay.patel@mp.gov.in"},
            jurisdiction="Mandla Subdivision"
        ),
        Stakeholder(
            name="Biswajit Mohanty",
            role="panchayat_secretary",
            contact_info={"phone": "+91-9876543213", "email": "biswajit.mohanty@odisha.gov.in"},
            jurisdiction="Rayagada Block"
        ),
        Stakeholder(
            name="Priyanka Naik",
            role="forest_guard",
            contact_info={"phone": "+91-9876543214", "email": "priyanka.naik@odishaforest.gov.in"},
            jurisdiction="Rayagada Forest Division"
        ),
        Stakeholder(
            name="Amit Debbarma",
            role="panchayat_secretary", 
            contact_info={"phone": "+91-9876543215", "email": "amit.debbarma@tripura.gov.in"},
            jurisdiction="Khowai District"
        )
    ]
    
    for stakeholder in stakeholders:
        db.add(stakeholder)
    db.commit()
    print(f"✅ Created {len(stakeholders)} stakeholders")

def create_mock_claim_cases(db: Session):
    """Create realistic claim cases at different stages"""
    
    villages_data = [
        # Madhya Pradesh - Gond tribes
        {"village": "Bichhiya", "district": "Mandla", "state": "Madhya Pradesh", "tribe": "Gond", "claim_type": "community"},
        {"village": "Bijadandi", "district": "Mandla", "state": "Madhya Pradesh", "tribe": "Gond", "claim_type": "individual"},
        {"village": "Narayanganj", "district": "Dindori", "state": "Madhya Pradesh", "tribe": "Baiga", "claim_type": "community"},
        
        # Odisha - Kondh tribes  
        {"village": "Bissamcuttack", "district": "Rayagada", "state": "Odisha", "tribe": "Kondh", "claim_type": "cfr"},
        {"village": "Muniguda", "district": "Rayagada", "state": "Odisha", "tribe": "Kondh", "claim_type": "individual"},
        
        # Tripura - Tripuri tribes
        {"village": "Teliamura", "district": "Khowai", "state": "Tripura", "tribe": "Tripuri", "claim_type": "community"},
        {"village": "Kalyanpur", "district": "Khowai", "state": "Tripura", "tribe": "Tripuri", "claim_type": "individual"},
    ]
    
    claim_cases = []
    
    for i, village_data in enumerate(villages_data):
        case_number = f"FRA-{datetime.now().strftime('%Y%m%d')}-{i+1:04d}"
        
        # Create claim case with string values only
        claim_case = ClaimCase(
            case_number=case_number,
            village_name=village_data["village"],
            district=village_data["district"],
            state=village_data["state"],
            claim_type=village_data["claim_type"],
            applicant_name=f"{village_data['tribe']} Community" if village_data["claim_type"] in ["community", "cfr"] else f"Ramesh {village_data['tribe']}",
            applicant_contact=f"+91-9{random.randint(100000000, 999999999)}",
            current_step=STEP_TYPES['GRAM_SABHA_MEETING'],  # Use string directly
            overall_status="draft",
            created_at=datetime.now() - timedelta(days=random.randint(1, 90))
        )
        
        db.add(claim_case)
        db.flush()  # Get the ID without committing
        claim_cases.append(claim_case)
        
        # Create workflow steps with different statuses
        create_mock_steps_for_case(db, claim_case, village_data)
    
    db.commit()
    print(f"✅ Created {len(claim_cases)} claim cases")
    return claim_cases

def create_mock_steps_for_case(db: Session, claim_case: ClaimCase, village_data: dict):
    """Create workflow steps with realistic progress"""
    
    steps_data = [
        (STEP_TYPES['GRAM_SABHA_MEETING'], "Gram Sabha Meeting", 1),
        (STEP_TYPES['FRC_MEETING'], "FRC Meeting & Planning", 2), 
        (STEP_TYPES['VISUAL_MAPPING'], "Visual Mapping", 3),
        (STEP_TYPES['NOC_PROCESS'], "NOC Process", 4),
        (STEP_TYPES['VERIFICATION'], "Verification", 5),
        (STEP_TYPES['GRAM_SABHA_PRESENTATION'], "Gram Sabha Presentation", 6),
        (STEP_TYPES['SDLC_REVIEW'], "SDLC Review", 7),
        (STEP_TYPES['DLC_APPROVAL'], "DLC Approval", 8)
    ]
    
    # Determine how many steps are completed based on random progression
    total_steps = len(steps_data)
    completed_up_to = random.randint(0, total_steps)
    
    current_step_type = STEP_TYPES['GRAM_SABHA_MEETING']  # Default
    
    for i, (step_type, step_name, step_order) in enumerate(steps_data):
        step_order = i + 1
        
        if step_order < completed_up_to:
            step_status = STEP_STATUSES['COMPLETED']
            started_at = claim_case.created_at + timedelta(days=step_order * 3)
            completed_at = started_at + timedelta(days=2)
        elif step_order == completed_up_to:
            step_status = random.choice([STEP_STATUSES['IN_PROGRESS'], STEP_STATUSES['AWAITING_REVIEW']])
            started_at = claim_case.created_at + timedelta(days=step_order * 3)
            completed_at = None
            current_step_type = step_type  # Track current step
        else:
            step_status = STEP_STATUSES['NOT_STARTED']
            started_at = None
            completed_at = None
        
        step = StepInstance(
            claim_case_id=claim_case.id,
            step_type=step_type,  # Use string directly
            step_status=step_status,  # Use string directly
            step_order=step_order,
            meeting_date=started_at,
            meeting_location=f"{village_data['village']} Panchayat Bhawan",
            participants=[
                {"name": "Village Elder", "role": "Community Representative"},
                {"name": "Panchayat Secretary", "role": "Government Official"},
                {"name": "Forest Guard", "role": "Forest Department"}
            ] if step_status != STEP_STATUSES['NOT_STARTED'] else [],
            decisions_made=f"Decisions made regarding {step_name} for {village_data['village']}" if step_status == STEP_STATUSES['COMPLETED'] else None,
            started_at=started_at,
            completed_at=completed_at
        )
        
        db.add(step)
        db.flush()  # Get step ID
        
        # Create action logs for completed steps
        if step_status == STEP_STATUSES['COMPLETED']:
            action = ActionLog(
                claim_case_id=claim_case.id,
                step_instance_id=step.id,
                action_type="STEP_COMPLETED",
                description=f"Completed {step_name} for {village_data['village']}",
                performed_by="System"
            )
            db.add(action)
    
    # Update claim case current step and status
    if completed_up_to > 0 and completed_up_to <= total_steps:
        claim_case.current_step = current_step_type
        claim_case.overall_status = "in_progress"
    elif completed_up_to == total_steps:
        claim_case.overall_status = "completed"
    else:
        claim_case.overall_status = "draft"

def create_mock_documents(db: Session, claim_case: ClaimCase):
    """Create mock documents for completed steps"""
    document_types = [
        ("meeting_minutes", "Meeting Minutes.pdf"),
        ("attendance_sheet", "Attendance Sheet.pdf"),
        ("map", "Village Boundary Map.pdf"),
        ("noc", "No Objection Certificate.pdf"),
        ("application_form", "FRA Application Form.pdf"),
        ("photograph", "Meeting Photo.jpg")
    ]
    
    # Get completed steps for this case
    completed_steps = db.query(StepInstance).filter(
        StepInstance.claim_case_id == claim_case.id,
        StepInstance.step_status == STEP_STATUSES['COMPLETED']
    ).all()
    
    for step in completed_steps:
        # Add 1-3 documents per completed step
        num_docs = random.randint(1, 3)
        for _ in range(num_docs):
            doc_type, filename = random.choice(document_types)
            
            document = Document(
                claim_case_id=claim_case.id,
                step_instance_id=step.id,
                filename=filename,
                file_path=f"/uploads/mock/{claim_case.case_number}/{filename}",
                file_type=filename.split('.')[-1],
                document_type=doc_type,
                file_size=random.randint(1024, 5120),
                mime_type="application/pdf" if filename.endswith('.pdf') else "image/jpeg",
                uploaded_at=step.completed_at or datetime.now()
            )
            db.add(document)

def initialize_mock_data(db: Session):
    """Initialize all mock data"""
    print("🌱 Initializing mock data...")
    
    create_mock_stakeholders(db)
    claim_cases = create_mock_claim_cases(db)
    
    # Create documents for all cases
    for case in claim_cases:
        create_mock_documents(db, case)
    
    db.commit()
    print("✅ Mock data initialization completed!")

if __name__ == "__main__":
    try:
        from .database import SessionLocal
    except ImportError:
        from database import SessionLocal
    db = SessionLocal()
    try:
        initialize_mock_data(db)
        print("\n🎉 Database successfully seeded!")
        print("📊 You now have:")
        print("   - 6 government stakeholders")
        print("   - 7 claim cases at different stages")
        print("   - Complete workflow steps for each case")
        print("   - Mock documents and action logs")
        print("\n🚀 You can now start the backend server!")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()