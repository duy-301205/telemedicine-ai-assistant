import os
import datetime
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.models import (
    CaseModel,
    DocumentModel,
    ImageModel,
    ExtractionModel,
    PredictionModel,
    ReportVersionModel,
    AuditLogModel
)

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "demo_assets"))

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_database(db: Session):
    # Idempotent: check if DEMO-001 exists
    existing = db.query(CaseModel).filter(CaseModel.id == "DEMO-001").first()
    if existing:
        print("Database already contains DEMO-001. Skipping re-seed.")
        return

    print("Seeding database with demo cases...")

    # ========================================================
    # 1. CASE: DEMO-001 (Ca chuẩn mực đầy đủ luồng P0-P4)
    # ========================================================
    c1 = CaseModel(
        id="DEMO-001",
        patient_name_demo="Nguyễn Văn Giả Định (Demo)",
        age=68,
        gender="Nam",
        status="AI_DRAFT",
        is_mock=True,
        error_type=None,
        error_message=None,
        notes="Ca chuẩn mẫu: PDF 2 trang, X-quang minh họa, thiếu dị ứng, 3 điểm mock.",
        created_at=datetime.datetime(2026, 11, 15, 8, 30, 0)
    )
    db.add(c1)

    doc1 = DocumentModel(
        id="DOC-DEMO-001",
        case_id="DEMO-001",
        filename="sample_case_2pages.pdf",
        file_path=os.path.join(ASSETS_DIR, "sample_case_2pages.pdf"),
        page_count=2,
        status="OK"
    )
    db.add(doc1)

    img1 = ImageModel(
        id="IMG-DEMO-001",
        case_id="DEMO-001",
        filename="xray_illustration.png",
        file_path=os.path.join(ASSETS_DIR, "xray_illustration.png"),
        image_source_type="illustrative",
        paired_with_document=False,
        status="OK"
    )
    db.add(img1)

    ext1 = ExtractionModel(
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
    )
    db.add(ext1)

    pred1 = PredictionModel(
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
    )
    db.add(pred1)

    rep1 = ReportVersionModel(
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
    )
    db.add(rep1)

    aud1 = AuditLogModel(
        id="AUD-DEMO-001-01",
        case_id="DEMO-001",
        version_id="REP-DEMO-001-V1",
        actor_label="AI Assistant (Prototype)",
        action="CREATED_AI_DRAFT",
        source_version_id=None,
        timestamp_utc=datetime.datetime(2026, 11, 15, 8, 35, 0),
        change_summary="Khởi tạo bản thảo AI Draft ban đầu từ hồ sơ và ảnh minh họa"
    )
    db.add(aud1)

    # ========================================================
    # 2. CASE: DEMO-MISSING-PAGE (Tình huống thiếu trang)
    # ========================================================
    c2 = CaseModel(
        id="DEMO-MISSING-PAGE",
        patient_name_demo="Trần Văn Thiếu (Demo)",
        age=55,
        gender="Nam",
        status="MISSING_PAGE",
        is_mock=True,
        error_type="MISSING_PAGE",
        error_message="Tệp hồ sơ chỉ gồm 1 trang. Quy chuẩn yêu cầu tối thiểu 2 trang (thiếu trang kết quả xét nghiệm).",
        notes="Ca kiểm thử tình huống thiếu trang: hệ thống từ chối trích xuất tự động và không suy đoán.",
        created_at=datetime.datetime(2026, 11, 16, 9, 0, 0)
    )
    db.add(c2)

    doc2 = DocumentModel(
        id="DOC-DEMO-MISSING",
        case_id="DEMO-MISSING-PAGE",
        filename="sample_case_missing_page.pdf",
        file_path=os.path.join(ASSETS_DIR, "sample_case_missing_page.pdf"),
        page_count=1,
        status="MISSING_PAGE"
    )
    db.add(doc2)

    # ========================================================
    # 3. CASE: DEMO-INVALID-IMAGE (Tình huống ảnh X-quang lỗi)
    # ========================================================
    c3 = CaseModel(
        id="DEMO-INVALID-IMAGE",
        patient_name_demo="Lê Thị Lỗi Ảnh (Demo)",
        age=42,
        gender="Nữ",
        status="INVALID_IMAGE",
        is_mock=True,
        error_type="INVALID_IMAGE",
        error_message="Tệp ảnh X-quang bị hỏng cấu trúc tệp (Corrupted Image File). Hệ thống từ chối phân tích và không render điểm mock.",
        notes="Ca kiểm thử tình huống ảnh không hợp lệ: API báo lỗi 422 rõ ràng.",
        created_at=datetime.datetime(2026, 11, 16, 10, 15, 0)
    )
    db.add(c3)

    img3 = ImageModel(
        id="IMG-DEMO-INVALID",
        case_id="DEMO-INVALID-IMAGE",
        filename="xray_invalid.png",
        file_path=os.path.join(ASSETS_DIR, "xray_invalid.png"),
        image_source_type="illustrative",
        paired_with_document=False,
        status="INVALID_IMAGE"
    )
    db.add(img3)

    # ========================================================
    # 4. CASE: DEMO-002 (Phân biệt Phủ định vs Chưa có dữ liệu)
    # ========================================================
    c4 = CaseModel(
        id="DEMO-002",
        patient_name_demo="Phạm Văn Minh Bạch (Demo)",
        age=52,
        gender="Nam",
        status="AI_DRAFT",
        is_mock=True,
        error_type=None,
        error_message=None,
        notes="Ca kiểm thử phân biệt: Trường dị ứng có câu phủ định tường minh ('Không ghi nhận tiền sử dị ứng').",
        created_at=datetime.datetime(2026, 11, 16, 14, 0, 0)
    )
    db.add(c4)

    doc4 = DocumentModel(
        id="DOC-DEMO-002",
        case_id="DEMO-002",
        filename="sample_case_negative_allergy.pdf",
        file_path=os.path.join(ASSETS_DIR, "sample_case_negative_allergy.pdf"),
        page_count=2,
        status="OK"
    )
    db.add(doc4)

    img4 = ImageModel(
        id="IMG-DEMO-002",
        case_id="DEMO-002",
        filename="xray_illustration.png",
        file_path=os.path.join(ASSETS_DIR, "xray_illustration.png"),
        image_source_type="illustrative",
        paired_with_document=False,
        status="OK"
    )
    db.add(img4)

    ext4 = ExtractionModel(
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
    )
    db.add(ext4)

    pred4 = PredictionModel(
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
    )
    db.add(pred4)

    rep4 = ReportVersionModel(
        id="REP-DEMO-002-V1",
        case_id="DEMO-002",
        version_number=1,
        status="AI_DRAFT",
        parent_version_id=None,
        actor_label="AI Assistant (Prototype)",
        actor_role="ai_system",
        content={
            "summary": "Bệnh nhân nam 52 tuổi có triệu chứng khó thở nhẹ, ho ít đờm trắng, tiền sử đái tháo đường type 2. Tài liệu khẳng định không có tiền sử dị ứng thuốc/thức ăn.",
            "clinical_notes": "Tiền sử dị ứng: Phủ định có căn cứ (Không ghi nhận dị ứng).",
            "xray_observations": "Điểm X-quang giả định: Đám mờ phổi 0.65 (nghi ngờ), Tim to 0.22, Tràn dịch 0.18.",
            "attention_points": ["Kiểm soát đường huyết định kỳ", "Theo dõi đáp ứng điều trị hô hấp"],
            "recommended_action": "Bác sĩ hội chẩn xem xét chỉ định xét nghiệm đờm và chụp lại phim khi cần.",
            "source_references": []
        },
        change_summary="Bản thảo AI Draft khởi tạo ca DEMO-002",
        created_at=datetime.datetime(2026, 11, 16, 14, 5, 0)
    )
    db.add(rep4)

    db.commit()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    init_db()
    with SessionLocal() as db_session:
        seed_database(db_session)
