import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.app.models.models import CaseModel, ReportVersionModel, AuditLogModel
from backend.app.schemas.schemas import ReportDraftEditRequest, ReportApproveRequest

class ReportService:
    @staticmethod
    def list_reports(db: Session, case_id: str):
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")
        return db.query(ReportVersionModel).filter(
            ReportVersionModel.case_id == case_id
        ).order_by(ReportVersionModel.version_number.asc()).all()

    @staticmethod
    def get_report(db: Session, case_id: str, version_id: str):
        report = db.query(ReportVersionModel).filter(
            ReportVersionModel.id == version_id,
            ReportVersionModel.case_id == case_id
        ).first()
        if not report:
            raise HTTPException(
                status_code=404, 
                detail=f"Không tìm thấy phiên bản báo cáo '{version_id}' thuộc ca '{case_id}'"
            )
        return report

    @staticmethod
    def create_draft_edit(db: Session, case_id: str, payload: ReportDraftEditRequest):
        # 1. Validate case exists
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        # 2. Validate parent version exists and belongs to case
        parent = db.query(ReportVersionModel).filter(
            ReportVersionModel.id == payload.parent_version_id,
            ReportVersionModel.case_id == case_id
        ).first()
        if not parent:
            raise HTTPException(
                status_code=400,
                detail=f"Phiên bản gốc '{payload.parent_version_id}' không hợp lệ hoặc không thuộc ca '{case_id}'"
            )

        # 3. Validate content is not empty
        if not payload.content.summary or not payload.content.clinical_notes:
            raise HTTPException(status_code=422, detail="Nội dung báo cáo không được để trống")

        # 4. Find next version number
        latest_ver = db.query(ReportVersionModel).filter(
            ReportVersionModel.case_id == case_id
        ).order_by(ReportVersionModel.version_number.desc()).first()
        next_ver_num = (latest_ver.version_number + 1) if latest_ver else 1

        new_version_id = f"REP-{case_id}-V{next_ver_num}-{uuid.uuid4().hex[:6]}"
        new_report = ReportVersionModel(
            id=new_version_id,
            case_id=case_id,
            version_number=next_ver_num,
            status="DOCTOR_EDITED",
            parent_version_id=parent.id,
            actor_label=payload.actor_label,
            actor_role="demo_doctor",
            content=payload.content.model_dump(),
            change_summary=payload.change_summary or "Chỉnh sửa bởi Bác sĩ Demo",
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(new_report)

        # 5. Create audit log
        audit = AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8]}",
            case_id=case_id,
            version_id=new_version_id,
            actor_label=payload.actor_label,
            action="SAVED_DOCTOR_EDIT",
            source_version_id=parent.id,
            timestamp_utc=datetime.datetime.now(datetime.timezone.utc),
            change_summary=payload.change_summary or "Chỉnh sửa bởi Bác sĩ Demo"
        )
        db.add(audit)

        # 6. Update case status
        case.status = "DOCTOR_EDITED"

        db.commit()
        db.refresh(new_report)
        return new_report

    @staticmethod
    def approve_report(db: Session, case_id: str, version_id: str, payload: ReportApproveRequest):
        # 1. Validate case
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        # 2. Validate target version belongs to this case
        target_version = db.query(ReportVersionModel).filter(
            ReportVersionModel.id == version_id,
            ReportVersionModel.case_id == case_id
        ).first()
        if not target_version:
            raise HTTPException(
                status_code=400,
                detail=f"Phiên bản '{version_id}' không tồn tại hoặc không thuộc ca '{case_id}'"
            )

        if not payload.confirmation_checked:
            raise HTTPException(status_code=400, detail="Cần xác nhận kiểm tra lâm sàng trước khi phê duyệt")

        # 3. Create immutable approved version
        latest_ver = db.query(ReportVersionModel).filter(
            ReportVersionModel.case_id == case_id
        ).order_by(ReportVersionModel.version_number.desc()).first()
        next_ver_num = (latest_ver.version_number + 1) if latest_ver else 1

        approved_version_id = f"REP-{case_id}-V{next_ver_num}-APPROVED-{uuid.uuid4().hex[:6]}"
        approved_report = ReportVersionModel(
            id=approved_version_id,
            case_id=case_id,
            version_number=next_ver_num,
            status="DOCTOR_APPROVED",
            parent_version_id=target_version.id,
            actor_label=payload.actor_label,
            actor_role="demo_doctor",
            content=target_version.content,
            change_summary=payload.notes or "Bác sĩ đối chiếu lâm sàng và phê duyệt chính thức",
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(approved_report)

        # 4. Audit Log
        audit = AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8]}",
            case_id=case_id,
            version_id=approved_version_id,
            actor_label=payload.actor_label,
            action="APPROVED_BY_DOCTOR",
            source_version_id=target_version.id,
            timestamp_utc=datetime.datetime.now(datetime.timezone.utc),
            change_summary=payload.notes or "Bác sĩ đối chiếu lâm sàng và phê duyệt chính thức"
        )
        db.add(audit)

        case.status = "DOCTOR_APPROVED"

        db.commit()
        db.refresh(approved_report)
        return approved_report

    @staticmethod
    def get_audit_logs(db: Session, case_id: str):
        return db.query(AuditLogModel).filter(
            AuditLogModel.case_id == case_id
        ).order_by(AuditLogModel.timestamp_utc.asc()).all()

    @staticmethod
    def compare_reports(db: Session, case_id: str, v1_id: str, v2_id: str) -> Dict[str, Any]:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        r1 = db.query(ReportVersionModel).filter(ReportVersionModel.id == v1_id, ReportVersionModel.case_id == case_id).first()
        r2 = db.query(ReportVersionModel).filter(ReportVersionModel.id == v2_id, ReportVersionModel.case_id == case_id).first()

        if not r1:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy phiên bản báo cáo {v1_id}")
        if not r2:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy phiên bản báo cáo {v2_id}")

        c1 = r1.content or {}
        c2 = r2.content or {}

        fields_to_compare = [
            ("summary", "Tóm tắt ca bệnh"),
            ("clinical_notes", "Nhận định lâm sàng"),
            ("xray_observations", "Nhận định hình ảnh X-quang"),
            ("attention_points", "Điểm cần lưu ý"),
            ("recommended_action", "Hành động đề xuất")
        ]

        differences = []
        for field_key, field_label in fields_to_compare:
            val1 = c1.get(field_key)
            val2 = c2.get(field_key)
            is_changed = (val1 != val2)
            differences.append({
                "field": field_key,
                "label": field_label,
                "v1_value": val1,
                "v2_value": val2,
                "is_changed": is_changed
            })

        return {
            "case_id": case_id,
            "v1": {
                "id": r1.id,
                "version_number": r1.version_number,
                "status": r1.status,
                "actor_label": r1.actor_label,
                "created_at": r1.created_at.isoformat() if r1.created_at else None
            },
            "v2": {
                "id": r2.id,
                "version_number": r2.version_number,
                "status": r2.status,
                "actor_label": r2.actor_label,
                "created_at": r2.created_at.isoformat() if r2.created_at else None
            },
            "differences": differences
        }

    @staticmethod
    def export_report_pdf(db: Session, case_id: str, version_id: str) -> bytes:
        from backend.app.services.pdf_exporter import generate_report_pdf_bytes

        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        report = db.query(ReportVersionModel).filter(
            ReportVersionModel.id == version_id,
            ReportVersionModel.case_id == case_id
        ).first()
        if not report:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy phiên bản {version_id}")

        case_data = {
            "id": case.id,
            "case_code": case.case_code or case.id,
            "patient_name_demo": case.patient_name_demo,
            "age": case.age,
            "gender": case.gender,
            "notes": case.notes
        }

        report_data = {
            "id": report.id,
            "version_number": report.version_number,
            "status": report.status,
            "actor_label": report.actor_label,
            "actor_role": report.actor_role,
            "content": report.content,
            "change_summary": report.change_summary,
            "created_at": report.created_at
        }

        return generate_report_pdf_bytes(report_data, case_data)
