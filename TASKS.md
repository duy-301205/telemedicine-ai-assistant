# DANH SÁCH CÔNG VIỆC TRIỂN KHAI (TASKS.MD)
## Dự án: Telemedicine AI Demo Prototype

> Trạng thái: **ĐÃ HOÀN THÀNH TOÀN BỘ VÀ KIỂM THỬ PASS**  
> Sinh viên thực hiện: Hoàng Mạnh Duy — K68A3  
> Quy chuẩn: Theo tài liệu `TELEMEDICINE_AI_DEMO_SPEC.md`  
> Ký hiệu: `[x]` Đã hoàn thành và kiểm thử PASS  

---

### P0 — Khảo sát & Scaffold
- [x] Khảo sát repository hiện tại và kiểm tra môi trường (Python 3.13, Node v22.17).
- [x] Thiết lập cấu trúc thư mục backend (`backend/app/...`), frontend (`frontend/...`), `demo_assets/`, `docs/`.
- [x] Cấu hình môi trường `.env.example`, `.gitignore`, `backend/requirements.txt`, `frontend/package.json`.
- [x] Khởi tạo SQLite database models (`Case`, `Document`, `Image`, `Extraction`, `Prediction`, `ReportVersion`, `AuditLog`), schema Pydantic, database migration / idempotent init.

### P1 — Dữ liệu Seed & API Backend
- [x] Script sinh PDF 2 trang tiếng Việt thật (`demo_assets/sample_case_2pages.pdf`) chứa chính xác các quote cho `DEMO-001`.
- [x] Tạo ảnh minh họa X-quang (`demo_assets/xray_illustration.png`) kèm nhãn disclaimer rõ ràng và ảnh lỗi cho ca `DEMO-INVALID-IMAGE`.
- [x] Seed dữ liệu ca mẫu:
  - `DEMO-001`: Ca đầy đủ (PDF 2 trang, X-quang minh họa, 5 trường có nguồn/missing dị ứng, 3 score mock, AI Draft v1).
  - `DEMO-MISSING-PAGE`: Ca thiếu trang hồ sơ (`MISSING_PAGE`).
  - `DEMO-INVALID-IMAGE`: Ca ảnh X-quang hỏng (`INVALID_IMAGE`).
  - `DEMO-002`: Ca có ghi nhận phủ định rõ ràng ("Không ghi nhận tiền sử dị ứng").
- [x] Xây dựng FastAPI endpoints:
  - `GET /api/health`
  - `GET /api/cases`
  - `GET /api/cases/{case_id}`
  - `GET /api/cases/{case_id}/document`
  - `GET /api/cases/{case_id}/image`
  - `GET /api/cases/{case_id}/extraction`
  - `GET /api/cases/{case_id}/predictions`
  - `GET /api/cases/{case_id}/reports`
  - `GET /api/cases/{case_id}/reports/{version_id}`
  - `POST /api/cases/{case_id}/reports/draft-edit` (bất biến AI Draft, sinh version DOCTOR_EDITED mới)
  - `POST /api/cases/{case_id}/reports/{version_id}/approve` (tạo version DOCTOR_APPROVED + audit log)
  - `GET /api/cases/{case_id}/reports/{version_id}/export` (xuất JSON)
  - `GET /api/research/data-plan`
  - `GET /api/demo/config` (cấu hình Zoom URL, demo mode)
- [x] Viết test backend với `pytest` kiểm tra 100% các tiêu chí API bắt buộc (18/18 tests PASSED).

