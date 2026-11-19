# KẾ HOẠCH KIỂM THỬ HỆ THỐNG (TEST PLAN)
## Dự án: Telemedicine AI — Ma trận 30 Kịch bản Kiểm thử Nghiệp vụ (TC01–TC30)

Tài liệu này quy định chi tiết mục tiêu, phạm vi, dữ liệu đầu vào và tiêu chí chấp nhận cho toàn bộ 30 kịch bản kiểm thử (TC01–TC30) theo mục 8.2 của `TELEMEDICINE_AI_FULL_SYSTEM_UPGRADE_SPEC.md`.

---

### Danh mục 30 Kịch bản Kiểm thử

| Mã | Tên kịch bản | Phân hệ kiểm tra | Điều kiện tiên quyết & Dữ liệu thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC01** | Health check & Disclaimer | Hệ thống chung | `GET /api/health` | HTTP 200, status `healthy`, có disclaimer y tế rõ ràng. |
| **TC02** | Hiện diện đầy đủ 8 ca mẫu | Database Seed | `GET /api/cases` sau khi seed | Đủ 8 ca: DEMO-001 đến DEMO-CONFLICT-008. |
| **TC03** | Tải luồng tệp PDF bệnh án | File Streaming | `GET /api/cases/DEMO-001/document` | HTTP 200, Content-Type `application/pdf`, dung lượng > 1KB. |
| **TC04** | Tải luồng tệp ảnh X-quang | Image Streaming | `GET /api/cases/DEMO-001/image` | HTTP 200, Content-Type `image/*`, dung lượng > 500 bytes. |
| **TC05** | Dẫn nguồn trích xuất thực thể | Extraction Citation | `GET /api/cases/DEMO-001/extraction` | 100% trường `present` có `page_number`, quote khớp nguyên văn PDF. |
| **TC06** | Phân biệt Missing vs Negative dị ứng | Medical Extraction | DEMO-001 vs DEMO-002 | DEMO-001 dị ứng `missing` (value null); DEMO-002 dị ứng `negative`. |
| **TC07** | Phân biệt nhiều mốc thời gian | Time Provenance | DEMO-003 extraction | Phân biệt rõ ngày khám 10/11, nhập viện 14/11, chụp phim 15/11. |
| **TC08** | Cảnh báo hồ sơ dạng quét hình | Scanned Document | DEMO-SCAN-004 | Báo lỗi hoặc cảnh báo `[OCR Cảnh báo]`, yêu cầu kiểm tra kỹ. |
| **TC09** | Từ chối hồ sơ thiếu trang | Safety Error | DEMO-INCOMPLETE-005 | HTTP 422, error_type `MISSING_PAGE`, không tự ý suy đoán dữ liệu. |
| **TC10** | Từ chối ảnh X-quang hỏng | Safety Error | DEMO-BAD-IMAGE-006 | HTTP 422, error_type `INVALID_IMAGE`, từ chối phân tích. |
| **TC11** | Cảnh báo ngoài phạm vi tư thế AP | Posture Scope | DEMO-AP-007 | Gắn cờ cảnh báo AP ngoài phạm vi huấn luyện VinDr-CXR (PA view). |
| **TC12** | Phát hiện mâu thuẫn thông tin dị ứng | Data Conflict | DEMO-CONFLICT-008 | Gắn cờ `conflict`, trích dẫn cả 2 trang mâu thuẫn để đối chiếu. |
| **TC13** | Tạo ca bệnh mới qua API | Case CRUD | `POST /api/cases` với dữ liệu mới | HTTP 200, sinh mã `CASE-...`, `TM-...`, lưu thật vào SQLite. |
| **TC14** | Cập nhật thông tin ca bệnh | Case CRUD | `PATCH /api/cases/{id}` | HTTP 200, cập nhật tên, tuổi, ghi chú, lưu vết vào DB. |
| **TC15** | Lưu trữ (soft delete) ca bệnh | Case Lifecycle | `DELETE /api/cases/{id}` | HTTP 200, gán `archived_at`, chuyển trạng thái `ARCHIVED`. |
| **TC16** | Upload tệp PDF bệnh án thực tế | File Upload | `POST /api/cases/{id}/files` (multipart) | Tính mã SHA-256, đếm trang PDF bằng `pypdf`, lưu vật lý. |
| **TC17** | Upload tệp ảnh X-quang thực tế | File Upload | `POST /api/cases/{id}/files` (image) | Lưu tệp ảnh vào storage, ghi nhận tư thế PA/AP, mã băm SHA256. |
| **TC18** | Từ chối điểm số giả lập trên ảnh lạ | Model Integrity | Upload ảnh lạ không thuộc fixture | Trả về `PREDICTION_UNAVAILABLE`, danh sách nhãn rỗng. |
| **TC19** | Kích hoạt tác vụ phân tích AI | Job Pipeline | `POST /api/cases/{id}/process` | Tạo `ProcessingJobModel` & `AnalysisRunModel`, lưu vết đầu vào/ra. |
| **TC20** | Nhập liệu trích xuất thủ công | Manual Override | `POST /api/cases/{id}/manual-extraction` | Bác sĩ tự nhập thực thể khi không có AI, lưu vào DB. |
| **TC21** | Nhập điểm X-quang thủ công | Manual Override | `POST /api/cases/{id}/manual-predictions`| Bác sĩ tự ghi nhận tổn thương X-quang với disclaimer rõ ràng. |
| **TC22** | Khởi tạo và bảo toàn AI Draft V1 | Immutability | `GET /api/cases/DEMO-001/reports` | Version 1 mang trạng thái `AI_DRAFT`, không bị ghi đè khi sửa. |
| **TC23** | Tạo bản chỉnh sửa Doctor Edited | Versioning | `POST /api/cases/{id}/reports/draft-edit` | Tạo Version 2 (`DOCTOR_EDITED`), Version 1 giữ nguyên bất biến. |
| **TC24** | Phê duyệt báo cáo có xác nhận | Approval Flow | `POST /api/cases/{id}/reports/{v}/approve` | Tạo Version mới (`DOCTOR_APPROVED`), có tên bác sĩ và mốc giờ. |
| **TC25** | So sánh đối chiếu hai phiên bản | Diff Engine | `GET /api/cases/{id}/reports/compare` | So sánh chi tiết từng trường nội dung, trả danh sách khác biệt. |
| **TC26** | Xuất báo cáo y tế dạng PDF thật | PDF Exporter | `GET /api/cases/{id}/reports/{v}/export?format=pdf` | Stream nhị phân PDF (ReportLab), bắt đầu bằng `%PDF`, có watermark. |
| **TC27** | Xuất báo cáo dạng JSON có cội nguồn | JSON Export | `GET /api/cases/{id}/reports/{v}/export?format=json` | Trả JSON đầy đủ metadata, phiên bản, tác nhân và nội dung. |
| **TC28** | Vòng đời buổi hội chẩn từ xa | Telemedicine | Tạo mới và cập nhật buổi hội chẩn | Lưu vào bảng `consultations`, chuyển trạng thái sang `COMPLETED`. |
| **TC29** | Bảng điều khiển thống kê thực tế | Dashboard | `GET /api/dashboard/summary` | Thống kê chính xác số ca, trạng thái, cảnh báo từ database. |
| **TC30** | Xác thực và phân quyền tài khoản | RBAC & Security | Đăng nhập tài khoản demo | Trả token hợp lệ, phân định vai trò `DEMO_ADMIN`, `CLINICIAN_DEMO`. |
