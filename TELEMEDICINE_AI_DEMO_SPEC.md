# TELEMEDICINE AI — DEMO SPECIFICATION & AGENT EXECUTION PLAN

> **Dự án:** Trợ lý AI hỗ trợ chuẩn bị hội chẩn Telemedicine  
> **Người thực hiện:** Hoàng Mạnh Duy — K68A3  
> **Mục tiêu hiện tại:** Tạo **prototype web có thể thao tác từ đầu đến cuối**, để minh họa sản phẩm mà giảng viên yêu cầu ở lần báo cáo tiếp theo; **không giả vờ đã có mô hình chẩn đoán được kiểm chứng**.  
> **Tình trạng:** Đặc tả triển khai, chưa phải báo cáo kết quả thực nghiệm.

---

## 0. HƯỚNG DẪN CHO CODING AGENT (ĐỌC TRƯỚC KHI VIẾT CODE)

Bạn là coding agent được giao tạo ứng dụng demo hoàn chỉnh theo tài liệu này.

1. **Khảo sát repository hiện có trước.** Nếu repository đã có code, phát hiện công nghệ, cấu trúc, script và các module có thể tái sử dụng. Không xóa, ghi đè hoặc phá vỡ công việc hiện hữu. Nếu repository trống, khởi tạo dự án theo mục 4.
2. Ưu tiên **một luồng demo hoạt động thật** hơn là nhiều màn hình tĩnh: mở ca mẫu → đọc PDF hai trang → bấm trường xem đoạn gốc → xem ảnh và ba điểm số → chỉnh sửa → xác nhận → mở lại lịch sử phiên bản.
3. **Mock rõ ràng:** Nếu chưa tích hợp mô hình ảnh/OCR/NLP thật, ghi nhãn `DEMO / MOCK — KHÔNG PHẢI KẾT QUẢ AI THỰC TẾ` ở giao diện, phản hồi API và báo cáo xuất. Không gọi điểm mock là kết quả mô hình, không tự gắn “được bác sĩ xác nhận” trừ khi có thao tác xác nhận trong demo. Tài khoản đóng vai bác sĩ phải được ghi là **người dùng demo**.
4. Sử dụng **dữ liệu giả hoàn toàn**, không đưa dữ liệu bệnh nhân thật hoặc ảnh VinDr-CXR có hạn chế bản quyền/truy cập lên public deployment. Nếu chưa có quyền sử dụng ảnh X-quang, dùng **ảnh minh họa tự tạo/được phép sử dụng** và chú thích đây không phải ảnh đánh giá mô hình. Không khẳng định ảnh minh họa và hồ sơ giả là một cặp bệnh nhân xác thực.
5. Không sử dụng dữ liệu mock để tính F1, AUROC, sensitivity, specificity hoặc khẳng định đạt KPI. KPI được trình bày là **mục tiêu chưa kiểm chứng**.
6. Tự chạy cài đặt, migrations, seed và tests; sửa lỗi đến khi đạt tiêu chí nghiệm thu. Viết README với các lệnh chạy cụ thể. Không dừng ở bước tạo giao diện mà thiếu lưu trạng thái phía backend.
7. Không tự tạo hoặc bịa URL public. Nếu môi trường không cho phép triển khai, cung cấp hướng dẫn triển khai và ô chờ để người dùng điền link demo, không tự công bố URL.
8. Không tự ý thêm hành vi y khoa nguy hiểm: không chẩn đoán khẳng định, không đề xuất điều trị/thuốc; nội dung ảnh phải ghi là **dấu hiệu nghi ngờ, cần bác sĩ đối chiếu**.
9. Nếu thiếu khóa dịch vụ/cấu hình môi trường, ứng dụng vẫn chạy được ở **demo mode** không cần API trả phí, không cần Zoom SDK, không cần GPU.
10. Cập nhật checklist tại cuối tài liệu (hoặc `TASKS.md`) theo tiến độ thực tế; chỉ đánh dấu PASS sau khi kiểm thử.

## 1. BỐI CẢNH VÀ PHẠM VI

### 1.1 Bài toán

Bác sĩ chuẩn bị hội chẩn từ xa cần tổng hợp các trường từ hồ sơ bệnh án, đối chiếu với X-quang ngực thẳng và tạo báo cáo sơ bộ để kiểm tra. Sản phẩm đề tài dự kiến nhận diện ba dấu hiệu: **Cardiomegaly (tim to), Pleural Effusion (tràn dịch màng phổi), Lung Opacity (đám mờ phổi)**. Đây là **bài toán phân loại đa nhãn**; một ảnh có thể có nhiều nhãn.

### 1.2 Mục tiêu bản demo lần này

