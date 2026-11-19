# DANH SÁCH NHIỆM VỤ NÂNG CẤP HỆ THỐNG (UPGRADE_TASKS.MD)
## Dự án: Telemedicine AI — Nâng cấp Prototype thành Hệ thống Nghiệp vụ Hoàn chỉnh

> Trạng thái: **ĐÃ HOÀN THÀNH 100% (ALL TASKS PASSED)**  
> Kế thừa: `TELEMEDICINE_AI_DEMO_SPEC.md` và code hiện hữu  
> Đặc tả chi tiết: `TELEMEDICINE_AI_FULL_SYSTEM_UPGRADE_SPEC.md`  
> Ký hiệu: `[x]` Đã hoàn thành và kiểm thử PASS  

---

### U0 — Khảo sát, Lập kế hoạch & Bảo toàn Dữ liệu
- [x] Khảo sát toàn bộ repository hiện có (Backend FastAPI, SQLite, Frontend React, 18 Pytest).
- [x] Chạy baseline test suite hiện hữu (18/18 tests PASSED).
- [x] Sao lưu an toàn cơ sở dữ liệu: `storage/telemedicine_demo.db` -> `storage/telemedicine_demo.db.backup`.
- [x] Soạn thảo kế hoạch chi tiết `UPGRADE_TASKS.md`.
- [x] Soạn thảo tài liệu kiến trúc nâng cấp `docs/UPGRADE_DESIGN.md`.

### U1 — Nâng cấp Domain, DB Schema, Upload & Quản lý Ca
- [x] Mở rộng CSDL (backward-compatible, bảo toàn dữ liệu cũ):
  - Bổ sung bảng `users` (hỗ trợ các role: `DEMO_ADMIN`, `CLINICIAN_DEMO`, `VIEWER_DEMO`).
  - Mở rộng bảng `cases` (thêm `case_code`, `created_by`, `archived_at`, tiến trình trạng thái).
  - Bổ sung bảng `case_files` (lưu trữ metadata file upload thực tế: SHA256, MIME, size, pages, storage_path).
  - Bổ sung bảng `processing_jobs` & `analysis_runs` (quản lý trạng thái tác vụ phân tích, snapshot input/output).
  - Bổ sung bảng `consultations` (quản lý phiên hội chẩn từ xa: thời gian, link Zoom an toàn, trạng thái, biên bản kết luận).
- [x] Endpoint xác thực và phân quyền demo:
  - `POST /api/auth/login` (đăng nhập với các tài khoản demo chuẩn).
  - `GET /api/auth/me` (thông tin người dùng và quyền hiện tại).
  - `GET /api/auth/demo-accounts` (danh sách tài khoản demo phục vụ chuyển đổi nhanh).
- [x] Endpoint Dashboard & Thống kê thực tế:
  - `GET /api/dashboard/summary` (tổng hợp số ca theo trạng thái, số file, số báo cáo, phiên hội chẩn).
- [x] Endpoint Quản lý Ca bệnh nâng cao (CRUD + Search + Filter + Archive):
  - Mở rộng `GET /api/cases` (hỗ trợ `search`, `status`, `sort_by`, `sort_dir`, `include_archived`).
  - `POST /api/cases` (tạo ca mới qua wizard).
  - `PATCH /api/cases/{id}` (cập nhật metadata ca bệnh).
  - `DELETE /api/cases/{id}` (lưu trữ mềm ca bệnh).
- [x] Endpoint Tải tệp thực tế & Xác thực an toàn:
  - `POST /api/cases/{id}/files` (upload multipart PDF / ảnh, kiểm tra magic bytes, kích thước tối đa 20MB, tính mã SHA256, trích xuất số trang qua pypdf).
  - `GET /api/cases/{id}/files` (danh sách tệp thuộc ca).
  - `GET /api/cases/{id}/document` & `GET /api/cases/{id}/image` (stream tệp nhị phân).

