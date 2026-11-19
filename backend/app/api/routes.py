from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Response
from fastapi.responses import JSONResponse, Response, StreamingResponse
from sqlalchemy.orm import Session
import io

from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.models import UserModel
from backend.app.services.case_service import CaseService
from backend.app.services.report_service import ReportService
from backend.app.services.consultation_service import ConsultationService
from backend.app.services.dashboard_service import DashboardService
from backend.app.schemas.schemas import (
    UserLoginRequest,
    UserResponse,
    DashboardSummaryResponse,
    CaseListItem,
    CaseDetailResponse,
    CaseCreateRequest,
    CaseUpdateRequest,
    CaseFileResponse,
    ExtractionResponse,
    PredictionResponse,
    ProcessCaseRequest,
    ProcessingJobResponse,
    ReportVersionResponse,
    ReportDraftEditRequest,
    ReportApproveRequest,
    AuditLogResponse,
    ConsultationCreateRequest,
    ConsultationUpdateRequest,
    ConsultationResponse,
    DemoConfigResponse
)

router = APIRouter()

# ---------------- HEALTH & CONFIG ----------------

@router.get("/health", summary="Health check")
def health_check():
    return {
        "status": "healthy",
        "service": "Telemedicine AI Business System API",
        "version": "2.0.0",
        "demo_mode": settings.DEMO_MODE,
        "disclaimer": "HỆ THỐNG QUẢN LÝ CA BỆNH VÀ TRỢ LÝ HỘI CHẨN TELEMEDICINE (AI MOCK ADAPTERS)"
    }

@router.get("/demo/config", response_model=DemoConfigResponse, summary="Public safe demo config")
def get_demo_config():
    zoom_url = settings.ZOOM_MEETING_URL.strip() if settings.ZOOM_MEETING_URL else None
    zoom_enabled = bool(zoom_url and (zoom_url.startswith("https://") or zoom_url.startswith("http://")))
    return DemoConfigResponse(
        demo_mode=settings.DEMO_MODE,
        disclaimer="MOCK ADAPTERS CHO 2 PIPELINE AI — MỌI TÁC VỤ QUẢN LÝ CA, UPLOAD, LỊCH HỘI CHẨN VÀ PHÊ DUYỆT ĐỀU LƯU DỮ LIỆU THẬT.",
        zoom_meeting_url=zoom_url if zoom_enabled else None,
        zoom_enabled=zoom_enabled,
        public_demo_url=settings.PUBLIC_DEMO_URL or None,
        max_upload_mb=20,
        max_pdf_pages=20
    )

# ---------------- AUTH & SESSIONS ----------------

@router.get("/auth/demo-accounts", summary="List available demo accounts")
def list_demo_accounts(db: Session = Depends(get_db)):
    users = db.query(UserModel).filter(UserModel.is_active == True).all()
    accounts = []
    for u in users:
        desc = "Toàn quyền quản trị, tạo ca, upload, xóa, duyệt" if u.role == "DEMO_ADMIN" else \
               "Bác sĩ chuyên khoa, chỉnh sửa báo cáo, phê duyệt, lên lịch hội chẩn" if u.role == "CLINICIAN_DEMO" else \
               "Quan sát viên, thẩm tra hồ sơ, chỉ đọc"
        accounts.append({
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role,
            "description": desc
        })
    return accounts

@router.post("/auth/login", summary="Login with username or role")
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    u = db.query(UserModel).filter(
        (UserModel.username == payload.username) |
        (UserModel.role == payload.username)
    ).first()
    if not u:
        # Fallback create or return error
        raise HTTPException(status_code=401, detail="Tài khoản không hợp lệ.")
    return {
        "access_token": f"demo-token-{u.id}",
        "token_type": "bearer",
        "user": {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active
        }
    }

@router.get("/auth/me", response_model=UserResponse, summary="Get current logged in user")
def get_current_user(role: Optional[str] = None, db: Session = Depends(get_db)):
    target_role = role or "CLINICIAN_DEMO"
    u = db.query(UserModel).filter(UserModel.role == target_role).first()
    if not u:
        u = db.query(UserModel).first()
    return u

# ---------------- DASHBOARD ----------------

@router.get("/dashboard/summary", response_model=DashboardSummaryResponse, summary="Get dashboard summary metrics")
def get_dashboard_summary(db: Session = Depends(get_db)):
    return DashboardService.get_summary(db)

