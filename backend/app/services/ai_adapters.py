import hashlib
import os
from typing import Dict, Any, List, Optional
import pypdf

def get_file_sha256(file_path: str) -> str:
    if not os.path.exists(file_path):
        return ""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "demo_assets"))

# Pre-compute hashes of seeded assets for robust matching
HASH_DEMO_001_PDF = get_file_sha256(os.path.join(ASSETS_DIR, "sample_case_2pages.pdf"))
HASH_DEMO_002_PDF = get_file_sha256(os.path.join(ASSETS_DIR, "sample_case_negative_allergy.pdf"))
HASH_DEMO_003_PDF = get_file_sha256(os.path.join(ASSETS_DIR, "sample_case_demo003_timestamps.pdf"))
HASH_DEMO_SCAN_PDF = get_file_sha256(os.path.join(ASSETS_DIR, "sample_case_scan004.pdf"))
HASH_DEMO_CONFLICT_PDF = get_file_sha256(os.path.join(ASSETS_DIR, "sample_case_conflict008.pdf"))
HASH_DEMO_MISSING_PDF = get_file_sha256(os.path.join(ASSETS_DIR, "sample_case_missing_page.pdf"))

HASH_XRAY_PA = get_file_sha256(os.path.join(ASSETS_DIR, "xray_illustration.png"))
HASH_XRAY_AP = get_file_sha256(os.path.join(ASSETS_DIR, "xray_ap_view.png"))
HASH_XRAY_INVALID = get_file_sha256(os.path.join(ASSETS_DIR, "xray_invalid.png"))


class DocumentExtractionProvider:
    def extract(self, case_id: str, file_path: str, file_hash: str) -> Dict[str, Any]:
        raise NotImplementedError


