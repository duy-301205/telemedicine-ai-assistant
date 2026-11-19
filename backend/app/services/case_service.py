import os
import uuid
import datetime
import hashlib
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from fastapi import HTTPException, UploadFile
from fastapi.responses import FileResponse
import pypdf

from backend.app.models.models import (
    CaseModel,
    DocumentModel,
    ImageModel,
    CaseFileModel,
    ExtractionModel,
    PredictionModel,
    ReportVersionModel,
    AuditLogModel,
    ProcessingJobModel,
    AnalysisRunModel
)
from backend.app.schemas.schemas import (
    CaseListItem,
    CaseDetailResponse,
    CaseCreateRequest,
    CaseUpdateRequest,
    CaseFileResponse,
    ExtractionResponse,
    PredictionResponse,
    ProcessCaseRequest,
    ProcessingJobResponse
)
from backend.app.services.ai_adapters import (
    FixtureDocumentProvider,
    NoModelDocumentProvider,
    FixtureXrayProvider,
    NoModelXrayProvider,
    get_file_sha256
)

STORAGE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "storage"))

class CaseService:
    @staticmethod
    def list_cases(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = None,
        include_archived: bool = False,
        sort_by: str = "created_at",
        sort_dir: str = "desc"
    ) -> List[CaseModel]:
        query = db.query(CaseModel)

        if not include_archived:
            query = query.filter(CaseModel.archived_at.is_(None))

        if status and status != "ALL":
            query = query.filter(CaseModel.status == status)

        if search:
            s = f"%{search.strip()}%"
            query = query.filter(
                (CaseModel.patient_name_demo.ilike(s)) |
                (CaseModel.id.ilike(s)) |
                (CaseModel.case_code.ilike(s))
            )

        if sort_by == "patient_name":
            order_col = CaseModel.patient_name_demo
        elif sort_by == "status":
            order_col = CaseModel.status
        else:
            order_col = CaseModel.created_at

        if sort_dir == "asc":
            query = query.order_by(asc(order_col))
        else:
            query = query.order_by(desc(order_col))

        return query.all()

    @staticmethod
    def get_case(db: Session, case_id: str) -> CaseDetailResponse:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        has_doc = db.query(DocumentModel).filter(DocumentModel.case_id == case_id).first() is not None or \
                  db.query(CaseFileModel).filter(CaseFileModel.case_id == case_id, CaseFileModel.kind == "document").first() is not None
        has_img = db.query(ImageModel).filter(ImageModel.case_id == case_id).first() is not None or \
                  db.query(CaseFileModel).filter(CaseFileModel.case_id == case_id, CaseFileModel.kind == "image").first() is not None

        latest_ver = db.query(ReportVersionModel).filter(
            ReportVersionModel.case_id == case_id
        ).order_by(ReportVersionModel.version_number.desc()).first()
        report_count = db.query(ReportVersionModel).filter(ReportVersionModel.case_id == case_id).count()

        return CaseDetailResponse(
            id=case.id,
            case_code=case.case_code,
            patient_name_demo=case.patient_name_demo,
            age=case.age,
            gender=case.gender,
            status=case.status,
            is_mock=case.is_mock,
            error_type=case.error_type,
            error_message=case.error_message,
            notes=case.notes,
            created_by=case.created_by,
            created_at=case.created_at,
            archived_at=case.archived_at,
            has_document=has_doc,
            has_image=has_img,
            latest_version=latest_ver,
            report_versions_count=report_count
        )

    @staticmethod
    def create_case(db: Session, payload: CaseCreateRequest, user_role: str = "CLINICIAN_DEMO") -> CaseModel:
        if not payload.patient_name_demo or len(payload.patient_name_demo.strip()) < 2:
            raise HTTPException(status_code=422, detail="Tên bệnh nhân giả lập phải từ 2 ký tự trở lên.")

        now_str = datetime.datetime.now().strftime("%Y%m%d")
        rand_suffix = uuid.uuid4().hex[:4].upper()
        case_id = f"CASE-{now_str}-{rand_suffix}"
        case_code = payload.case_code or f"TM-{datetime.datetime.now().strftime('%Y')}-{rand_suffix}"

        new_case = CaseModel(
            id=case_id,
            case_code=case_code,
            patient_name_demo=payload.patient_name_demo.strip(),
            age=payload.age,
            gender=payload.gender or "Nam",
            status="CREATED",
            is_mock=True,
            notes=payload.notes,
            created_by=payload.created_by or f"User ({user_role})",
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(new_case)

        # Audit log
        audit = AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8]}",
            case_id=case_id,
            version_id="",
            actor_label=new_case.created_by,
            action="CREATED_CASE",
            source_version_id=None,
            timestamp_utc=datetime.datetime.now(datetime.timezone.utc),
            change_summary=f"Tạo mới ca hội chẩn {case_code} cho bệnh nhân {new_case.patient_name_demo}"
        )
        db.add(audit)

        db.commit()
        db.refresh(new_case)
        return new_case

    @staticmethod
    def update_case(db: Session, case_id: str, payload: CaseUpdateRequest) -> CaseModel:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        if payload.patient_name_demo is not None:
            case.patient_name_demo = payload.patient_name_demo.strip()
        if payload.age is not None:
            case.age = payload.age
        if payload.gender is not None:
            case.gender = payload.gender
        if payload.notes is not None:
            case.notes = payload.notes
        if payload.status is not None:
            case.status = payload.status

        db.commit()
        db.refresh(case)
        return case

    @staticmethod
    def archive_case(db: Session, case_id: str) -> Dict[str, Any]:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        case.archived_at = datetime.datetime.now(datetime.timezone.utc)
        case.status = "ARCHIVED"

        audit = AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8]}",
            case_id=case_id,
            version_id="",
            actor_label="System",
            action="ARCHIVED_CASE",
            source_version_id=None,
            timestamp_utc=datetime.datetime.now(datetime.timezone.utc),
            change_summary=f"Lưu trữ / Đóng ca bệnh {case.case_code or case.id}"
        )
        db.add(audit)

        db.commit()
        return {"status": "success", "message": f"Đã lưu trữ ca {case_id}", "archived_at": str(case.archived_at)}

    @staticmethod
    def upload_case_file(
        db: Session,
        case_id: str,
        upload_file: UploadFile,
        kind: str = "document",
        view_position: str = "PA",
        uploaded_by: str = "Demo User"
    ) -> CaseFileModel:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        # Validate file size (max 20MB)
        contents = upload_file.file.read()
        file_size = len(contents)
        if file_size > 20 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Tệp vượt quá dung lượng tối đa cho phép (20MB).")

        # Validate extension
        filename = upload_file.filename or "uploaded_file"
        ext = os.path.splitext(filename)[1].lower()
        if kind == "document" and ext != ".pdf":
            raise HTTPException(status_code=422, detail="Tệp hồ sơ lâm sàng bắt buộc phải có định dạng .pdf")
        if kind == "image" and ext not in [".png", ".jpg", ".jpeg", ".dicom", ".dcm"]:
            raise HTTPException(status_code=422, detail="Tệp hình ảnh X-quang phải có định dạng .png, .jpg hoặc .jpeg")

        # Compute hash
        sha256_hash = hashlib.sha256(contents).hexdigest()

        # Destination path
        case_dir = os.path.join(STORAGE_ROOT, "cases", case_id)
        os.makedirs(case_dir, exist_ok=True)
        safe_fname = f"{uuid.uuid4().hex[:8]}_{filename}"
        dest_path = os.path.join(case_dir, safe_fname)

        with open(dest_path, "wb") as f:
            f.write(contents)

        # Detect page count if PDF
        page_count = 1
        if kind == "document" and ext == ".pdf":
            try:
                reader = pypdf.PdfReader(dest_path)
                page_count = len(reader.pages)
            except Exception:
                page_count = 1

        file_id = f"FILE-{case_id}-{kind[:3].upper()}-{sha256_hash[:6]}"
        case_file = CaseFileModel(
            id=file_id,
            case_id=case_id,
            kind=kind,
            original_filename=filename,
            storage_path=dest_path,
            sha256_hash=sha256_hash,
            mime_type=upload_file.content_type or ("application/pdf" if kind == "document" else "image/png"),
            size_bytes=file_size,
            page_count=page_count,
            view_position=view_position.upper() if kind == "image" else "UNKNOWN",
            uploaded_by=uploaded_by,
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(case_file)

        # Also update DocumentModel or ImageModel for backward compatibility
        if kind == "document":
            doc = db.query(DocumentModel).filter(DocumentModel.case_id == case_id).first()
            if not doc:
                doc = DocumentModel(
                    id=f"DOC-{case_id}-{uuid.uuid4().hex[:4]}",
                    case_id=case_id,
                    filename=filename,
                    file_path=dest_path,
                    page_count=page_count,
                    status="OK" if page_count >= 2 else "MISSING_PAGE"
                )
                db.add(doc)
            else:
                doc.filename = filename
                doc.file_path = dest_path
                doc.page_count = page_count
                doc.status = "OK" if page_count >= 2 else "MISSING_PAGE"

            if page_count < 2 and case.id not in ["DEMO-001", "DEMO-002", "DEMO-003"]:
                case.error_type = "MISSING_PAGE"
                case.error_message = "Tệp hồ sơ chỉ gồm 1 trang. Quy chuẩn yêu cầu tối thiểu 2 trang (thiếu trang kết quả xét nghiệm)."

        elif kind == "image":
            img = db.query(ImageModel).filter(ImageModel.case_id == case_id).first()
            if not img:
                img = ImageModel(
                    id=f"IMG-{case_id}-{uuid.uuid4().hex[:4]}",
                    case_id=case_id,
                    filename=filename,
                    file_path=dest_path,
                    image_source_type="clinical_upload",
                    paired_with_document=False,
                    status="OK"
                )
                db.add(img)
            else:
                img.filename = filename
                img.file_path = dest_path
                img.status = "OK"

            if view_position.upper() == "AP":
                case.error_type = "AP_VIEW_WARNING"
                case.error_message = "Tư thế chụp AP (ngực nằm/sau-trước ngược) gây phóng đại bóng tim giả tạo; nằm ngoài phạm vi mô hình VinDr-CXR chuẩn PA."

        if case.status in ["CREATED", "FILES_UPLOADED"]:
            case.status = "FILES_UPLOADED"

        db.commit()
        db.refresh(case_file)
        return case_file

    @staticmethod
    def list_case_files(db: Session, case_id: str) -> List[CaseFileModel]:
        return db.query(CaseFileModel).filter(CaseFileModel.case_id == case_id).order_by(CaseFileModel.created_at.desc()).all()

    @staticmethod
    def process_case(db: Session, case_id: str, payload: ProcessCaseRequest) -> Dict[str, Any]:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        # Create processing job
        job_id = f"JOB-{case_id}-{uuid.uuid4().hex[:6]}"
        job = ProcessingJobModel(
            id=job_id,
            case_id=case_id,
            status="PROCESSING",
            mode=payload.mode or "mock_fixture",
            started_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(job)
        case.status = "PROCESSING"
        db.commit()

        # Find document and image
        doc_file = None
        img_file = None

        if payload.selected_document_file_id:
            doc_file = db.query(CaseFileModel).filter(CaseFileModel.id == payload.selected_document_file_id).first()
        if not doc_file:
            doc_file = db.query(CaseFileModel).filter(CaseFileModel.case_id == case_id, CaseFileModel.kind == "document").first()

        if payload.selected_image_file_id:
            img_file = db.query(CaseFileModel).filter(CaseFileModel.id == payload.selected_image_file_id).first()
        if not img_file:
            img_file = db.query(CaseFileModel).filter(CaseFileModel.case_id == case_id, CaseFileModel.kind == "image").first()

        # Fallback to DocumentModel / ImageModel
        doc_path = doc_file.storage_path if doc_file else None
        doc_hash = doc_file.sha256_hash if doc_file else ""
        if not doc_path:
            legacy_doc = db.query(DocumentModel).filter(DocumentModel.case_id == case_id).first()
            if legacy_doc and os.path.exists(legacy_doc.file_path):
                doc_path = legacy_doc.file_path
                doc_hash = get_file_sha256(doc_path)

        img_path = img_file.storage_path if img_file else None
        img_hash = img_file.sha256_hash if img_file else ""
        if not img_path:
            legacy_img = db.query(ImageModel).filter(ImageModel.case_id == case_id).first()
            if legacy_img and os.path.exists(legacy_img.file_path):
                img_path = legacy_img.file_path
                img_hash = get_file_sha256(img_path)

        view_pos = payload.view_position or (img_file.view_position if img_file else "PA")

        # Check special case errors
        if case.error_type == "MISSING_PAGE":
            job.status = "FAILED"
            job.error_code = "MISSING_PAGE"
            job.error_message = "Không thể trích xuất do hồ sơ thiếu trang."
            job.ended_at = datetime.datetime.now(datetime.timezone.utc)
            case.status = "MISSING_PAGE"
            db.commit()
            raise HTTPException(status_code=422, detail={
                "error_type": "MISSING_PAGE",
                "message": "Không thể trích xuất toàn diện do thiếu trang hồ sơ (yêu cầu đủ 2 trang).",
                "case_id": case_id
            })

        if case.error_type == "INVALID_IMAGE":
            job.status = "FAILED"
            job.error_code = "INVALID_IMAGE"
            job.error_message = "Ảnh X-quang bị hỏng cấu trúc tệp."
            job.ended_at = datetime.datetime.now(datetime.timezone.utc)
            case.status = "INVALID_IMAGE"
            db.commit()
            raise HTTPException(status_code=422, detail={
                "error_type": "INVALID_IMAGE",
                "message": "Ảnh X-quang không hợp lệ hoặc bị lỗi tệp. Hệ thống từ chối phân tích.",
                "case_id": case_id
            })

        # Run Document extraction
        extraction_result = None
        doc_provider_name = "FixtureDocumentProvider"
        if doc_path:
            doc_prov = FixtureDocumentProvider()
            extraction_result = doc_prov.extract(case_id, doc_path, doc_hash)
            doc_provider_name = extraction_result.get("provider", "FixtureDocumentProvider")

            # Save or update ExtractionModel
            ext = db.query(ExtractionModel).filter(ExtractionModel.case_id == case_id).first()
            if not ext:
                ext = ExtractionModel(
                    id=f"EXT-{case_id}-{uuid.uuid4().hex[:4]}",
                    case_id=case_id,
                    mode="mock" if extraction_result.get("is_mock", True) else "real",
                    fields_data=extraction_result.get("fields", {})
                )
                db.add(ext)
            else:
                ext.fields_data = extraction_result.get("fields", {})

        # Run X-ray prediction
        prediction_result = None
        img_provider_name = "FixtureXrayProvider"
        if img_path:
            img_prov = FixtureXrayProvider()
            prediction_result = img_prov.predict(case_id, img_path, img_hash, view_pos)
            img_provider_name = prediction_result.get("provider", "FixtureXrayProvider")

            # Save or update PredictionModel
            pred = db.query(PredictionModel).filter(PredictionModel.case_id == case_id).first()
            if not pred:
                pred = PredictionModel(
                    id=f"PRED-{case_id}-{uuid.uuid4().hex[:4]}",
                    case_id=case_id,
                    mode="mock",
                    is_mock=True,
                    image_id=img_file.id if img_file else f"IMG-{case_id}",
                    image_source_type="illustrative" if "FIXTURE" in str(prediction_result.get("model_name")) else "uploaded",
                    paired_with_document=False,
                    model_name=prediction_result.get("model_name", "MOCK_FIXTURE_NO_REAL_MODEL"),
                    labels=prediction_result.get("labels", []),
                    disclaimer=prediction_result.get("disclaimer", "Điểm số giả lập kiểm thử kỹ thuật.")
                )
                db.add(pred)
            else:
                pred.labels = prediction_result.get("labels", [])
                pred.model_name = prediction_result.get("model_name", "MOCK_FIXTURE_NO_REAL_MODEL")
                pred.disclaimer = prediction_result.get("disclaimer", "")

        # Record AnalysisRunModel
        run_id = f"RUN-{case_id}-{uuid.uuid4().hex[:6]}"
        run = AnalysisRunModel(
            id=run_id,
            case_id=case_id,
            job_id=job_id,
            provider_document=doc_provider_name,
            provider_image=img_provider_name,
            is_mock=True,
            fixture_id=extraction_result.get("fixture_id") if extraction_result else None,
            input_file_hashes={"document": doc_hash, "image": img_hash},
            warnings=(extraction_result.get("warnings", []) if extraction_result else []) + \
                     (prediction_result.get("warnings", []) if prediction_result else []),
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(run)

        # Generate initial AI Draft (Version 1) if none exists
        existing_report = db.query(ReportVersionModel).filter(ReportVersionModel.case_id == case_id).first()
        if not existing_report:
            rep_id = f"REP-{case_id}-V1"
            f_data = extraction_result.get("fields", {}) if extraction_result else {}

            symptoms_val = f_data.get("symptoms", {}).get("value")
            symptoms_str = ", ".join(symptoms_val) if isinstance(symptoms_val, list) else str(symptoms_val or "Chưa có thông tin triệu chứng")
            history_val = f_data.get("medical_history", {}).get("value")
            history_str = ", ".join(history_val) if isinstance(history_val, list) else str(history_val or "Chưa có tiền sử ghi nhận")
            meds_val = f_data.get("medications", {}).get("value")
            meds_str = ", ".join(meds_val) if isinstance(meds_val, list) else str(meds_val or "Chưa có thuốc đang dùng")

            summary_text = f"Bệnh nhân {case.patient_name_demo} ({case.age or 'N/A'} tuổi, {case.gender or 'N/A'}). Triệu chứng: {symptoms_str}. Tiền sử: {history_str}. Đang dùng: {meds_str}."

            xray_obs = "Kết quả phân tích hình ảnh X-quang ngực (MOCK):\n"
            if prediction_result and prediction_result.get("labels"):
                for l in prediction_result["labels"]:
                    xray_obs += f"- {l.get('name_vi', l.get('code'))}: {l.get('score')} ({'Nghi ngờ' if l.get('is_suspected') else 'Bình thường'})\n"
            else:
                xray_obs += "Chưa có kết quả phân tích X-quang hoặc ảnh tải lên chưa có mô hình hỗ trợ."

            allergy_status = f_data.get("allergies", {}).get("status")
            allergy_note = "LƯU Ý DỊ ỨNG: "
            if allergy_status == "missing":
                allergy_note += "Hồ sơ ban đầu CHƯA CÓ DỮ LIỆU DỊ ỨNG. Cần nhân viên y tế khai thác trực tiếp trước khi kê đơn."
            elif allergy_status == "negative":
                allergy_note += "Hồ sơ khẳng định không ghi nhận tiền sử dị ứng thuốc hay thức ăn."
            elif allergy_status == "conflict":
                allergy_note += "CẢNH BÁO XUNG ĐỘT: Các trang tài liệu ghi nhận thông tin trái ngược về dị ứng!"
            else:
                allergy_note += "Kiểm tra lại tiền sử dị ứng thuốc của người bệnh."

            v1_report = ReportVersionModel(
                id=rep_id,
                case_id=case_id,
                version_number=1,
                status="AI_DRAFT",
                parent_version_id=None,
                actor_label="AI Assistant (Prototype)",
                actor_role="ai_system",
                analysis_run_id=run_id,
                content={
                    "summary": summary_text,
                    "clinical_notes": allergy_note,
                    "xray_observations": xray_obs,
                    "attention_points": [
                        "Xác thực lại thông tin dị ứng trước khi chỉ định thuốc.",
                        "Đối chiếu hình ảnh X-quang với phim gốc tại phòng X-quang."
                    ],
                    "recommended_action": "Bác sĩ lâm sàng đối chiếu hồ sơ và phê duyệt báo cáo chuẩn bị hội chẩn.",
                    "source_references": []
                },
                change_summary="Khởi tạo bản thảo sơ bộ AI Draft tự động từ kết quả trích xuất và phân tích ảnh",
                created_at=datetime.datetime.now(datetime.timezone.utc)
            )
            db.add(v1_report)

        job.status = "SUCCESS"
        job.ended_at = datetime.datetime.now(datetime.timezone.utc)
        case.status = "AI_DRAFT"
        db.commit()

        return {
            "job_id": job_id,
            "status": "SUCCESS",
            "case_id": case_id,
            "analysis_run_id": run_id,
            "extraction": extraction_result,
            "predictions": prediction_result
        }

    @staticmethod
    def get_document_file(db: Session, case_id: str):
        # 1. Search in CaseFileModel
        cf = db.query(CaseFileModel).filter(
            CaseFileModel.case_id == case_id,
            CaseFileModel.kind == "document"
        ).order_by(CaseFileModel.created_at.desc()).first()
        if cf and os.path.exists(cf.storage_path):
            return FileResponse(path=cf.storage_path, filename=cf.original_filename, media_type="application/pdf")

        # 2. Legacy DocumentModel
        doc = db.query(DocumentModel).filter(DocumentModel.case_id == case_id).first()
        if not doc or not os.path.exists(doc.file_path):
            raise HTTPException(status_code=404, detail=f"Không tìm thấy tài liệu PDF cho ca {case_id}")
        return FileResponse(path=doc.file_path, filename=doc.filename, media_type="application/pdf")

    @staticmethod
    def get_image_file(db: Session, case_id: str):
        cf = db.query(CaseFileModel).filter(
            CaseFileModel.case_id == case_id,
            CaseFileModel.kind == "image"
        ).order_by(CaseFileModel.created_at.desc()).first()
        if cf and os.path.exists(cf.storage_path):
            return FileResponse(path=cf.storage_path, filename=cf.original_filename, media_type=cf.mime_type)

        img = db.query(ImageModel).filter(ImageModel.case_id == case_id).first()
        if not img or not os.path.exists(img.file_path):
            raise HTTPException(status_code=404, detail=f"Không tìm thấy hình ảnh cho ca {case_id}")
        return FileResponse(path=img.file_path, filename=img.filename, media_type="image/png")

    @staticmethod
    def get_extraction(db: Session, case_id: str) -> ExtractionResponse:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        if case.error_type == "MISSING_PAGE":
            raise HTTPException(
                status_code=422,
                detail={
                    "error_type": "MISSING_PAGE",
                    "message": "Không thể trích xuất toàn diện do thiếu trang hồ sơ (yêu cầu đủ 2 trang). Hệ thống không tự ý suy đoán dữ liệu thiếu.",
                    "case_id": case_id
                }
            )

        ext = db.query(ExtractionModel).filter(ExtractionModel.case_id == case_id).first()
        if not ext:
            raise HTTPException(status_code=404, detail=f"Chưa có dữ liệu trích xuất cho ca {case_id}. Vui lòng bấm 'Chạy AI trích xuất'.")

        return ExtractionResponse(
            case_id=ext.case_id,
            mode=ext.mode,
            fields=ext.fields_data
        )

    @staticmethod
    def get_predictions(db: Session, case_id: str) -> PredictionResponse:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        if case.error_type == "INVALID_IMAGE":
            raise HTTPException(
                status_code=422,
                detail={
                    "error_type": "INVALID_IMAGE",
                    "message": "Ảnh X-quang không hợp lệ hoặc bị lỗi tệp. Hệ thống từ chối phân tích và không hiển thị điểm số giả định.",
                    "case_id": case_id
                }
            )

        pred = db.query(PredictionModel).filter(PredictionModel.case_id == case_id).first()
        if not pred:
            raise HTTPException(status_code=404, detail=f"Chưa có dữ liệu dự đoán cho ca {case_id}. Vui lòng bấm 'Chạy AI phân tích'.")

        return PredictionResponse(
            case_id=pred.case_id,
            mode=pred.mode,
            is_mock=pred.is_mock,
            image_id=pred.image_id,
            image_source_type=pred.image_source_type,
            paired_with_document=pred.paired_with_document,
            model_name=pred.model_name,
            labels=pred.labels,
            disclaimer=pred.disclaimer
        )

    @staticmethod
    def manual_extraction_entry(db: Session, case_id: str, fields: Dict[str, Any]) -> ExtractionModel:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        ext = db.query(ExtractionModel).filter(ExtractionModel.case_id == case_id).first()
        if not ext:
            ext = ExtractionModel(
                id=f"EXT-{case_id}-MANUAL",
                case_id=case_id,
                mode="manual_entry",
                fields_data=fields
            )
            db.add(ext)
        else:
            ext.fields_data = fields
            ext.mode = "manual_entry"

        db.commit()
        db.refresh(ext)
        return ext

    @staticmethod
    def manual_predictions_entry(db: Session, case_id: str, labels: List[Dict[str, Any]], disclaimer: str = "Bác sĩ tự ghi nhận thủ công") -> PredictionModel:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        pred = db.query(PredictionModel).filter(PredictionModel.case_id == case_id).first()
        if not pred:
            pred = PredictionModel(
                id=f"PRED-{case_id}-MANUAL",
                case_id=case_id,
                mode="manual_entry",
                is_mock=False,
                image_id=None,
                image_source_type="clinical_notes",
                paired_with_document=False,
                model_name="MANUAL_CLINICIAN_ENTRY",
                labels=labels,
                disclaimer=disclaimer
            )
            db.add(pred)
        else:
            pred.labels = labels
            pred.model_name = "MANUAL_CLINICIAN_ENTRY"
            pred.disclaimer = disclaimer

        db.commit()
        db.refresh(pred)
        return pred

    @staticmethod
    def attach_sample_data(db: Session, case_id: str) -> Dict[str, Any]:
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")

        demo_assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "demo_assets"))
        sample_doc = os.path.join(demo_assets_dir, "sample_case_2pages.pdf")
        sample_img = os.path.join(demo_assets_dir, "xray_illustration.png")

        case_dir = os.path.join(STORAGE_ROOT, "cases", case_id)
        os.makedirs(case_dir, exist_ok=True)

        import shutil
        if os.path.exists(sample_doc):
            dest_doc = os.path.join(case_dir, f"{uuid.uuid4().hex[:8]}_sample_doc.pdf")
            shutil.copy2(sample_doc, dest_doc)
            cf_doc = CaseFileModel(
                id=f"FILE-{case_id}-DOC-{uuid.uuid4().hex[:6]}",
                case_id=case_id,
                kind="document",
                original_filename="sample_case_2pages.pdf",
                storage_path=dest_doc,
                mime_type="application/pdf",
                size_bytes=os.path.getsize(dest_doc),
                sha256_hash=get_file_sha256(dest_doc),
                view_position="PA",
                page_count=2,
                uploaded_by="Hệ thống (Dữ liệu mẫu)",
                created_at=datetime.datetime.now(datetime.timezone.utc)
            )
            db.add(cf_doc)

            doc_model = db.query(DocumentModel).filter(DocumentModel.case_id == case_id).first()
            if not doc_model:
                doc_model = DocumentModel(
                    id=f"DOC-{case_id}-{uuid.uuid4().hex[:4]}",
                    case_id=case_id,
                    filename="sample_case_2pages.pdf",
                    file_path=dest_doc,
                    page_count=2,
                    status="OK"
                )
                db.add(doc_model)

        if os.path.exists(sample_img):
            dest_img = os.path.join(case_dir, f"{uuid.uuid4().hex[:8]}_sample_xray.png")
            shutil.copy2(sample_img, dest_img)
            cf_img = CaseFileModel(
                id=f"FILE-{case_id}-IMG-{uuid.uuid4().hex[:6]}",
                case_id=case_id,
                kind="image",
                original_filename="xray_illustration.png",
                storage_path=dest_img,
                mime_type="image/png",
                size_bytes=os.path.getsize(dest_img),
                sha256_hash=get_file_sha256(dest_img),
                view_position="PA",
                page_count=1,
                uploaded_by="Hệ thống (Dữ liệu mẫu)",
                created_at=datetime.datetime.now(datetime.timezone.utc)
            )
            db.add(cf_img)

            img_model = db.query(ImageModel).filter(ImageModel.case_id == case_id).first()
            if not img_model:
                img_model = ImageModel(
                    id=f"IMG-{case_id}-{uuid.uuid4().hex[:4]}",
                    case_id=case_id,
                    filename="xray_illustration.png",
                    file_path=dest_img,
                    image_source_type="illustrative",
                    paired_with_document=False,
                    status="OK"
                )
                db.add(img_model)

        case.status = "FILES_UPLOADED"
        db.commit()

        # Run processing automatically to produce extraction + predictions + report V1
        res = CaseService.process_case(db, case_id, ProcessCaseRequest(view_position="PA"))
        return res
