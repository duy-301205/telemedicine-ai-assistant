from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.config import settings
from backend.app.services.case_service import CaseService
from backend.app.services.report_service import ReportService
from backend.app.schemas.schemas import (
    CaseListItem,
    CaseDetailResponse,
    ExtractionResponse,
    PredictionResponse,
    ReportVersionResponse,
    ReportDraftEditRequest,
    ReportApproveRequest,
    AuditLogResponse,
    DemoConfigResponse
)

router = APIRouter()

# ---------------- HEALTH & CONFIG ----------------

@router.get("/health", summary="Health check")
def health_check():
    return {
        "status": "healthy",
        "service": "Telemedicine AI Demo API",
        "version": "1.0.0",
        "demo_mode": settings.DEMO_MODE,
        "disclaimer": "HỆ THỐNG PROTOTYPE DEMO — KHÔNG DÙNG CHO QUYẾT ĐỊNH LÂM SÀNG"
    }

@router.get("/demo/config", response_model=DemoConfigResponse, summary="Public safe demo config")
def get_demo_config():
    zoom_url = settings.ZOOM_MEETING_URL.strip() if settings.ZOOM_MEETING_URL else None
    zoom_enabled = bool(zoom_url and (zoom_url.startswith("https://") or zoom_url.startswith("http://")))
    return DemoConfigResponse(
        demo_mode=settings.DEMO_MODE,
        disclaimer="DEMO / MOCK — KHÔNG PHẢI KẾT QUẢ AI THỰC TẾ. Không gửi hồ sơ hay dữ liệu bệnh nhân sang Zoom.",
        zoom_meeting_url=zoom_url if zoom_enabled else None,
        zoom_enabled=zoom_enabled,
        public_demo_url=settings.PUBLIC_DEMO_URL or None
    )

# ---------------- CASES ----------------

@router.get("/cases", response_model=List[CaseListItem], summary="List all demo cases")
def list_cases(db: Session = Depends(get_db)):
    return CaseService.list_cases(db)

@router.get("/cases/{case_id}", response_model=CaseDetailResponse, summary="Get case details")
def get_case_detail(case_id: str, db: Session = Depends(get_db)):
    return CaseService.get_case(db, case_id)

@router.get("/cases/{case_id}/document", summary="Get case PDF document")
def get_case_document(case_id: str, db: Session = Depends(get_db)):
    return CaseService.get_document_file(db, case_id)

@router.get("/cases/{case_id}/image", summary="Get case X-ray illustration")
def get_case_image(case_id: str, db: Session = Depends(get_db)):
    return CaseService.get_image_file(db, case_id)

@router.get("/cases/{case_id}/extraction", response_model=ExtractionResponse, summary="Get extraction fields with sources")
def get_case_extraction(case_id: str, db: Session = Depends(get_db)):
    return CaseService.get_extraction(db, case_id)

@router.get("/cases/{case_id}/predictions", response_model=PredictionResponse, summary="Get mock X-ray predictions")
def get_case_predictions(case_id: str, db: Session = Depends(get_db)):
    return CaseService.get_predictions(db, case_id)

# ---------------- REPORTS & REVIEWS ----------------

@router.get("/cases/{case_id}/reports", response_model=List[ReportVersionResponse], summary="List report versions")
def list_case_reports(case_id: str, db: Session = Depends(get_db)):
    return ReportService.list_reports(db, case_id)

@router.get("/cases/{case_id}/reports/{version_id}", response_model=ReportVersionResponse, summary="Get specific report version")
def get_case_report_version(case_id: str, version_id: str, db: Session = Depends(get_db)):
    return ReportService.get_report(db, case_id, version_id)

@router.post("/cases/{case_id}/reports/draft-edit", response_model=ReportVersionResponse, summary="Save doctor edited draft version")
def save_draft_edit(case_id: str, payload: ReportDraftEditRequest, db: Session = Depends(get_db)):
    return ReportService.create_draft_edit(db, case_id, payload)

@router.post("/cases/{case_id}/reports/{version_id}/approve", response_model=ReportVersionResponse, summary="Approve report version")
def approve_report(case_id: str, version_id: str, payload: ReportApproveRequest, db: Session = Depends(get_db)):
    return ReportService.approve_report(db, case_id, version_id, payload)

@router.get("/cases/{case_id}/reports/{version_id}/export", summary="Export report version as JSON")
def export_report_version(case_id: str, version_id: str, db: Session = Depends(get_db)):
    report = ReportService.get_report(db, case_id, version_id)
    return {
        "export_metadata": {
            "exported_at": str(report.created_at),
            "system": "Telemedicine AI Demo Prototype",
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