class FixtureDocumentProvider(DocumentExtractionProvider):
    def extract(self, case_id: str, file_path: str, file_hash: str) -> Dict[str, Any]:
        # 1. Match DEMO-001
        if file_hash == HASH_DEMO_001_PDF or "sample_case_2pages" in file_path or case_id == "DEMO-001":
            return {
                "case_id": case_id,
                "mode": "mock",
                "is_mock": True,
                "provider": "FixtureDocumentProvider",
                "fixture_id": "FIXTURE-DEMO-001",
                "fields": {
                    "symptoms": {
                        "value": ["Ho khan", "Khó thở trong 3 ngày"],
                        "status": "present",
                        "source": {
                            "document_id": "DOC-DEMO-001",
                            "page_number": 1,
                            "section": "Triệu chứng",
                            "quote": "Triệu chứng: Bệnh nhân ho khan, khó thở trong 3 ngày."
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
                            "quote": "Tiền sử: Tăng huyết áp."
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
                            "quote": "Thuốc đang dùng: Amlodipine 5 mg/ngày."
                        },
                        "note": "Trích xuất từ mục IV Thuốc đang dùng trang 1"
                    },
                    "allergies": {
                        "value": None,
                        "status": "missing",
                        "source": None,
                        "note": "Không có thông tin dị ứng trong hồ sơ ban đầu. Gắn nhãn Chưa có dữ liệu, không tự ý gán Không dị ứng."
                    },
                    "test_datetime": {
                        "value": "2026-11-15T08:30:00+07:00",
                        "status": "present",
                        "source": {
                            "document_id": "DOC-DEMO-001",
                            "page_number": 2,
                            "section": "Thời điểm chụp X-quang",
                            "quote": "Thời điểm chụp X-quang: 15/11/2026, 08:30 (giờ Việt Nam)."
                        },
                        "note": "Trích xuất từ mục VI Chỉ định trang 2"
                    }
                }
            }

        # 2. Match DEMO-002 (Negative Allergy)
        if file_hash == HASH_DEMO_002_PDF or "negative_allergy" in file_path or case_id == "DEMO-002":
            return {
                "case_id": case_id,
                "mode": "mock",
                "is_mock": True,
                "provider": "FixtureDocumentProvider",
                "fixture_id": "FIXTURE-DEMO-002",
                "fields": {
                    "symptoms": {
                        "value": ["Khó thở nhẹ khi leo cầu thang", "Ho ít đờm trắng"],
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Triệu chứng",
                            "quote": "Triệu chứng: Khó thở nhẹ khi leo cầu thang, ho ít đờm trắng."
                        }
                    },
                    "medical_history": {
                        "value": ["Đái tháo đường type 2"],
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Tiền sử",
                            "quote": "Tiền sử: Đái tháo đường type 2 đang theo dõi định kỳ."
                        }
                    },
                    "medications": {
                        "value": ["Metformin 500 mg x 2 viên/ngày"],
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Thuốc đang dùng",
                            "quote": "Thuốc đang dùng: Metformin 500 mg x 2 viên/ngày."
                        }
                    },
                    "allergies": {
                        "value": "Không ghi nhận tiền sử dị ứng thuốc hay thức ăn",
                        "status": "negative",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Tiền sử dị ứng",
                            "quote": "Dị ứng: Không ghi nhận tiền sử dị ứng thuốc hay thức ăn."
                        },
                        "note": "Hồ sơ có câu phủ định rõ ràng -> Phủ định có căn cứ (negative), phân biệt với Chưa có dữ liệu (missing)."
                    },
                    "test_datetime": {
                        "value": "2026-11-16T09:15:00+07:00",
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 2,
                            "section": "Thời điểm chụp X-quang",
                            "quote": "Thời điểm chụp X-quang: 16/11/2026, 09:15 (giờ Việt Nam)."
                        }
                    }
                }
            }

        # 3. Match DEMO-003 (Multiple Timestamps)
        if file_hash == HASH_DEMO_003_PDF or "demo003" in file_path or case_id == "DEMO-003":
            return {
                "case_id": case_id,
                "mode": "mock",
                "is_mock": True,
                "provider": "FixtureDocumentProvider",
                "fixture_id": "FIXTURE-DEMO-003",
                "fields": {
                    "symptoms": {
                        "value": ["Đau tức ngực trái khi vận động nhẹ", "Khó thở"],
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Bệnh sử",
                            "quote": "Triệu chứng: Đau tức ngực trái khi vận động nhẹ, kèm theo khó thở."
                        }
                    },
                    "medical_history": {
                        "value": ["Bệnh mạch vành đặt stent năm 2021"],
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Tiền sử",
                            "quote": "Tiền sử: Bệnh mạch vành đặt stent năm 2021."
                        }
                    },
                    "medications": {
                        "value": ["Clopidogrel 75 mg/ngày", "Atorvastatin 20 mg/ngày"],
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Thuốc",
                            "quote": "Thuốc đang dùng: Clopidogrel 75 mg/ngày, Atorvastatin 20 mg/ngày."
                        }
                    },
                    "allergies": {
                        "value": "Không ghi nhận tiền sử dị ứng thuốc",
                        "status": "negative",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Dị ứng",
                            "quote": "Dị ứng: Không ghi nhận tiền sử dị ứng thuốc."
                        }
                    },
                    "test_datetime": {
                        "value": "2026-11-14T10:15:00+07:00",
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 2,
                            "section": "Thời điểm chụp X-quang",
                            "quote": "Thời điểm chụp X-quang: 14/11/2026, 10:15 (giờ Việt Nam)."
                        },
                        "note": "Trích xuất chính xác thời điểm chụp X-quang 14/11 thay vì ngày khám 10/11 hay nhập viện 12/11."
                    }
                }
            }

        # 4. Match DEMO-CONFLICT-008
        if file_hash == HASH_DEMO_CONFLICT_PDF or "conflict" in file_path or case_id == "DEMO-CONFLICT-008":
            return {
                "case_id": case_id,
                "mode": "mock",
                "is_mock": True,
                "provider": "FixtureDocumentProvider",
                "fixture_id": "FIXTURE-DEMO-CONFLICT",
                "fields": {
                    "symptoms": {
                        "value": ["Sốt nhẹ về chiều", "Ho khan kéo dài 2 tuần"],
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Bệnh sử",
                            "quote": "Triệu chứng: Sốt nhẹ về chiều, ho khan kéo dài 2 tuần."
                        }
                    },
                    "medical_history": {
                        "value": ["Đái tháo đường type 2"],
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Tiền sử",
                            "quote": "Tiền sử: Đái tháo đường type 2."
                        }
                    },
                    "medications": {
                        "value": ["Metformin 500 mg x 2 viên/ngày"],
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Thuốc",
                            "quote": "Thuốc đang dùng: Metformin 500 mg x 2 viên/ngày."
                        }
                    },
                    "allergies": {
                        "value": "Mâu thuẫn: Mục IV ghi 'Không dị ứng', Mục V ghi 'Nghi ngờ dị ứng Penicillin'",
                        "status": "conflicting",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 1,
                            "section": "Dị ứng (Mục IV & V)",
                            "quote": "Dị ứng (Mục IV): Không ghi nhận tiền sử dị ứng thuốc hay thức ăn. // Khám bổ sung (Mục V): Ghi nhận nghi ngờ dị ứng Penicillin xuất hiện ban đỏ năm 2022."
                        },
                        "note": "Hồ sơ chứa 2 thông tin trái ngược nhau. Hệ thống giữ lại cả 2 nguồn và yêu cầu Bác sĩ xác minh trực tiếp."
                    },
                    "test_datetime": {
                        "value": "2026-11-17T11:00:00+07:00",
                        "status": "present",
                        "source": {
                            "document_id": f"DOC-{case_id}",
                            "page_number": 2,
                            "section": "Thời điểm chụp X-quang",
                            "quote": "Thời điểm chụp X-quang: 17/11/2026, 11:00 (giờ Việt Nam)."
                        }
                    }
                }
            }

        # 5. Match DEMO-SCAN-004
        if file_hash == HASH_DEMO_SCAN_PDF or "scan004" in file_path or case_id == "DEMO-SCAN-004":
            return {
                "case_id": case_id,
                "mode": "mock",
                "is_mock": True,
                "provider": "FixtureDocumentProvider",
                "fixture_id": "FIXTURE-DEMO-SCAN",
                "fields": {
                    "symptoms": {"value": None, "status": "unverified", "note": "Văn bản scan dạng hình ảnh, mô hình OCR tự động chưa được tích hợp."},
                    "medical_history": {"value": None, "status": "unverified", "note": "Chưa có OCR"},
                    "medications": {"value": None, "status": "unverified", "note": "Chưa có OCR"},
                    "allergies": {"value": None, "status": "unverified", "note": "Chưa có OCR"},
                    "test_datetime": {"value": None, "status": "unverified", "note": "Chưa có OCR"}
                },
                "warnings": ["Tệp hồ sơ scan hình ảnh; chức năng OCR tự động chưa kích hoạt. Hệ thống từ chối trích xuất tự động giả lập."]
            }

        # 6. Match Missing Page
        if file_hash == HASH_DEMO_MISSING_PDF or "missing_page" in file_path or case_id in ["DEMO-MISSING-PAGE", "DEMO-INCOMPLETE-005"]:
            return {
                "case_id": case_id,
                "mode": "mock",
                "is_mock": True,
                "provider": "FixtureDocumentProvider",
                "fixture_id": "FIXTURE-DEMO-MISSING",
                "error_type": "MISSING_PAGE",
                "fields": {
                    "symptoms": {
                        "value": ["Sốt nhẹ và đau tức ngực âm ỉ"],
                        "status": "present",
                        "source": {"document_id": f"DOC-{case_id}", "page_number": 1, "section": "Triệu chứng", "quote": "Triệu chứng: Sốt nhẹ và đau tức ngực âm ỉ."}
                    },
                    "medical_history": {"value": None, "status": "missing", "note": "Thiếu trang 2"},
                    "medications": {"value": None, "status": "missing", "note": "Thiếu trang 2"},
                    "allergies": {"value": None, "status": "missing", "note": "Thiếu trang 2"},
                    "test_datetime": {"value": None, "status": "missing", "note": "Thiếu trang kết quả cận lâm sàng (Trang 2)"}
                },
                "warnings": ["Tệp hồ sơ chỉ gồm 1 trang (thiếu trang 2). Hệ thống từ chối suy đoán dữ liệu thiếu."]
            }

        # Fallback to NoModelDocumentProvider
        return NoModelDocumentProvider().extract(case_id, file_path, file_hash)


