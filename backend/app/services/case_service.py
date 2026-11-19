import os
from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi.responses import FileResponse
from backend.app.models.models import CaseModel, DocumentModel, ImageModel, ExtractionModel, PredictionModel, ReportVersionModel
from backend.app.schemas.schemas import CaseListItem, CaseDetailResponse, ExtractionResponse, PredictionResponse

class CaseService:
    @staticmethod
    def list_cases(db: Session):
        return db.query(CaseModel).order_by(CaseModel.id.asc()).all()

    @staticmethod
    def get_case(db: Session, case_id: str):
        case = db.query(CaseModel).filter(CaseModel.id == case_id).first()
        if not case:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy ca bệnh: {case_id}")
        
        has_doc = db.query(DocumentModel).filter(DocumentModel.case_id == case_id).first() is not None
        has_img = db.query(ImageModel).filter(ImageModel.case_id == case_id).first() is not None
        latest_ver = db.query(ReportVersionModel).filter(
            ReportVersionModel.case_id == case_id
        ).order_by(ReportVersionModel.version_number.desc()).first()
        report_count = db.query(ReportVersionModel).filter(ReportVersionModel.case_id == case_id).count()

        return CaseDetailResponse(
            id=case.id,
            patient_name_demo=case.patient_name_demo,
            age=case.age,
            gender=case.gender,
            status=case.status,
            is_mock=case.is_mock,
            error_type=case.error_type,
            error_message=case.error_message,
            notes=case.notes,
            created_at=case.created_at,
            has_document=has_doc,
            has_image=has_img,
            latest_version=latest_ver,
            report_versions_count=report_count
        )

    @staticmethod
    def get_document_file(db: Session, case_id: str):
        doc = db.query(DocumentModel).filter(DocumentModel.case_id == case_id).first()
        if not doc or not os.path.exists(doc.file_path):
            raise HTTPException(status_code=404, detail=f"Không tìm thấy tài liệu PDF cho ca {case_id}")
        return FileResponse(
            path=doc.file_path,
            filename=doc.filename,
            media_type="application/pdf"
        )

    @staticmethod
    def get_image_file(db: Session, case_id: str):
        img = db.query(ImageModel).filter(ImageModel.case_id == case_id).first()
        if not img or not os.path.exists(img.file_path):
            raise HTTPException(status_code=404, detail=f"Không tìm thấy hình ảnh cho ca {case_id}")
        
        # If case has invalid image error
        if img.status == "INVALID_IMAGE":
            # Can still return raw file or let API raise error
            return FileResponse(path=img.file_path, filename=img.filename, media_type="image/png")

        return FileResponse(
            path=img.file_path,
            filename=img.filename,
            media_type="image/png"
        )

    @staticmethod
    def get_extraction(db: Session, case_id: str):
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
            raise HTTPException(status_code=404, detail=f"Không có dữ liệu trích xuất cho ca {case_id}")

        return ExtractionResponse(
            case_id=ext.case_id,
            mode=ext.mode,
            fields=ext.fields_data
        )

    @staticmethod
    def get_predictions(db: Session, case_id: str):
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
            raise HTTPException(status_code=404, detail=f"Không có dữ liệu dự đoán cho ca {case_id}")

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