### P2 — Giao diện Luồng Demo Frontend (React + Vite + Tailwind)
- [x] Khởi tạo Frontend React + TypeScript + Vite + Tailwind CSS + Lucide Icons.
- [x] Thiết kế Layout y tế chuyên nghiệp: Header với Disclaimer rõ ràng `DEMO / MOCK — KHÔNG DÙNG CHO QUYẾT ĐỊNH LÂM SÀNG`, nút Zoom (HTTPS / disabled khi chưa cấu hình), nút sao chép link demo.
- [x] Trang Chủ `/` & Giới thiệu prototype.
- [x] Trang Danh sách Ca `/demo`: chọn ca `DEMO-001`, `DEMO-MISSING-PAGE`, `DEMO-INVALID-IMAGE`, `DEMO-002`.
- [x] Trang Chi tiết Ca `/cases/:caseId` với 4 Tab:
  - Tab 1: **Hồ sơ bệnh án & Truy vết nguồn**:
    - Viewer PDF 2 trang có chuyển trang (1/2), phóng to/thu nhỏ, khung trích đoạn gốc.
    - Panel 5 nhóm trường trích xuất (Triệu chứng, Tiền sử, Thuốc, Dị ứng [Missing badge], Thời điểm).
    - Bấm vào trường tự động mở đúng trang PDF và hiển thị quote nguồn nổi bật.
  - Tab 2: **Phân tích X-quang**:
    - Hiển thị ảnh X-quang minh họa kèm disclaimer.
    - 3 điểm số MOCK (Cardiomegaly 0.91, Pleural Effusion 0.78, Lung Opacity 0.15) có badge MOCK FIXTURE.
    - 3 điểm/vùng minh họa trực quan (có toggle bật/tắt minh họa vùng nghi ngờ, ghi chú rõ không phải Grad-CAM thật).
    - Giải thích ngưỡng giả lập và lưu ý thế chụp PA của VinDr-CXR.
  - Tab 3: **Báo cáo sơ bộ & Chỉnh sửa**:
    - Hiển thị AI Draft tổng hợp tự động có liên kết dẫn nguồn.
    - Form chỉnh sửa cho Bác sĩ Demo (nhập tên Bác sĩ, nội dung chỉnh sửa, ghi chú lý do).
    - Nút `Lưu bản chỉnh sửa` (sinh bản DOCTOR_EDITED, giữ nguyên AI Draft).
    - Dialog xác nhận `Xác nhận báo cáo` (tạo bản DOCTOR_APPROVED).
  - Tab 4: **Lịch sử phiên bản & So sánh (Diff)**:
    - Danh sách các version theo thứ tự thời gian kèm metadata (người sửa, thời điểm, trạng thái).
    - Xem chi tiết từng version bất biến.
    - Chức năng so sánh song song / trực quan (Side-by-side Diff) giữa AI Draft và bản Bác sĩ sửa/duyệt.
- [x] Xử lý trạng thái lỗi trực quan: `MISSING_PAGE`, `INVALID_IMAGE`, lỗi mạng / API offline.

### P3 — Nghiên cứu Dữ liệu & Kế hoạch Kiểm thử
- [x] Trang `/research-data`:
  - Bảng kế hoạch phân chia dữ liệu VinDr-CXR (15.000 train -> 3.200 sub-train, 800 sub-val; 3.000 independent test).
  - Ghi chú minh bạch "Chưa thống kê" cho số ca dương theo nhãn, chưa tự tính AUROC.
  - Quy tắc gán nhãn đa chuyên gia và giới hạn thế chụp PA.
- [x] Trang `/test-plan`:
  - Bảng KPI mục tiêu (MT1, MT2, MT3) gắn nhãn `Mục tiêu / Chưa đo`.
  - Mẫu phiếu đánh giá lâm sàng độc lập và kịch bản 30 ca kiểm thử.
- [x] Trang `/about`: Giới hạn demo, chính sách dữ liệu giả lập, trách nhiệm y khoa.
- [x] Chạy kiểm thử tự động Frontend và Backend: 18/18 Pytest PASS, Vite build PASS.

### P4 — Bàn giao & Tài liệu
- [x] Tạo `README.md` hướng dẫn chi tiết cách chạy trên Windows (PowerShell/CMD, 2 terminal, python venv, npm install).
- [x] Tạo `.env.example` với đầy đủ biến cấu hình.
- [x] Tạo `docs/DEMO_SCRIPT.md`: kịch bản trình bày demo 3-5 phút trước hội đồng.
- [x] Tạo `docs/DATA_SPLIT_PLAN.md` và `docs/TEST_PLAN.md`.
- [x] Kiểm tra lại toàn bộ tiêu chí nghiệm thu T01 - T20.
