import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.seed.seed_data import init_db, seed_database
from backend.app.database import SessionLocal
import pypdf

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    init_db()
    with SessionLocal() as db:
        seed_database(db)

@pytest.fixture
def client():
    return TestClient(app)

# T01: /api/health trả 200 JSON
def test_t01_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "disclaimer" in data

# T02: Seed case DEMO-001 hiện sau cài đặt sạch
def test_t02_seed_cases_exist(client):
    res = client.get("/api/cases")
    assert res.status_code == 200
    cases = res.json()
    case_ids = [c["id"] for c in cases]
    assert "DEMO-001" in case_ids
    assert "DEMO-MISSING-PAGE" in case_ids
    assert "DEMO-INVALID-IMAGE" in case_ids
    assert "DEMO-002" in case_ids

    # Detail of DEMO-001
    c1 = client.get("/api/cases/DEMO-001").json()
    assert c1["id"] == "DEMO-001"
    assert c1["is_mock"] is True

# T03: PDF tài liệu hai trang, mở đúng trang
def test_t03_pdf_document(client):
    res = client.get("/api/cases/DEMO-001/document")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000

# T04: Bấm tiền sử hiện đúng quote và trang 1
def test_t04_extraction_source(client):
    res = client.get("/api/cases/DEMO-001/extraction")
    assert res.status_code == 200
    data = res.json()
    assert "fields" in data
    fields = data["fields"]

    # Symptoms
    assert fields["symptoms"]["status"] == "present"
    assert fields["symptoms"]["source"]["page_number"] == 1
    assert "ho khan" in fields["symptoms"]["source"]["quote"].lower()

    # Medical history (Tiền sử)
    assert fields["medical_history"]["status"] == "present"
    assert fields["medical_history"]["source"]["page_number"] == 1
    assert fields["medical_history"]["source"]["quote"] == "Tiền sử: Tăng huyết áp."

# T05: Missing - Dị ứng hiển thị Chưa có dữ liệu trên DEMO-001, Phủ định trên DEMO-002
def test_t05_missing_vs_negative_allergy(client):
    # DEMO-001 has missing allergy
    res1 = client.get("/api/cases/DEMO-001/extraction").json()
    assert res1["fields"]["allergies"]["status"] == "missing"
    assert res1["fields"]["allergies"]["value"] is None
    assert res1["fields"]["allergies"]["source"] is None

    # DEMO-002 has explicit negative allergy
    res2 = client.get("/api/cases/DEMO-002/extraction").json()
    assert res2["fields"]["allergies"]["status"] == "negative"
    assert "Không ghi nhận tiền sử dị ứng" in res2["fields"]["allergies"]["value"]
    assert res2["fields"]["allergies"]["source"]["page_number"] == 1

# T06: Đúng 3 mã nhãn và ba score mock kèm disclaimer
def test_t06_three_labels_mock_scores(client):
    res = client.get("/api/cases/DEMO-001/predictions")
    assert res.status_code == 200
    data = res.json()
    assert data["is_mock"] is True
    assert "disclaimer" in data
    assert "giả lập" in data["disclaimer"].lower()

    labels = {l["code"]: l for l in data["labels"]}
    assert "cardiomegaly" in labels
    assert "pleural_effusion" in labels
    assert "lung_opacity" in labels

    assert labels["cardiomegaly"]["score"] == 0.91
    assert labels["pleural_effusion"]["score"] == 0.78
    assert labels["lung_opacity"]["score"] == 0.15

    # Check that visual boxes are provided for UI illustration
    assert labels["cardiomegaly"]["visual_box"] is not None
    assert labels["pleural_effusion"]["visual_box"] is not None
    assert labels["lung_opacity"]["visual_box"] is not None

# T07: AI Draft hiển thị source refs và các lưu ý
def test_t07_ai_draft_structure(client):
    res = client.get("/api/cases/DEMO-001/reports")
    assert res.status_code == 200
    reports = res.json()
    assert len(reports) >= 1
    draft = reports[0]
    assert draft["status"] == "AI_DRAFT"
    assert draft["version_number"] == 1
    content = draft["content"]
    assert len(content["attention_points"]) >= 2
    assert len(content["source_references"]) >= 3

# T08: Edit tạo bản mới, bản AI ban đầu không đổi (immutability)
def test_t08_edit_creates_new_version_immutability(client):
    initial_reports = client.get("/api/cases/DEMO-001/reports").json()
    v1 = initial_reports[0]
    v1_summary = v1["content"]["summary"]

    # Perform edit
    edit_payload = {
        "parent_version_id": v1["id"],
        "actor_label": "BS. Nguyễn Văn A (Demo)",
        "content": {
            "summary": "Bản tóm tắt đã được Bác sĩ chỉnh sửa bổ sung thông tin lâm sàng.",
            "clinical_notes": "Bệnh nhân có biểu hiện khó thở, nghi ngờ suy tim sung huyết.",
            "xray_observations": "Đồng thuận với gợi ý X-quang: cần lưu ý bóng tim to.",
            "attention_points": [
                "Bổ sung tiền sử dị ứng thuốc",
                "Khám chuyên khoa tim mạch"
            ],
            "recommended_action": "Hội chẩn khẩn cấp",
            "source_references": v1["content"]["source_references"]
        },
        "change_summary": "Bổ sung chẩn đoán sơ bộ suy tim sung huyết"
    }

    res = client.post("/api/cases/DEMO-001/reports/draft-edit", json=edit_payload)
    assert res.status_code == 200
    new_version = res.json()
    assert new_version["version_number"] > 1
    assert new_version["status"] == "DOCTOR_EDITED"
    assert new_version["parent_version_id"] == v1["id"]

    # Verify v1 is UNCHANGED (Immutability check)
    refreshed_v1 = client.get(f"/api/cases/DEMO-001/reports/{v1['id']}").json()
    assert refreshed_v1["content"]["summary"] == v1_summary
    assert refreshed_v1["status"] == "AI_DRAFT"

