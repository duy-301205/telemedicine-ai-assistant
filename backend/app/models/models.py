import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(String(32), default="CLINICIAN_DEMO")  # DEMO_ADMIN, CLINICIAN_DEMO, VIEWER_DEMO
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)


class CaseModel(Base):
    __tablename__ = "cases"

    id = Column(String(64), primary_key=True, index=True)
    case_code = Column(String(64), index=True, nullable=True)
    patient_name_demo = Column(String(128), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(16), nullable=True)
    status = Column(String(32), default="CREATED")  # CREATED, FILES_UPLOADED, READY_FOR_PROCESSING, PROCESSING, REVIEW_READY, IN_REVIEW, APPROVED, CONSULTATION_READY, CONSULTED, ARCHIVED
    is_mock = Column(Boolean, default=True)
    error_type = Column(String(32), nullable=True)   # MISSING_PAGE, INVALID_IMAGE, PROCESSING_FAILED
    error_message = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(String(128), default="BS. Trần Demo (CLINICIAN_DEMO)")
    created_at = Column(DateTime, default=get_utc_now)
    archived_at = Column(DateTime, nullable=True)

    # Relationships
    documents = relationship("DocumentModel", back_populates="case", cascade="all, delete-orphan")
    images = relationship("ImageModel", back_populates="case", cascade="all, delete-orphan")
    case_files = relationship("CaseFileModel", back_populates="case", cascade="all, delete-orphan")
    extractions = relationship("ExtractionModel", back_populates="case", cascade="all, delete-orphan")
    predictions = relationship("PredictionModel", back_populates="case", cascade="all, delete-orphan")
    reports = relationship("ReportVersionModel", back_populates="case", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLogModel", back_populates="case", cascade="all, delete-orphan")
    processing_jobs = relationship("ProcessingJobModel", back_populates="case", cascade="all, delete-orphan")
    analysis_runs = relationship("AnalysisRunModel", back_populates="case", cascade="all, delete-orphan")
    consultations = relationship("ConsultationModel", back_populates="case", cascade="all, delete-orphan")


class CaseFileModel(Base):
    __tablename__ = "case_files"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False, index=True)
    kind = Column(String(32), nullable=False)  # document, image
    original_filename = Column(String(255), nullable=False)
    storage_path = Column(String(512), nullable=False)
    sha256_hash = Column(String(64), index=True, nullable=False)
    mime_type = Column(String(64), nullable=False)
    size_bytes = Column(Integer, default=0)
    page_count = Column(Integer, default=1)
    view_position = Column(String(32), default="UNKNOWN")  # PA, AP, UNKNOWN
    file_version = Column(Integer, default=1)
    uploaded_by = Column(String(128), default="Demo User")
    created_at = Column(DateTime, default=get_utc_now)

    case = relationship("CaseModel", back_populates="case_files")


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


class ProcessingJobModel(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False, index=True)
    status = Column(String(32), default="QUEUED")  # QUEUED, PROCESSING, SUCCESS, PARTIAL_SUCCESS, FAILED
    mode = Column(String(32), default="mock_fixture")  # mock_fixture, no_model, manual
    started_at = Column(DateTime, default=get_utc_now)
    ended_at = Column(DateTime, nullable=True)
    error_code = Column(String(64), nullable=True)
    error_message = Column(Text, nullable=True)

    case = relationship("CaseModel", back_populates="processing_jobs")


class AnalysisRunModel(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False, index=True)
    job_id = Column(String(64), ForeignKey("processing_jobs.id"), nullable=True)
    provider_document = Column(String(64), default="FixtureDocumentProvider")
    provider_image = Column(String(64), default="FixtureXrayProvider")
    is_mock = Column(Boolean, default=True)
    fixture_id = Column(String(64), nullable=True)
    input_file_hashes = Column(JSON, nullable=True)
    warnings = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    case = relationship("CaseModel", back_populates="analysis_runs")


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
    analysis_run_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    case = relationship("CaseModel", back_populates="reports")


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False)
    version_id = Column(String(64), nullable=False)
    actor_label = Column(String(128), nullable=False)
    action = Column(String(64), nullable=False)  # CREATED_AI_DRAFT, SAVED_DOCTOR_EDIT, APPROVED_BY_DOCTOR, etc.
    source_version_id = Column(String(64), nullable=True)
    timestamp_utc = Column(DateTime, default=get_utc_now)
    change_summary = Column(Text, nullable=True)

    case = relationship("CaseModel", back_populates="audit_logs")


class ConsultationModel(Base):
    __tablename__ = "consultations"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id"), nullable=False, index=True)
    report_version_id = Column(String(64), nullable=True)
    title = Column(String(255), nullable=False)
    scheduled_at = Column(String(64), nullable=False)
    zoom_meeting_url = Column(String(512), nullable=True)
    status = Column(String(32), default="SCHEDULED")  # SCHEDULED, OPENED, COMPLETED, CANCELED
    conclusion_notes = Column(Text, nullable=True)
    attendees = Column(JSON, nullable=True)
    created_by = Column(String(128), default="Demo Clinician")
    created_at = Column(DateTime, default=get_utc_now)

    case = relationship("CaseModel", back_populates="consultations")
