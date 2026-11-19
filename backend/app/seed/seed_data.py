import os
import hashlib
import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.models import (
    UserModel,
    CaseModel,
    DocumentModel,
    ImageModel,
    CaseFileModel,
    ExtractionModel,
    PredictionModel,
    ReportVersionModel,
    AuditLogModel,
    ConsultationModel,
    AnalysisRunModel
)

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "demo_assets"))

def calculate_sha256(filepath: str) -> str:
    if not os.path.exists(filepath):
        return ""
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def migrate_schema():
    """Ensure all tables exist and add new columns to existing SQLite tables if missing."""
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        # Check cases columns
        case_cols = [r[1] for r in conn.execute(text("PRAGMA table_info(cases);")).fetchall()]
        if "case_code" not in case_cols:
            conn.execute(text("ALTER TABLE cases ADD COLUMN case_code VARCHAR(50);"))
        if "created_by" not in case_cols:
            conn.execute(text("ALTER TABLE cases ADD COLUMN created_by VARCHAR(50) DEFAULT 'CLINICIAN_DEMO';"))
        if "archived_at" not in case_cols:
            conn.execute(text("ALTER TABLE cases ADD COLUMN archived_at DATETIME;"))

        # Check report_versions columns
        rep_cols = [r[1] for r in conn.execute(text("PRAGMA table_info(report_versions);")).fetchall()]
        if "analysis_run_id" not in rep_cols:
            conn.execute(text("ALTER TABLE report_versions ADD COLUMN analysis_run_id VARCHAR(64);"))

        conn.commit()

def init_db():
    migrate_schema()

def seed_users(db: Session):
    users_data = [
        {
            "id": "usr-admin",
            "username": "admin",
            "display_name": "Quản trị viên Demo",
            "role": "DEMO_ADMIN",
            "email": "admin@telemedicine.local",
            "is_active": True
        },
        {
            "id": "usr-clinician",
            "username": "doctor",
            "display_name": "BS. Nguyễn Văn Khám (Chuyên khoa Tim Mạch)",
            "role": "CLINICIAN_DEMO",
            "email": "doctor@telemedicine.local",
            "is_active": True
        },
        {
            "id": "usr-viewer",
            "username": "viewer",
            "display_name": "BS. Quan Sát Viên (Hội đồng Thẩm tra)",
            "role": "VIEWER_DEMO",
            "email": "viewer@telemedicine.local",
            "is_active": True
        }
    ]
    for u in users_data:
        existing = db.query(UserModel).filter(UserModel.username == u["username"]).first()
        if not existing:
            db.add(UserModel(
                id=u["id"],
                username=u["username"],
                full_name=u["display_name"],
                role=u["role"],
                is_active=u["is_active"],
                created_at=datetime.datetime.now(datetime.timezone.utc)
            ))
    db.commit()