- Hiển thị **một ca giả lập** gồm PDF bệnh án **2 trang** + **1 ảnh X-quang minh họa**; cùng một `case_id` liên kết tất cả bản ghi.
- Hiển thị **5 nhóm trường**: triệu chứng, tiền sử, thuốc, dị ứng, thời điểm xét nghiệm; mỗi trường **có vị trí/đoạn nguồn** hoặc trạng thái **chưa có dữ liệu**.
- Cho phép nhấn vào trường để mở PDF đến **đúng trang** và hiển thị/đánh dấu **đoạn gốc**. Nếu không đủ khả năng highlight trực tiếp trong PDF, làm phương án chắc chắn: hiển thị PDF đúng trang bên cạnh đoạn nguồn trích nguyên văn, nhấn mạnh vị trí trong khung nguồn.
- Hiển thị ảnh và **ba điểm dự đoán MOCK** cùng giải thích điểm số, trạng thái giả lập, tùy chọn nhãn/ngưỡng minh họa; không mặc định xem ba điểm là xác suất đã hiệu chuẩn.
- Tạo **AI Draft mẫu**, cho **bác sĩ demo chỉnh sửa** và **xác nhận**, lưu **bản AI gốc bất biến** cùng bản bác sĩ xác nhận và lịch sử thay đổi.
- Có nút **Mở Zoom** dạng liên kết HTTPS do quản trị viên cấu hình; demo không cần SDK và **không truyền hồ sơ/ảnh đến Zoom**.
- Có **bảng kế hoạch phân chia dữ liệu và thống kê nhãn** tách biệt với dữ liệu thật; mọi con số đề xuất/ chưa có thống kê cần ghi rõ.
- Có trang **Giới thiệu demo + giới hạn + kiểm thử + liên kết** phục vụ đặt link demo vào slide.

### 1.3 Ngoài phạm vi MVP

- Huấn luyện DenseNet/EfficientNet, inference thật, Grad-CAM thật hoặc đánh giá chất lượng dự đoán.
- OCR/LLM chính thức trên PDF bất kỳ; không tuyên bố trích xuất tự động đã đạt F1.
- Kết nối bệnh án điện tử thật, Zoom Meeting SDK, FHIR production hoặc hệ thống quản lý bệnh viện.
- Chẩn đoán tự động, phân tích tương quan lâm sàng từ ảnh/hồ sơ không phải cặp bệnh nhân xác thực.

## 2. NHỮNG GÌ THẦY MUỐN THẤY TRONG BUỔI TỚI

| Nhận xét của thầy | Hiện thực cụ thể trong demo |
|---|---|
| Báo cáo mẫu có dẫn nguồn | 5 trường hồ sơ; nhấn để thấy trang/đoạn PDF |
| Một ảnh và 3 điểm dự đoán | Ảnh minh họa + 3 score MOCK + disclaimer |
| Bản lưu sau bác sĩ sửa | AI Draft bất biến, Doctor Edited, Doctor Approved, version list và diff |
| Có cùng mã ca | PDF, ảnh, extraction, prediction và reports dùng cùng `case_id` |
| Báo khi thiếu trang/ảnh lỗi | Các trạng thái `MISSING_PAGE`, `INVALID_IMAGE`, `PROCESSING_FAILED` |
| Bảng chia dữ liệu | Train/Validation/Test tách biệt + số ca dương theo nhãn (chưa có thì ghi `Chưa thống kê`) |
| Link demo vào slide | Hướng dẫn public deploy; nút `Sao chép link demo` nếu đã cấu hình public URL |
| KPI và cách đo | Trang kế hoạch kiểm thử, ghi rõ **chưa đo KPI** |
| Minh họa Grad-CAM | Chỉ là **khung/vùng đánh dấu chuyên gia minh họa** nếu không có Grad-CAM thật; không giả tạo một Grad-CAM như kết quả mô hình |
| Zoom | Link tham gia; ghi rõ không gửi dữ liệu ca sang Zoom |

## 3. LUỒNG DEMO CHÍNH — PHẢI CHẠY ĐƯỢC

**Luồng A — Một ca mẫu:**

