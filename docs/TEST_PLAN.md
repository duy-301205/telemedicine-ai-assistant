# KẾ HOẠCH KIỂM THỬ & BÁO CÁO NGHIỆM THU (TEST PLAN & REPORT)
## Dự án: Telemedicine AI Prototype Demo

---

### 1. CÁC MỤC TIÊU KPI & PHƯƠNG PHÁP ĐO LƯỜNG

| Mã MT | Hạng mục kiểm thử | Chỉ số KPI mục tiêu | Trạng thái hiện tại | Phương pháp đo lường khi đủ dữ liệu |
|---|---|---|:---:|---|
| **MT1** | Trích xuất thực thể bệnh án | $F1 \ge 0.90$ trên $\ge 100$ hồ sơ độc lập; 100% trường có dẫn nguồn hoặc đánh dấu thiếu | **Mục tiêu / Chưa đo** | So khớp từng trường với ground truth; kiểm tra trích dẫn câu có hỗ trợ nội dung (*citation correctness*) |
| **MT2** | Nhận diện 3 tổn thương X-quang | Macro-AUROC $\ge 0.85$; Sensitivity $\ge 0.85$ tại Specificity $\ge 0.75$ | **Mục tiêu / Chưa đo** | Huấn luyện mạng với `BCEWithLogitsLoss` (nhận trực tiếp 3 logits); xác định ngưỡng riêng từng nhãn trên tập Validation trước khi đánh giá trên tập Test độc lập |
| **MT3** | Tích hợp Telemedicine & Versioning | $\ge 95\%$ kịch bản kiểm thử PASS ($\ge 29/30$ ca); $p95 \le 60$ giây sau khi tải tệp xong; lưu toàn vẹn phiên bản | **Mục tiêu / Chưa đo** | Chạy kiểm thử tự động 30 kịch bản quy trình khép kín; kiểm tra tính bất biến của bản thảo AI Draft và đối sánh phiên bản |

> **Cam kết:** Báo cáo ghi rõ trạng thái **"Chưa đo"** cho các chỉ số mô hình học sâu; không tạo biểu đồ AUROC giả lập hay số liệu tự suy diễn.

---

### 2. KẾT QUẢ KIỂM THỬ THỰC TẾ TRÊN MÔI TRƯỜNG HIỆN HỮU (T01 — T20)

| Mã test | Hạng mục kiểm tra | Tiêu chuẩn PASS | Kết quả thực tế | Ghi chú kỹ thuật |
|:---:|---|---|:---:|---|
| **T01** | `GET /api/health` | Trả về mã HTTP 200, JSON có thông tin service và disclaimer | **PASS** | `status: "healthy"`, `demo_mode: true` |
| **T02** | Seed Case tồn tại | `DEMO-001`, `DEMO-MISSING-PAGE`, `DEMO-INVALID-IMAGE`, `DEMO-002` tồn tại sau khởi tạo | **PASS** | Khởi tạo tự động (idempotent init) vào SQLite |
| **T03** | Tệp PDF 2 trang | Tệp PDF tồn tại, có đúng 2 trang văn bản đọc được | **PASS** | Sinh bởi ReportLab với TrueType font Unicode |
| **T04** | Dẫn nguồn trích dẫn | Bấm trường Tiền sử trả về trang 1, đúng câu quote nguyên văn | **PASS** | `"Tiền sử: Tăng huyết áp."` tại Trang 1 |
| **T05** | Phân biệt Thiếu vs Phủ định | DEMO-001 trường Dị ứng là `missing`; DEMO-002 là `negative` | **PASS** | Phân biệt rõ `missing` (null) và câu phủ định có căn cứ |
| **T06** | 3 Điểm số Mock & Disclaimer | Đúng 3 mã nhãn (`cardiomegaly`, `pleural_effusion`, `lung_opacity`), điểm số và disclaimer | **PASS** | Điểm mock 0.91, 0.78, 0.15; có 3 visual boxes |
| **T07** | Cấu trúc AI Draft | AI Draft có đầy đủ các mục tóm tắt, lưu ý dị ứng và liên kết nguồn | **PASS** | Phiên bản 1 (Version 1) khởi tạo tự động |
| **T08** | Tính bất biến (Immutability) | Bác sĩ sửa tạo version mới (`DOCTOR_EDITED`), không sửa đè bản AI Draft gốc | **PASS** | Bản AI Draft Version 1 giữ nguyên nội dung gốc |
| **T09** | Phê duyệt Bác sĩ | Cần checkbox xác nhận thẩm định rõ ràng; tạo bản `DOCTOR_APPROVED` | **PASS** | Ghi nhận tên bác sĩ demo và mốc thời gian UTC |
| **T10** | Lưu trữ bền vững (Persistence) | Khởi động lại backend hoặc reload trang, toàn bộ phiên bản vẫn còn nguyên | **PASS** | Cơ sở dữ liệu SQLite lưu tại `storage/telemedicine_demo.db` |
| **T11** | Lịch sử phiên bản & Audit | Hiển thị thứ tự các version, audit logs và hỗ trợ xem diff song song | **PASS** | Modal Side-by-Side Diff làm nổi bật phần thay đổi |
| **T12** | Xử lý ca thiếu trang | `DEMO-MISSING-PAGE` trả lỗi mã 422 giải thích rõ ràng, không tự suy đoán | **PASS** | Hệ thống từ chối trích xuất tự động khi thiếu trang |
| **T13** | Xử lý ca ảnh hỏng | `DEMO-INVALID-IMAGE` từ chối render điểm mock như thể thành công | **PASS** | Báo lỗi ảnh không hợp lệ (Corrupted Image) |
| **T14** | Tích hợp cuộc họp Zoom | Nút mở URL HTTPS cấu hình trong `.env`; disabled khi chưa có link; không gửi data sang Zoom | **PASS** | Kiểm soát an toàn link hội nghị |
| **T15** | Bảng kế hoạch VinDr-CXR | Bảng phân chia 15.000 train thành 3.200 sub-train / 800 val / 3.000 test độc lập | **PASS** | Ô số ca dương ghi nhãn "Chưa thống kê" |
| **T16** | Nhãn KPI minh bạch | Gắn nhãn "Mục tiêu / Chưa đo", không tạo số liệu giả mạo | **PASS** | Đáp ứng yêu cầu liêm chính học thuật |
| **T17** | Toàn vẹn nguồn trích dẫn | 100% câu quote seed xuất hiện thực tế trong văn bản PDF | **PASS** | Unit test `pypdf` kiểm tra chuỗi thành công |
| **T18** | Kiểm tra hợp lệ API (Validation) | Chặn sửa report mượn mã ca khác, chặn report rỗng | **PASS** | HTTP 400/422 validation |
| **T19** | Sẵn sàng Public Demo | Cấu hình qua `.env.example`, hỗ trợ biến `VITE_API_BASE_URL` | **PASS** | CORS và biến môi trường cấu hình động |
| **T20** | Giao diện Responsive | Giao diện hiển thị chuẩn xác trên laptop và thiết bị di động | **PASS** | Tailwind CSS responsive layout |

---

### 3. THỐNG KÊ KẾT QUẢ AUTOMATED TESTS
- **Backend Test Suite (Pytest):** 18/18 tests **PASSED** (100%).
- **Frontend Build (Vite + TypeScript):** Biến dịch thành công 0 lỗi, bundle tạo tại `frontend/dist/`.
- **Database Seed:** Tự động nạp 4 ca bệnh mô phỏng (`DEMO-001`, `DEMO-MISSING-PAGE`, `DEMO-INVALID-IMAGE`, `DEMO-002`) vào SQLite.
