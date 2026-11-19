from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field

# ---------------- USER & AUTH ----------------

class UserLoginRequest(BaseModel):
    username: str

class UserResponse(BaseModel):
    id: str
    username: str
    full_name: str
    role: str  # DEMO_ADMIN, CLINICIAN_DEMO, VIEWER_DEMO
    is_active: bool

    class Config:
        from_attributes = True

# ---------------- DASHBOARD ----------------

class DashboardSummaryResponse(BaseModel):
    total_cases: int
    active_cases: int
    archived_cases: int
    status_counts: Dict[str, int]
    total_files: int
    total_reports: int
    total_consultations: int
    recent_cases: List[Dict[str, Any]]
    system_mode: str = "DEMO_MOCK_PROTOTYPE"

# ---------------- CITATIONS & EXTRACTION ----------------

class SourceCitation(BaseModel):
    document_id: str
    page_number: int
    section: str
    quote: str
    bbox: Optional[Dict[str, float]] = None

class FieldExtraction(BaseModel):
    value: Optional[Union[str, List[str]]] = None
    status: str = Field(..., description="present | missing | negative | conflicting | unverified | not_processed")
    source: Optional[SourceCitation] = None
    note: Optional[str] = None

class ExtractionResponse(BaseModel):
    case_id: str
    mode: str = "mock"
    is_mock: bool = True
    provider: Optional[str] = "FixtureDocumentProvider"
    fixture_id: Optional[str] = None
    fields: Dict[str, FieldExtraction]
    warnings: Optional[List[str]] = None

# ---------------- PREDICTIONS ----------------

class PredictionVisualBox(BaseModel):
    label: str
    x: float
    y: float
    width: float
    height: float
    color: str = "#EF4444"
    description: str

class PredictionLabel(BaseModel):
    code: str
    name_vi: str
    score: float
    threshold_mock: float = 0.5
    is_suspected: bool
    finding_description: str
    visual_box: Optional[PredictionVisualBox] = None

class PredictionResponse(BaseModel):
    case_id: str
    mode: str = "mock"
    is_mock: bool = True
    status: Optional[str] = "OK"
    error_type: Optional[str] = None
    image_id: Optional[str] = None
    image_source_type: str = "illustrative"
    paired_with_document: bool = False
    model_name: str = "MOCK_FIXTURE_NO_REAL_MODEL"
    view_position: str = "PA"
    labels: List[PredictionLabel]
    disclaimer: str
    warnings: Optional[List[str]] = None

# ---------------- REPORTS & REVIEWS ----------------

class ReportContent(BaseModel):
    summary: str
    clinical_notes: str
    xray_observations: str
    attention_points: List[str]
    recommended_action: str
    source_references: Optional[List[Dict[str, Any]]] = None

class ReportVersionResponse(BaseModel):
    id: str
    case_id: str
    version_number: int
    status: str
    parent_version_id: Optional[str] = None
    actor_label: str
    actor_role: str
    content: ReportContent
    change_summary: Optional[str] = None
    analysis_run_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReportDraftEditRequest(BaseModel):
    parent_version_id: str
    actor_label: str = Field(default="Bác sĩ Demo", min_length=2)
    content: ReportContent
    change_summary: Optional[str] = "Chỉnh sửa bổ sung bởi Bác sĩ Demo"

class ReportApproveRequest(BaseModel):
    actor_label: str = Field(default="Bác sĩ Demo", min_length=2)
    confirmation_checked: bool = True
    notes: Optional[str] = "Đã đối chiếu lâm sàng và xác nhận báo cáo sơ bộ"

class AuditLogResponse(BaseModel):
    id: str
    case_id: str
    version_id: str
    actor_label: str
    action: str
    source_version_id: Optional[str] = None
    timestamp_utc: datetime
    change_summary: Optional[str] = None

    class Config:
        from_attributes = True

# ---------------- CASE MANAGEMENT ----------------

class CaseCreateRequest(BaseModel):
    case_code: Optional[str] = None
    patient_name_demo: str = Field(..., min_length=2)
    age: Optional[int] = None
    gender: Optional[str] = "Nam"
    notes: Optional[str] = None
    created_by: Optional[str] = "BS. Trần Demo (CLINICIAN_DEMO)"

class CaseUpdateRequest(BaseModel):
    patient_name_demo: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class CaseListItem(BaseModel):
    id: str
    case_code: Optional[str] = None
    patient_name_demo: str
    age: Optional[int] = None
    gender: Optional[str] = None
    status: str
    is_mock: bool = True
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    archived_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CaseDetailResponse(BaseModel):
    id: str
    case_code: Optional[str] = None
    patient_name_demo: str
    age: Optional[int] = None
    gender: Optional[str] = None
    status: str
    is_mock: bool = True
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    archived_at: Optional[datetime] = None
    has_document: bool
    has_image: bool
    latest_version: Optional[ReportVersionResponse] = None
    report_versions_count: int

# ---------------- FILES ----------------

class CaseFileResponse(BaseModel):
    id: str
    case_id: str
    kind: str
    original_filename: str
    sha256_hash: str
    mime_type: str
    size_bytes: int
    page_count: int
    view_position: str
    created_at: datetime

    class Config:
        from_attributes = True

# ---------------- PROCESSING JOBS ----------------

class ProcessCaseRequest(BaseModel):
    mode: Optional[str] = "mock_fixture"  # mock_fixture, no_model, manual
    selected_document_file_id: Optional[str] = None
    selected_image_file_id: Optional[str] = None
    view_position: Optional[str] = "PA"

class ProcessingJobResponse(BaseModel):
    job_id: str
    case_id: str
    status: str
    mode: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None

# ---------------- CONSULTATIONS ----------------

class ConsultationCreateRequest(BaseModel):
    title: str = Field(..., min_length=2)
    scheduled_at: str
    zoom_meeting_url: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[str] = "BS. Hội Chẩn Demo"

class ConsultationUpdateRequest(BaseModel):
    status: Optional[str] = None  # SCHEDULED, OPENED, COMPLETED, CANCELED
    conclusion_notes: Optional[str] = None
    zoom_meeting_url: Optional[str] = None

class ConsultationResponse(BaseModel):
    id: str
    case_id: str
    report_version_id: Optional[str] = None
    title: str
    scheduled_at: str
    zoom_meeting_url: Optional[str] = None
    status: str
    conclusion_notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ---------------- CONFIG ----------------

class DemoConfigResponse(BaseModel):
    demo_mode: bool = True
    disclaimer: str
    zoom_meeting_url: Optional[str] = None
    zoom_enabled: bool = False
    public_demo_url: Optional[str] = None
    max_upload_mb: int = 20
    max_pdf_pages: int = 20
