from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.models import (
    CaseModel,
    CaseFileModel,
    ReportVersionModel,
    ConsultationModel,
    AuditLogModel
)
from backend.app.schemas.schemas import DashboardSummaryResponse

class DashboardService:
    @staticmethod
    def get_summary(db: Session) -> Dict[str, Any]:
        total_cases = db.query(CaseModel).count()
        archived_cases = db.query(CaseModel).filter(CaseModel.archived_at.isnot(None)).count()
        active_cases = total_cases - archived_cases

        # Status distribution
        statuses = ["CREATED", "FILES_UPLOADED", "PROCESSING", "AI_DRAFT", "DOCTOR_EDITED", "DOCTOR_APPROVED", "CONSULTATION_READY", "MISSING_PAGE", "INVALID_IMAGE", "ARCHIVED"]
        status_counts = {}
        for s in statuses:
            cnt = db.query(CaseModel).filter(CaseModel.status == s).count()
            if cnt > 0:
                status_counts[s] = cnt

        total_files = db.query(CaseFileModel).count()
        total_reports = db.query(ReportVersionModel).count()
        total_consultations = db.query(ConsultationModel).count()

        recent_cases_q = db.query(CaseModel).order_by(CaseModel.created_at.desc()).limit(8).all()
        recent_cases = []
        for c in recent_cases_q:
            recent_cases.append({
                "id": c.id,
                "case_code": c.case_code or c.id,
                "patient_name_demo": c.patient_name_demo,
                "status": c.status,
                "error_type": c.error_type,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "has_notes": bool(c.notes)
            })

        return {
            "total_cases": total_cases,
            "active_cases": active_cases,
            "archived_cases": archived_cases,
            "status_counts": status_counts,
            "total_files": total_files,
            "total_reports": total_reports,
            "total_consultations": total_consultations,
            "recent_cases": recent_cases,
            "system_mode": "DEMO_MOCK_PROTOTYPE"
        }
