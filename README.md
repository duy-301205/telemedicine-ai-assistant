# TELEMEDICINE AI — HỆ THỐNG QUẢN LÝ CA BỆNH & TRỢ LÝ HỘI CHẨN Y TẾ TỪ XA
> **Đề tài:** Trợ lý AI hỗ trợ chuẩn bị hội chẩn Telemedicine (Nâng cấp Hệ thống Toàn diện v2.0)  
> **Sinh viên thực hiện:** Hoàng Mạnh Duy — K68A3  
> **Nguyên tắc cốt lõi:**  
> - **Chức năng nghiệp vụ THẬT 100%:** Tạo ca, tải lên tệp, quản lý tiến trình, hiệu chỉnh báo cáo, phê duyệt lâm sàng, so sánh diff phiên bản, lên lịch hội chẩn, lưu vết kiểm toán và xuất báo cáo PDF thời gian thực được lưu trữ trực tiếp trong CSDL SQLite.  
> - **2 Pipeline AI chạy MOCK ADAPTER:** Trích xuất thực thể bệnh án và phân tích X-quang ngực chạy trên cơ chế Adapter cách ly an toàn, đối chiếu băm SHA-256 fixture, tuyệt đối từ chối tự tạo điểm số giả lập trên ảnh lạ.  
> - **Cảnh báo y tế:** Ứng dụng chỉ phục vụ mục đích nghiên cứu học thuật — **KHÔNG DÙNG CHO QUYẾT ĐỊNH LÂM SÀNG**.

---

## 1. YÊU CẦU MÔI TRƯỜNG TRÊN WINDOWS
- **Hệ điều hành:** Windows 10 / Windows 11 (64-bit).
- **Python:** Phiên bản 3.10+ (Đã kiểm nghiệm tương thích tốt trên Python 3.13.7).
- **Node.js:** Phiên bản 18+ (Đã kiểm nghiệm trên Node v22.17.1, npm 10.9.2).

---

## 2. CÀI ĐẶT & KHỞI CHẠY HỆ THỐNG TRÊN WINDOWS

Hệ thống được khởi chạy bằng **2 Terminal (PowerShell)**:

### 2.1 Terminal 1: Backend FastAPI

1. Mở PowerShell tại thư mục gốc dự án:
   ```powershell
   cd E:\telemedicine_ai
   ```

2. Cài đặt các gói phụ thuộc Python:
   ```powershell
   pip install fastapi uvicorn pydantic pydantic-settings sqlalchemy python-multipart reportlab pypdf pytest httpx
   ```

3. Khởi tạo tài sản mẫu & Cơ sở dữ liệu:
   ```powershell
   python demo_assets/generate_assets.py
   python -m backend.app.seed.seed_data
   ```
   *Hệ thống sẽ nạp sẵn 8 ca bệnh chuẩn mực và 3 tài khoản người dùng demo.*