1. Mở `/demo` thấy ca `DEMO-001`, nhãn `DỮ LIỆU MÔ PHỎNG`, trạng thái `AI Draft`.
2. Bấm `Xem hồ sơ`: thấy PDF 2 trang ở panel trái; panel phải hiển thị 5 trường thông tin.
3. Bấm `Tiền sử: Tăng huyết áp`: viewer chuyển sang trang 1, panel nguồn thể hiện `Trang 1 — mục Tiền sử`, trích nguyên văn câu nguồn.
4. Bấm `Dị ứng`: hiển thị `Chưa có dữ liệu`; không được hiển thị `Không dị ứng` nếu tài liệu không có câu phủ định.
5. Chuyển `Phân tích X-quang`: thấy **một ảnh minh họa**, ba score mock `0.91`, `0.78`, `0.15` (chỉ số demo, không khẳng định bệnh); có nhãn ba dấu hiệu và disclaimer.
6. Chuyển `Báo cáo`: hiển thị AI Draft có các trường hồ sơ/điểm ảnh và danh sách cần bác sĩ kiểm tra.
7. Chọn `Chỉnh sửa`, sửa một đoạn, điền tên bác sĩ demo (ví dụ `Bác sĩ Demo`), bấm `Lưu bản chỉnh sửa` → sinh version mới, không sửa AI Draft.
8. Chọn `Xác nhận báo cáo` → thao tác cần xác nhận trong dialog; tạo version `Doctor Approved` và audit log (ai, lúc nào, từ phiên bản nào).
9. Tải lại trang/khởi động lại backend: phải thấy versions còn nguyên; có thể so sánh AI Draft và bản đã xác nhận.
10. `Mở Zoom` chỉ mở `ZOOM_MEETING_URL` được cấu hình (nếu thiếu thì nút disabled và hiển thị lý do); không tự tạo meeting.
11. Mở `/research-data` thấy bảng kế hoạch chia dữ liệu cùng phương pháp tổng hợp nhãn; không có số thống kê bị bịa.

**Luồng B — Lỗi và dữ liệu thiếu:**

- Ca demo thiếu thông tin dị ứng: badge `Chưa có dữ liệu`.
- Ca `DEMO-MISSING-PAGE`: hiển thị `Thiếu trang hồ sơ`; không dùng AI để suy đoán nội dung còn thiếu.
- Ca `DEMO-INVALID-IMAGE`: hiển thị `Ảnh không hợp lệ`; không render ba điểm mock như thể phân tích thành công.
- Tải file không được hỗ trợ / quá giới hạn: API trả lỗi có mã rõ ràng, UI giải thích thân thiện.

## 4. KIẾN TRÚC VÀ STACK

**Ưu tiên:** React + TypeScript + Vite + Tailwind (frontend), FastAPI + Pydantic + SQLAlchemy (backend), SQLite cho demo local (dễ chạy), thiết kế để thay được bằng PostgreSQL qua `DATABASE_URL`; lưu file demo trong `storage/` và báo cáo JSON.

Nếu repo hiện có PostgreSQL sẵn thì dùng PostgreSQL; không ép phải cài Docker hoặc GPU để mở demo. Mọi cấu hình qua `.env.example`.

```text
telemedicine-ai-demo/
├── README.md
├── TASKS.md
├── .gitignore
├── .env.example
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── pages/        # DemoCase, ResearchData, AboutDemo
│   │   ├── components/   # PdfViewer, ExtractionPanel, XrayPanel,
│   │   │                 # ReportEditor, VersionHistory, DataSplitTable
│   │   ├── api/
│   │   └── types/
│   └── ...
├── backend/
│   ├── requirements.txt (hoặc pyproject.toml)
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── seed/
│   ├── tests/
│   └── ...
├── demo_assets/
│   ├── sample_case_2pages.pdf
│   ├── xray_illustration.png
│   └── demo_data.json
└── docs/
    ├── DEMO_SCRIPT.md
    ├── DATA_SPLIT_PLAN.md
    └── TEST_PLAN.md
```

**Luồng kiến trúc:** React → FastAPI → hai nhánh dữ liệu giả lập (extraction mock và imaging mock) → report composer → bác sĩ demo review → storage/versioning. Phần tích hợp AI thật được định nghĩa bằng interface riêng để thay thế mock sau này, **không thay đổi hợp đồng API**.

### 4.1 Kiến trúc dữ liệu và quyền

- `case_id`: khóa liên kết xuyên suốt ca bệnh.
- `file_id`: tham chiếu PDF/ảnh thuộc ca.
- `extraction_id`: kết quả trích xuất có `source` theo từng trường.
- `prediction_id`: ba điểm số và `is_mock: true`.
- `report_version_id`: bản báo cáo bất biến, `parent_version_id` để truy lịch sử.
- `status`: `AI_DRAFT`, `DOCTOR_EDITED`, `DOCTOR_APPROVED`.
- `actor`: với MVP là **tài khoản/nhân vật demo**, chưa thay thế cơ chế xác thực bác sĩ thực tế. Dùng chú thích rõ ràng.
- Không lưu secret/meeting passcode trong client bundle. Không có thông tin bệnh nhân thật.

## 5. DỮ LIỆU MẪU VÀ GROUND TRUTH

### 5.1 Ca mô phỏng DEMO-001

Tạo PDF **thật**, đúng **2 trang**, chữ tiếng Việt có thể chọn/copy (nếu hỗ trợ, thêm tùy chọn bản scan). Nội dung nhất quán, ví dụ:

