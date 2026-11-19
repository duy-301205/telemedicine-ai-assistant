from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field

class SourceCitation(BaseModel):
    document_id: str
    page_number: int
    section: str
    quote: str
    bbox: Optional[Dict[str, float]] = None

class FieldExtraction(BaseModel):
    value: Optional[Union[str, List[str]]] = None
    status: str = Field(..., description="present | missing | negative")
    source: Optional[SourceCitation] = None
    note: Optional[str] = None

class ExtractionResponse(BaseModel):
    case_id: str
    mode: str = "mock"
    fields: Dict[str, FieldExtraction]

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
    image_id: Optional[str] = None
    image_source_type: str = "illustrative"
    paired_with_document: bool = False
    model_name: str = "MOCK_FIXTURE_NO_REAL_MODEL"
    labels: List[PredictionLabel]
    disclaimer: str

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

class CaseListItem(BaseModel):
    id: str
    patient_name_demo: str
    age: Optional[int] = None
    gender: Optional[str] = None
    status: str
    is_mock: bool = True
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CaseDetailResponse(BaseModel):
    id: str
    patient_name_demo: str
    age: Optional[int] = None
    gender: Optional[str] = None
    status: str
    is_mock: bool = True
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    has_document: bool
    has_image: bool
    latest_version: Optional[ReportVersionResponse] = None
    report_versions_count: int

class DemoConfigResponse(BaseModel):
    demo_mode: bool = True
    disclaimer: str
    zoom_meeting_url: Optional[str] = None
    zoom_enabled: bool = False
    public_demo_url: Optional[str] = None