4. Khởi động máy chủ backend:
   ```powershell
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

---

### 2.2 Terminal 2: Frontend React (Vite + Tailwind v4)

1. Mở cửa sổ PowerShell thứ hai:
   ```powershell
   cd E:\telemedicine_ai\frontend
   ```

2. Cài đặt các gói npm:
   ```powershell
   npm install
   ```

3. Khởi chạy máy chủ giao diện:
   ```powershell
   npm run dev
   ```

4. Mở trình duyệt Web tại địa chỉ:
   ```
   http://localhost:5173/
   ```

---

## 3. KIỂM THỬ TỰ ĐỘNG TOÀN BỘ 30 KỊCH BẢN (TC01 – TC30)

Chạy bộ kiểm thử tự động toàn diện kiểm tra 30 kịch bản nghiệp vụ:

```powershell
cd E:\telemedicine_ai
pytest backend/tests/test_api.py -v
```
**Kết quả thực tế:** **30 passed / 30 tests (100% PASS)** trong ~5 giây.

Kiểm tra biên dịch Frontend:
```powershell
cd E:\telemedicine_ai\frontend
npm run build
```
**Kết quả thực tế:** **0 lỗi TypeScript, bản build Vite hoàn tất trong ~2.3 giây**.

---

## 4. TÀI LIỆU DỰ ÁN CHI TIẾT

- [Bảng Ma trận Tính năng Thật vs Mock](file:///e:/telemedicine_ai/docs/FEATURE_MATRIX.md)
- [Kế hoạch Kiểm thử 30 Kịch bản (TC01–TC30)](file:///e:/telemedicine_ai/docs/TEST_PLAN.md)
- [Báo cáo Kết quả Kiểm thử Thực tế](file:///e:/telemedicine_ai/docs/TEST_REPORT.md)
- [Thiết kế Kiến trúc Nâng cấp Hệ thống](file:///e:/telemedicine_ai/docs/UPGRADE_DESIGN.md)
- [Hướng dẫn Triển khai & Vận hành](file:///e:/telemedicine_ai/docs/DEPLOY.md)
- [Danh sách Nhiệm vụ Nâng cấp](file:///e:/telemedicine_ai/UPGRADE_TASKS.md)

---

## 5. DANH SÁCH 8 CA DỮ LIỆU MẪU (DEMO CASES)

1. **`DEMO-001` (Ca chuẩn mực):** PDF 2 trang, X-quang PA, thiếu trường dị ứng (Missing), 3 điểm mock (Tim to 0.91, Tràn dịch 0.78, Đám mờ 0.15).
2. **`DEMO-002` (Phủ định tường minh):** Trường dị ứng có câu khẳng định "Không ghi nhận tiền sử dị ứng thuốc hay thức ăn" (Negative).
3. **`DEMO-003` (Đa mốc thời gian):** Phân biệt rõ ngày khám ban đầu (10/11), nhập viện (14/11) và chụp X-quang (15/11).
4. **`DEMO-SCAN-004` (PDF dạng Scan):** Cảnh báo nhận dạng ký tự quang học `[OCR Cảnh báo]`, yêu cầu đối soát mắt thường.
5. **`DEMO-INCOMPLETE-005` (Thiếu trang hồ sơ):** Hồ sơ chỉ có 1 trang, API trả lỗi 422 `MISSING_PAGE`, từ chối tự suy đoán.
6. **`DEMO-BAD-IMAGE-006` (Tệp ảnh lỗi):** Cấu trúc ảnh bị hỏng, API trả lỗi 422 `INVALID_IMAGE`, từ chối hiển thị điểm số.
7. **`DEMO-AP-007` (Cảnh báo tư thế AP):** Phim chụp tại giường tư thế AP ngoài phạm vi tối ưu của mô hình VinDr-CXR chuẩn PA.
8. **`DEMO-CONFLICT-008` (Mâu thuẫn dữ liệu nguồn):** Trang 1 ghi "Không dị ứng", trang 2 ghi "Dị ứng Penicillin năm 2021" -> Cảnh báo `conflict` bắt buộc đối soát.

---

## 6. PHÂN QUYỀN VAI TRÒ NGƯỜI DÙNG DEMO (RBAC)

Người dùng có thể chuyển đổi vai trò ngay trên thanh Navigation bar:
- **`DEMO_ADMIN`:** Toàn quyền quản trị hệ thống, tạo ca, upload tệp, chỉnh sửa, lưu trữ (archive/soft-delete).
- **`CLINICIAN_DEMO`:** Bác sĩ lâm sàng, tạo ca, tải tài liệu, hiệu chỉnh báo cáo sơ bộ, phê duyệt báo cáo, điều phối lịch hội chẩn.
- **`VIEWER_DEMO`:** Quan sát viên / Bác sĩ thẩm tra độc lập, chỉ xem hồ sơ và lịch sử phiên bản, không được sửa/phê duyệt.
