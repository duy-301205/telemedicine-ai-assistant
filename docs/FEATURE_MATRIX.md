# BẢNG MA TRẬN TÍNH NĂNG HỆ THỐNG (FEATURE MATRIX)
## Dự án: Telemedicine AI — Phân định rõ Tính năng Thật vs Mock vs Chưa triển khai

Tài liệu này xác nhận minh bạch tình trạng triển khai của từng phân hệ trong hệ thống Telemedicine AI v2.0, tuân thủ nghiêm ngặt nguyên tắc liêm chính học thuật và chỉ đạo của đề tài.

---

### 1. Phân loại Tính năng

| Phân hệ / Tính năng | Trạng thái | Cơ chế Hoạt động | Lưu trữ & Xử lý |
| :--- | :---: | :--- | :--- |
| **Quản lý Ca bệnh (Case Management)** | **THẬT (REAL)** | Tạo mới, cập nhật, tìm kiếm, lọc theo trạng thái, lưu trữ (soft delete). | CSDL SQLite `cases`, `users` |
| **Tải lên & Lưu trữ Tệp (File Upload)** | **THẬT (REAL)** | Multipart upload, kiểm tra magic bytes, giới hạn 20MB, tính băm SHA-256, đếm trang PDF thực qua `pypdf`. | Thư mục vật lý `storage/cases/{id}/`, bảng `case_files` |
| **Quản lý Phiên bản Báo cáo (Versioning)** | **THẬT (REAL)** | Tạo bản thảo bác sĩ sửa (Version 2+), phê duyệt báo cáo có đối soát lâm sàng, bảo đảm tính bất biến (Immutability). | Bảng `report_versions`, Audit logs |
| **So sánh Đối chiếu Phiên bản (Diff)** | **THẬT (REAL)** | So sánh có cấu trúc từng trường (`summary`, `clinical_notes`, `xray_observations`, `attention_points`). | API `/api/cases/{id}/reports/compare` |
| **Xuất Báo cáo PDF & JSON** | **THẬT (REAL)** | Sinh file PDF nhị phân thời gian thực bằng `ReportLab` với định dạng y tế chuẩn, watermark MOCK và metadata. | API streaming nhị phân `application/pdf` |
| **Quản lý Hội chẩn Y tế từ xa** | **THẬT (REAL)** | Lên lịch họp, cấu hình link Zoom an toàn, cập nhật trạng thái `SCHEDULED` -> `COMPLETED`, lưu biên bản kết luận. | Bảng `consultations` |
| **Nhật ký Kiểm toán (Audit Logging)** | **THẬT (REAL)** | Tự động ghi nhận mọi thao tác: tạo ca, upload, sửa báo cáo, phê duyệt, lên lịch hội chẩn kèm diễn giải, tác nhân, thời gian UTC. | Bảng `audit_logs` |
| **Phân quyền Demo (RBAC)** | **THẬT (REAL)** | Hỗ trợ 3 nhóm vai trò: `DEMO_ADMIN` (Quản trị), `CLINICIAN_DEMO` (Bác sĩ), `VIEWER_DEMO` (Quan sát viên). | Bảng `users`, API `/api/auth/login`, `/api/auth/me` |
| **Dashboard & Báo cáo Thống kê** | **THẬT (REAL)** | Thống kê động số ca theo trạng thái, phân bố cảnh báo, ca tiếp nhận gần nhất, lịch hội chẩn sắp tới. | API `/api/dashboard/summary` |
| **Pipeline AI 1: Trích xuất Thực thể Bệnh án** | **MOCK ADAPTER** | Sử dụng `FixtureDocumentProvider` đối chiếu mã SHA256 với 8 ca mẫu có căn cứ dẫn nguồn; nếu tệp lạ không có fixture sẽ từ chối tự suy đoán (`NoModelDocumentProvider`). | Bảng `extractions`, `analysis_runs` |
| **Pipeline AI 2: Phân tích Tổn thương X-quang** | **MOCK ADAPTER** | Sử dụng `FixtureXrayProvider` đối chiếu mã SHA256; cảnh báo rõ ràng khi tư thế AP nằm ngoài phạm vi mô hình VinDr-CXR; từ chối sinh điểm số giả lập trên ảnh lạ (`NoModelXrayProvider`). | Bảng `predictions`, `analysis_runs` |
| **Nhập Liệu Mô Phỏng Thủ công (Manual Input)** | **THẬT (REAL)** | Cho phép Bác sĩ tự nhập thực thể hoặc điểm X-quang khi tải lên tệp mới chưa có mô hình AI. | API `/api/cases/{id}/manual-extraction`, `/manual-predictions` |
| **Tích hợp Model Deep Learning thực tế (Weights)** | *CHƯA TRIỂN KHAI (OUT OF SCOPE)* | Huấn luyện mô hình DenseNet/EfficientNet trên 18.000 ảnh VinDr-CXR thực tế (thuộc giai đoạn đề xuất nghiên cứu tiếp theo). | Kế hoạch dữ liệu chi tiết tại `/research-data` |
| **Tích hợp Model NLP y tế thực tế (BioBERT / LLM)**| *CHƯA TRIỂN KHAI (OUT OF SCOPE)* | Triển khai mô hình NLP trích xuất thực thể bệnh án độc lập (thuộc giai đoạn tiếp theo). | Được định nghĩa trong bảng KPI mục tiêu MT1 |

---

### 2. Minh bạch về An toàn và Dữ liệu

1. **Không có kết nối ngoài rò rỉ dữ liệu:** Hệ thống không gửi bất kỳ văn bản bệnh án hay hình ảnh X-quang nào sang Zoom hoặc dịch vụ đám mây bên ngoài.
2. **Liêm chính điểm số AI:** Khi người dùng tải lên hình ảnh X-quang mới chưa được định nghĩa trong fixture, hệ thống trả về `PREDICTION_UNAVAILABLE` với `labels: []` thay vì tạo ra các điểm số 0.91 hay 0.78 giả mạo.
3. **Phân biệt rành mạch giữa Missing và Negative:**
   - Trường dị ứng không có thông tin: Gắn nhãn `Chưa có dữ liệu (missing)`, cảnh báo bác sĩ phải hỏi trực tiếp người bệnh.
   - Trường dị ứng có câu khẳng định không dị ứng: Gắn nhãn `Phủ định (negative)` kèm trích dẫn nguyên văn.
   - Hồ sơ có thông tin trái ngược giữa các trang: Gắn nhãn `Mâu thuẫn nguồn (conflict)`.