# T09: Approve chỉ phê duyệt sau thao tác explicit, có actor/time
def test_t09_doctor_approve(client):
    reports = client.get("/api/cases/DEMO-001/reports").json()
    latest_report = reports[-1]

    approve_payload = {
        "actor_label": "TS.BS. Lê Quang B (Demo)",
        "confirmation_checked": True,
        "notes": "Đã đối chiếu kỹ lưỡng kết quả X-quang và triệu chứng lâm sàng"
    }

    res = client.post(f"/api/cases/DEMO-001/reports/{latest_report['id']}/approve", json=approve_payload)
    assert res.status_code == 200
    approved_ver = res.json()
    assert approved_ver["status"] == "DOCTOR_APPROVED"
    assert approved_ver["actor_label"] == "TS.BS. Lê Quang B (Demo)"
    assert approved_ver["parent_version_id"] == latest_report["id"]

# T10: Persistence - kiểm tra data được lưu vào SQLite và truy vấn lại
def test_t10_persistence_across_queries(client):
    # Retrieve case detail
    case_detail = client.get("/api/cases/DEMO-001").json()
    assert case_detail["status"] == "DOCTOR_APPROVED"
    assert case_detail["report_versions_count"] >= 3

# T11: History hiển thị đủ thứ tự version và audit log
def test_t11_version_history_and_audit(client):
    reports = client.get("/api/cases/DEMO-001/reports").json()
    version_numbers = [r["version_number"] for r in reports]
    assert version_numbers == sorted(version_numbers)

    # Audit logs
    audit_res = client.get("/api/cases/DEMO-001/audit-logs")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 2
    actions = [log["action"] for log in logs]
    assert "CREATED_AI_DRAFT" in actions
    assert "APPROVED_BY_DOCTOR" in actions

# T12: Missing page ca DEMO-MISSING-PAGE có lỗi phù hợp, không tự suy đoán
def test_t12_missing_page_error(client):
    res = client.get("/api/cases/DEMO-MISSING-PAGE/extraction")
    assert res.status_code == 422
    err = res.json()
    assert "detail" in err
    detail = err["detail"]
    assert detail["error_type"] == "MISSING_PAGE"
    assert "thiếu trang" in detail["message"].lower()

# T13: Invalid image ca DEMO-INVALID-IMAGE có lỗi phù hợp, không báo dự đoán thành công
def test_t13_invalid_image_error(client):
    res = client.get("/api/cases/DEMO-INVALID-IMAGE/predictions")
    assert res.status_code == 422
    err = res.json()
    assert "detail" in err
    detail = err["detail"]
    assert detail["error_type"] == "INVALID_IMAGE"

# T14: Zoom config
def test_t14_zoom_configuration(client):
    res = client.get("/api/demo/config")
    assert res.status_code == 200
    cfg = res.json()
    assert "zoom_enabled" in cfg
    assert "disclaimer" in cfg
    if cfg["zoom_enabled"]:
        assert cfg["zoom_meeting_url"].startswith("http")

# T15: Data plan có bảng chia tập với placeholder số dương chưa thống kê
def test_t15_data_plan(client):
    res = client.get("/api/research/data-plan")
    assert res.status_code == 200
    data = res.json()
    assert data["published_total"] == 18000
    assert "splits" in data
    for s in data["splits"]:
        assert "Chưa thống kê" in s["cardiomegaly_positive"]

# T16: KPI có nhãn Mục tiêu / Chưa đo
def test_t16_kpi_targets(client):
    res = client.get("/api/research/data-plan")
    kpis = res.json()["kpi_targets"]
    assert len(kpis) >= 3
    for k in kpis:
        assert k["status"] == "Mục tiêu / Chưa đo"

# T17: Source integrity - Mọi quote seed tồn tại trong text PDF thật
def test_t17_source_integrity(client):
    doc_res = client.get("/api/cases/DEMO-001/document")
    import io
    pdf_reader = pypdf.PdfReader(io.BytesIO(doc_res.content))
    assert len(pdf_reader.pages) == 2

    p1_text = pdf_reader.pages[0].extract_text()
    p2_text = pdf_reader.pages[1].extract_text()

    ext = client.get("/api/cases/DEMO-001/extraction").json()
    for field_name, f_data in ext["fields"].items():
        if f_data["status"] == "present" and f_data.get("source"):
            page_num = f_data["source"]["page_number"]
            quote = f_data["source"]["quote"]
            target_text = p1_text if page_num == 1 else p2_text
            assert quote in target_text, f"Quote '{quote}' missing from page {page_num}"

# T18: API validation - reject cross-case version and invalid payload
def test_t18_api_validation(client):
    # Attempting to edit a report using a parent version from another case
    invalid_edit = {
        "parent_version_id": "REP-DEMO-002-V1",  # belongs to DEMO-002
        "actor_label": "BS. Hacker",
        "content": {
            "summary": "Hack attempt",
            "clinical_notes": "Test notes",
            "xray_observations": "Test obs",
            "attention_points": ["test"],
            "recommended_action": "test"
        }
    }
    res = client.post("/api/cases/DEMO-001/reports/draft-edit", json=invalid_edit)
    assert res.status_code == 400

    # Attempting to approve an empty payload
    res_bad = client.post("/api/cases/DEMO-001/reports/REP-DEMO-001-V1/approve", json={"actor_label": "A", "confirmation_checked": False})
    assert res_bad.status_code in [400, 422]