### U2 — AI Adapter Tách Biệt & Cơ chế Khớp Fixture An toàn
- [x] Xây dựng kiến trúc Adapter cho 2 luồng AI:
  - `DocumentExtractionProvider` protocol / interface.
  - `ChestXrayProvider` protocol / interface.
- [x] Triển khai các Provider cụ thể:
  - `FixtureDocumentProvider` & `FixtureXrayProvider`: đối chiếu mã băm SHA256 của tệp upload với fixture seed. Nếu khớp -> trả kết quả mock kèm `fixture_id`, `is_mock=True`.
  - `NoModelDocumentProvider` & `NoModelXrayProvider`: khi người dùng tải tệp mới không khớp fixture -> trả về trạng thái `EXTRACTION_UNAVAILABLE` / `PREDICTION_UNAVAILABLE`, TUYỆT ĐỐI không tự động gán điểm 0.91/0.78/0.15 cho ảnh lạ.
  - `TextDocumentExtractionProvider`: trích xuất văn bản thực tế từ PDF có text (qua pypdf) khi không có fixture.
- [x] Hỗ trợ nhập liệu mô phỏng thủ công có kiểm soát:
  - `POST /api/cases/{id}/manual-extraction` (nhập kết quả trích xuất có dẫn nguồn, gắn badge `MANUAL_DEMO_INPUT`).
  - `POST /api/cases/{id}/manual-predictions` (nhập điểm số minh họa có disclaimer rõ ràng).
- [x] Vận hành tác vụ xử lý:
  - `POST /api/cases/{id}/process` (tạo processing job / run, auto-generate AI Draft V1 nếu chưa có).

### U3 — Báo cáo Đa vòng đời, Xuất PDF & Quản lý Hội chẩn
- [x] Nâng cấp quy trình Báo cáo sơ bộ:
  - Khởi tạo AI Draft gắn liền với `analysis_run_id`.
  - Phê duyệt báo cáo yêu cầu checklist thẩm định lâm sàng rõ ràng.
  - `GET /api/cases/{id}/reports/compare?v1={v1}&v2={v2}` (API so sánh diff chi tiết giữa 2 phiên bản).
- [x] Xuất báo cáo đa định dạng (JSON & PDF thực sự):
  - `GET /api/cases/{id}/reports/{version_id}/export?format=json` (xuất JSON có đầy đủ metadata provenance).
  - `GET /api/cases/{id}/reports/{version_id}/export?format=pdf` (sinh tệp PDF báo cáo y tế chính thức qua ReportLab, có header, bảng metadata, watermark MOCK, tóm tắt và ghi nhận lâm sàng).
- [x] Phân hệ Quản lý Phiên Hội chẩn Telemedicine:
  - `POST /api/cases/{id}/consultations` (lên lịch phiên hội chẩn, tiêu đề, ngày giờ, link Zoom HTTPS an toàn).
  - `GET /api/consultations` & `GET /api/cases/{id}/consultations` (danh sách phiên hội chẩn).
  - `PATCH /api/consultations/{consult_id}` (cập nhật trạng thái `SCHEDULED` -> `COMPLETED` / `CANCELED`, ghi nhận biên bản kết luận hội chẩn).

