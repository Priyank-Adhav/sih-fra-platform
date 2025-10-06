from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging
from ..models import ClaimCase, StepInstance, StepType, StepStatus, ActionLog
from ..schemas import StepInstanceCreate, StepInstanceUpdate, WORKFLOW_STEPS

logger = logging.getLogger(__name__)

class WorkflowService:
    def __init__(self, db: Session):
        self.db = db

    def initialize_workflow(self, claim_case: ClaimCase) -> List[StepInstance]:
        """Initialize all workflow steps for a new claim case"""
        steps = []
        for step_template in WORKFLOW_STEPS:
            step = StepInstance(
                claim_case_id=claim_case.id,
                step_type=step_template["step_type"].value,
                step_order=step_template["step_order"],
                step_status="not_started"
            )
            self.db.add(step)
            steps.append(step)
        
        self.db.commit()
        
        # Log the workflow initialization
        self._log_action(
            claim_case.id,
            "WORKFLOW_INITIALIZED",
            f"Workflow initialized with {len(steps)} steps for case {claim_case.case_number}",
            "system"
        )
        
        return steps

    def get_current_step(self, claim_case_id: int) -> Optional[StepInstance]:
        """Get the current active step for a claim case"""
        return self.db.query(StepInstance)\
            .filter(StepInstance.claim_case_id == claim_case_id)\
            .filter(StepInstance.step_status != "completed")\
            .order_by(StepInstance.step_order)\
            .first()

    def update_step_status(self, step_instance_id: int, new_status: StepStatus, 
                         notes: Optional[str] = None) -> StepInstance:
        """Update the status of a workflow step"""
        step = self.db.query(StepInstance).filter(StepInstance.id == step_instance_id).first()
        if not step:
            raise ValueError(f"Step instance {step_instance_id} not found")
        
        old_status = step.step_status
        step.step_status = new_status
        
        # Update timestamps
        if new_status == "in_progress" and not step.started_at:
            step.started_at = datetime.utcnow()
        elif new_status == "completed" and not step.completed_at:
            step.completed_at = datetime.utcnow()
        
        self.db.commit()
        
        # Log the status change
        self._log_action(
            step.claim_case_id,
            "STEP_STATUS_CHANGED",
            f"Step {step.step_type} changed from {old_status} to {new_status}. {notes or ''}",
            "system",
            step_instance_id=step.id
        )
        
        return step

    def proceed_to_next_step(self, claim_case_id: int) -> Optional[StepInstance]:
        """Mark current step as completed and activate the next step"""
        current_step = self.get_current_step(claim_case_id)
        if not current_step:
            return None
        
        # Mark current step as completed
        current_step.step_status = "completed"
        current_step.completed_at = datetime.utcnow()
        
        # Find and activate next step
        next_step = self.db.query(StepInstance)\
            .filter(StepInstance.claim_case_id == claim_case_id)\
            .filter(StepInstance.step_order > current_step.step_order)\
            .order_by(StepInstance.step_order)\
            .first()
        
        if next_step:
            next_step.step_status = "in_progress"
            next_step.started_at = datetime.utcnow()
            
            # Update claim case current step
            claim_case = self.db.query(ClaimCase).filter(ClaimCase.id == claim_case_id).first()
            if claim_case:
                claim_case.current_step = next_step.step_type
        
        self.db.commit()
        
        # Log the progression
        action_desc = f"Progressed from step {current_step.step_order} to {next_step.step_order if next_step else 'completed'}"
        self._log_action(
            claim_case_id,
            "WORKFLOW_PROGRESSED",
            action_desc,
            "system"
        )
        
        return next_step

    def get_workflow_progress(self, claim_case_id: int) -> dict:
        """Get comprehensive workflow progress for a claim case"""
        steps = self.db.query(StepInstance)\
            .filter(StepInstance.claim_case_id == claim_case_id)\
            .order_by(StepInstance.step_order)\
            .all()
        
        total_steps = len(steps)
        completed_steps = len([s for s in steps if s.step_status == "completed"])
        progress_percentage = (completed_steps / total_steps * 100) if total_steps > 0 else 0
        
        return {
            "total_steps": total_steps,
            "completed_steps": completed_steps,
            "progress_percentage": progress_percentage,
            "current_step": self.get_current_step(claim_case_id),
            "steps": steps
        }

    def _log_action(self, claim_case_id: int, action_type: str, description: str, 
                   performed_by: str, step_instance_id: Optional[int] = None):
        """Helper method to log actions"""
        action_log = ActionLog(
            claim_case_id=claim_case_id,
            step_instance_id=step_instance_id,
            action_type=action_type,
            description=description,
            performed_by=performed_by
        )
        self.db.add(action_log)
        self.db.commit()