class NoModelDocumentProvider(DocumentExtractionProvider):
    def extract(self, case_id: str, file_path: str, file_hash: str) -> Dict[str, Any]:
        extracted_text = ""
        page_count = 0
        if os.path.exists(file_path) and file_path.lower().endswith(".pdf"):
            try:
                reader = pypdf.PdfReader(file_path)
                page_count = len(reader.pages)
                extracted_text = "\n".join([p.extract_text() or "" for p in reader.pages[:3]])
            except Exception:
                pass

        return {
            "case_id": case_id,
            "mode": "no_model",
            "is_mock": True,
            "provider": "NoModelDocumentProvider",
            "fixture_id": None,
            "page_count": page_count,
            "raw_text_extracted": extracted_text[:500] if extracted_text else None,
            "fields": {
                "symptoms": {"value": None, "status": "not_processed", "note": "Tệp upload mới không khớp fixture; mô hình NLP tự động chưa triển khai."},
                "medical_history": {"value": None, "status": "not_processed", "note": "Chưa xử lý"},
                "medications": {"value": None, "status": "not_processed", "note": "Chưa xử lý"},
                "allergies": {"value": None, "status": "not_processed", "note": "Chưa xử lý"},
                "test_datetime": {"value": None, "status": "not_processed", "note": "Chưa xử lý"}
            },
            "warnings": ["Tệp hồ sơ mới được tiếp nhận nhưng chưa có mô hình AI trích xuất tự động. Bác sĩ có thể nhập dữ liệu thủ công qua chức năng Manual Demo Input."]
        }


