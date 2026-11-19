# KẾ HOẠCH PHÂN CHIA DỮ LIỆU & QUY TẮC GÁN NHÃN (DATA SPLIT PLAN)
## Bộ dữ liệu: VinDr-CXR (PhysioNet)

---

### 1. TỔNG QUAN BỘ DỮ LIỆU CÔNG BỐ
Bộ dữ liệu ảnh X-quang ngực thẳng **VinDr-CXR** được công bố chính thức trên PhysioNet gồm **18.000 ảnh DICOM**, chia thành hai tập độc lập:
- **Tập Train công bố:** 15.000 ảnh (được gán nhãn bởi nhóm bác sĩ chẩn đoán hình ảnh).
- **Tập Test công bố:** 3.000 ảnh (kiểm thử độc lập).

> **Lưu ý liêm chính học thuật:** Các con số 15.000 và 3.000 là thông số công bố của bộ dữ liệu, **không phải tuyên bố sinh viên đã tải toàn bộ hoặc đã hoàn thành huấn luyện**. Đề tài dự kiến xin quyền truy cập nghiên cứu và chọn lọc **3.000 – 5.000 ảnh** phục vụ thử nghiệm ban đầu.

---

### 2. BẢNG PHÂN CHIA TẬP PHÁT TRIỂN & KIỂM THỬ ĐỀ XUẤT

| Tập dữ liệu | Số lượng ảnh | Vai trò phân công | Tim to (+) | Tràn dịch màng phổi (+) | Đám mờ phổi (+) | Ghi chú minh bạch |
|---|---:|---|---|---|---|---|
| **Train chính thức VinDr-CXR** | 15.000 | Nguồn phát triển tổng quát | *Chưa thống kê* | *Chưa thống kê* | *Chưa thống kê* | Bộ train do PhysioNet công bố |
| **Tập con Train (Sub-train đề xuất)** | 3.200 | Huấn luyện mạng nơ-ron (DenseNet/EfficientNet) | *Chưa thống kê* | *Chưa thống kê* | *Chưa thống kê* | Trích xuất từ 15.000 train |
| **Tập con Validation (Sub-val đề xuất)** | 800 | Tinh chỉnh siêu tham số & chọn ngưỡng riêng từng nhãn | *Chưa thống kê* | *Chưa thống kê* | *Chưa thống kê* | Tách biệt hoàn toàn với Test |
| **Test chính thức VinDr-CXR** | 3.000 | Đánh giá độc lập cuối cùng | *Chưa thống kê* | *Chưa thống kê* | *Chưa thống kê* | Giữ nguyên độc lập tuyệt đối |

**Ghi chú quy chuẩn:**
- Tỷ lệ phân chia tập con dự kiến: 80% Train (3.200 ảnh) và 20% Validation (800 ảnh) từ tổng số 4.000 ảnh chọn lọc ban đầu.
- Tuyệt đối không cộng lẫn 3.000 ảnh Test vào tổng tập Train hay Validation.
- Mọi ô số ca dương tính được ghi rõ **"Chưa thống kê"**, không bịa đặt số liệu thống kê khi chưa tải và chạy script lọc nhãn chính thức.

---

### 3. QUY TẮC GÁN NHÃN ĐỒNG THUẬN ĐA CHUYÊN GIA (LABEL CONSOLIDATION)
Trong bộ VinDr-CXR, mỗi ảnh trong tập train được đọc và khoanh vùng độc lập bởi nhiều bác sĩ (thường là 3 hoặc 5 chuyên gia). Quy tắc chuyển đổi từ danh sách bounding box sang nhãn nhị phân cho 3 bệnh lý mục tiêu như sau:

1. **Quy tắc bỏ phiếu đa số (Majority Voting):**
   - Với mỗi tổn thương (Tim to, Tràn dịch, Đám mờ), ảnh được coi là dương tính (`1`) nếu có ít nhất $\ge 3/5$ (hoặc $\ge 2/3$) bác sĩ cùng ghi nhận tổn thương đó trên cùng một vùng ảnh.
   - Ngược lại, nếu chỉ có 1 bác sĩ nhận định đơn độc, nhãn được coi là nghi ngờ hoặc âm tính (`0`) nhằm giảm thiểu dương tính giả do biến thiên giữa các người đọc (inter-observer variability).

2. **Xử lý đa hộp (Bounding Box Overlap):**
   - Sử dụng chỉ số $IoU \ge 0.4$ để xác định các hộp do nhiều bác sĩ vẽ có thuộc cùng một vùng tổn thương hay không.
   - Khi tính nhãn cấp độ ảnh (image-level label) cho bài toán phân loại đa nhãn, chỉ cần có ít nhất một vùng tổn thương đạt ngưỡng đồng thuận thì nhãn của ảnh đó được gán là dương tính.

3. **Loại trừ trùng lặp và ảnh lỗi:**
   - Kiểm tra hash tệp DICOM và mã định danh bệnh nhân (`PatientID`) để đảm bảo các phim chụp lặp lại của cùng một bệnh nhân không nằm ở cả tập Train và Validation (tránh data leakage).

---

### 4. GIỚI HẠN TƯ THẾ CHỤP X-QUANG (POSTURE SCOPE)
- **Tư thế áp dụng:** Chỉ áp dụng cho ảnh ngực thẳng chụp theo tư thế **Sau - Trước (PA - Posteroanterior view)** khi bệnh nhân đứng thẳng hít sâu.
- **Tư thế loại trừ:** Chưa có mô hình được kiểm chứng trên ảnh chụp tư thế **Trước - Sau (AP - Anteroposterior view)** hoặc bệnh nhân nằm tại giường cấp cứu. Trong tư thế AP, bóng tim tự nhiên bị phóng đại lớn hơn thực tế khoảng 15-20%, do đó không thể áp dụng ngưỡng tỉ lệ tim/lồng ngực của tư thế PA để kết luận tim to.
