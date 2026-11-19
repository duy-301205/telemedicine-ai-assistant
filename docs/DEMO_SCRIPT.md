# KỊCH BẢN TRÌNH BÀY DEMO (DEMO SCRIPT)
## Trợ Lý AI Hỗ Trợ Chuẩn Bị Hội Chẩn Telemedicine
> **Thời lượng dự kiến:** 3 — 5 phút  
> **Người báo cáo:** Hoàng Mạnh Duy — K68A3  
> **Mục tiêu:** Minh họa luồng sản phẩm hoàn chỉnh khép kín, làm rõ tính minh bạch (Mock vs Real), không giả vờ đã có kết quả kiểm chứng.

---

### PHÚT 0:00 — 0:45: MỞ ĐẦU & NÊU BỐI CẢNH BÀI TOÁN
- **Thao tác:** Mở trình duyệt tại trang `http://localhost:5173/` (hoặc link public nếu có).
- **Lời thoại:**
  > "Kính thưa Thầy và Hội đồng, theo yêu cầu ở buổi seminar trước, hôm nay em xin báo cáo bản Web Prototype hoàn chỉnh của đề tài: *Trợ lý AI hỗ trợ chuẩn bị hội chẩn Telemedicine*.  
  > Mục tiêu của buổi này là minh họa một quy trình làm việc khép kín giữa AI và Bác sĩ: từ đọc hồ sơ bệnh án có dẫn nguồn, đối chiếu phim X-quang với 3 dấu hiệu nghi ngờ, sinh bản thảo báo cáo sơ bộ và lưu trữ phiên bản bất biến khi bác sĩ phê duyệt."

---

### PHÚT 0:45 — 1:45: LUỒNG TRÍCH XUẤT HỒ SƠ CÓ DẪN NGUỒN (MT1)
- **Thao tác:**
  1. Bấm nút **Vào Ca Mẫu DEMO-001** (hoặc vào tab *Hồ sơ bệnh án & Dẫn nguồn*).
  2. Bấm vào thẻ **2. Tiền sử bệnh lý (Tăng huyết áp)** ở panel bên phải:
     - Quan sát panel PDF bên trái tự động chuyển sang **Trang 1**.
     - Vùng văn bản `"Tiền sử: Tăng huyết áp."` được đánh dấu nổi bật (highlight vàng) kèm nhãn dẫn nguồn.
  3. Bấm vào thẻ **5. Thời điểm chụp X-quang**:
     - Quan sát PDF tự động chuyển sang **Trang 2**, câu `"Thời điểm chụp X-quang: 15/11/2026, 08:30"` sáng lên.
  4. Bấm vào thẻ **4. Tiền sử dị ứng**:
     - Chỉ cho Thầy thấy badge màu vàng cam **Chưa có dữ liệu** (`missing`).
- **Lời thoại:**
  > "Như Thầy đã góp ý, AI y tế không được phép đưa ra thông tin vô căn cứ. Tại Tab 1, mỗi trường thông tin trích xuất đều có trích dẫn câu nguyên văn và số trang chính xác trong tệp PDF 2 trang.  
  > Đặc biệt ở mục Dị ứng, hồ sơ gốc không ghi nhận câu phủ định nên hệ thống gắn nhãn trung thực là *'Chưa có dữ liệu'*, tuyệt đối không tự ý giả định là *'Không dị ứng'*. Đây là tiêu chí citation correctness trong mục tiêu MT1."

---

### PHÚT 1:45 — 2:45: ĐỐI CHIẾU X-QUANG VỚI 3 DẤU HIỆU MOCK (MT2)
- **Thao tác:**
  1. Chuyển sang Tab **2. Phân tích X-quang (3 Mock Scores)**.
  2. Chỉ rõ 3 điểm số:
     - **Tim to (Cardiomegaly):** 0.91 (Nghi ngờ, vượt ngưỡng giả định 0.50).
     - **Tràn dịch màng phổi (Pleural Effusion):** 0.78 (Nghi ngờ).
     - **Đám mờ phổi (Lung Opacity):** 0.15 (Bình thường).
  3. Bật/tắt nút **Hiện 3 vùng chú ý** để thấy 3 marker đồ họa trên bóng tim, góc sườn hoành và đỉnh phổi.
  4. Nhấn mạnh dòng disclaimer màu đỏ/vàng trên màn hình.