class ChestXrayProvider:
    def predict(self, case_id: str, image_path: str, image_hash: str, view_position: str = "PA") -> Dict[str, Any]:
        raise NotImplementedError


class FixtureXrayProvider(ChestXrayProvider):
    def predict(self, case_id: str, image_path: str, image_hash: str, view_position: str = "PA") -> Dict[str, Any]:
        # 1. Invalid Image check
        if image_hash == HASH_XRAY_INVALID or "invalid" in image_path or case_id in ["DEMO-INVALID-IMAGE", "DEMO-BAD-IMAGE-006"]:
            return {
                "case_id": case_id,
                "mode": "mock",
                "is_mock": True,
                "provider": "FixtureXrayProvider",
                "status": "INVALID_IMAGE",
                "error_type": "INVALID_IMAGE",
                "labels": [],
                "warnings": ["Tệp ảnh bị hỏng cấu trúc tệp (Corrupted Image). Hệ thống từ chối phân tích và không hiển thị điểm số giả lập."],
                "disclaimer": "Không thể phân tích tệp ảnh không hợp lệ."
            }

        # 2. AP View Check (Outside scope)
        if image_hash == HASH_XRAY_AP or "xray_ap" in image_path or view_position == "AP" or case_id == "DEMO-AP-007":
            return {
                "case_id": case_id,
                "mode": "mock",
                "is_mock": True,
                "provider": "FixtureXrayProvider",
                "status": "UNSUPPORTED_IMAGE_VIEW",
                "error_type": "UNSUPPORTED_IMAGE_VIEW",
                "view_position": "AP",
                "labels": [],
                "warnings": [
                    "CẢNH BÁO TƯ THẾ CHỤP: Ảnh chụp theo tư thế Trước-Sau (AP view) ngoài phạm vi nghiên cứu PA của VinDr-CXR. Bóng tim trong tư thế AP thường bị phóng đại lớn hơn thực tế, hệ thống từ chối áp dụng suy luận tự động."
                ],
                "disclaimer": "Tư thế AP nằm ngoài phạm vi mô hình thử nghiệm PA."
            }

        # 3. Match DEMO-001 (High Cardiomegaly & Pleural Effusion)
        if image_hash == HASH_XRAY_PA or "xray_illustration" in image_path or case_id == "DEMO-001":
            return {
                "case_id": case_id,
                "mode": "mock",
                "is_mock": True,
                "provider": "FixtureXrayProvider",
                "fixture_id": "FIXTURE-XRAY-PA-001",
                "image_source_type": "illustrative",
                "paired_with_document": False,
                "model_name": "MOCK_FIXTURE_NO_REAL_MODEL",
                "view_position": "PA",
                "labels": [
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
                "disclaimer": "Điểm số giả lập, không phải dự đoán của mô hình được huấn luyện; ảnh minh họa không ghép cặp lâm sàng với hồ sơ."
            }

        # 4. Match DEMO-002 / other cases with different scores
        if case_id in ["DEMO-002", "DEMO-003", "DEMO-CONFLICT-008"]:
            return {
                "case_id": case_id,
                "mode": "mock",
                "is_mock": True,
                "provider": "FixtureXrayProvider",
                "fixture_id": f"FIXTURE-XRAY-{case_id}",
                "image_source_type": "illustrative",
                "paired_with_document": False,
                "model_name": "MOCK_FIXTURE_NO_REAL_MODEL",
                "view_position": "PA",
                "labels": [
                    {
                        "code": "cardiomegaly",
                        "name_vi": "Tim to",
                        "score": 0.25,
                        "threshold_mock": 0.50,
                        "is_suspected": False,
                        "finding_description": "Bóng tim trong giới hạn bình thường.",
                        "visual_box": None
                    },
                    {
                        "code": "pleural_effusion",
                        "name_vi": "Tràn dịch màng phổi",
                        "score": 0.18,
                        "threshold_mock": 0.50,
                        "is_suspected": False,
                        "finding_description": "Hai góc sườn hoành sáng rõ.",
                        "visual_box": None
                    },
                    {
                        "code": "lung_opacity",
                        "name_vi": "Đám mờ phổi",
                        "score": 0.72,
                        "threshold_mock": 0.50,
                        "is_suspected": True,
                        "finding_description": "Vùng mờ đông đặc nhẹ rải rác nhu mô phổi.",
                        "visual_box": {
                            "label": "Đám mờ nhu mô (Mock)",
                            "x": 0.25,
                            "y": 0.35,
                            "width": 0.28,
                            "height": 0.25,
                            "color": "#EF4444",
                            "description": "Điểm minh họa vùng mờ nhu mô"
                        }
                    }
                ],
                "disclaimer": "Điểm số giả lập phục vụ kịch bản ca bệnh khác nhau, không phải dự đoán lâm sàng."
            }

        # Fallback to NoModelXrayProvider
        return NoModelXrayProvider().predict(case_id, image_path, image_hash, view_position)


class NoModelXrayProvider(ChestXrayProvider):
    def predict(self, case_id: str, image_path: str, image_hash: str, view_position: str = "PA") -> Dict[str, Any]:
        return {
            "case_id": case_id,
            "mode": "no_model",
            "is_mock": True,
            "provider": "NoModelXrayProvider",
            "fixture_id": None,
            "status": "PREDICTION_UNAVAILABLE",
            "model_name": "NO_REAL_MODEL_INTEGRATED",
            "view_position": view_position,
            "labels": [],
            "warnings": [
                "Ảnh tải lên mới không khớp bất kỳ fixture nào và chưa tích hợp mô hình Deep Learning thực tế.",
                "Hệ thống từ chối tự động sinh 3 điểm số giả định để đảm bảo tính liêm chính dữ liệu."
            ],
            "disclaimer": "Chưa có mô hình AI phân tích ảnh mới. Bác sĩ có thể nhập điểm thủ công qua Manual Demo Input nếu cần."
        }