**Trang 1**
- `MÃ CA: DEMO-001 — HỒ SƠ MÔ PHỎNG, KHÔNG PHẢI BỆNH NHÂN THẬT`.
- `Triệu chứng: Bệnh nhân ho khan, khó thở trong 3 ngày.`
- `Tiền sử: Tăng huyết áp.`
- `Thuốc đang dùng: Amlodipine 5 mg/ngày.`
- Không có dòng khẳng định người bệnh không dị ứng.

**Trang 2**
- `Thời điểm chụp X-quang: 15/11/2026, 08:30 (giờ Việt Nam).`
- `Ghi chú: Đây là hồ sơ biên soạn phục vụ demo kỹ thuật. Ảnh X-quang minh họa được ghép rời, KHÔNG phải phim của bệnh nhân trong hồ sơ.`
- Có vùng giải thích mục tiêu demo/giới hạn.

**Ground truth đề xuất:**

| Trường | Giá trị | Nguồn |
|---|---|---|
| `symptoms` | `Ho khan`, `Khó thở trong 3 ngày` | Trang 1, câu Triệu chứng |
| `medical_history` | `Tăng huyết áp` | Trang 1, câu Tiền sử |
| `medications` | `Amlodipine 5 mg/ngày` | Trang 1, câu Thuốc đang dùng |
| `allergies` | `null`, `status=missing` | Không có trong tài liệu |
| `test_datetime` | `2026-11-15T08:30:00+07:00` | Trang 2, câu Thời điểm chụp X-quang |

Nguồn nên có ít nhất `page_number`, `quote`, `section`; có thể thêm bounding box ký tự nếu viewer làm được. Tất cả quote phải **thật sự tồn tại trong PDF seed**; viết unit test để xác minh text extraction.

### 5.2 Dữ liệu ảnh minh họa

- `image_type=illustrative` và `paired_with_document=false`.
- Chỉ dùng file có quyền sử dụng công khai hoặc asset do chính ứng dụng tạo ra. Không tạo hình giả mạo như ảnh VinDr-CXR thực tế.
- Ba điểm MOCK để minh họa UI: `Cardiomegaly=0.91`, `Pleural Effusion=0.78`, `Lung Opacity=0.15`; giá trị là **fixtures** được đặt trước, không do DenseNet/EfficientNet tính.
- Nếu hiển thị nhãn “nghi ngờ”, phải có ngưỡng **giả lập** và giải thích ngưỡng chưa được hiệu chỉnh thực nghiệm.
- Nếu có overlay vùng ảnh, mô tả trung thực nguồn: `Minh họa vùng chú ý` — không gọi là Grad-CAM hoặc bounding box của bác sĩ nếu không phải như vậy.

### 5.3 Dữ liệu thiếu và bất thường

Seed ít nhất hai ca tình huống lỗi: `DEMO-MISSING-PAGE` và `DEMO-INVALID-IMAGE`. Nên có một trường hợp **phủ định có căn cứ** (ví dụ dòng “Không ghi nhận dị ứng” trong một hồ sơ khác) để demo phân biệt `negative` và `missing`.

## 6. ĐỊNH DẠNG JSON / API CONTRACTS

### 6.1 Extraction response (ví dụ)

```json
{
  "case_id": "DEMO-001",
  "mode": "mock",
  "fields": {
    "symptoms": {
      "value": ["Ho khan", "Khó thở trong 3 ngày"],
      "status": "present",
      "source": {"document_id":"DOC-DEMO-001", "page_number":1, "section":"Triệu chứng", "quote":"Triệu chứng: Bệnh nhân ho khan, khó thở trong 3 ngày."}
    },
    "medical_history": {
      "value": ["Tăng huyết áp"],
      "status": "present",
      "source": {"document_id":"DOC-DEMO-001", "page_number":1, "section":"Tiền sử", "quote":"Tiền sử: Tăng huyết áp."}
    },
    "medications": {
      "value": ["Amlodipine 5 mg/ngày"],
      "status": "present",
      "source": {"document_id":"DOC-DEMO-001", "page_number":1, "section":"Thuốc đang dùng", "quote":"Thuốc đang dùng: Amlodipine 5 mg/ngày."}
    },
    "allergies": {"value": null, "status":"missing", "source":null},
    "test_datetime": {
      "value":"2026-11-15T08:30:00+07:00",
      "status":"present",
      "source":{"document_id":"DOC-DEMO-001", "page_number":2, "section":"Thời điểm chụp X-quang", "quote":"Thời điểm chụp X-quang: 15/11/2026, 08:30 (giờ Việt Nam)."}
    }
  }
}
```

### 6.2 Image analysis response (ví dụ)

