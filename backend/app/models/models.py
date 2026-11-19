import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class CaseModel(Base):
    __tablename__ = "cases"

    id = Column(String(64), primary_key=True, index=True)
    patient_name_demo = Column(String(128), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(16), nullable=True)
    status = Column(String(32), default="AI_DRAFT")  # AI_DRAFT, DOCTOR_EDITED, DOCTOR_APPROVED, MISSING_PAGE, INVALID_IMAGE
    is_mock = Column(Boolean, default=True)
    error_type = Column(String(32), nullable=True)   # MISSING_PAGE, INVALID_IMAGE, PROCESSING_FAILED
    error_message = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    documents = relationship("DocumentModel", back_populates="case", cascade="all, delete-orphan")
    images = relationship("ImageModel", back_populates="case", cascade="all, delete-orphan")
    extractions = relationship("ExtractionModel", back_populates="case", cascade="all, delete-orphan")
    predictions = relationship("PredictionModel", back_populates="case", cascade="all, delete-orphan")
    reports = relationship("ReportVersionModel", back_populates="case", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLogModel", back_populates="case", cascade="all, delete-orphan")


class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    page_count = Column(Integer, default=2)
    status = Column(String(32), default="OK")  # OK, MISSING_PAGE, CORRUPTED

    case = relationship("CaseModel", back_populates="documents")


class ImageModel(Base):
    __tablename__ = "images"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    image_source_type = Column(String(64), default="illustrative")  # illustrative, clinical_real_mock
    paired_with_document = Column(Boolean, default=False)
    status = Column(String(32), default="OK")  # OK, INVALID_IMAGE, CORRUPTED

    case = relationship("CaseModel", back_populates="images")


class ExtractionModel(Base):
    __tablename__ = "extractions"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False)
    mode = Column(String(32), default="mock")
    fields_data = Column(JSON, nullable=False)  # symptoms, medical_history, medications, allergies, test_datetime

    case = relationship("CaseModel", back_populates="extractions")


class PredictionModel(Base):
    __tablename__ = "predictions"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False)
    mode = Column(String(32), default="mock")
    is_mock = Column(Boolean, default=True)
    image_id = Column(String(64), nullable=True)
    image_source_type = Column(String(64), default="illustrative")
    paired_with_document = Column(Boolean, default=False)
    model_name = Column(String(128), default="MOCK_FIXTURE_NO_REAL_MODEL")
    labels = Column(JSON, nullable=False)  # List of {code, name_vi, score, threshold, visual_box}
    disclaimer = Column(Text, nullable=False)

    case = relationship("CaseModel", back_populates="predictions")


class ReportVersionModel(Base):
    __tablename__ = "report_versions"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    status = Column(String(32), nullable=False)  # AI_DRAFT, DOCTOR_EDITED, DOCTOR_APPROVED
    parent_version_id = Column(String(64), nullable=True)
    actor_label = Column(String(128), nullable=False)  # e.g. "AI Assistant (Prototype)", "Bác sĩ Demo"
    actor_role = Column(String(64), default="demo_doctor")
    content = Column(JSON, nullable=False)
    change_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    case = relationship("CaseModel", back_populates="reports")


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False)
    version_id = Column(String(64), nullable=False)
    actor_label = Column(String(128), nullable=False)
    action = Column(String(64), nullable=False)  # CREATED_AI_DRAFT, SAVED_DOCTOR_EDIT, APPROVED_BY_DOCTOR
    source_version_id = Column(String(64), nullable=True)
    timestamp_utc = Column(DateTime, default=get_utc_now)
    change_summary = Column(Text, nullable=True)

    case = relationship("CaseModel", back_populates="audit_logs")
