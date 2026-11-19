import pytest
import io
import pypdf
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.seed.seed_data import init_db, seed_database
from backend.app.database import SessionLocal

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    init_db()
    with SessionLocal() as db:
        seed_database(db)

@pytest.fixture
def client():
    return TestClient(app)

# ---------------- TC01: Health check & Disclaimer ----------------
def test_tc01_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "disclaimer" in data

# ---------------- TC02: Seed cases check ----------------
def test_tc02_seed_cases_exist(client):
    res = client.get("/api/cases")
    assert res.status_code == 200
    cases = res.json()
    case_ids = [c["id"] for c in cases]
    assert "DEMO-001" in case_ids
    assert "DEMO-002" in case_ids
    assert "DEMO-003" in case_ids
    assert "DEMO-SCAN-004" in case_ids
    assert "DEMO-INCOMPLETE-005" in case_ids or "DEMO-MISSING-PAGE" in case_ids
    assert "DEMO-BAD-IMAGE-006" in case_ids or "DEMO-INVALID-IMAGE" in case_ids
    assert "DEMO-AP-007" in case_ids
    assert "DEMO-CONFLICT-008" in case_ids

# ---------------- TC03: Document retrieval ----------------
def test_tc03_pdf_document_retrieval(client):
    res = client.get("/api/cases/DEMO-001/document")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000

# ---------------- TC04: Image retrieval ----------------
def test_tc04_image_retrieval(client):
    res = client.get("/api/cases/DEMO-001/image")
    assert res.status_code == 200
    assert "image/" in res.headers["content-type"]
    assert len(res.content) > 500

# ---------------- TC05: Extraction citations & sources ----------------
def test_tc05_extraction_sources(client):
    res = client.get("/api/cases/DEMO-001/extraction")
    assert res.status_code == 200
    data = res.json()
    fields = data["fields"]

    assert fields["symptoms"]["status"] == "present"
    assert fields["symptoms"]["source"]["page_number"] == 1
    assert "ho khan" in fields["symptoms"]["source"]["quote"].lower()

    assert fields["medical_history"]["status"] == "present"
    assert fields["medical_history"]["source"]["page_number"] == 1
    assert fields["medical_history"]["source"]["quote"] == "Tiền sử: Tăng huyết áp."

# ---------------- TC06: Negative vs Missing allergy ----------------
def test_tc06_negative_vs_missing_allergy(client):
    res1 = client.get("/api/cases/DEMO-001/extraction").json()
    assert res1["fields"]["allergies"]["status"] == "missing"
    assert res1["fields"]["allergies"]["value"] is None

    res2 = client.get("/api/cases/DEMO-002/extraction").json()
    assert res2["fields"]["allergies"]["status"] == "negative"
    assert "Không ghi nhận tiền sử dị ứng" in res2["fields"]["allergies"]["value"]

# ---------------- TC07: Multiple timestamps ----------------
def test_tc07_multiple_timestamps(client):
    res = client.get("/api/cases/DEMO-003/extraction")
    assert res.status_code == 200
    fields = res.json()["fields"]
    assert fields["test_datetime"]["status"] == "present"
    assert "2026-11-15" in fields["test_datetime"]["value"]
    assert "note" in fields["test_datetime"]
    assert "10/11/2026" in fields["test_datetime"]["note"]

# ---------------- TC08: Scanned PDF warning ----------------
def test_tc08_scanned_pdf_warning(client):
    res = client.get("/api/cases/DEMO-SCAN-004")
    assert res.status_code == 200
    c = res.json()
    assert "scan" in c["error_message"].lower() or "bản quét" in c["error_message"].lower()

    ext = client.get("/api/cases/DEMO-SCAN-004/extraction").json()
    assert "[OCR Cảnh báo]" in ext["fields"]["symptoms"].get("note", "")

# ---------------- TC09: Missing page error ----------------
def test_tc09_missing_page_error(client):
    cid = "DEMO-INCOMPLETE-005"
    res = client.get(f"/api/cases/{cid}/extraction")
    assert res.status_code == 422
    err = res.json()
    assert err["detail"]["error_type"] == "MISSING_PAGE"

