# TÀI LIỆU THIẾT KẾ KIẾN TRÚC NÂNG CẤP HỆ THỐNG (UPGRADE DESIGN)
## Dự án: Telemedicine AI — Hỗ trợ Chuẩn bị Hội chẩn Từ xa

---

### 1. TỔNG QUAN KIẾN TRÚC NÂNG CẤP
Hệ thống được nâng cấp từ một prototype demo tĩnh thành **một ứng dụng nghiệp vụ hoàn chỉnh có thể vận hành đa ca bệnh**. Hai luồng AI (trích xuất thực thể bệnh án và phân tích ảnh X-quang) vẫn được giữ ở chế độ **MOCK có kiểm soát minh bạch**, trong khi toàn bộ các luồng nghiệp vụ khác (tạo ca, tải tệp thực, xác thực, quản lý phiên bản báo cáo, phê duyệt lâm sàng, xuất tệp và phiên hội chẩn) đều hoạt động thật trên nền tảng FastAPI, SQLAlchemy và SQLite/PostgreSQL.

```text
React Frontend (Vite + TS + Tailwind)
   │
   ▼  REST API (JSON / Multipart Upload / PDF Stream)
FastAPI Backend Core
   ├── API Routers (/cases, /files, /process, /reports, /consultations, /auth, /dashboard)
   ├── Domain Services (CaseService, FileService, ReportService, ConsultationService)
   ├── AI Adapter Layer (Protocol Interfaces)
   │     ├── FixtureDocumentProvider (khớp mã băm SHA256)
   │     ├── NoModelDocumentProvider (fallback an toàn khi tệp không khớp fixture)
   │     ├── FixtureXrayProvider (khớp mã băm SHA256)
   │     ├── NoModelXrayProvider (từ chối sinh điểm cho ảnh lạ)
   │     └── ManualDemoEntry (hỗ trợ nhập dữ liệu thử nghiệm có gắn nhãn rõ ràng)
   ├── Storage & Repository Layer
   │     ├── SQLAlchemy ORM (SQLite / PostgreSQL)
   │     └── File Storage Manager (lưu tệp tại storage/cases/{case_id}/{random_id})
   └── Report Exporters (ReportLab PDF Generator & JSON Exporter)
```

---

### 2. MÔ HÌNH DỮ LIỆU & CHIẾN LƯỢC MIGRATION AN TOÀN
Cơ sở dữ liệu SQLite hiện có tại `storage/telemedicine_demo.db` đã được sao lưu sang `storage/telemedicine_demo.db.backup`. Các bảng và dữ liệu cũ được giữ nguyên vẹn để bảo toàn các phiên bản báo cáo và audit logs đã tạo.

#### Các bảng dữ liệu chính:
1. **`users`**: Quản lý tài khoản và phân quyền demo:
   - `id`, `username`, `full_name`, `role` (`DEMO_ADMIN`, `CLINICIAN_DEMO`, `VIEWER_DEMO`), `is_active`, `created_at`.
2. **`cases` (Mở rộng)**:
   - `id`, `case_code`, `patient_name_demo`, `age`, `gender`, `status` (`CREATED`, `FILES_UPLOADED`, `READY_FOR_PROCESSING`, `PROCESSING`, `REVIEW_READY`, `IN_REVIEW`, `APPROVED`, `CONSULTATION_READY`, `CONSULTED`, `ARCHIVED`), `is_mock`, `error_type`, `error_message`, `notes`, `created_by`, `created_at`, `archived_at`.
3. **`case_files`**: Quản lý tệp tải lên thực tế:
   - `id`, `case_id`, `kind` (`document` / `image`), `original_filename`, `storage_path`, `sha256_hash`, `mime_type`, `size_bytes`, `page_count`, `view_position` (`PA`, `AP`, `UNKNOWN`), `file_version`, `uploaded_by`, `created_at`.
4. **`processing_jobs`**: Theo dõi tác vụ phân tích:
   - `id`, `case_id`, `status` (`QUEUED`, `PROCESSING`, `SUCCESS`, `PARTIAL_SUCCESS`, `FAILED`), `mode` (`mock_fixture`, `no_model`, `manual`), `started_at`, `ended_at`, `error_code`, `error_message`.
5. **`analysis_runs`**: Bản ghi cội nguồn (Provenance Snapshot):
   - `id`, `case_id`, `job_id`, `provider_document`, `provider_image`, `is_mock`, `fixture_id`, `input_file_hashes_json`, `warnings_json`, `created_at`.
6. **`extracted_fields`**: Dữ liệu trường trích xuất từ lượt chạy:
   - `id`, `run_id`, `case_id`, `field_code`, `value_json`, `status` (`present`, `missing`, `negative`, `conflicting`, `unverified`), `source_citation_json`.