```json
{
  "case_id":"DEMO-001",
  "mode":"mock",
  "is_mock":true,
  "image_id":"IMG-DEMO-001",
  "image_source_type":"illustrative",
  "paired_with_document":false,
  "model_name":"MOCK_FIXTURE_NO_REAL_MODEL",
  "labels":[
    {"code":"cardiomegaly","name_vi":"Tim to","score":0.91},
    {"code":"pleural_effusion","name_vi":"Tràn dịch màng phổi","score":0.78},
    {"code":"lung_opacity","name_vi":"Đám mờ phổi","score":0.15}
  ],
  "disclaimer":"Điểm số giả lập, không phải dự đoán của mô hình được huấn luyện; ảnh minh họa không ghép cặp lâm sàng với hồ sơ."
}
```

### 6.3 API endpoints bắt buộc

| Method | Route | Vai trò |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/cases` | Danh sách ca demo |
| GET | `/api/cases/{case_id}` | Thông tin ca và trạng thái |
| GET | `/api/cases/{case_id}/document` | PDF mẫu (an toàn, đúng case) |
| GET | `/api/cases/{case_id}/image` | Ảnh minh họa |
| GET | `/api/cases/{case_id}/extraction` | JSON các trường và nguồn |
| GET | `/api/cases/{case_id}/predictions` | Ba điểm MOCK |
| GET | `/api/cases/{case_id}/reports` | Danh sách phiên bản |
| GET | `/api/cases/{case_id}/reports/{version_id}` | Một phiên bản báo cáo |
| POST | `/api/cases/{case_id}/reports/draft-edit` | Tạo version edited từ version gốc |
| POST | `/api/cases/{case_id}/reports/{version_id}/approve` | Tạo version approved với actor demo |
| GET | `/api/cases/{case_id}/reports/{version_id}/export` | Export JSON (PDF là nice-to-have) |
| GET | `/api/research/data-plan` | Kế hoạch chia dữ liệu và số liệu đã xác thực |
| GET | `/api/demo/config` | Cấu hình public an toàn, Zoom enabled/disabled |

Đặt `CORS_ORIGINS` theo môi trường; validate `case_id`, `version_id`, file type và kích thước. Không thêm endpoint ghi dữ liệu thật không kiểm soát.

### 6.4 Quy tắc versioning

- Mỗi bản báo cáo là **immutable** sau khi lưu, trừ metadata kỹ thuật không ảnh hưởng nội dung. Không `UPDATE` nội dung AI Draft khi bác sĩ chỉnh sửa.
- Tạo `version_number` tăng dần và `parent_version_id` cho các bản chỉnh sửa/xác nhận.
- `AI_DRAFT` chỉ đọc; `DOCTOR_EDITED` cho phép chỉnh nội dung mới; `DOCTOR_APPROVED` phải do thao tác bấm xác nhận riêng tạo ra.
- Audit log: `case_id`, `version_id`, `actor_label`, `action`, `timestamp_utc`, `source_version_id`, tóm tắt thay đổi.
- Backend phải validate không xác nhận phiên bản của ca khác, không chấp nhận report rỗng. Bản Approved không sửa tại chỗ; nếu sửa tiếp tạo version mới và cần phê duyệt lại.
- Có giao diện **so sánh hai bản** (tối thiểu xem song song trước/sau; highlight diff nếu dễ làm).

## 7. FRONTEND / UX REQUIREMENTS

### 7.1 Routes

- `/` → Giới thiệu dự án + nút `Vào demo`.
- `/demo` → chọn ca mẫu; mặc định `DEMO-001`.
- `/cases/:caseId` → trang ca với tabs `Hồ sơ`, `Ảnh X-quang`, `Báo cáo`, `Lịch sử`.
- `/research-data` → bảng VinDr-CXR + kế hoạch train/val/test + nhãn.
- `/test-plan` → các KPI mục tiêu và cách đo, không hiển thị kết quả tự bịa.
- `/about` → giới hạn demo, chính sách dữ liệu giả, trạng thái các module.

### 7.2 Giao diện mong muốn

- Phong cách y tế tối giản: navy/trắng/xanh lam, dễ đọc trên laptop; responsive.
- Luôn thấy badge `DEMO / MOCK`; tiêu đề ghi `Không dùng cho quyết định lâm sàng`.
- PDF viewer có selector trang (1/2), zoom và khu vực trích dẫn hiển thị theo lựa chọn trường.
- Panel ảnh có 3 nhãn, score và legend; nếu không dùng Grad-CAM thật thì không đặt heatmap giả.
- Report editor có trạng thái bản hiện hành, nút Save Edit và Approve riêng, ô `Người xác nhận (demo)`.
- History hiển thị thời gian, phiên bản, người sửa, trạng thái, nút mở bản cũ / so sánh.
- Error UX: trạng thái loading, file hỏng, thiếu trang, không có Zoom URL, API unavailable, không có nguồn.
- Nếu muốn thêm upload tự do, chỉ thêm sau khi luồng demo seed hoàn chỉnh. **Không dùng upload giả làm như đã OCR/AI thật**: cho biết chỉ kiểm tra và lưu file, hoặc giữ chức năng upload disabled với nhãn `Sắp triển khai`.

## 8. KẾ HOẠCH DỮ LIỆU, TỔNG HỢP NHÃN VÀ KIỂM THỬ

### 8.1 VinDr-CXR

Thông tin từ đề cương: bộ dữ liệu công bố có **18.000 ảnh**, gồm **15.000 train và 3.000 test**. Các số này là thông tin công bố, **không phải khẳng định đã tải**. Dự kiến **3.000–5.000 ảnh** chọn từ tập train cho thử nghiệm ban đầu. Giữ nguyên test chính thức độc lập; tách validation từ train.

Bảng ở `/research-data`:

| Tập | Số lượng | Vai trò | Tim to (+) | Tràn dịch (+) | Đám mờ (+) |
|---|---:|---|---|---|---|
| Train chính thức VinDr-CXR | 15.000 | Nguồn dữ liệu phát triển | Chưa thống kê theo quy tắc chọn | Chưa thống kê | Chưa thống kê |
| Tập con Train (ví dụ) | 3.200 | Huấn luyện | Chưa thống kê | Chưa thống kê | Chưa thống kê |
| Tập con Validation (ví dụ) | 800 | Chốt mô hình/ngưỡng | Chưa thống kê | Chưa thống kê | Chưa thống kê |
| Test chính thức VinDr-CXR | 3.000 | Kiểm thử độc lập, khi được cấp quyền | Chưa thống kê | Chưa thống kê | Chưa thống kê |

Gắn nhãn `3.200 + 800 là ví dụ phân bổ 4.000 ảnh từ train chính thức, không phải số liệu thực nghiệm`. Không cộng lẫn 3.000 test chính thức vào tổng tập con 4.000 ảnh.

**Quy tắc gán nhãn cần chốt trước thực nghiệm:** Dữ liệu train VinDr-CXR có nhiều lượt đọc chuyên gia. Cần mô tả rõ cách quy đổi nhãn theo ảnh (ví dụ quy tắc đa số hoặc cách khác đã được chọn); ghi phiên bản quy tắc, xử lý trường hợp không có box/nhiều box/khác biệt người đọc và kiểm tra trùng ảnh. Không tự động áp dụng một quy tắc chưa được thầy phê duyệt như kết quả cuối cùng.

**Phạm vi tư thế:** VinDr-CXR được công bố cho ảnh ngực thẳng **PA**; phiên bản demo chưa có mô hình có thể kiểm chứng trên AP hoặc ảnh ngoài phạm vi. UI phải nêu giới hạn này.

### 8.2 Dữ liệu hồ sơ

Mục tiêu KPI MT1: kiểm thử **ít nhất 100 hồ sơ độc lập**. Vì vậy cần **tập phát triển khác** (số lượng dự kiến được ghi rõ, không lấy lại 100 ca test làm data tuning). Demo có thể dùng 1–3 ca seed, **không tính** là thành tích F1. Ground truth cho mỗi trường gồm `value`, `status`, `page`, `quote` (và bbox nếu có).

Có ba dạng hồ sơ cần thiết kế về sau: PDF text, scan khó đọc, hồ sơ thiếu trường; thêm câu phủ định và thông tin mâu thuẫn. Không ghép hồ sơ mô phỏng ngẫu nhiên với ảnh rồi tính chất lượng tổng hợp lâm sàng như trên dữ liệu cặp bệnh nhân thật.

### 8.3 KPI mục tiêu (chưa đo)

| MT | KPI | Cách đo khi đủ dữ liệu |
|---|---|---|
| MT1 | F1 trích xuất ≥0,90 trên ≥100 hồ sơ test | So từng trường với ground truth, báo F1 từng trường và trung bình |
| MT1 | 100% trường có nguồn hoặc trạng thái thiếu | Đếm coverage; riêng **citation correctness** phải kiểm tra quote hỗ trợ nội dung |
| MT2 | Macro-AUROC ≥0,85 | AUROC từng nhãn rồi lấy trung bình trên test độc lập; báo số dương mỗi nhãn |
| MT2 | Sensitivity ≥0,85 tại Specificity ≥0,75 | Chốt **ngưỡng riêng cho từng nhãn** trên validation rồi đánh giá test |
| MT2 | ≥90% nhận định có căn cứ | Bác sĩ/chuyên gia đánh giá độc lập, rubric ghi rõ |
| MT3 | ≥95% của 30 kịch bản | **Ít nhất 29/30 PASS = 96,7%** |
| MT3 | p95 ≤60 giây sau tải xong | Cố định máy, số lượt đo, hồ sơ tối đa 2 trang + 1 ảnh, ghi p95 |
| MT3 | Lưu đầy đủ phiên bản | So AI Draft và bản Approved qua API/DB/history |

**Không tạo biểu đồ KPI hoặc số liệu kết quả giả.** Trang `/test-plan` cho phép xem `Chưa đo`, plan và mẫu phiếu kiểm thử.

## 9. TEST CASES VÀ TIÊU CHÍ NGHIỆM THU MVP

Tối thiểu chạy các tests sau:

| ID | Kiểm tra | PASS khi |
|---|---|---|
| T01 | `/api/health` | Trả 200 JSON |
| T02 | Seed case | `DEMO-001` hiện sau cài đặt sạch |
| T03 | PDF | Tài liệu hai trang, mở đúng trang |
| T04 | Source | Bấm tiền sử hiện đúng quote và trang 1 |
| T05 | Missing | Dị ứng hiển thị `Chưa có dữ liệu` |
| T06 | 3 labels | Đúng mã nhãn và ba score mock, kèm disclaimer |
| T07 | Report | AI Draft hiển thị source refs và các lưu ý |
| T08 | Edit | Tạo bản mới; bản AI ban đầu không đổi |
| T09 | Approve | Chỉ phê duyệt sau thao tác explicit, có actor/time |
| T10 | Persistence | Restart backend vẫn còn các version |
| T11 | History | Hiển thị đủ thứ tự version, mở và so sánh |
| T12 | Missing page | Có lỗi phù hợp, không tự suy đoán |
| T13 | Invalid image | Có lỗi phù hợp, không báo dự đoán thành công |
| T14 | Zoom | Khi không cấu hình URL, nút disabled; khi có, mở link HTTPS |
| T15 | Data plan | Có bảng chia tập với placeholder số dương chưa thống kê |
| T16 | KPI | Có nhãn `Mục tiêu / Chưa đo` |
| T17 | Source integrity | Mọi quote seed tồn tại trong text PDF thật |
| T18 | API validation | Reject cross-case version / invalid payload |
| T19 | Public demo | Nếu deploy, link mở bằng cửa sổ ẩn danh, API đáp ứng |
| T20 | Basic responsive | Không vỡ giao diện ở kích thước laptop/mobile |

Tests ưu tiên: `pytest` cho backend và API, `Vitest` cho component/service; nếu có Playwright, viết một E2E test đi qua từ xem nguồn đến approved. Không thay thế kiểm thử thủ công bằng câu “đã test” khi chưa chạy.

## 10. TRIỂN KHAI DEMO & LINK TRONG SLIDE

- Frontend có thể triển khai lên dịch vụ hosting static; backend lên dịch vụ chạy Python với database tồn tại qua restart. Không chọn cách lưu SQLite trên ổ đĩa tạm nếu dữ liệu mất khi redeploy; chọn persistent storage hoặc PostgreSQL khi public.
- Không bao giờ public `.env`, token, URL cuộc họp chứa secret, hay dữ liệu sức khỏe thật.
- `VITE_API_BASE_URL` trỏ tới API public. Thiết lập CORS đúng origin frontend.
- `PUBLIC_DEMO_URL` chỉ điền khi người dùng thực sự có URL đang hoạt động. Có QR trong slide sau khi URL được kiểm tra, không sinh QR tới URL placeholder.
- `DEMO_MODE=true` mặc định; phần giới thiệu phải thể hiện OCR/AI ảnh là mock nếu chưa triển khai.
- README cần ghi cách khởi động local bằng 2 terminal, seed DB, chạy tests, tạo bản reset demo và kiểm tra public deployment.
- Nếu deploy public, **không cho người lạ sửa cùng một hồ sơ xác nhận duy nhất**: dùng session demo riêng hoặc reset/sandbox dữ liệu theo phiên; demo không phải hệ thống xác thực bác sĩ production.

Mẫu thông tin thêm vào slide cuối:

```text
DEMO HỆ THỐNG — TELEMEDICINE AI (PROTOTYPE)
Link: [ĐIỀN SAU KHI TRIỂN KHAI THÀNH CÔNG]
Chế độ: DEMO/MOCK — Không dùng cho quyết định y khoa
Phạm vi: Một ca mô phỏng, dẫn nguồn hồ sơ, ba điểm ảnh, bác sĩ sửa và lưu phiên bản
```

## 11. KẾ HOẠCH THỰC THI CHO AGENT (THỨ TỰ BẮT BUỘC)

### P0 — Khảo sát & scaffold

- [ ] Khảo sát repo; thống kê phần đã có, tránh làm lại.
- [ ] Tạo cấu trúc frontend/backend, config và README chạy local.
- [ ] Thiết lập model DB, migrations/init, schema và seed idempotent.

### P1 — Dữ liệu seed & API

- [ ] Sinh PDF 2 trang nhất quán với các quote JSON.
- [ ] Chuẩn bị ảnh minh họa có nguồn/quyền hợp lệ và disclaimer.
- [ ] Sinh dữ liệu extraction/prediction/report seed cho `DEMO-001`.
- [ ] Tạo API xem ca, PDF, ảnh, extraction và score mock.
- [ ] Xây dựng API tạo report version/edit/approve/audit.

### P2 — Giao diện luồng demo

- [ ] Trang ca và PDF viewer có nguồn.
- [ ] Bảng ba score có chữ **MOCK** rõ ràng.
- [ ] Báo cáo AI Draft và editor.
- [ ] Phê duyệt demo, history và diff trước/sau.
- [ ] Trạng thái lỗi/thiếu dữ liệu và responsive.

### P3 — Dữ liệu nghiên cứu & kiểm thử

- [ ] Trang `/research-data`, bảng phân chia dữ liệu và placeholder nhãn dương.
- [ ] Trang `/test-plan` cho KPI & điều kiện đánh giá.
- [ ] Thực thi test backend, frontend và E2E nếu có.
- [ ] Cung cấp test report ghi rõ PASS/FAIL thực tế.

### P4 — Bàn giao

- [ ] Viết `docs/DEMO_SCRIPT.md`: kịch bản 3–5 phút cho giảng viên.
- [ ] Viết `docs/DATA_SPLIT_PLAN.md` và `docs/TEST_PLAN.md`.
- [ ] Tạo `.env.example`, mô tả biến cấu hình.
- [ ] Hướng dẫn triển khai, test link public/QR nếu có hạ tầng.
- [ ] Liệt kê chức năng mock, thật, chưa thực hiện và các hạn chế.

## 12. TIÊU CHÍ KẾT THÚC CÔNG VIỆC

Bàn giao được xem là đạt khi người dùng có thể tự chạy local và đi qua chuỗi:

`DEMO-001 → Xem PDF trang 1 → Click trường có nguồn → Xem 3 score MOCK → Xem AI Draft → Sửa → Lưu → Xác nhận (demo) → Xem lịch sử/so sánh → Reload vẫn còn dữ liệu`.

Ngoài ra phải có bảng chia tập dữ liệu, trạng thái lỗi, test report và README. **Không báo hoàn tất nếu chức năng lưu phiên bản chỉ là state trong trình duyệt** hoặc nếu mất sau refresh.

## 13. HƯỚNG NÂNG CẤP SAU SEMINAR (KHÔNG CHẶN MVP)

1. Thay extraction mock bằng `PyMuPDF` để đọc text; OCR chỉ dùng khi cần, có nguồn trang/vị trí; kiểm thử trên ≥100 hồ sơ độc lập.
2. Huấn luyện DenseNet121 baseline với ảnh PA và 3 nhãn, dùng **BCEWithLogitsLoss nhận trực tiếp 3 logits** trong training; khi inference mới áp dụng sigmoid và ngưỡng theo nhãn từ validation.
3. So sánh EfficientNet trên cùng bộ dữ liệu; đối chiếu Grad-CAM với box chuyên gia, có ví dụ lệch vùng.
4. Tính AUROC/sensitivity/specificity trên tập test độc lập, báo ca dương theo nhãn và khoảng tin cậy.
5. Cải thiện auth, permission, PostgreSQL, audit log, xuất PDF và ánh xạ FHIR R4 khi cần.
6. Nghiên cứu đánh giá lâm sàng chỉ khi có dữ liệu ghép cặp hồ sơ–phim được xác thực và quyền sử dụng phù hợp.

## 14. THAM KHẢO & NGUỒN CẦN ĐỐI CHIẾU

- Tài liệu seminar và nhận xét giảng viên do sinh viên cung cấp là cơ sở yêu cầu của bản demo.
- VinDr-CXR: <https://physionet.org/content/vindr-cxr/1.0.0/>
- FastAPI: <https://fastapi.tiangolo.com/>
- React: <https://react.dev/>
- PyTorch BCEWithLogitsLoss: <https://docs.pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.html>
- Zoom Meeting SDK: <https://developers.zoom.us/docs/meeting-sdk/>

**Lưu ý:** Các nguồn tham khảo là định hướng đọc và đối chiếu; tài liệu này không xác nhận đã được cấp quyền tải bộ VinDr-CXR hay đã có kết quả huấn luyện.