# ---------------- TC10: Invalid image error ----------------
def test_tc10_invalid_image_error(client):
    cid = "DEMO-BAD-IMAGE-006"
    res = client.get(f"/api/cases/{cid}/predictions")
    assert res.status_code == 422
    err = res.json()
    assert err["detail"]["error_type"] == "INVALID_IMAGE"

# ---------------- TC11: AP view warning ----------------
def test_tc11_ap_view_warning(client):
    res = client.get("/api/cases/DEMO-AP-007")
    assert res.status_code == 200
    c = res.json()
    assert c["error_type"] == "AP_VIEW_WARNING"

    preds = client.get("/api/cases/DEMO-AP-007/predictions").json()
    assert "AP" in preds["disclaimer"] or "ngoài phạm vi" in preds["disclaimer"].lower()

# ---------------- TC12: Data conflict detection ----------------
def test_tc12_data_conflict_detection(client):
    res = client.get("/api/cases/DEMO-CONFLICT-008")
    assert res.status_code == 200
    assert res.json()["error_type"] == "DATA_CONFLICT"

    ext = client.get("/api/cases/DEMO-CONFLICT-008/extraction").json()
    assert ext["fields"]["allergies"]["status"] == "conflict"
    assert "xung đột" in ext["fields"]["allergies"]["note"].lower() or "mâu thuẫn" in ext["fields"]["allergies"]["value"].lower()

