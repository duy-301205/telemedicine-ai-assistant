import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.app.models.models import CaseModel, ReportVersionModel, AuditLogModel, ExtractionModel, PredictionModel
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
        parent = None
        if payload.parent_version_id and payload.parent_version_id not in ["INITIAL", "NEW", "NONE", ""]:
            parent = db.query(ReportVersionModel).filter(
                ReportVersionModel.id == payload.parent_version_id,
                ReportVersionModel.case_id == case_id
            ).first()
            if not parent:
                # If specific ID was provided but not found, fallback to latest existing version if available
                latest_existing = db.query(ReportVersionModel).filter(
                    ReportVersionModel.case_id == case_id
                ).order_by(ReportVersionModel.version_number.desc()).first()
                if latest_existing:
                    parent = latest_existing
                else:
                    parent = None
        else:
            parent = db.query(ReportVersionModel).filter(
                ReportVersionModel.case_id == case_id
            ).order_by(ReportVersionModel.version_number.desc()).first()

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
            parent_version_id=parent.id if parent else None,
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
            action="SAVED_DOCTOR_EDIT" if parent else "CREATED_INITIAL_DRAFT",
            source_version_id=parent.id if parent else None,
            timestamp_utc=datetime.datetime.now(datetime.timezone.utc),
            change_summary=payload.change_summary or ("Chỉnh sửa bởi Bác sĩ Demo" if parent else "Khởi tạo bản thảo báo cáo đầu tiên")
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

    @staticmethod
    def generate_initial_report(db: Session, case_id: str, actor_label: str = "AI Assistant (Prototype)") -> ReportVersionModel:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        # Check existing extraction and prediction
        ext = db.query(ExtractionModel).filter(ExtractionModel.case_id == case_id).first()
        pred = db.query(PredictionModel).filter(PredictionModel.case_id == case_id).first()

        age_str = f", {case.age} tuổi" if case.age else ""
        gender_str = f", giới tính {case.gender}" if case.gender else ""
        summary_text = f"Bệnh nhân giả lập: {case.patient_name_demo}{age_str}{gender_str}."

        symptoms_list = []
        history_list = []
        meds_list = []
        missing_notes = []

        if ext and ext.fields_data:
            fields = ext.fields_data
            sym_data = fields.get("symptoms", {})
            if sym_data.get("value"):
                val = sym_data["value"]
                symptoms_list = val if isinstance(val, list) else [str(val)]

            hist_data = fields.get("medical_history", {})
            if hist_data.get("value"):
                val = hist_data["value"]
                history_list = val if isinstance(val, list) else [str(val)]

            med_data = fields.get("medications", {})
            if med_data.get("value"):
                val = med_data["value"]
                meds_list = val if isinstance(val, list) else [str(val)]

            allergy_data = fields.get("allergies", {})
            if allergy_data.get("status") == "missing":
                missing_notes.append("Thiếu thông tin dị ứng trong hồ sơ trích xuất.")
            elif allergy_data.get("value"):
                val = allergy_data["value"]
                missing_notes.append(f"Dị ứng: {', '.join(val) if isinstance(val, list) else val}")

        if not symptoms_list:
            symptoms_list = ["Bệnh nhân theo dõi khám hô hấp - tim mạch."]
        if not history_list:
            history_list = ["Chưa ghi nhận tiền sử bệnh nền đặc biệt."]
        if not meds_list:
            meds_list = ["Không dùng thuốc điều trị mạn tính kéo dài."]

        clinical_notes_text = (
            f"Triệu chứng: {', '.join(symptoms_list)}.\n"
            f"Tiền sử: {', '.join(history_list)}.\n"
            f"Thuốc đang dùng: {', '.join(meds_list)}."
        )

        xray_obs = []
        high_risk_labels = []
        if pred and pred.labels:
            for lbl in pred.labels:
                score = lbl.get("score", 0.0)
                thresh = lbl.get("threshold_mock", 0.5)
                name_vi = lbl.get("name_vi", lbl.get("code", "Tổn thương"))
                desc = lbl.get("finding_description", "")
                if score >= thresh:
                    high_risk_labels.append(f"{name_vi} ({score:.2f})")
                    xray_obs.append(f"- {name_vi} (Xác suất mô phỏng {score:.2f} >= ngưỡng {thresh:.2f}): {desc}")
                else:
                    xray_obs.append(f"- {name_vi} (Xác suất {score:.2f} < ngưỡng {thresh:.2f}): Chưa ghi nhận bất thường.")
        else:
            xray_obs.append("Chưa thực hiện phân tích X-quang hoặc chưa có ảnh đối chiếu.")

        xray_text = "\n".join(xray_obs)

        attention_points = []
        if case.error_type == "MISSING_PAGE":
            attention_points.append("Cảnh báo: Hồ sơ thiếu trang kết quả cận lâm sàng; cần bổ sung.")
        if case.error_type == "AP_VIEW_WARNING":
            attention_points.append("Cảnh báo tư thế chụp AP: bóng tim có thể bị phóng đại giả lập.")
        if missing_notes:
            attention_points.extend(missing_notes)
        if high_risk_labels:
            attention_points.append(f"Điểm số AI vượt ngưỡng nghi ngờ: {', '.join(high_risk_labels)}.")
        if not attention_points:
            attention_points.append("Cần đối chiếu thêm với lâm sàng trực tiếp khi tiến hành hội chẩn.")

        recommended_action = "Chuyển tiếp hồ sơ chuẩn bị cho buổi hội chẩn từ xa; kiểm tra lại cận lâm sàng và tiền sử dị ứng với người bệnh."

        latest_ver = db.query(ReportVersionModel).filter(
            ReportVersionModel.case_id == case_id
        ).order_by(ReportVersionModel.version_number.desc()).first()
        next_ver_num = (latest_ver.version_number + 1) if latest_ver else 1

        new_version_id = f"REP-{case_id}-V{next_ver_num}-{uuid.uuid4().hex[:6]}"
        content_dict = {
            "summary": summary_text,
            "clinical_notes": clinical_notes_text,
            "xray_observations": xray_text,
            "attention_points": attention_points,
            "recommended_action": recommended_action,
            "source_references": [
                {"field": "symptoms", "source": "Hồ sơ bệnh án gốc"},
                {"field": "xray", "source": "Phân tích hình ảnh X-quang"}
            ]
        }

        report = ReportVersionModel(
            id=new_version_id,
            case_id=case_id,
            version_number=next_ver_num,
            status="AI_DRAFT",
            parent_version_id=latest_ver.id if latest_ver else None,
            actor_label=actor_label,
            actor_role="ai_pipeline",
            content=content_dict,
            change_summary="Tự động tổng hợp bản thảo báo cáo sơ bộ từ dữ liệu ca bệnh (AI Draft V1)",
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(report)

        audit = AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8]}",
            case_id=case_id,
            version_id=new_version_id,
            actor_label=actor_label,
            action="GENERATED_INITIAL_DRAFT",
            source_version_id=latest_ver.id if latest_ver else None,
            timestamp_utc=datetime.datetime.now(datetime.timezone.utc),
            change_summary="Tự động tổng hợp bản thảo báo cáo sơ bộ từ dữ liệu ca bệnh (AI Draft V1)"
        )
        db.add(audit)

        case.status = "AI_DRAFT"
        db.commit()
        db.refresh(report)
        return report
