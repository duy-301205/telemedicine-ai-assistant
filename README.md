# TELEMEDICINE AI — PROTOTYPE DEMO
> **Đề tài:** Trợ lý AI hỗ trợ chuẩn bị hội chẩn Telemedicine  
> **Sinh viên thực hiện:** Hoàng Mạnh Duy — K68A3  
> **Mục tiêu:** Web Prototype có thể thao tác hoàn chỉnh từ đầu đến cuối; phân biệt minh bạch giữa kết quả giả lập (MOCK) và hệ thống thực tế.  
> **Cảnh báo y tế:** Ứng dụng chỉ phục vụ mục đích minh họa kỹ thuật — **KHÔNG DÙNG CHO QUYẾT ĐỊNH LÂM SÀNG**.

---

## 1. YÊU CẦU MÔI TRƯỜNG TRÊN WINDOWS
- **Hệ điều hành:** Windows 10 / Windows 11.
- **Python:** Phiên bản 3.10+ (Đã kiểm thử trên Python 3.13.7).
- **Node.js:** Phiên bản 18+ (Đã kiểm thử trên Node v22.17.1, npm 10.9.2).

---

## 2. CÀI ĐẶT & KHỞI CHẠY HỆ THỐNG TRÊN WINDOWS

Hệ thống được khởi chạy bằng **2 Terminal (PowerShell hoặc CMD)**:

### 2.1 Terminal 1: Backend FastAPI

1. Mở PowerShell tại thư mục gốc dự án `E:\telemedicine_ai`:
   ```powershell
   cd E:\telemedicine_ai
   ```

2. (Tùy chọn) Kích hoạt môi trường ảo Python nếu có:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Cài đặt các thư viện Python:
   ```powershell
   pip install -r backend/requirements.txt
   ```

4. Khởi tạo tài sản mẫu (PDF 2 trang, ảnh X-quang minh họa):
   ```powershell
   python demo_assets/generate_assets.py
   ```

5. Khởi động máy chủ backend FastAPI:
   ```powershell
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Backend sẽ tự động khởi tạo cơ sở dữ liệu SQLite tại `storage/telemedicine_demo.db` và nạp sẵn 4 ca demo.*  
   *Tài liệu Swagger API: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

---

### 2.2 Terminal 2: Frontend React (Vite + Tailwind)

1. Mở một cửa sổ PowerShell mới:
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

## 3. CHẠY KIỂM THỬ TỰ ĐỘNG (AUTOMATED TESTS)

Để kiểm tra 100% các tiêu chí nghiệm thu (T01 – T18) phía backend:

```powershell
cd E:\telemedicine_ai
pytest backend/tests/test_api.py -v
```
*(Kết quả: 18/18 tests PASSED).*

Kiểm tra biên dịch Frontend:
```powershell
cd E:\telemedicine_ai\frontend
npm run build
```
*(Kết quả: 0 lỗi TypeScript, tạo gói dist hoàn chỉnh).*

---

## 4. KỊCH BẢN THAO TÁC LUỒNG DEMO CHÍNH (3 PHÚT)

1. **Mở ca chuẩn `DEMO-001`:** Giao diện hiển thị nhãn `DỮ LIỆU MÔ PHỎNG`, trạng thái `AI Draft`.
2. **Xem hồ sơ & Dẫn nguồn:**
   - Panel trái hiển thị tệp PDF 2 trang.
   - Bấm vào trường **Tiền sử: Tăng huyết áp**: Trình xem tự động chuyển sang **Trang 1** và làm nổi bật câu trích dẫn gốc.
   - Bấm vào trường **Thời điểm xét nghiệm**: Tự động chuyển sang **Trang 2** và trích dẫn câu thời điểm chụp.
   - Bấm vào trường **Dị ứng**: Hiển thị badge màu vàng cam **Chưa có dữ liệu** (`missing`), giải thích hệ thống không tự ý gán "Không dị ứng" khi tài liệu thiếu câu phủ định.
3. **Đối chiếu X-quang (3 Điểm Mock):**
   - Chuyển sang Tab 2, quan sát ảnh minh họa X-quang và 3 điểm số:
     - **Tim to:** `0.91` (Nghi ngờ, vượt ngưỡng giả định 0.50).
     - **Tràn dịch màng phổi:** `0.78` (Nghi ngờ).
     - **Đám mờ phổi:** `0.15` (Bình thường).
   - Bật/tắt nút **Hiện 3 vùng chú ý** để thấy 3 marker đồ họa minh họa (ghi chú rõ không phải Grad-CAM thật).
4. **Bác sĩ chỉnh sửa báo cáo:**
   - Chuyển sang Tab 3, xem bản thảo `Version 1 (AI Draft)`.
   - Bấm **Chỉnh sửa nội dung**, bổ sung ghi chú lâm sàng và bấm **Lưu bản chỉnh sửa**.
   - Hệ thống sinh `Version 2 (Bác sĩ đã chỉnh sửa)`, giữ nguyên bản AI Draft gốc (tính bất biến - immutability).
5. **Xác nhận & Phê duyệt:**
   - Bấm **Xác nhận báo cáo**, hộp thoại thẩm định hiện lên. Tích chọn xác nhận và lưu.
   - Hệ thống tạo `Version 3 (Đã phê duyệt chính thức)` và ghi nhật ký kiểm toán (Audit Log).
6. **Kiểm tra lịch sử & So sánh (Diff):**
   - Chuyển sang Tab 4 để xem danh sách phiên bản và nhật ký kiểm toán.
   - Bấm **So sánh với V1** để mở bảng đối chiếu song song (Side-by-side Diff).
   - **Tải lại trang (F5) hoặc khởi động lại backend:** Dữ liệu các phiên bản vẫn được bảo toàn nguyên vẹn trong SQLite.
7. **Kiểm tra các tình huống lỗi:**
   - Ca `DEMO-MISSING-PAGE`: Hồ sơ chỉ có 1 trang, API từ chối trích xuất tự động và giao diện cảnh báo lỗi thân thiện.
   - Ca `DEMO-INVALID-IMAGE`: Ảnh bị lỗi định dạng, API báo lỗi 422 và từ chối render điểm mock.
   - Ca `DEMO-002`: Trường dị ứng có câu khẳng định rõ ràng, gắn nhãn `Phủ định có căn cứ` (khác biệt với `Chưa có dữ liệu`).

---

## 5. CẤU HÌNH BIẾN MÔI TRƯỜNG (.ENV)

Xem tệp `.env.example`:
- `DATABASE_URL`: Đường dẫn CSDL SQLite (mặc định: `sqlite:///./storage/telemedicine_demo.db`).
- `ZOOM_MEETING_URL`: Liên kết phòng họp Zoom HTTPS. Nếu để trống, nút mở Zoom trên giao diện sẽ tự động vô hiệu hóa an toàn.
- `PUBLIC_DEMO_URL`: Đường dẫn public demo (để trống khi chạy local).

---

## 6. DANH MỤC TÀI LIỆU CHI TIẾT
- Kịch bản thuyết trình hội đồng: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)
- Kế hoạch phân chia dữ liệu VinDr-CXR: [`docs/DATA_SPLIT_PLAN.md`](docs/DATA_SPLIT_PLAN.md)
- Kế hoạch kiểm thử & KPI: [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md)
- Bảng phân công công việc: [`TASKS.md`](TASKS.md)