7. **`image_predictions`**: Điểm số và vùng chú ý từ lượt chạy:
   - `id`, `run_id`, `case_id`, `image_file_id`, `label_code`, `name_vi`, `score`, `threshold`, `is_suspected`, `visual_box_json`, `provenance_type`.
8. **`report_versions` (Bảo toàn & Mở rộng)**:
   - `id`, `case_id`, `version_number`, `status` (`AI_DRAFT`, `DOCTOR_EDITED`, `DOCTOR_APPROVED`), `parent_version_id`, `actor_label`, `actor_role`, `content`, `change_summary`, `analysis_run_id`, `created_at`.
9. **`audit_events` / `audit_logs`**: Nhật ký kiểm toán bất biến.
10. **`consultations`**: Quản lý phiên hội chẩn từ xa:
    - `id`, `case_id`, `report_version_id`, `title`, `scheduled_at`, `zoom_meeting_url`, `status` (`SCHEDULED`, `OPENED`, `COMPLETED`, `CANCELED`), `conclusion_notes`, `created_by`, `created_at`.
11. **`dataset_plans`**: Kế hoạch nghiên cứu phân chia VinDr-CXR.

---

### 3. KIẾN TRÚC AI ADAPTER & NGUYÊN TẮC LIÊM CHÍNH DỮ LIỆU
Để đảm bảo tuyệt đối không giả mạo kết quả AI:
1. **Khớp mã băm SHA-256 (Hash-based Fixture Matching):**
   - Khi người dùng tải tệp lên và bấm `Phân tích`, hệ thống tính mã băm SHA256 của tệp.
   - Nếu mã băm khớp với các tệp mẫu đã được seed (`DEMO-001`, `DEMO-002`,...), hệ thống trả về kết quả tương ứng từ Fixture Provider kèm nhãn minh bạch `MOCK FIXTURE`, `fixture_id` và cội nguồn tệp.
2. **Xử lý tệp lạ không có trong Fixture (No-Model Fallback):**
   - Nếu tệp tải lên là tệp mới hoàn toàn không khớp mã băm:
     - Với tệp PDF: Hệ thống dùng PyMuPDF / pypdf để trích xuất văn bản thực tế (`REAL_TEXT_EXTRACTION`), nhưng các trường y tế được đánh dấu `UNVERIFIED` hoặc `NOT_PROCESSED`.
     - Với tệp ảnh X-quang: Hệ thống trả về `PREDICTION_UNAVAILABLE` và **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG GÁN ĐIỂM 0.91/0.78/0.15 CHO ẢNH MỚI**.
3. **Nhập liệu thủ công (Manual Demo Entry):**
   - Cho phép người dùng thử nghiệm tự nhập thông tin trích xuất hoặc điểm số minh họa trên giao diện, nhưng kết quả bắt buộc phải mang nhãn `MANUAL_DEMO_INPUT` và ghi nhận rõ người nhập trong nhật ký kiểm toán.

---

### 4. QUY TRÌNH QUẢN LÝ PHIÊN BẢN & PHÊ DUYỆT BÁC SĨ (APPROVAL WORKFLOW)
- **AI Draft bất biến:** Bản thảo sơ bộ do AI sinh ra mang trạng thái `AI_DRAFT` và được khóa không cho sửa trực tiếp.
- **Bác sĩ chỉnh sửa (`DOCTOR_EDITED`):** Người dùng có vai trò `CLINICIAN_DEMO` hoặc `DEMO_ADMIN` khi chỉnh sửa sẽ sinh ra một phiên bản mới độc lập có `parent_version_id` trỏ về bản trước đó.
- **Phê duyệt lâm sàng (`DOCTOR_APPROVED`):** Yêu cầu xác nhận trách nhiệm qua checklist kiểm tra hồ sơ và phim X-quang. Bản phê duyệt được dùng làm tài liệu căn cứ chính thức trong phiên hội chẩn.
- **Xuất báo cáo PDF thực sự:** Tích hợp ReportLab để sinh tệp PDF báo cáo y tế chính thức, chứa quốc hiệu, thông tin bệnh nhân, bảng đối chiếu trích dẫn, ảnh X-quang, nhận xét bác sĩ và watermark `DEMO / MOCK PROTOTYPE`.

---

### 5. AN TOÀN HỘI CHẨN TELEMEDICINE (ZOOM INTEGRATION)
- Chỉ lưu trữ và mở liên kết Zoom dạng HTTPS an toàn theo cấu hình quản trị.
- **Nguyên tắc an toàn dữ liệu y tế (PHI Protection):** Hệ thống không truyền tải hồ sơ bệnh án, ảnh X-quang hay danh tính bệnh nhân sang Zoom.
- Biên bản kết luận sau hội chẩn được lưu trữ gắn liền với phiên bản báo cáo đã phê duyệt trong cơ sở dữ liệu.
