# HƯỚNG DẪN TRIỂN KHAI VẬN HÀNH (DEPLOYMENT GUIDE)
## Dự án: Telemedicine AI — Hướng dẫn Vận hành trên Môi trường Windows

---

### 1. Yêu cầu Hệ thống

- **Hệ điều hành:** Windows 10/11 (64-bit) hoặc Windows Server 2022.
- **Python:** Phiên bản 3.10 trở lên (khuyên dùng Python 3.11 – 3.13).
- **Node.js:** Phiên bản 18 LTS trở lên (kèm `npm`).
- **RAM:** Tối thiểu 4GB (khuyên dùng 8GB).
- **Ổ đĩa trống:** Tối thiểu 1GB.

---

### 2. Cài đặt Môi trường Cục bộ

#### Bước 2.1: Cài đặt Thư viện Backend
Mở PowerShell tại thư mục gốc của dự án (`E:\telemedicine_ai`):
```powershell
# Cài đặt các gói phụ thuộc Python
pip install fastapi uvicorn pydantic pydantic-settings sqlalchemy python-multipart reportlab pypdf pytest httpx
```

#### Bước 2.2: Khởi tạo Cơ sở Dữ liệu & Dữ liệu Mẫu (Seed Data)
Dữ liệu 8 ca bệnh và các tài khoản demo sẽ được tự động đồng bộ hóa:
```powershell
python -m backend.app.seed.seed_data
```
Lệnh này sẽ bảo đảm cấu trúc CSDL SQLite tại `storage/telemedicine_demo.db` và nạp sẵn 8 ca mẫu chuẩn mực.

#### Bước 2.3: Cài đặt và Biên dịch Frontend
```powershell
cd frontend
npm install
npm run build
cd ..
```

---

### 3. Khởi động Ứng dụng

Bạn có thể chạy bằng 2 cửa sổ terminal riêng biệt hoặc qua tệp lệnh batch:

#### Cách 1: Khởi động qua PowerShell
**Cửa sổ 1: Chạy Backend FastAPI (Cổng 8000)**
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation tự động có tại: `http://127.0.0.1:8000/docs`

**Cửa sổ 2: Chạy Frontend React Vite (Cổng 5173)**
```powershell
cd frontend
npm run dev
```
Giao diện ứng dụng truy cập tại: `http://localhost:5173`

---

### 4. Kiểm thử Tự động (Automated Verification)

Chạy toàn bộ bộ kiểm thử nghiệp vụ 30 kịch bản:
```powershell
pytest backend/tests/test_api.py -v
```
Tiêu chuẩn chấp nhận: **30 passed trong < 10 giây**.

---

### 5. Sao lưu và Khôi phục Dữ liệu (Backup & Restore)

- **Vị trí file dữ liệu SQLite:** `storage/telemedicine_demo.db`
- **Sao lưu:** Sao chép file sang `storage/telemedicine_demo.db.backup` khi hệ thống dừng hoặc dùng lệnh:
  ```powershell
  Copy-Item -Path "storage/telemedicine_demo.db" -Destination "storage/telemedicine_demo.db.backup"
  ```
- **Khôi phục:** Đổi tên file backup lại thành `storage/telemedicine_demo.db`.
- **Tệp upload thực tế:** Được lưu trữ an toàn theo từng ca tại `storage/cases/{case_id}/`.