# ---------------- CASES MANAGEMENT ----------------

@router.get("/cases", response_model=List[CaseListItem], summary="List cases with search and filters")
def list_cases(
    search: Optional[str] = Query(None, description="Search by name, ID or case code"),
    status: Optional[str] = Query(None, description="Filter by status (or ALL)"),
    include_archived: bool = Query(False, description="Include archived cases"),
    sort_by: str = Query("created_at", description="created_at | patient_name | status"),
    sort_dir: str = Query("desc", description="asc | desc"),
    db: Session = Depends(get_db)
):
    return CaseService.list_cases(db, search, status, include_archived, sort_by, sort_dir)

@router.post("/cases", response_model=CaseDetailResponse, summary="Create a new clinical case")
def create_case(payload: CaseCreateRequest, db: Session = Depends(get_db)):
    created = CaseService.create_case(db, payload)
    return CaseService.get_case(db, created.id)

@router.get("/cases/{case_id}", response_model=CaseDetailResponse, summary="Get case details")
def get_case_detail(case_id: str, db: Session = Depends(get_db)):
    return CaseService.get_case(db, case_id)

@router.patch("/cases/{case_id}", response_model=CaseDetailResponse, summary="Update case details")
def update_case(case_id: str, payload: CaseUpdateRequest, db: Session = Depends(get_db)):
    CaseService.update_case(db, case_id, payload)
    return CaseService.get_case(db, case_id)

@router.delete("/cases/{case_id}", summary="Archive case")
def archive_case(case_id: str, db: Session = Depends(get_db)):
    return CaseService.archive_case(db, case_id)

# ---------------- FILES & UPLOADS ----------------

@router.post("/cases/{case_id}/files", response_model=CaseFileResponse, summary="Upload a document or image file to a case")
def upload_case_file(
    case_id: str,
    file: UploadFile = File(...),
    kind: str = Form("document"),  # document, image
    view_position: str = Form("PA"),  # PA, AP, UNKNOWN
    uploaded_by: str = Form("Demo Clinician"),
    db: Session = Depends(get_db)
):
    return CaseService.upload_case_file(db, case_id, file, kind, view_position, uploaded_by)

@router.get("/cases/{case_id}/files", response_model=List[CaseFileResponse], summary="List all files attached to a case")
def list_case_files(case_id: str, db: Session = Depends(get_db)):
    return CaseService.list_case_files(db, case_id)

@router.get("/cases/{case_id}/document", summary="Get case PDF document")
def get_case_document(case_id: str, db: Session = Depends(get_db)):
    return CaseService.get_document_file(db, case_id)

@router.get("/cases/{case_id}/image", summary="Get case X-ray illustration")
def get_case_image(case_id: str, db: Session = Depends(get_db)):
    return CaseService.get_image_file(db, case_id)

# ---------------- AI PIPELINE PROCESSING & RUNS ----------------

@router.post("/cases/{case_id}/process", summary="Trigger mock AI extraction and X-ray analysis")
def process_case(case_id: str, payload: ProcessCaseRequest = ProcessCaseRequest(), db: Session = Depends(get_db)):
    return CaseService.process_case(db, case_id, payload)

@router.post("/cases/{case_id}/attach-sample-data", summary="Attach sample 2-page PDF and sample X-ray if missing, and run analysis")
def attach_sample_data(case_id: str, db: Session = Depends(get_db)):
    return CaseService.attach_sample_data(db, case_id)

@router.get("/cases/{case_id}/extraction", response_model=ExtractionResponse, summary="Get extraction fields with sources")
def get_case_extraction(case_id: str, db: Session = Depends(get_db)):
    return CaseService.get_extraction(db, case_id)

@router.get("/cases/{case_id}/predictions", response_model=PredictionResponse, summary="Get mock X-ray predictions")
def get_case_predictions(case_id: str, db: Session = Depends(get_db)):
    return CaseService.get_predictions(db, case_id)

