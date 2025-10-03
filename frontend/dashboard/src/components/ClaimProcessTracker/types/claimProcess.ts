export interface StepInstance {
    id: number;
    step_type: string;
    step_status: string;
    step_order: number;
    meeting_date?: string;
    meeting_location?: string;
    participants: any[];
    decisions_made?: string;
    boundary_coordinates?: any;
    verification_notes?: string;
    started_at?: string;
    completed_at?: string;
    documents: Document[];
  }
  
  export interface ClaimCase {
    id: number;
    case_number: string;
    village_name: string;
    district: string;
    state: string;
    claim_type: string;
    applicant_name?: string;
    applicant_contact?: string;
    current_step: string;
    overall_status: string;
    created_at: string;
    updated_at?: string;
    steps: StepInstance[];
    documents: Document[];
  }
  
  export interface Document {
    id: number;
    filename: string;
    file_path: string;
    file_type: string;
    document_type: string;
    file_size: number;
    mime_type: string;
    extracted_text?: string;
    processed_data?: any;
    uploaded_at: string;
    step_instance_id?: number;
  }
  
  export interface WorkflowProgress {
    total_steps: number;
    completed_steps: number;
    progress_percentage: number;
    current_step: StepInstance;
    steps: StepInstance[];
  }
  
  export interface Stakeholder {
    id: number;
    name: string;
    role: string;
    contact_info: any;
    jurisdiction: string;
    is_active: boolean;
  }
  
  // Step type mappings
  export const STEP_TYPES = {
    GRAM_SABHA_MEETING: 'gram_sabha_meeting',
    FRC_MEETING: 'frc_meeting',
    VISUAL_MAPPING: 'visual_mapping',
    NOC_PROCESS: 'noc_process',
    VERIFICATION: 'verification',
    GRAM_SABHA_PRESENTATION: 'gram_sabha_presentation',
    SDLC_REVIEW: 'sdlc_review',
    DLC_APPROVAL: 'dlc_approval'
  } as const;
  
  export const STEP_STATUSES = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    AWAITING_REVIEW: 'awaiting_review',
    COMPLETED: 'completed'
  } as const;
  
  export const STEP_DISPLAY_NAMES: Record<string, string> = {
    [STEP_TYPES.GRAM_SABHA_MEETING]: 'Gram Sabha Meeting',
    [STEP_TYPES.FRC_MEETING]: 'FRC Meeting & Planning',
    [STEP_TYPES.VISUAL_MAPPING]: 'Visual Mapping',
    [STEP_TYPES.NOC_PROCESS]: 'NOC Process',
    [STEP_TYPES.VERIFICATION]: 'Verification',
    [STEP_TYPES.GRAM_SABHA_PRESENTATION]: 'Gram Sabha Presentation',
    [STEP_TYPES.SDLC_REVIEW]: 'SDLC Review',
    [STEP_TYPES.DLC_APPROVAL]: 'DLC Approval'
  };