- **Lời thoại:**
  > "Tại Tab 2, hệ thống mô phỏng bài toán phân loại đa nhãn với 3 tổn thương mục tiêu trên ảnh ngực thẳng tư thế PA. Ba điểm số này được gán nhãn rõ ràng là **MOCK FIXTURE — KHÔNG PHẢI KẾT QUẢ AI THỰC TẾ**, và các vùng khoanh chỉ là đồ họa minh họa kỹ thuật, không phải Grad-CAM thật. Em cũng ghi rõ giới hạn: mô hình chỉ áp dụng tư thế PA theo thiết kế của VinDr-CXR."

---

### PHÚT 2:45 — 3:45: CHỈNH SỬA, PHÊ DUYỆT BÁC SĨ & LƯU PHIÊN BẢN (MT3)
- **Thao tác:**
  1. Chuyển sang Tab **3. Báo cáo sơ bộ & Chỉnh sửa**.
  2. Chỉ rõ bản thảo đầu tiên mang mã `Version 1` có trạng thái **AI Draft (Bất biến)**.
  3. Bấm **Chỉnh sửa nội dung**, sửa mục tóm tắt (ví dụ thêm: *"Đã khám lâm sàng, nghi ngờ suy tim sung huyết đợt cấp"*), nhập tóm tắt thay đổi và bấm **Lưu bản chỉnh sửa**.
     - Hệ thống sinh ngay `Version 2` với trạng thái **Bác sĩ đã chỉnh sửa**; bản AI Draft gốc vẫn được giữ nguyên vẹn.
  4. Bấm **Xác nhận báo cáo**:
     - Hộp thoại thẩm định y khoa hiện lên; tích chọn checkbox cam kết đối chiếu và bấm **Xác nhận & Lưu phiên bản**.
     - Sinh `Version 3` với trạng thái **Đã phê duyệt chính thức**.
  5. Chuyển sang Tab **4. Lịch sử phiên bản**:
     - Cho xem cây phiên bản và bảng **Audit Logs** với đầy đủ timestamp UTC, tên bác sĩ demo và hành vi.
     - Bấm nút **So sánh với V1** để mở modal Side-by-Side Diff, làm nổi bật chính xác những câu từ đã thay đổi.
  6. **F5 / Tải lại trình duyệt**: Chứng minh toàn bộ phiên bản và audit logs vẫn còn nguyên trong SQLite, không bị mất.
- **Lời thoại:**
  > "Đây là phân hệ quản lý phiên bản hoạt động thật 100%. Bản AI ban đầu là bất biến. Khi Bác sĩ Demo chỉnh sửa hoặc phê duyệt, backend tạo các bản ghi mới độc lập và lưu vết kiểm toán (Audit Trail) vĩnh viễn trong cơ sở dữ liệu SQLite. Bác sĩ có thể bấm xem so sánh Diff trước và sau khi duyệt."

---

### PHÚT 3:45 — 4:30: TÍNH NĂNG ZOOM AN TOÀN & BẢNG DỮ LIỆU VINDR-CXR
- **Thao tác:**
  1. Chỉ vào nút **Mở Zoom** trên thanh điều hướng:
     - Giải thích cơ chế: mở HTTPS URL được cấu hình trong file `.env`; nếu chưa cấu hình thì nút disabled an toàn.
     - Nhấn mạnh: **Không truyền bất kỳ dữ liệu hồ sơ hay ảnh y tế nào sang Zoom**.
  2. Mở trang **Dữ liệu VinDr-CXR** (`/research-data`):
     - Cho xem bảng phân chia 15.000 train thành 3.200 sub-train và 800 sub-validation; giữ nguyên 3.000 test độc lập.
     - Chỉ rõ các cột số ca dương mang nhãn **"Chưa thống kê"**, tuyệt đối không bịa số liệu AUROC hay F1.
  3. Mở trang **KPI & Kiểm thử** (`/test-plan`):
     - Chỉ rõ các mục tiêu MT1, MT2, MT3 đều được gắn nhãn **Mục tiêu / Chưa đo**.

---

### PHÚT 4:30 — 5:00: KẾT LUẬN & ĐỊNH HƯỚNG BƯỚC TIẾP THEO
- **Lời thoại:**
  > "Tóm lại, bản demo hôm nay đã đáp ứng 100% các tiêu chí Thầy giao: có dẫn nguồn PDF hai trang, có 3 điểm số X-quang, có cơ chế lưu phiên bản bác sĩ duyệt không mất sau reload, phân biệt rõ mock và real.  
  > Sau buổi hôm nay, em sẽ tiến hành bước tiếp theo: huấn luyện mạng DenseNet121 với BCEWithLogitsLoss trên tập con VinDr-CXR và tích hợp PyMuPDF trích xuất text thật. Em xin trân trọng cảm ơn Thầy và xin nhận các câu hỏi góp ý ạ!"