### U4 — Dữ liệu Mẫu 8 Ca & Bảng Nghiên cứu Khoa học Hoàn chỉnh
- [x] Sinh đầy đủ 8 ca bệnh mô phỏng chuẩn mực theo đặc tả:
  - `DEMO-001`: Ca chuẩn có trường dị ứng missing, 3 score mock 0.91/0.78/0.15, ảnh PA.
  - `DEMO-002`: Ca có dị ứng negative kèm trích dẫn nguyên văn ("Không ghi nhận tiền sử dị ứng").
  - `DEMO-003`: Ca có nhiều mốc thời gian (khám 10/11, nhập viện 14/11, chụp X-quang 15/11) phân biệt chính xác `test_datetime`.
  - `DEMO-SCAN-004`: Ca hồ sơ PDF dạng scan hình ảnh, hiển thị cảnh báo `[OCR Cảnh báo]`.
  - `DEMO-INCOMPLETE-005` (alias `DEMO-MISSING-PAGE`): Ca thiếu trang thứ 2, trả về 422 `MISSING_PAGE`.
  - `DEMO-BAD-IMAGE-006` (alias `DEMO-INVALID-IMAGE`): Ca tệp ảnh hỏng, từ chối dự đoán 422 `INVALID_IMAGE`.
  - `DEMO-AP-007`: Ca chụp X-quang tư thế AP (ngoài phạm vi PA), hiển thị cảnh báo ngoài phạm vi VinDr-CXR.
  - `DEMO-CONFLICT-008`: Ca hồ sơ có 2 nguồn thông tin mâu thuẫn nhau giữa trang 1 và trang 2, gắn nhãn `conflict`.
- [x] Hoàn thiện 3 sản phẩm theo yêu cầu của Giảng viên:
  - Sản phẩm A: Báo cáo mẫu có dẫn nguồn, click nhảy đúng trang và câu, phân biệt rõ missing vs negative.
  - Sản phẩm B: Một ảnh và ba điểm số, minh họa vùng chú ý, kèm ví dụ minh họa lỗi lệch vùng chú ý.
  - Sản phẩm C: Lịch sử trước/sau bác sĩ sửa, diff so sánh trực quan, xuất JSON và PDF thật.
- [x] Bảng nghiên cứu dữ liệu VinDr-CXR:
  - Bảng thống kê phân biệt 3 cấp độ: `Công bố (Published)`, `Kế hoạch (Planned)`, `Thực đo (Measured)`.
  - 3 nhóm KPI rõ ràng (MT1, MT2, MT3).

### U5 — Giao diện Web Nghiệp vụ Toàn diện, Kiểm thử 30 Ca & Bàn giao
- [x] Cập nhật Frontend UI:
  - Dashboard `/` với số liệu thống kê sống động từ database.
  - Trang danh sách ca `/cases` có thanh tìm kiếm, bộ lọc trạng thái, nút Tiếp nhận Ca Mới.
  - Wizard tạo ca `/cases/new` cho phép nhập thông tin và tải lên PDF + ảnh thật.
  - Trang chi tiết ca `/cases/:caseId` với 6 tab: Hồ sơ & Dẫn nguồn, X-quang, Báo cáo & Phê duyệt, Lịch sử phiên bản, Hội chẩn, Tệp đính kèm.
  - Component quản lý phiên hội chẩn `/consultations` & biên bản kết luận.
  - Hộp thoại chọn vai trò demo (`CLINICIAN_DEMO`, `DEMO_ADMIN`, `VIEWER_DEMO`) trên thanh điều hướng.
  - Màn hình rộng tối đa 1760px, phong cách thiết kế lâm sàng hài hòa (cyan/emerald/amber trên nền sáng), khắc phục triệt để lỗi tràn giao diện.
- [x] Xây dựng bộ kiểm thử nghiệp vụ toàn diện (TC01 – TC30) với `pytest`:
  - 30/30 kịch bản kiểm thử nghiệp vụ (TC01 đến TC30) PASS 100%.
- [x] Hoàn thiện tài liệu bàn giao:
  - `docs/UPGRADE_DESIGN.md` (kiến trúc và thiết kế kỹ thuật nâng cấp).
  - `docs/FEATURE_MATRIX.md` (ma trận tính năng Thực vs Mock vs Chưa làm).
  - `docs/TEST_PLAN.md` (kế hoạch kiểm thử 30 ca).
  - `docs/TEST_REPORT.md` (kết quả chạy kiểm thử thực tế 30/30).
  - `docs/DEPLOY.md` (hướng dẫn triển khai môi trường cục bộ và production trên Windows).
  - `README.md` (cập nhật toàn diện hướng dẫn cài đặt và chạy).