@router.post("/cases/{case_id}/manual-extraction", summary="Manual clinician extraction entry")
def manual_extraction_entry(case_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    ext = CaseService.manual_extraction_entry(db, case_id, payload)
    return {"status": "success", "case_id": case_id, "mode": ext.mode, "fields": ext.fields_data}

@router.post("/cases/{case_id}/manual-predictions", summary="Manual clinician predictions entry")
def manual_predictions_entry(case_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    pred = CaseService.manual_predictions_entry(
        db,
        case_id,
        payload.get("labels", []),
        payload.get("disclaimer", "Nhập thủ công bởi bác sĩ lâm sàng.")
    )
    return {"status": "success", "case_id": case_id, "mode": pred.mode, "labels": pred.labels}

# ---------------- REPORTS & REVIEWS ----------------

@router.get("/cases/{case_id}/reports", response_model=List[ReportVersionResponse], summary="List report versions")
def list_case_reports(case_id: str, db: Session = Depends(get_db)):
    return ReportService.list_reports(db, case_id)

@router.get("/cases/{case_id}/reports/compare", summary="Compare two report versions")
def compare_report_versions(
    case_id: str,
    v1: str = Query(..., description="Version ID 1"),
    v2: str = Query(..., description="Version ID 2"),
    db: Session = Depends(get_db)
):
    return ReportService.compare_reports(db, case_id, v1, v2)

@router.get("/cases/{case_id}/reports/{version_id}", response_model=ReportVersionResponse, summary="Get specific report version")
def get_case_report_version(case_id: str, version_id: str, db: Session = Depends(get_db)):
    return ReportService.get_report(db, case_id, version_id)

@router.post("/cases/{case_id}/reports/draft-edit", response_model=ReportVersionResponse, summary="Save doctor edited draft version")
def save_draft_edit(case_id: str, payload: ReportDraftEditRequest, db: Session = Depends(get_db)):
    return ReportService.create_draft_edit(db, case_id, payload)

@router.post("/cases/{case_id}/reports/generate-initial", response_model=ReportVersionResponse, summary="Generate initial AI draft report version (V1)")
def generate_initial_report(
    case_id: str,
    actor_label: str = Query("AI Assistant (Prototype)", description="Label of generating actor"),
    db: Session = Depends(get_db)
):
    return ReportService.generate_initial_report(db, case_id, actor_label)

@router.post("/cases/{case_id}/reports/{version_id}/approve", response_model=ReportVersionResponse, summary="Approve report version")
def approve_report(case_id: str, version_id: str, payload: ReportApproveRequest, db: Session = Depends(get_db)):
    return ReportService.approve_report(db, case_id, version_id, payload)

@router.get("/cases/{case_id}/reports/{version_id}/export", summary="Export report version as JSON or PDF")
def export_report_version(
    case_id: str,
    version_id: str,
    format: str = Query("json", description="json | pdf"),
    db: Session = Depends(get_db)
):
    if format.lower() == "pdf":
        pdf_bytes = ReportService.export_report_pdf(db, case_id, version_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename=report_{case_id}_{version_id}.pdf"}
        )

    report = ReportService.get_report(db, case_id, version_id)
    return {
        "export_metadata": {
            "exported_at": str(report.created_at),
            "system": "Telemedicine AI Business System (Mock AI)",
            "disclaimer": "HỒ SƠ XUẤT RA TỪ MÔ HÌNH THỬ NGHIỆM — KHÔNG DÙNG CHO CHẨN ĐOÁN LÂM SÀNG",
            "is_mock": True
        },
        "report_id": report.id,
        "case_id": report.case_id,
        "version_number": report.version_number,
        "status": report.status,
        "actor_label": report.actor_label,
        "actor_role": report.actor_role,
        "content": report.content,
        "change_summary": report.change_summary
    }

@router.get("/cases/{case_id}/audit-logs", response_model=List[AuditLogResponse], summary="Get case audit logs")
def get_case_audit_logs(case_id: str, db: Session = Depends(get_db)):
    return ReportService.get_audit_logs(db, case_id)

# ---------------- CONSULTATIONS ----------------

@router.get("/consultations", response_model=List[ConsultationResponse], summary="List all consultations")
def list_all_consultations(db: Session = Depends(get_db)):
    return ConsultationService.list_all_consultations(db)

@router.get("/cases/{case_id}/consultations", response_model=List[ConsultationResponse], summary="List consultations for a case")
def list_case_consultations(case_id: str, db: Session = Depends(get_db)):
    return ConsultationService.list_case_consultations(db, case_id)

@router.post("/cases/{case_id}/consultations", response_model=ConsultationResponse, summary="Create consultation for a case")
def create_consultation(case_id: str, payload: ConsultationCreateRequest, db: Session = Depends(get_db)):
    return ConsultationService.create_consultation(db, case_id, payload)

@router.patch("/consultations/{consultation_id}", response_model=ConsultationResponse, summary="Update consultation status / notes")
def update_consultation(consultation_id: str, payload: ConsultationUpdateRequest, db: Session = Depends(get_db)):
    return ConsultationService.update_consultation(db, consultation_id, payload)

# ---------------- RESEARCH & DATA PLAN ----------------

@router.get("/research/data-plan", summary="Get VinDr-CXR data split plan and label consolidation strategy")
def get_research_data_plan():
    return {
        "dataset_name": "VinDr-CXR (PhysioNet)",
        "published_total": 18000,
        "projection_status": "Kế hoạch nghiên cứu đề xuất — Chưa áp dụng thực nghiệm chính thức",
        "posture_scope": "Chỉ áp dụng tư thế ngực thẳng sau-trước (PA view); chưa kiểm chứng trên AP hay tư thế nằm.",
        "label_consolidation_rule": "Đồng thuận đa số từ nhóm đọc chuyên gia (Majority Voting), ghi nhận phiên bản quy tắc xử lý đa bounding box và loại trừ ảnh trùng lặp.",
        "splits": [
            {
                "split_name": "Train chính thức VinDr-CXR",
                "count": 15000,
                "role": "Nguồn dữ liệu phát triển mô hình",
                "cardiomegaly_positive": "Chưa thống kê theo quy tắc chọn",
                "pleural_effusion_positive": "Chưa thống kê theo quy tắc chọn",
                "lung_opacity_positive": "Chưa thống kê theo quy tắc chọn",
                "notes": "Bộ train công bố chính thức"
            },
            {
                "split_name": "Tập con Train (Đề xuất)",
                "count": 3200,
                "role": "Huấn luyện DenseNet / EfficientNet",
                "cardiomegaly_positive": "Chưa thống kê",
                "pleural_effusion_positive": "Chưa thống kê",
                "lung_opacity_positive": "Chưa thống kê",
                "notes": "Trích xuất từ 15.000 train (ví dụ phân bổ)"
            },
            {
                "split_name": "Tập con Validation (Đề xuất)",
                "count": 800,
                "role": "Chốt siêu tham số & ngưỡng phân loại riêng từng nhãn",
                "cardiomegaly_positive": "Chưa thống kê",
                "pleural_effusion_positive": "Chưa thống kê",
                "lung_opacity_positive": "Chưa thống kê",
                "notes": "Trích xuất từ 15.000 train; tách biệt hoàn toàn với Test"
            },
            {
                "split_name": "Test chính thức VinDr-CXR",
                "count": 3000,
                "role": "Kiểm thử độc lập khi được cấp quyền sử dụng",
                "cardiomegaly_positive": "Chưa thống kê",
                "pleural_effusion_positive": "Chưa thống kê",
                "lung_opacity_positive": "Chưa thống kê",
                "notes": "Giữ nguyên độc lập tuyệt đối, không tinh chỉnh trên tập này"
            }
        ],
        "kpi_targets": [
            {
                "code": "MT1",
                "name": "Trích xuất thực thể bệnh án",
                "target": "F1 >= 0.90 trên >= 100 hồ sơ độc lập; 100% trường có nguồn hoặc đánh dấu thiếu",
                "status": "Mục tiêu / Chưa đo",
                "measurement": "So khớp từng trường với ground truth; kiểm tra trích dẫn câu hỗ trợ nội dung"
            },
            {
                "code": "MT2",
                "name": "Nhận diện 3 tổn thương X-quang",
                "target": "Macro-AUROC >= 0.85; Sensitivity >= 0.85 tại Specificity >= 0.75",
                "status": "Mục tiêu / Chưa đo",
                "measurement": "BCEWithLogitsLoss (3 logits); xác định ngưỡng riêng từng nhãn trên validation"
            },
            {
                "code": "MT3",
                "name": "Tích hợp Telemedicine & Versioning",
                "target": ">= 95% kịch bản PASS (>= 29/30 ca); p95 <= 60s; lưu phiên bản bất biến",
                "status": "Mục tiêu / Chưa đo",
                "measurement": "30 kịch bản kiểm thử quy trình trọn vẹn và đối sánh phiên bản"
            }
        ]
    }