# ---------------- TC13: Real case creation API ----------------
def test_tc13_create_case_api(client):
    payload = {
        "patient_name_demo": "Bệnh Nhân Test Mới",
        "age": 49,
        "gender": "Nữ",
        "notes": "Kiểm thử tạo ca mới lưu database",
        "created_by": "BS. Nguyễn Văn Khám"
    }
    res = client.post("/api/cases", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["patient_name_demo"] == "Bệnh Nhân Test Mới"
    assert data["id"].startswith("CASE-")
    assert data["case_code"].startswith("TM-")
    assert data["status"] == "CREATED"

# ---------------- TC14: Case update API ----------------
def test_tc14_update_case_api(client):
    # Create a case first
    new_c = client.post("/api/cases", json={"patient_name_demo": "Nguyễn Cần Update", "age": 30}).json()
    cid = new_c["id"]

    update_payload = {
        "patient_name_demo": "Nguyễn Đã Update",
        "age": 31,
        "notes": "Đã cập nhật ghi chú lâm sàng"
    }
    res = client.patch(f"/api/cases/{cid}", json=update_payload)
    assert res.status_code == 200
    updated = res.json()
    assert updated["patient_name_demo"] == "Nguyễn Đã Update"
    assert updated["age"] == 31

# ---------------- TC15: Case archiving / soft delete ----------------
def test_tc15_archive_case_api(client):
    new_c = client.post("/api/cases", json={"patient_name_demo": "Bệnh Nhân Sắp Lưu Trữ"}).json()
    cid = new_c["id"]

    del_res = client.delete(f"/api/cases/{cid}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"

    # Detail shows status ARCHIVED and archived_at set
    detail = client.get(f"/api/cases/{cid}").json()
    assert detail["status"] == "ARCHIVED"
    assert detail["archived_at"] is not None

# ---------------- TC16: Document file upload ----------------
def test_tc16_upload_document_file(client):
    new_c = client.post("/api/cases", json={"patient_name_demo": "Bệnh Nhân Upload Doc"}).json()
    cid = new_c["id"]

    # Read sample PDF
    with open("demo_assets/sample_case_2pages.pdf", "rb") as f:
        pdf_bytes = f.read()

    files = {"file": ("test_doc.pdf", pdf_bytes, "application/pdf")}
    data = {"kind": "document", "uploaded_by": "BS. Tester"}
    res = client.post(f"/api/cases/{cid}/files", files=files, data=data)
    assert res.status_code == 200
    file_info = res.json()
    assert file_info["kind"] == "document"
    assert file_info["original_filename"] == "test_doc.pdf"
    assert file_info["sha256_hash"] != ""
    assert file_info["page_count"] == 2

    # Check list files
    list_files = client.get(f"/api/cases/{cid}/files").json()
    assert len(list_files) >= 1

# ---------------- TC17: Image file upload ----------------
def test_tc17_upload_image_file(client):
    new_c = client.post("/api/cases", json={"patient_name_demo": "Bệnh Nhân Upload Img"}).json()
    cid = new_c["id"]

    with open("demo_assets/xray_illustration.png", "rb") as f:
        img_bytes = f.read()

    files = {"file": ("test_xray.png", img_bytes, "image/png")}
    data = {"kind": "image", "view_position": "PA", "uploaded_by": "KTV X-Quang"}
    res = client.post(f"/api/cases/{cid}/files", files=files, data=data)
    assert res.status_code == 200
    file_info = res.json()
    assert file_info["kind"] == "image"
    assert file_info["view_position"] == "PA"

# ---------------- TC18: Unknown upload refrains from fake scores ----------------
def test_tc18_no_model_fallback_on_unseeded_upload(client):
    new_c = client.post("/api/cases", json={"patient_name_demo": "Bệnh Nhân Tệp Mới Lạ"}).json()
    cid = new_c["id"]

    # Upload arbitrary dummy PNG (does not match seeded hashes)
    dummy_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    client.post(f"/api/cases/{cid}/files", files={"file": ("unseeded.png", dummy_png, "image/png")}, data={"kind": "image", "view_position": "PA"})

    # Process
    proc_res = client.post(f"/api/cases/{cid}/process")
    assert proc_res.status_code == 200
    data = proc_res.json()
    preds = data["predictions"]
    assert preds["status"] == "PREDICTION_UNAVAILABLE"
    # Ensure it did NOT output 0.91, 0.78 fake scores!
    assert len(preds["labels"]) == 0
    assert "NoModelXrayProvider" in preds["provider"]

# ---------------- TC19: Processing job trigger ----------------
def test_tc19_process_case_job(client):
    # Process DEMO-001
    res = client.post("/api/cases/DEMO-001/process")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert "job_id" in data
    assert "analysis_run_id" in data

# ---------------- TC20: Manual extraction entry override ----------------
def test_tc20_manual_extraction_entry(client):
    new_c = client.post("/api/cases", json={"patient_name_demo": "Bệnh Nhân Nhập Thủ Công"}).json()
    cid = new_c["id"]

    manual_data = {
        "symptoms": {"value": ["Đau bụng thượng vị"], "status": "present"},
        "allergies": {"value": "Dị ứng phấn hoa", "status": "present"}
    }
    res = client.post(f"/api/cases/{cid}/manual-extraction", json=manual_data)
    assert res.status_code == 200
    assert res.json()["mode"] == "manual_entry"

    ext = client.get(f"/api/cases/{cid}/extraction").json()
    assert ext["fields"]["symptoms"]["value"] == ["Đau bụng thượng vị"]

# ---------------- TC21: Manual prediction entry override ----------------
def test_tc21_manual_prediction_entry(client):
    new_c = client.post("/api/cases", json={"patient_name_demo": "Bệnh Nhân Nhập Xquang Tay"}).json()
    cid = new_c["id"]

    manual_preds = {
        "labels": [
            {"code": "cardiomegaly", "name_vi": "Tim to", "score": 0.55, "is_suspected": True, "finding_description": "Bác sĩ đọc tay"}
        ],
        "disclaimer": "Nhập tay bởi Bác sĩ Chẩn đoán hình ảnh"
    }
    res = client.post(f"/api/cases/{cid}/manual-predictions", json=manual_preds)
    assert res.status_code == 200
    assert res.json()["mode"] == "manual_entry"

    preds = client.get(f"/api/cases/{cid}/predictions").json()
    assert preds["labels"][0]["score"] == 0.55

# ---------------- TC22: AI Draft structure ----------------
def test_tc22_ai_draft_structure_and_immutability(client):
    res = client.get("/api/cases/DEMO-001/reports")
    assert res.status_code == 200
    reports = res.json()
    assert len(reports) >= 1
    draft = reports[0]
    assert draft["status"] == "AI_DRAFT"
    assert draft["version_number"] == 1
    assert "summary" in draft["content"]

# ---------------- TC23: Doctor draft edit ----------------
def test_tc23_doctor_draft_edit(client):
    reports = client.get("/api/cases/DEMO-001/reports").json()
    v1 = reports[0]

    edit_payload = {
        "parent_version_id": v1["id"],
        "actor_label": "BS. Nguyễn Văn Khám",
        "content": {
            "summary": "Bản tóm tắt đã được Bác sĩ hiệu chỉnh thông tin lâm sàng.",
            "clinical_notes": "Bệnh nhân có biểu hiện khó thở, nghi ngờ suy tim.",
            "xray_observations": "Đồng thuận với gợi ý X-quang: bóng tim to.",
            "attention_points": ["Bổ sung tiền sử dị ứng thuốc", "Khám chuyên khoa tim mạch"],
            "recommended_action": "Hội chẩn khẩn cấp",
            "source_references": v1["content"].get("source_references", [])
        },
        "change_summary": "Hiệu chỉnh chẩn đoán sơ bộ suy tim"
    }

    res = client.post("/api/cases/DEMO-001/reports/draft-edit", json=edit_payload)
    assert res.status_code == 200
    new_version = res.json()
    assert new_version["version_number"] > 1
    assert new_version["status"] == "DOCTOR_EDITED"

# ---------------- TC24: Doctor approval workflow ----------------
def test_tc24_doctor_approval_workflow(client):
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

# ---------------- TC25: Report diff comparison ----------------
def test_tc25_report_diff_comparison(client):
    reports = client.get("/api/cases/DEMO-001/reports").json()
    assert len(reports) >= 2
    v1_id = reports[0]["id"]
    v2_id = reports[1]["id"]

    res = client.get(f"/api/cases/DEMO-001/reports/compare?v1={v1_id}&v2={v2_id}")
    assert res.status_code == 200
    diff = res.json()
    assert "differences" in diff
    assert len(diff["differences"]) >= 3

# ---------------- TC26: Export report PDF ----------------
def test_tc26_export_report_pdf(client):
    reports = client.get("/api/cases/DEMO-001/reports").json()
    v_id = reports[-1]["id"]

    res = client.get(f"/api/cases/DEMO-001/reports/{v_id}/export?format=pdf")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 500
    # Verify valid PDF header
    assert res.content.startswith(b"%PDF")

# ---------------- TC27: Export report JSON ----------------
def test_tc27_export_report_json(client):
    reports = client.get("/api/cases/DEMO-001/reports").json()
    v_id = reports[-1]["id"]

    res = client.get(f"/api/cases/DEMO-001/reports/{v_id}/export?format=json")
    assert res.status_code == 200
    data = res.json()
    assert "export_metadata" in data
    assert data["report_id"] == v_id
    assert "content" in data

# ---------------- TC28: Consultation lifecycle ----------------
def test_tc28_consultation_lifecycle(client):
    payload = {
        "title": "Hội chẩn Nội Khoa - Hô Hấp Ca Mới",
        "scheduled_at": "2026-11-25 10:00:00",
        "zoom_meeting_url": "https://zoom.us/j/1234567890",
        "notes": "Tập trung phân tích tiền sử dị ứng thuốc và đám mờ phổi",
        "created_by": "BS. Khám"
    }
    create_res = client.post("/api/cases/DEMO-001/consultations", json=payload)
    assert create_res.status_code == 200
    con = create_res.json()
    assert con["title"] == payload["title"]
    assert con["status"] == "SCHEDULED"

    # Update status
    con_id = con["id"]
    update_res = client.patch(f"/api/consultations/{con_id}", json={"status": "COMPLETED", "conclusion_notes": "Đã thống nhất phác đồ điều trị"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "COMPLETED"

# ---------------- TC29: Dashboard summary ----------------
def test_tc29_dashboard_summary(client):
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_cases"] >= 8
    assert "active_cases" in data
    assert "status_counts" in data
    assert "recent_cases" in data

# ---------------- TC30: RBAC and Auth ----------------
def test_tc30_rbac_and_auth(client):
    acc_res = client.get("/api/auth/demo-accounts")
    assert acc_res.status_code == 200
    accounts = acc_res.json()
    roles = [a["role"] for a in accounts]
    assert "DEMO_ADMIN" in roles
    assert "CLINICIAN_DEMO" in roles
    assert "VIEWER_DEMO" in roles

    # Login test
    login_res = client.post("/api/auth/login", json={"username": "doctor"})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()
    assert login_res.json()["user"]["role"] == "CLINICIAN_DEMO"