def seed_database(db: Session):
    migrate_schema()
    seed_users(db)

    print("Checking seed cases...")

    # Helper to create CaseFileModel
    def add_case_file(case_id: str, file_path: str, kind: str, purpose: str, projection: str = "PA"):
        if not os.path.exists(file_path):
            return
        sha = calculate_sha256(file_path)
        size = os.path.getsize(file_path)
        fname = os.path.basename(file_path)
        existing = db.query(CaseFileModel).filter(
            CaseFileModel.case_id == case_id,
            CaseFileModel.original_filename == fname
        ).first()
        if not existing:
            db.add(CaseFileModel(
                id=f"FILE-{case_id}-{kind[:3].upper()}-{sha[:6]}",
                case_id=case_id,
                kind=kind,
                original_filename=fname,
                storage_path=file_path,
                mime_type="application/pdf" if kind == "document" else "image/png",
                size_bytes=size,
                sha256_hash=sha,
                view_position=projection,
                page_count=2 if "2pages" in fname or "002" in fname or "003" in fname or "008" in fname else 1,
                uploaded_by=purpose,
                created_at=datetime.datetime.now(datetime.timezone.utc)
            ))

    # ========================================================
    # 1. CASE: DEMO-001 (Ca chuẩn mực đầy đủ luồng P0-P4)
    # ========================================================
    c1 = db.query(CaseModel).filter(CaseModel.id == "DEMO-001").first()
    if not c1:
        c1 = CaseModel(
            id="DEMO-001",
            case_code="TM-2026-001",
            patient_name_demo="Nguyễn Văn Giả Định (Demo)",
            age=68,
            gender="Nam",
            status="AI_DRAFT",
            is_mock=True,
            error_type=None,
            error_message=None,
            notes="Ca chuẩn mẫu: PDF 2 trang, X-quang minh họa, thiếu dị ứng, 3 điểm mock.",
            created_by="CLINICIAN_DEMO",
            created_at=datetime.datetime(2026, 11, 15, 8, 30, 0)
        )
        db.add(c1)
        db.commit()
    else:
        if not c1.case_code:
            c1.case_code = "TM-2026-001"
            c1.created_by = "CLINICIAN_DEMO"
            db.commit()

    # Doc & Img & Files for DEMO-001
    doc1_path = os.path.join(ASSETS_DIR, "sample_case_2pages.pdf")
    img1_path = os.path.join(ASSETS_DIR, "xray_illustration.png")
    add_case_file("DEMO-001", doc1_path, "document", "Bệnh án trích sao chuẩn 2 trang")
    add_case_file("DEMO-001", img1_path, "image", "X-quang ngực thẳng tư thế PA", "PA")

    if not db.query(DocumentModel).filter(DocumentModel.case_id == "DEMO-001").first():
        db.add(DocumentModel(
            id="DOC-DEMO-001",
            case_id="DEMO-001",
            filename="sample_case_2pages.pdf",
            file_path=doc1_path,
            page_count=2,
            status="OK"
        ))

    if not db.query(ImageModel).filter(ImageModel.case_id == "DEMO-001").first():
        db.add(ImageModel(
            id="IMG-DEMO-001",
            case_id="DEMO-001",
            filename="xray_illustration.png",
            file_path=img1_path,
            image_source_type="illustrative",
            paired_with_document=False,
            status="OK"
        ))

    if not db.query(ExtractionModel).filter(ExtractionModel.case_id == "DEMO-001").first():
        db.add(ExtractionModel(
            id="EXT-DEMO-001",
            case_id="DEMO-001",
            mode="mock",
            fields_data={
                "symptoms": {
                    "value": ["Ho khan", "Khó thở trong 3 ngày"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-001",
                        "page_number": 1,
                        "section": "Triệu chứng",
                        "quote": "Triệu chứng: Bệnh nhân ho khan, khó thở trong 3 ngày.",
                        "bbox": {"x": 60, "y": 230, "width": 480, "height": 20}
                    },
                    "note": "Trích xuất từ mục II Bệnh sử trang 1"
                },
                "medical_history": {
                    "value": ["Tăng huyết áp"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-001",
                        "page_number": 1,
                        "section": "Tiền sử",
                        "quote": "Tiền sử: Tăng huyết áp.",
                        "bbox": {"x": 60, "y": 305, "width": 480, "height": 20}
                    },
                    "note": "Trích xuất từ mục III Tiền sử trang 1"
                },
                "medications": {
                    "value": ["Amlodipine 5 mg/ngày"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-001",
                        "page_number": 1,
                        "section": "Thuốc đang dùng",
                        "quote": "Thuốc đang dùng: Amlodipine 5 mg/ngày.",
                        "bbox": {"x": 60, "y": 380, "width": 480, "height": 20}
                    },
                    "note": "Trích xuất từ mục IV Thuốc đang dùng trang 1"
                },
                "allergies": {
                    "value": None,
                    "status": "missing",
                    "source": None,
                    "note": "Hồ sơ không có ghi nhận thông tin dị ứng. Hệ thống gắn nhãn Chưa có dữ liệu, không tự ý giả định là Không dị ứng."
                },
                "test_datetime": {
                    "value": "2026-11-15T08:30:00+07:00",
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-001",
                        "page_number": 2,
                        "section": "Thời điểm chụp X-quang",
                        "quote": "Thời điểm chụp X-quang: 15/11/2026, 08:30 (giờ Việt Nam).",
                        "bbox": {"x": 60, "y": 125, "width": 480, "height": 20}
                    },
                    "note": "Trích xuất từ mục VI Chỉ định trang 2"
                }
            }
        ))

    if not db.query(PredictionModel).filter(PredictionModel.case_id == "DEMO-001").first():
        db.add(PredictionModel(
            id="PRED-DEMO-001",
            case_id="DEMO-001",
            mode="mock",
            is_mock=True,
            image_id="IMG-DEMO-001",
            image_source_type="illustrative",
            paired_with_document=False,
            model_name="MOCK_FIXTURE_NO_REAL_MODEL",
            labels=[
                {
                    "code": "cardiomegaly",
                    "name_vi": "Tim to",
                    "score": 0.91,
                    "threshold_mock": 0.50,
                    "is_suspected": True,
                    "finding_description": "Bóng tim mở rộng sang hai bên, tỷ lệ tim/lồng ngực > 0.50 (nghi ngờ tim to).",
                    "visual_box": {
                        "label": "Bóng tim mở rộng (Mock)",
                        "x": 0.38,
                        "y": 0.43,
                        "width": 0.30,
                        "height": 0.35,
                        "color": "#EF4444",
                        "description": "Điểm minh họa 1: Vùng bóng tim lớn vượt quá đường trung đòn trái."
                    }
                },
                {
                    "code": "pleural_effusion",
                    "name_vi": "Tràn dịch màng phổi",
                    "score": 0.78,
                    "threshold_mock": 0.50,
                    "is_suspected": True,
                    "finding_description": "Tù góc sườn hoành phải, nghi ngờ tụ dịch đáy phổi phải.",
                    "visual_box": {
                        "label": "Tù góc sườn hoành phải (Mock)",
                        "x": 0.18,
                        "y": 0.70,
                        "width": 0.22,
                        "height": 0.18,
                        "color": "#F59E0B",
                        "description": "Điểm minh họa 2: Góc sườn hoành phải không còn nhọn sáng."
                    }
                },
                {
                    "code": "lung_opacity",
                    "name_vi": "Đám mờ phổi",
                    "score": 0.15,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Không ghi nhận đám mờ phế nang hay nốt mờ khu trú điển hình.",
                    "visual_box": {
                        "label": "Nhu mô phổi trên (Mock)",
                        "x": 0.53,
                        "y": 0.23,
                        "width": 0.25,
                        "height": 0.22,
                        "color": "#10B981",
                        "description": "Điểm minh họa 3: Nhu mô đỉnh phổi hai bên sáng đều, không rõ tổn thương."
                    }
                }
            ],
            disclaimer="Điểm số giả lập, không phải dự đoán của mô hình được huấn luyện; ảnh minh họa không ghép cặp lâm sàng với hồ sơ."
        ))

    if not db.query(ReportVersionModel).filter(ReportVersionModel.case_id == "DEMO-001").first():
        db.add(ReportVersionModel(
            id="REP-DEMO-001-V1",
            case_id="DEMO-001",
            version_number=1,
            status="AI_DRAFT",
            parent_version_id=None,
            actor_label="AI Assistant (Prototype)",
            actor_role="ai_system",
            content={
                "summary": "Bệnh nhân nam 68 tuổi xuất hiện triệu chứng ho khan và khó thở trong 3 ngày qua. Tiền sử tăng huyết áp 5 năm đang điều trị bằng Amlodipine 5 mg/ngày. Hình ảnh X-quang minh họa có điểm mock cao ở dấu hiệu Tim to (0.91) và Tràn dịch màng phổi (0.78).",
                "clinical_notes": "1. Hồ sơ ban đầu CHƯA CÓ DỮ LIỆU DỊ ỨNG (thiếu trường). Cần nhân viên y tế khai thác trực tiếp trước khi kê đơn.\n2. Bệnh nhân có tiền sử tim mạch/tăng huyết áp, triệu chứng khó thở tiến triển gợi ý đợt suy tim sung huyết hoặc kèm dịch màng phổi.",
                "xray_observations": "Điểm dự đoán X-quang giả lập (MOCK):\n- Tim to: 0.91 (nghi ngờ cao theo ngưỡng giả định 0.50)\n- Tràn dịch màng phổi: 0.78 (nghi ngờ theo ngưỡng giả định 0.50)\n- Đám mờ phổi: 0.15 (dưới ngưỡng giả định)\nLưu ý: Ảnh chỉ là đồ họa minh họa kỹ thuật, không phải phim chụp của bệnh nhân.",
                "attention_points": [
                    "Cần hỏi và bổ sung thông tin tiền sử dị ứng thuốc của người bệnh.",
                    "Đề nghị đo ECG và siêu âm tim Doppler màu để đánh giá kích thước buồng tim và phân suất tống máu EF.",
                    "Chụp lại phim X-quang ngực thẳng chuẩn PA khi có điều kiện lâm sàng thực tế."
                ],
                "recommended_action": "Chuẩn bị hồ sơ hội chẩn chuyên khoa Nội Hô hấp — Tim mạch; bác sĩ hội chẩn thẩm định lại toàn bộ dữ liệu nguồn.",
                "source_references": [
                    {"field": "Triệu chứng", "page": 1, "quote": "Triệu chứng: Bệnh nhân ho khan, khó thở trong 3 ngày."},
                    {"field": "Tiền sử", "page": 1, "quote": "Tiền sử: Tăng huyết áp."},
                    {"field": "Thuốc", "page": 1, "quote": "Thuốc đang dùng: Amlodipine 5 mg/ngày."},
                    {"field": "Thời điểm X-quang", "page": 2, "quote": "Thời điểm chụp X-quang: 15/11/2026, 08:30 (giờ Việt Nam)."}
                ]
            },
            change_summary="Bản thảo sơ bộ khởi tạo tự động bởi AI (AI Draft - Bất biến)",
            created_at=datetime.datetime(2026, 11, 15, 8, 35, 0)
        ))

    # Add consultation for DEMO-001
    if not db.query(ConsultationModel).filter(ConsultationModel.case_id == "DEMO-001").first():
        db.add(ConsultationModel(
            id="CON-DEMO-001",
            case_id="DEMO-001",
            title="Hội chẩn liên viện chuyên khoa Tim Mạch - Hô Hấp",
            scheduled_at="2026-11-22 09:30:00",
            zoom_meeting_url="https://zoom.us/j/99988877766",
            status="SCHEDULED",
            conclusion_notes="Tập trung thẩm định bóng tim và chỉ định siêu âm tim Doppler. Đề nghị làm thêm điện tâm đồ và siêu âm tim cấp cứu.",
            attendees=["BS. Nguyễn Văn Khám", "BS. Lê Hoàng (Bệnh viện Đa khoa Tỉnh)", "BS. Trần Thu Hà (Khoa Chẩn đoán Hình ảnh)"],
            created_by="BS. Nguyễn Văn Khám",
            created_at=datetime.datetime.now(datetime.timezone.utc)
        ))

    # ========================================================
    # 2. CASE: DEMO-002 (Phân biệt Phủ định vs Chưa có dữ liệu)
    # ========================================================
    c2 = db.query(CaseModel).filter(CaseModel.id == "DEMO-002").first()
    if not c2:
        c2 = CaseModel(
            id="DEMO-002",
            case_code="TM-2026-002",
            patient_name_demo="Trần Thị Phủ Định (Demo)",
            age=52,
            gender="Nữ",
            status="AI_DRAFT",
            is_mock=True,
            error_type=None,
            error_message=None,
            notes="Ca kiểm thử phân biệt: Trường dị ứng có câu phủ định tường minh ('Không ghi nhận tiền sử dị ứng').",
            created_by="CLINICIAN_DEMO",
            created_at=datetime.datetime(2026, 11, 16, 14, 0, 0)
        )
        db.add(c2)
        db.commit()
    else:
        if not c2.case_code:
            c2.case_code = "TM-2026-002"
            c2.created_by = "CLINICIAN_DEMO"
            db.commit()

    doc2_path = os.path.join(ASSETS_DIR, "sample_case_negative_allergy.pdf")
    img2_path = os.path.join(ASSETS_DIR, "xray_illustration.png")
    add_case_file("DEMO-002", doc2_path, "document", "Bệnh án trích sao có phủ định dị ứng")
    add_case_file("DEMO-002", img2_path, "image", "X-quang ngực thẳng tư thế PA", "PA")

    if not db.query(DocumentModel).filter(DocumentModel.case_id == "DEMO-002").first():
        db.add(DocumentModel(
            id="DOC-DEMO-002",
            case_id="DEMO-002",
            filename="sample_case_negative_allergy.pdf",
            file_path=doc2_path,
            page_count=2,
            status="OK"
        ))

    if not db.query(ImageModel).filter(ImageModel.case_id == "DEMO-002").first():
        db.add(ImageModel(
            id="IMG-DEMO-002",
            case_id="DEMO-002",
            filename="xray_illustration.png",
            file_path=img2_path,
            image_source_type="illustrative",
            paired_with_document=False,
            status="OK"
        ))

    if not db.query(ExtractionModel).filter(ExtractionModel.case_id == "DEMO-002").first():
        db.add(ExtractionModel(
            id="EXT-DEMO-002",
            case_id="DEMO-002",
            mode="mock",
            fields_data={
                "symptoms": {
                    "value": ["Khó thở nhẹ khi leo cầu thang", "Ho ít đờm trắng"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-002",
                        "page_number": 1,
                        "section": "Triệu chứng",
                        "quote": "Triệu chứng: Khó thở nhẹ khi leo cầu thang, ho ít đờm trắng."
                    }
                },
                "medical_history": {
                    "value": ["Đái tháo đường type 2"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-002",
                        "page_number": 1,
                        "section": "Tiền sử",
                        "quote": "Tiền sử: Đái tháo đường type 2 đang theo dõi định kỳ."
                    }
                },
                "medications": {
                    "value": ["Metformin 500 mg x 2 viên/ngày"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-002",
                        "page_number": 1,
                        "section": "Thuốc đang dùng",
                        "quote": "Thuốc đang dùng: Metformin 500 mg x 2 viên/ngày."
                    }
                },
                "allergies": {
                    "value": "Không ghi nhận tiền sử dị ứng thuốc hay thức ăn",
                    "status": "negative",
                    "source": {
                        "document_id": "DOC-DEMO-002",
                        "page_number": 1,
                        "section": "Tiền sử dị ứng",
                        "quote": "Dị ứng: Không ghi nhận tiền sử dị ứng thuốc hay thức ăn."
                    },
                    "note": "Tài liệu có câu phủ định rõ ràng, gắn nhãn Phủ định (negative), không phải Thiếu (missing)."
                },
                "test_datetime": {
                    "value": "2026-11-16T09:15:00+07:00",
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-002",
                        "page_number": 2,
                        "section": "Thời điểm chụp X-quang",
                        "quote": "Thời điểm chụp X-quang: 16/11/2026, 09:15 (giờ Việt Nam)."
                    }
                }
            }
        ))

    if not db.query(PredictionModel).filter(PredictionModel.case_id == "DEMO-002").first():
        db.add(PredictionModel(
            id="PRED-DEMO-002",
            case_id="DEMO-002",
            mode="mock",
            is_mock=True,
            image_id="IMG-DEMO-002",
            image_source_type="illustrative",
            paired_with_document=False,
            model_name="MOCK_FIXTURE_NO_REAL_MODEL",
            labels=[
                {
                    "code": "cardiomegaly",
                    "name_vi": "Tim to",
                    "score": 0.22,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Chỉ số tim ngực trong giới hạn bình thường.",
                    "visual_box": None
                },
                {
                    "code": "pleural_effusion",
                    "name_vi": "Tràn dịch màng phổi",
                    "score": 0.18,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Hai góc sườn hoành sáng nhọn bình thường.",
                    "visual_box": None
                },
                {
                    "code": "lung_opacity",
                    "name_vi": "Đám mờ phổi",
                    "score": 0.65,
                    "threshold_mock": 0.50,
                    "is_suspected": True,
                    "finding_description": "Vùng mờ nhẹ rải rác đáy phổi trái.",
                    "visual_box": None
                }
            ],
            disclaimer="Điểm số giả lập, không phải dự đoán của mô hình được huấn luyện; ảnh minh họa không ghép cặp lâm sàng với hồ sơ."
        ))

    if not db.query(ReportVersionModel).filter(ReportVersionModel.case_id == "DEMO-002").first():
        db.add(ReportVersionModel(
            id="REP-DEMO-002-V1",
            case_id="DEMO-002",
            version_number=1,
            status="AI_DRAFT",
            parent_version_id=None,
            actor_label="AI Assistant (Prototype)",
            actor_role="ai_system",
            content={
                "summary": "Bệnh nhân nữ 52 tuổi có triệu chứng khó thở nhẹ, ho ít đờm trắng, tiền sử đái tháo đường type 2. Tài liệu khẳng định không có tiền sử dị ứng thuốc/thức ăn.",
                "clinical_notes": "Tiền sử dị ứng: Phủ định có căn cứ (Không ghi nhận dị ứng thuốc hay thức ăn).",
                "xray_observations": "Điểm X-quang giả định: Đám mờ phổi 0.65 (nghi ngờ), Tim to 0.22, Tràn dịch 0.18.",
                "attention_points": ["Kiểm soát đường huyết định kỳ", "Theo dõi đáp ứng điều trị hô hấp"],
                "recommended_action": "Bác sĩ hội chẩn xem xét chỉ định xét nghiệm đờm và chụp lại phim khi cần.",
                "source_references": []
            },
            change_summary="Bản thảo AI Draft khởi tạo ca DEMO-002",
            created_at=datetime.datetime(2026, 11, 16, 14, 5, 0)
        ))

    # ========================================================
    # 3. CASE: DEMO-003 (Nhiều mốc thời gian khác nhau)
    # ========================================================
    c3 = db.query(CaseModel).filter(CaseModel.id == "DEMO-003").first()
    if not c3:
        c3 = CaseModel(
            id="DEMO-003",
            case_code="TM-2026-003",
            patient_name_demo="Lê Hoàng Thời Điểm (Demo)",
            age=71,
            gender="Nam",
            status="AI_DRAFT",
            is_mock=True,
            error_type=None,
            error_message=None,
            notes="Ca kiểm thử nhiều mốc thời gian: Khám ban đầu 10/11, Nhập viện 14/11, Chụp X-quang 15/11.",
            created_by="CLINICIAN_DEMO",
            created_at=datetime.datetime(2026, 11, 15, 10, 0, 0)
        )
        db.add(c3)
        db.commit()
    else:
        if not c3.case_code:
            c3.case_code = "TM-2026-003"
            c3.created_by = "CLINICIAN_DEMO"
            db.commit()

    doc3_path = os.path.join(ASSETS_DIR, "sample_case_demo003_timestamps.pdf")
    img3_path = os.path.join(ASSETS_DIR, "xray_illustration.png")
    add_case_file("DEMO-003", doc3_path, "document", "Bệnh án trích sao đa mốc thời gian")
    add_case_file("DEMO-003", img3_path, "image", "X-quang ngực thẳng tư thế PA", "PA")

    if not db.query(DocumentModel).filter(DocumentModel.case_id == "DEMO-003").first():
        db.add(DocumentModel(
            id="DOC-DEMO-003",
            case_id="DEMO-003",
            filename="sample_case_demo003_timestamps.pdf",
            file_path=doc3_path,
            page_count=2,
            status="OK"
        ))

    if not db.query(ImageModel).filter(ImageModel.case_id == "DEMO-003").first():
        db.add(ImageModel(
            id="IMG-DEMO-003",
            case_id="DEMO-003",
            filename="xray_illustration.png",
            file_path=img3_path,
            image_source_type="illustrative",
            paired_with_document=False,
            status="OK"
        ))

    if not db.query(ExtractionModel).filter(ExtractionModel.case_id == "DEMO-003").first():
        db.add(ExtractionModel(
            id="EXT-DEMO-003",
            case_id="DEMO-003",
            mode="mock",
            fields_data={
                "symptoms": {
                    "value": ["Đau ngực âm ỉ", "Ho khan kéo dài"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-003",
                        "page_number": 1,
                        "section": "Triệu chứng",
                        "quote": "Triệu chứng: Đau ngực âm ỉ, ho khan kéo dài từ ngày 10/11/2026."
                    }
                },
                "medical_history": {
                    "value": ["Bệnh mạch vành", "Tăng mỡ máu"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-003",
                        "page_number": 1,
                        "section": "Tiền sử",
                        "quote": "Tiền sử: Bệnh mạch vành đặt stent năm 2022, tăng lipid máu."
                    }
                },
                "medications": {
                    "value": ["Atorvastatin 20mg", "Aspirin 81mg"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-003",
                        "page_number": 1,
                        "section": "Thuốc đang dùng",
                        "quote": "Thuốc: Atorvastatin 20mg/ngày, Aspirin 81mg/ngày."
                    }
                },
                "allergies": {
                    "value": None,
                    "status": "missing",
                    "source": None,
                    "note": "Hồ sơ không có ghi nhận thông tin dị ứng."
                },
                "test_datetime": {
                    "value": "2026-11-15T08:30:00+07:00",
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-003",
                        "page_number": 2,
                        "section": "Thời điểm chụp X-quang",
                        "quote": "Thời điểm chụp X-quang: 15/11/2026, 08:30 (giờ Việt Nam)."
                    },
                    "note": "Phân biệt rõ: Ngày khám ban đầu 10/11/2026, Nhập viện 14/11/2026, Chụp X-quang 15/11/2026."
                }
            }
        ))

    if not db.query(PredictionModel).filter(PredictionModel.case_id == "DEMO-003").first():
        db.add(PredictionModel(
            id="PRED-DEMO-003",
            case_id="DEMO-003",
            mode="mock",
            is_mock=True,
            image_id="IMG-DEMO-003",
            image_source_type="illustrative",
            paired_with_document=False,
            model_name="MOCK_FIXTURE_NO_REAL_MODEL",
            labels=[
                {
                    "code": "cardiomegaly",
                    "name_vi": "Tim to",
                    "score": 0.88,
                    "threshold_mock": 0.50,
                    "is_suspected": True,
                    "finding_description": "Chỉ số tim ngực tăng nhẹ.",
                    "visual_box": None
                },
                {
                    "code": "pleural_effusion",
                    "name_vi": "Tràn dịch màng phổi",
                    "score": 0.35,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Không có dấu hiệu tụ dịch màng phổi rõ.",
                    "visual_box": None
                },
                {
                    "code": "lung_opacity",
                    "name_vi": "Đám mờ phổi",
                    "score": 0.20,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Nhu mô phổi tương đối đồng đều.",
                    "visual_box": None
                }
            ],
            disclaimer="Điểm số giả lập, không phải dự đoán của mô hình được huấn luyện."
        ))

    if not db.query(ReportVersionModel).filter(ReportVersionModel.case_id == "DEMO-003").first():
        db.add(ReportVersionModel(
            id="REP-DEMO-003-V1",
            case_id="DEMO-003",
            version_number=1,
            status="AI_DRAFT",
            parent_version_id=None,
            actor_label="AI Assistant (Prototype)",
            actor_role="ai_system",
            content={
                "summary": "Bệnh nhân nam 71 tuổi có tiền sử mạch vành đặt stent, xuất hiện đau ngực từ 10/11/2026, nhập viện 14/11/2026 và chụp X-quang ngày 15/11/2026. Điểm mock Tim to: 0.88.",
                "clinical_notes": "Lưu ý mốc thời gian: Khám ban đầu (10/11), Nhập viện (14/11), Phim phổi (15/11). Cần theo dõi sát diễn tiến men tim Troponin.",
                "xray_observations": "Tim to: 0.88 (nghi ngờ). Không có tràn dịch màng phổi cấp.",
                "attention_points": ["Theo dõi điện tim liên tục 24h", "Kiểm tra men tim và chức năng thận trước khi dùng thuốc cản quang"],
                "recommended_action": "Hội chẩn khẩn Nội Tim Mạch đánh giá tái thông stent.",
                "source_references": []
            },
            change_summary="Bản thảo AI Draft khởi tạo ca DEMO-003 (Đa mốc thời gian)",
            created_at=datetime.datetime(2026, 11, 15, 10, 15, 0)
        ))

    # ========================================================
    # 4. CASE: DEMO-SCAN-004 (Bản PDF dạng scan hình ảnh)
    # ========================================================
    c4 = db.query(CaseModel).filter(CaseModel.id == "DEMO-SCAN-004").first()
    if not c4:
        c4 = CaseModel(
            id="DEMO-SCAN-004",
            case_code="TM-2026-004",
            patient_name_demo="Hoàng Thị Bản Quét (Demo)",
            age=60,
            gender="Nữ",
            status="AI_DRAFT",
            is_mock=True,
            error_type=None,
            error_message="Tài liệu tải lên là bản quét hình ảnh (Scan/Image-only PDF). Trích xuất dựa trên OCR mô phỏng cần được kiểm tra đối chiếu kỹ bằng mắt.",
            notes="Ca kiểm thử tài liệu scan: cảnh báo OCR và yêu cầu kiểm tra kỹ văn bản trích xuất.",
            created_by="CLINICIAN_DEMO",
            created_at=datetime.datetime(2026, 11, 16, 8, 30, 0)
        )
        db.add(c4)
        db.commit()
    else:
        if not c4.case_code:
            c4.case_code = "TM-2026-004"
            c4.created_by = "CLINICIAN_DEMO"
            db.commit()

    doc4_path = os.path.join(ASSETS_DIR, "sample_case_scan004.pdf")
    img4_path = os.path.join(ASSETS_DIR, "xray_illustration.png")
    add_case_file("DEMO-SCAN-004", doc4_path, "document", "Bản scan bệnh án chuyển viện")
    add_case_file("DEMO-SCAN-004", img4_path, "image", "X-quang ngực thẳng tư thế PA", "PA")

    if not db.query(DocumentModel).filter(DocumentModel.case_id == "DEMO-SCAN-004").first():
        db.add(DocumentModel(
            id="DOC-DEMO-SCAN-004",
            case_id="DEMO-SCAN-004",
            filename="sample_case_scan004.pdf",
            file_path=doc4_path,
            page_count=2,
            status="OK"
        ))

    if not db.query(ImageModel).filter(ImageModel.case_id == "DEMO-SCAN-004").first():
        db.add(ImageModel(
            id="IMG-DEMO-SCAN-004",
            case_id="DEMO-SCAN-004",
            filename="xray_illustration.png",
            file_path=img4_path,
            image_source_type="illustrative",
            paired_with_document=False,
            status="OK"
        ))

    if not db.query(ExtractionModel).filter(ExtractionModel.case_id == "DEMO-SCAN-004").first():
        db.add(ExtractionModel(
            id="EXT-DEMO-SCAN-004",
            case_id="DEMO-SCAN-004",
            mode="mock",
            fields_data={
                "symptoms": {
                    "value": ["Ho sốt nhẹ về chiều", "Sụt cân 2kg trong 1 tháng"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-SCAN-004",
                        "page_number": 1,
                        "section": "Triệu chứng lâm sàng",
                        "quote": "Bệnh nhân ho sốt nhẹ về chiều, sụt cân 2kg trong 1 tháng."
                    },
                    "note": "[OCR Cảnh báo] Văn bản nhận dạng từ bản quét hình ảnh."
                },
                "medical_history": {
                    "value": ["Tiền sử lao phổi điều trị khỏi 2018"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-SCAN-004",
                        "page_number": 1,
                        "section": "Tiền sử bệnh",
                        "quote": "Tiền sử lao phổi điều trị khỏi năm 2018."
                    }
                },
                "medications": {
                    "value": ["Paracetamol 500mg uống khi sốt"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-SCAN-004",
                        "page_number": 1,
                        "section": "Thuốc đang sử dụng",
                        "quote": "Thuốc đang dùng: Paracetamol 500mg khi sốt."
                    }
                },
                "allergies": {
                    "value": None,
                    "status": "missing",
                    "source": None,
                    "note": "Bản quét không đọc được dòng tiền sử dị ứng do mờ."
                },
                "test_datetime": {
                    "value": "2026-11-16T08:00:00+07:00",
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-SCAN-004",
                        "page_number": 2,
                        "section": "Thời điểm chụp phim",
                        "quote": "Thời điểm chụp: 16/11/2026 08:00."
                    }
                }
            }
        ))

    if not db.query(PredictionModel).filter(PredictionModel.case_id == "DEMO-SCAN-004").first():
        db.add(PredictionModel(
            id="PRED-DEMO-SCAN-004",
            case_id="DEMO-SCAN-004",
            mode="mock",
            is_mock=True,
            image_id="IMG-DEMO-SCAN-004",
            image_source_type="illustrative",
            paired_with_document=False,
            model_name="MOCK_FIXTURE_NO_REAL_MODEL",
            labels=[
                {
                    "code": "cardiomegaly",
                    "name_vi": "Tim to",
                    "score": 0.30,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Bóng tim bình thường.",
                    "visual_box": None
                },
                {
                    "code": "pleural_effusion",
                    "name_vi": "Tràn dịch màng phổi",
                    "score": 0.40,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Góc sườn hoành hai bên sáng.",
                    "visual_box": None
                },
                {
                    "code": "lung_opacity",
                    "name_vi": "Đám mờ phổi",
                    "score": 0.72,
                    "threshold_mock": 0.50,
                    "is_suspected": True,
                    "finding_description": "Vùng mờ xơ hóa đỉnh phổi phải, nghi tổn thương cũ/tiến triển.",
                    "visual_box": None
                }
            ],
            disclaimer="Điểm số giả lập, không phải dự đoán của mô hình được huấn luyện."
        ))

    if not db.query(ReportVersionModel).filter(ReportVersionModel.case_id == "DEMO-SCAN-004").first():
        db.add(ReportVersionModel(
            id="REP-DEMO-SCAN-004-V1",
            case_id="DEMO-SCAN-004",
            version_number=1,
            status="AI_DRAFT",
            parent_version_id=None,
            actor_label="AI Assistant (Prototype)",
            actor_role="ai_system",
            content={
                "summary": "Bệnh nhân nữ 60 tuổi ho sốt nhẹ kéo dài, tiền sử lao phổi 2018. Điểm mock Đám mờ phổi: 0.72 nghi xơ hóa hoặc tái phát lao.",
                "clinical_notes": "Lưu ý hồ sơ PDF dạng quét (Scan). Bác sĩ cần kiểm tra kỹ bản gốc.",
                "xray_observations": "Đám mờ phổi: 0.72 nghi ngờ tổn thương đỉnh phổi phải.",
                "attention_points": ["Thực hiện soi đờm tìm AFB và xét nghiệm GeneXpert", "Hỏi lại tiền sử dị ứng"],
                "recommended_action": "Hội chẩn khoa Lao & Bệnh Phổi để có phác đồ chính xác.",
                "source_references": []
            },
            change_summary="Bản thảo AI Draft khởi tạo ca DEMO-SCAN-004",
            created_at=datetime.datetime(2026, 11, 16, 9, 0, 0)
        ))

    # ========================================================
    # 5. CASE: DEMO-INCOMPLETE-005 (và alias DEMO-MISSING-PAGE)
    # ========================================================
    for cid, ccode, cname in [
        ("DEMO-INCOMPLETE-005", "TM-2026-005", "Vũ Đình Thiếu Trang (Demo)"),
        ("DEMO-MISSING-PAGE", "TM-2026-005-LEGACY", "Trần Văn Thiếu (Demo Legacy)")
    ]:
        c = db.query(CaseModel).filter(CaseModel.id == cid).first()
        if not c:
            c = CaseModel(
                id=cid,
                case_code=ccode,
                patient_name_demo=cname,
                age=45,
                gender="Nam",
                status="MISSING_PAGE",
                is_mock=True,
                error_type="MISSING_PAGE",
                error_message="Tệp hồ sơ chỉ gồm 1 trang. Quy chuẩn yêu cầu tối thiểu 2 trang (thiếu trang kết quả xét nghiệm).",
                notes="Ca kiểm thử tình huống thiếu trang: hệ thống từ chối trích xuất tự động và không suy đoán.",
                created_by="CLINICIAN_DEMO",
                created_at=datetime.datetime(2026, 11, 16, 9, 0, 0)
            )
            db.add(c)
            db.commit()
        else:
            if not c.case_code:
                c.case_code = ccode
                c.created_by = "CLINICIAN_DEMO"
                db.commit()

        doc_path = os.path.join(ASSETS_DIR, "sample_case_missing_page.pdf")
        add_case_file(cid, doc_path, "document", "Bệnh án thiếu trang (chỉ có 1 trang)")
        if not db.query(DocumentModel).filter(DocumentModel.case_id == cid).first():
            db.add(DocumentModel(
                id=f"DOC-{cid}",
                case_id=cid,
                filename="sample_case_missing_page.pdf",
                file_path=doc_path,
                page_count=1,
                status="MISSING_PAGE"
            ))

    # ========================================================
    # 6. CASE: DEMO-BAD-IMAGE-006 (và alias DEMO-INVALID-IMAGE)
    # ========================================================
    for cid, ccode, cname in [
        ("DEMO-BAD-IMAGE-006", "TM-2026-006", "Đặng Văn Ảnh Hỏng (Demo)"),
        ("DEMO-INVALID-IMAGE", "TM-2026-006-LEGACY", "Lê Thị Lỗi Ảnh (Demo Legacy)")
    ]:
        c = db.query(CaseModel).filter(CaseModel.id == cid).first()
        if not c:
            c = CaseModel(
                id=cid,
                case_code=ccode,
                patient_name_demo=cname,
                age=58,
                gender="Nam",
                status="INVALID_IMAGE",
                is_mock=True,
                error_type="INVALID_IMAGE",
                error_message="Tệp ảnh X-quang bị hỏng cấu trúc tệp (Corrupted Image File). Hệ thống từ chối phân tích và không render điểm mock.",
                notes="Ca kiểm thử tình huống ảnh không hợp lệ: API báo lỗi 422 rõ ràng.",
                created_by="CLINICIAN_DEMO",
                created_at=datetime.datetime(2026, 11, 16, 10, 15, 0)
            )
            db.add(c)
            db.commit()
        else:
            if not c.case_code:
                c.case_code = ccode
                c.created_by = "CLINICIAN_DEMO"
                db.commit()

        img_path = os.path.join(ASSETS_DIR, "xray_invalid.png")
        add_case_file(cid, img_path, "image", "Tệp ảnh X-quang bị hỏng cấu trúc", "PA")
        if not db.query(ImageModel).filter(ImageModel.case_id == cid).first():
            db.add(ImageModel(
                id=f"IMG-{cid}",
                case_id=cid,
                filename="xray_invalid.png",
                file_path=img_path,
                image_source_type="illustrative",
                paired_with_document=False,
                status="INVALID_IMAGE"
            ))

    # ========================================================
    # 7. CASE: DEMO-AP-007 (Ảnh chụp tư thế AP - ngoài phạm vi)
    # ========================================================
    c7 = db.query(CaseModel).filter(CaseModel.id == "DEMO-AP-007").first()
    if not c7:
        c7 = CaseModel(
            id="DEMO-AP-007",
            case_code="TM-2026-007",
            patient_name_demo="Bùi Văn Tư Thế (Demo)",
            age=63,
            gender="Nam",
            status="AI_DRAFT",
            is_mock=True,
            error_type="AP_VIEW_WARNING",
            error_message="Tư thế chụp AP (ngực nằm/sau-trước ngược) gây phóng đại bóng tim giả tạo; nằm ngoài phạm vi mô hình VinDr-CXR chuẩn PA. Cần cẩn trọng khi diễn giải.",
            notes="Ca kiểm thử tư thế AP: cảnh báo ngoài phạm vi mô hình chuẩn PA.",
            created_by="CLINICIAN_DEMO",
            created_at=datetime.datetime(2026, 11, 17, 11, 0, 0)
        )
        db.add(c7)
        db.commit()
    else:
        if not c7.case_code:
            c7.case_code = "TM-2026-007"
            c7.created_by = "CLINICIAN_DEMO"
            db.commit()

    doc7_path = os.path.join(ASSETS_DIR, "sample_case_2pages.pdf")
    img7_path = os.path.join(ASSETS_DIR, "xray_ap_view.png")
    add_case_file("DEMO-AP-007", doc7_path, "document", "Bệnh án trích sao tư thế AP")
    add_case_file("DEMO-AP-007", img7_path, "image", "X-quang ngực tư thế AP (ngoài phạm vi)", "AP")

    if not db.query(DocumentModel).filter(DocumentModel.case_id == "DEMO-AP-007").first():
        db.add(DocumentModel(
            id="DOC-DEMO-AP-007",
            case_id="DEMO-AP-007",
            filename="sample_case_2pages.pdf",
            file_path=doc7_path,
            page_count=2,
            status="OK"
        ))

    if not db.query(ImageModel).filter(ImageModel.case_id == "DEMO-AP-007").first():
        db.add(ImageModel(
            id="IMG-DEMO-AP-007",
            case_id="DEMO-AP-007",
            filename="xray_ap_view.png",
            file_path=img7_path,
            image_source_type="illustrative",
            paired_with_document=False,
            status="OK"
        ))

    if not db.query(ExtractionModel).filter(ExtractionModel.case_id == "DEMO-AP-007").first():
        db.add(ExtractionModel(
            id="EXT-DEMO-AP-007",
            case_id="DEMO-AP-007",
            mode="mock",
            fields_data={
                "symptoms": {
                    "value": ["Khó thở khi gắng sức", "Mệt mỏi kéo dài"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-AP-007",
                        "page_number": 1,
                        "section": "Triệu chứng",
                        "quote": "Bệnh nhân khó thở khi gắng sức, mệt mỏi kéo dài 1 tuần."
                    }
                },
                "medical_history": {
                    "value": ["Hở van hai lá nhẹ"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-AP-007",
                        "page_number": 1,
                        "section": "Tiền sử",
                        "quote": "Tiền sử: Hở van hai lá nhẹ theo dõi định kỳ."
                    }
                },
                "medications": {
                    "value": ["Enalapril 5mg/ngày"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-AP-007",
                        "page_number": 1,
                        "section": "Thuốc đang dùng",
                        "quote": "Thuốc: Enalapril 5mg/ngày."
                    }
                },
                "allergies": {
                    "value": None,
                    "status": "missing",
                    "source": None,
                    "note": "Chưa có dữ liệu dị ứng."
                },
                "test_datetime": {
                    "value": "2026-11-17T10:30:00+07:00",
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-AP-007",
                        "page_number": 2,
                        "section": "Thời điểm chụp",
                        "quote": "Thời điểm chụp X-quang tại giường: 17/11/2026 10:30 (Tư thế AP)."
                    }
                }
            }
        ))

    if not db.query(PredictionModel).filter(PredictionModel.case_id == "DEMO-AP-007").first():
        db.add(PredictionModel(
            id="PRED-DEMO-AP-007",
            case_id="DEMO-AP-007",
            mode="mock",
            is_mock=True,
            image_id="IMG-DEMO-AP-007",
            image_source_type="illustrative",
            paired_with_document=False,
            model_name="MOCK_FIXTURE_NO_REAL_MODEL",
            labels=[
                {
                    "code": "cardiomegaly",
                    "name_vi": "Tim to (Cảnh báo tư thế AP)",
                    "score": 0.89,
                    "threshold_mock": 0.50,
                    "is_suspected": True,
                    "finding_description": "CẢNH BÁO TƯ THẾ AP: Điểm 0.89 có thể do bóng tim bị phóng đại giả tạo khi chụp tại giường. Ngoài phạm vi chuẩn mô hình VinDr-CXR PA.",
                    "visual_box": None
                },
                {
                    "code": "pleural_effusion",
                    "name_vi": "Tràn dịch màng phổi",
                    "score": 0.25,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Chưa thấy tràn dịch rõ trên tư thế nằm.",
                    "visual_box": None
                },
                {
                    "code": "lung_opacity",
                    "name_vi": "Đám mờ phổi",
                    "score": 0.20,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Không có đám mờ khu trú.",
                    "visual_box": None
                }
            ],
            disclaimer="[CẢNH BÁO PHẠM VI MÔ HÌNH]: Phim chụp tư thế AP (ngực nằm/sau-trước ngược) nằm ngoài phạm vi huấn luyện chuẩn của VinDr-CXR (PA view). Điểm số tim to có độ tin cậy thấp do hiệu ứng phóng đại hình học."
        ))

    if not db.query(ReportVersionModel).filter(ReportVersionModel.case_id == "DEMO-AP-007").first():
        db.add(ReportVersionModel(
            id="REP-DEMO-AP-007-V1",
            case_id="DEMO-AP-007",
            version_number=1,
            status="AI_DRAFT",
            parent_version_id=None,
            actor_label="AI Assistant (Prototype)",
            actor_role="ai_system",
            content={
                "summary": "Bệnh nhân nam 63 tuổi khó thở mệt mỏi. Phim chụp tại giường tư thế AP ngoài phạm vi tối ưu của VinDr-CXR.",
                "clinical_notes": "LƯU Ý LÂM SÀNG: Tư thế AP gây phóng đại bóng tim, không được khẳng định bệnh nhân bị tim to thực sự chỉ dựa trên chỉ số này.",
                "xray_observations": "Tim to: 0.89 (CẢNH BÁO: Phóng đại hình học tư thế AP).",
                "attention_points": ["Chỉ định chụp lại phim chuẩn PA khi bệnh nhân có thể đứng được", "Làm siêu âm tim xác định thể tích buồng tim"],
                "recommended_action": "Bác sĩ hội chẩn thẩm định lại phim AP và cân nhắc siêu âm tim tại giường.",
                "source_references": []
            },
            change_summary="Bản thảo AI Draft ca DEMO-AP-007 (Cảnh báo tư thế ngoài phạm vi)",
            created_at=datetime.datetime(2026, 11, 17, 11, 15, 0)
        ))

    # ========================================================
    # 8. CASE: DEMO-CONFLICT-008 (Mâu thuẫn thông tin dị ứng)
    # ========================================================
    c8 = db.query(CaseModel).filter(CaseModel.id == "DEMO-CONFLICT-008").first()
    if not c8:
        c8 = CaseModel(
            id="DEMO-CONFLICT-008",
            case_code="TM-2026-008",
            patient_name_demo="Ngô Thị Mâu Thuẫn (Demo)",
            age=50,
            gender="Nữ",
            status="AI_DRAFT",
            is_mock=True,
            error_type="DATA_CONFLICT",
            error_message="MÂU THUẪN DỮ LIỆU NGUỒN: Trang 1 ghi 'Dị ứng: Không ghi nhận', nhưng Trang 2 ghi 'Tiền sử dị ứng Penicillin nổi mề đay năm 2021'. Hệ thống gắn cờ CONFLICT bắt buộc đối soát trực tiếp.",
            notes="Ca kiểm thử mâu thuẫn dữ liệu: phát hiện xung đột thông tin giữa các trang hồ sơ.",
            created_by="CLINICIAN_DEMO",
            created_at=datetime.datetime(2026, 11, 18, 14, 0, 0)
        )
        db.add(c8)
        db.commit()
    else:
        if not c8.case_code:
            c8.case_code = "TM-2026-008"
            c8.created_by = "CLINICIAN_DEMO"
            db.commit()

    doc8_path = os.path.join(ASSETS_DIR, "sample_case_conflict008.pdf")
    img8_path = os.path.join(ASSETS_DIR, "xray_illustration.png")
    add_case_file("DEMO-CONFLICT-008", doc8_path, "document", "Bệnh án có mâu thuẫn tiền sử dị ứng giữa trang 1 và 2")
    add_case_file("DEMO-CONFLICT-008", img8_path, "image", "X-quang ngực thẳng tư thế PA", "PA")

    if not db.query(DocumentModel).filter(DocumentModel.case_id == "DEMO-CONFLICT-008").first():
        db.add(DocumentModel(
            id="DOC-DEMO-CONFLICT-008",
            case_id="DEMO-CONFLICT-008",
            filename="sample_case_conflict008.pdf",
            file_path=doc8_path,
            page_count=2,
            status="OK"
        ))

    if not db.query(ImageModel).filter(ImageModel.case_id == "DEMO-CONFLICT-008").first():
        db.add(ImageModel(
            id="IMG-DEMO-CONFLICT-008",
            case_id="DEMO-CONFLICT-008",
            filename="xray_illustration.png",
            file_path=img8_path,
            image_source_type="illustrative",
            paired_with_document=False,
            status="OK"
        ))

    if not db.query(ExtractionModel).filter(ExtractionModel.case_id == "DEMO-CONFLICT-008").first():
        db.add(ExtractionModel(
            id="EXT-DEMO-CONFLICT-008",
            case_id="DEMO-CONFLICT-008",
            mode="mock",
            fields_data={
                "symptoms": {
                    "value": ["Viêm họng cấp", "Sốt nhẹ 38 độ C"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-CONFLICT-008",
                        "page_number": 1,
                        "section": "Triệu chứng",
                        "quote": "Bệnh nhân đau họng, sốt nhẹ 38 độ C trong 2 ngày."
                    }
                },
                "medical_history": {
                    "value": ["Viêm mũi dị ứng mạn tính"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-CONFLICT-008",
                        "page_number": 1,
                        "section": "Tiền sử",
                        "quote": "Tiền sử viêm mũi dị ứng thời tiết."
                    }
                },
                "medications": {
                    "value": ["Cetirizine 10mg khi dị ứng"],
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-CONFLICT-008",
                        "page_number": 1,
                        "section": "Thuốc",
                        "quote": "Thuốc: Cetirizine 10mg khi có triệu chứng."
                    }
                },
                "allergies": {
                    "value": "CẢNH BÁO MÂU THUẪN: Trang 1 ghi Không ghi nhận dị ứng, Trang 2 ghi Dị ứng Penicillin nổi mề đay năm 2021",
                    "status": "conflict",
                    "source": {
                        "document_id": "DOC-DEMO-CONFLICT-008",
                        "page_number": 1,
                        "section": "Mâu thuẫn thông tin",
                        "quote": "Trang 1: 'Dị ứng: Không ghi nhận' | Trang 2: 'Tiền sử dị ứng Penicillin nổi mề đay năm 2021.'"
                    },
                    "note": "[CỜ CẢNH BÁO BẮT BUỘC]: Phát hiện 2 nguồn thông tin trái ngược nhau trong cùng hồ sơ. Hệ thống từ chối tự giải quyết xung đột; bắt buộc bác sĩ lâm sàng kiểm tra lại bệnh nhân trước khi chỉ định kháng sinh nhóm Beta-lactam."
                },
                "test_datetime": {
                    "value": "2026-11-18T13:45:00+07:00",
                    "status": "present",
                    "source": {
                        "document_id": "DOC-DEMO-CONFLICT-008",
                        "page_number": 2,
                        "section": "Thời điểm chụp",
                        "quote": "Thời điểm chụp: 18/11/2026 13:45."
                    }
                }
            }
        ))

    if not db.query(PredictionModel).filter(PredictionModel.case_id == "DEMO-CONFLICT-008").first():
        db.add(PredictionModel(
            id="PRED-DEMO-CONFLICT-008",
            case_id="DEMO-CONFLICT-008",
            mode="mock",
            is_mock=True,
            image_id="IMG-DEMO-CONFLICT-008",
            image_source_type="illustrative",
            paired_with_document=False,
            model_name="MOCK_FIXTURE_NO_REAL_MODEL",
            labels=[
                {
                    "code": "cardiomegaly",
                    "name_vi": "Tim to",
                    "score": 0.15,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Kích thước tim bình thường.",
                    "visual_box": None
                },
                {
                    "code": "pleural_effusion",
                    "name_vi": "Tràn dịch màng phổi",
                    "score": 0.10,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Không có tràn dịch.",
                    "visual_box": None
                },
                {
                    "code": "lung_opacity",
                    "name_vi": "Đám mờ phổi",
                    "score": 0.25,
                    "threshold_mock": 0.50,
                    "is_suspected": False,
                    "finding_description": "Hai phế trường sáng đều.",
                    "visual_box": None
                }
            ],
            disclaimer="Điểm số giả lập, không phải dự đoán của mô hình được huấn luyện."
        ))

    if not db.query(ReportVersionModel).filter(ReportVersionModel.case_id == "DEMO-CONFLICT-008").first():
        db.add(ReportVersionModel(
            id="REP-DEMO-CONFLICT-008-V1",
            case_id="DEMO-CONFLICT-008",
            version_number=1,
            status="AI_DRAFT",
            parent_version_id=None,
            actor_label="AI Assistant (Prototype)",
            actor_role="ai_system",
            content={
                "summary": "Bệnh nhân nữ 50 tuổi viêm họng sốt nhẹ. Phát hiện mâu thuẫn nghiêm trọng về tiền sử dị ứng giữa trang 1 (Không dị ứng) và trang 2 (Dị ứng Penicillin).",
                "clinical_notes": "CẢNH BÁO DỊ ỨNG: KHÔNG KÊ ĐƠN KHÁNG SINH PENICILLIN / AMOXICILLIN cho đến khi hỏi lại trực tiếp người bệnh.",
                "xray_observations": "X-quang ngực bình thường, không ghi nhận đám mờ phế nang cấp.",
                "attention_points": [
                    "BẮT BUỘC: Khai thác lại tiền sử dị ứng Penicillin trực tiếp với bệnh nhân hoặc thân nhân.",
                    "Nếu xác nhận có dị ứng, tuyệt đối chống chỉ định nhóm kháng sinh Beta-lactam."
                ],
                "recommended_action": "Bác sĩ lâm sàng đối chiếu hồ sơ và cập nhật lại trường dị ứng trước khi phê duyệt báo cáo.",
                "source_references": [
                    {"field": "Dị ứng trang 1", "page": 1, "quote": "Dị ứng: Không ghi nhận."},
                    {"field": "Dị ứng trang 2", "page": 2, "quote": "Tiền sử dị ứng Penicillin nổi mề đay năm 2021."}
                ]
            },
            change_summary="Bản thảo AI Draft ca DEMO-CONFLICT-008 (Phát hiện xung đột nguồn)",
            created_at=datetime.datetime(2026, 11, 18, 14, 15, 0)
        ))

    db.commit()
    print("Database seeding and schema verification completed successfully!")

if __name__ == "__main__":
    with SessionLocal() as db_session:
        seed_database(db_session)
