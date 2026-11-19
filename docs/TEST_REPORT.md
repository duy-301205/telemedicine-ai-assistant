# BÁO CÁO KẾT QUẢ KIỂM THỬ (TEST REPORT)
## Dự án: Telemedicine AI — Báo cáo Thực thi 30 Kịch bản Nghiệp vụ (TC01–TC30)

- **Thời điểm thực hiện:** 2026-11-19T16:03:29+07:00
- **Môi trường thử nghiệm:**
  - Hệ điều hành: Windows 11 Pro x64
  - Python: 3.13.7
  - Framework: Pytest 9.0.3, AnyIO 4.11.0, Starlette TestClient, FastAPI 0.115+
  - Cơ sở dữ liệu: SQLite 3 (`storage/telemedicine_demo.db`)
  - Node.js & Vite: Node 20+, Vite 8.3.8, React 19, TypeScript 5.8
- **Tập tin kiểm thử:** `backend/tests/test_api.py`

---

### 1. Tổng hợp Kết quả Thực thi

| Tổng số kịch bản | Đạt (Passed) | Thất bại (Failed) | Lỗi ngoại lệ (Error) | Tỷ lệ thành công |
| :---: | :---: | :---: | :---: | :---: |
| **30** | **30** | **0** | **0** | **100.0%** |

---

### 2. Chi tiết Kết quả Từng Kịch bản

```
backend/tests/test_api.py::test_tc01_health_check PASSED                 [  3%]
backend/tests/test_api.py::test_tc02_seed_cases_exist PASSED             [  6%]
backend/tests/test_api.py::test_tc03_pdf_document_retrieval PASSED       [ 10%]
backend/tests/test_api.py::test_tc04_image_retrieval PASSED              [ 13%]
backend/tests/test_api.py::test_tc05_extraction_sources PASSED           [ 16%]
backend/tests/test_api.py::test_tc06_negative_vs_missing_allergy PASSED  [ 20%]
backend/tests/test_api.py::test_tc07_multiple_timestamps PASSED          [ 23%]
backend/tests/test_api.py::test_tc08_scanned_pdf_warning PASSED          [ 26%]
backend/tests/test_api.py::test_tc09_missing_page_error PASSED           [ 30%]
backend/tests/test_api.py::test_tc10_invalid_image_error PASSED          [ 33%]
backend/tests/test_api.py::test_tc11_ap_view_warning PASSED              [ 36%]
backend/tests/test_api.py::test_tc12_data_conflict_detection PASSED      [ 40%]
backend/tests/test_api.py::test_tc13_create_case_api PASSED              [ 43%]
backend/tests/test_api.py::test_tc14_update_case_api PASSED              [ 46%]
backend/tests/test_api.py::test_tc15_archive_case_api PASSED             [ 50%]
backend/tests/test_api.py::test_tc16_upload_document_file PASSED         [ 53%]
backend/tests/test_api.py::test_tc17_upload_image_file PASSED            [ 56%]
backend/tests/test_api.py::test_tc18_no_model_fallback_on_unseeded_upload PASSED [ 60%]
backend/tests/test_api.py::test_tc19_process_case_job PASSED             [ 63%]
backend/tests/test_api.py::test_tc20_manual_extraction_entry PASSED      [ 66%]
backend/tests/test_api.py::test_tc21_manual_prediction_entry PASSED      [ 70%]
backend/tests/test_api.py::test_tc22_ai_draft_structure_and_immutability PASSED [ 73%]
backend/tests/test_api.py::test_tc23_doctor_draft_edit PASSED            [ 76%]
backend/tests/test_api.py::test_tc24_doctor_approval_workflow PASSED     [ 80%]
backend/tests/test_api.py::test_tc25_report_diff_comparison PASSED       [ 83%]
backend/tests/test_api.py::test_tc26_export_report_pdf PASSED            [ 86%]
backend/tests/test_api.py::test_tc27_export_report_json PASSED           [ 90%]
backend/tests/test_api.py::test_tc28_consultation_lifecycle PASSED       [ 93%]
backend/tests/test_api.py::test_tc29_dashboard_summary PASSED            [ 96%]
backend/tests/test_api.py::test_tc30_rbac_and_auth PASSED                [100%]
```

---

### 3. Đánh giá Kết quả Kiểm thử Frontend

- Lệnh thực thi: `cd frontend; npm run build`
- Trình biên dịch: TypeScript `tsc` và Vite `vite build`
- Kết quả: **Thành công 100% trong 2.28s**, không có bất kỳ lỗi cú pháp hay thiếu kiểu dữ liệu nào.
- Kích thước bundle:
  - `dist/index.html`: 0.51 kB
  - `dist/assets/index-*.css`: 62.31 kB
  - `dist/assets/index-*.js`: 393.39 kB

---

### 4. Kết luận Nghiệm thu

Toàn bộ 30 kịch bản kiểm thử nghiệp vụ đều đạt chuẩn quy định trong mục tiêu MT3 (yêu cầu $\ge 29/30$ ca PASS; thực tế đạt **30/30 ca PASS = 100%**).
Hệ thống sẵn sàng bàn giao và bảo vệ trước Hội đồng nghiệm thu đề tài.
