import uuid
import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from backend.app.models.models import CaseModel, ConsultationModel, AuditLogModel
from backend.app.schemas.schemas import ConsultationCreateRequest, ConsultationUpdateRequest, ConsultationResponse

class ConsultationService:
    @staticmethod
    def list_all_consultations(db: Session) -> List[ConsultationModel]:
        return db.query(ConsultationModel).order_by(ConsultationModel.scheduled_at.desc()).all()

    @staticmethod
    def list_case_consultations(db: Session, case_id: str) -> List[ConsultationModel]:
        return db.query(ConsultationModel).filter(
            ConsultationModel.case_id == case_id
        ).order_by(ConsultationModel.scheduled_at.asc()).all()

    @staticmethod
    def create_consultation(
        db: Session,
        case_id: str,
        payload: ConsultationCreateRequest,
        created_by: str = "Demo Clinician"
    ) -> ConsultationModel:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        consultation_id = f"CON-{case_id}-{uuid.uuid4().hex[:6]}"
        new_con = ConsultationModel(
            id=consultation_id,
            case_id=case_id,
            title=payload.title,
            scheduled_at=payload.scheduled_at,
            zoom_meeting_url=payload.zoom_meeting_url,
            status="SCHEDULED",
            conclusion_notes=payload.notes,
            created_by=payload.created_by or created_by,
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(new_con)

        audit = AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8]}",
            case_id=case_id,
            version_id="",
            actor_label=new_con.created_by,
            action="SCHEDULED_CONSULTATION",
            source_version_id=None,
            timestamp_utc=datetime.datetime.now(datetime.timezone.utc),
            change_summary=f"Lên lịch hội chẩn: {payload.title} vào {payload.scheduled_at}"
        )
        db.add(audit)

        case.status = "CONSULTATION_READY"
        db.commit()
        db.refresh(new_con)
        return new_con

    @staticmethod
    def update_consultation(
        db: Session,
        consultation_id: str,
        payload: ConsultationUpdateRequest,
        actor_label: str = "Demo Clinician"
    ) -> ConsultationModel:
        con = db.query(ConsultationModel).filter(ConsultationModel.id == consultation_id).first()
        if not con:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy buổi hội chẩn: {consultation_id}")

        if payload.status:
            con.status = payload.status
        if payload.conclusion_notes:
            con.conclusion_notes = payload.conclusion_notes
        if payload.zoom_meeting_url:
            con.zoom_meeting_url = payload.zoom_meeting_url

        audit = AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8]}",
            case_id=con.case_id,
            version_id="",
            actor_label=actor_label,
            action="UPDATED_CONSULTATION",
            source_version_id=None,
            timestamp_utc=datetime.datetime.now(datetime.timezone.utc),
            change_summary=f"Cập nhật trạng thái hội chẩn: {con.status}"
        )
        db.add(audit)

        db.commit()
        db.refresh(con)
        return con
