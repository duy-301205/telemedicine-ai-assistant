# TELEMEDICINE AI — ĐẶC TẢ NÂNG CẤP PROTOTYPE THÀNH HỆ THỐNG NGHIỆP VỤ HOÀN CHỈNH (AI MOCK)

> **Tài liệu đầu vào cho Coding Agent — bản nâng cấp hệ thống hiện có, không phải dự án tạo lại từ đầu.**  
> Sinh viên: **Hoàng Mạnh Duy — K68A3**  
> Đề tài: **Trích xuất hồ sơ và nhận diện ba dấu hiệu trên X-quang ngực trước hội chẩn từ xa**  
> Giai đoạn: **Hệ thống nghiệp vụ đầy đủ + các AI adapter MOCK có thể thay thế**, không tuyên bố đạt chỉ tiêu mô hình.  
> Tài liệu kế thừa: `TELEMEDICINE_AI_DEMO_SPEC.md`, code hiện tại và nhận xét giảng viên.  
> Trạng thái: **Yêu cầu để Agent triển khai**, không phải xác nhận tính năng đã hoàn thành.

---

## 0. CHỈ DẪN BẮT BUỘC CHO AGENT

**MỤC TIÊU KHÁC BẢN DEMO CŨ:** Chuyển ứng dụng hiện tại (6 nhóm module tab/demo + FastAPI + SQLite + 18 pytest) thành **một sản phẩm Web có đầy đủ luồng nghiệp vụ thực sự**: quản lý ca → tải tệp và xác minh → yêu cầu xử lý → kết quả có nguồn/khung ảnh → tạo báo cáo → bác sĩ sửa và xác nhận → quản lý hội chẩn → lưu trữ/tra cứu/xuất báo cáo. AI hồ sơ và AI ảnh vẫn dùng MOCK **có giới hạn rõ**, nhưng mọi phần nghiệp vụ khác phải hoạt động thật.

1. **KHÔNG TẠO LẠI PROJECT.** Trước khi sửa code, đọc repo và liệt kê các file hiện hữu: `PdfViewer.tsx`, `ExtractionPanel.tsx`, `XrayPanel.tsx`, `ReportEditor.tsx`, `VersionHistory.tsx`, `CaseListPage.tsx`, `ResearchDataPage.tsx`, `TestPlanPage.tsx`, `Navbar.tsx`, API FastAPI, ORM, migrations, DB, seed và test. Tái sử dụng chúng và giữ URL/API cũ khi có thể.
2. **GIỮ DỮ LIỆU CŨ.** Có kế hoạch migration từ SQLite `storage/telemedicine_demo.db`; không xóa, reset hoặc rewrite DB người dùng. Backup trước migration và kiểm tra lại các version/audit cũ. Nếu schema chưa dùng migrations, thêm Alembic hoặc phương án migration được kiểm thử.
3. **Không làm giao diện tĩnh giả chức năng.** Tạo mới, upload, sửa, lưu, tra cứu, lọc, phê duyệt, xuất báo cáo phải chạy end-to-end với API + DB. Nếu chưa triển khai chức năng, hiển thị trạng thái chưa hỗ trợ, không nút hoạt động giả.
4. **AI MOCK được phép duy nhất tại hai ranh giới**: (a) nhận dạng/trích xuất thông tin hồ sơ tự động; (b) dự đoán 3 nhãn và attention/heatmap từ ảnh. Các thành phần này phải qua interface độc lập, rõ `processing_mode=mock`, không tự trả ra kết quả y khoa đáng tin trên upload tùy ý.
5. **BẢO ĐẢM TRUNG THỰC VỀ MOCK:** Mỗi kết quả mock kèm `is_mock`, `fixture_id`, `model_version=null`, phương pháp sinh, nguồn và cảnh báo. Ba điểm ví dụ 0.91/0.78/0.15 chỉ gắn với fixture định danh, tuyệt đối không tái sử dụng như thể mô hình đã phân tích tất cả ảnh mới.
6. **AN TOÀN Y TẾ:** Không đưa chẩn đoán cuối, điều trị, đơn thuốc hoặc tuyên bố xác suất đã được hiệu chuẩn; kết quả chỉ là gợi ý kiểm tra. Mọi ca giả lập ghi rõ DEMO. Hồ sơ mô phỏng ghép ảnh rời thì `paired_clinical_data=false`; không tính tính nhất quán y khoa giữa chúng.
7. **BẢO VỆ DỮ LIỆU:** Bản demo public chỉ dùng ca mô phỏng/ảnh có phép sử dụng. Không đưa dữ liệu VinDr-CXR bị hạn chế truy cập lên web public. Không đưa API key, Zoom meeting secret, dữ liệu riêng tư vào Git.
8. **THỰC HIỆN THEO GIAI ĐOẠN; TỰ KIỂM THỬ.** Viết `UPGRADE_TASKS.md` và `docs/UPGRADE_DESIGN.md` trước khi thay đổi lớn, triển khai từng nhóm, chạy test thực tế; báo cáo PASS/FAIL. Không báo hoàn thành khi mới scaffold.
9. **Chế độ mặc định chạy miễn phí, không GPU**, React + FastAPI + SQLite vẫn đủ. Thiết kế DB qua `DATABASE_URL` để dùng PostgreSQL khi triển khai, không bắt người dùng cài Docker/Zoom SDK.
10. **Kết thúc:** cập nhật README, `docs/FEATURE_MATRIX.md` (Real/Mock/Not implemented), `docs/DEMO_SCRIPT.md`, `docs/TEST_REPORT.md`, `docs/DEPLOY.md`; công khai những phần chưa đạt.

---

## 1. PHÂN BIỆT BẢN HIỆN TẠI VÀ BẢN MỤC TIÊU

### 1.1. Những thứ phải giữ và nâng cấp

| Phân hệ hiện có | Giữ lại | Nâng cấp bắt buộc |
|---|---|---|
| PDF viewer & citations | PDF 2 trang, chuyển trang, highlight, `missing/negative` | Nhận file mới, nhiều file/trang, liên kết nguồn theo file/version, kiểm tra quote/bbox, thiếu trang không làm crash |
| XrayPanel | Ba score MOCK, markers minh họa, PA disclaimer | Ảnh upload mới, metadata tư thế, không tự sinh score cho ảnh lạ, phân biệt annotation minh họa/chuyên gia/Grad-CAM thật |
| ReportEditor & History | AI Draft immutable, Doctor Edit/Approve, audit, diff, JSON | Vòng đời báo cáo theo ca, nhiều vòng chỉnh sửa, quyền, xuất PDF, tải lại, so sánh, audit đầy đủ |
| CaseList | Các ca DEMO và lỗi | CRUD ca thực sự, upload, lọc/tìm kiếm, tiến độ, lưu trữ, nhiều ca và phân trang |
| Research Data & Test Plan | Bảng chia tập, KPI mục tiêu | Kế hoạch có phiên bản, nhập thống kê thật nếu có, không bịa số, báo cáo định dạng mẫu và kết quả test hệ thống tách KPI AI |
| Zoom/config/backend | Nút link, SQLite, 18 pytest | Quản lý phiên hội chẩn theo ca, link cấu hình, event timeline, phiên bản báo cáo trước/sau, DB migration, kiểm thử E2E |

### 1.2. Định nghĩa xong việc

Một người dùng demo có thể **tự tạo ca mới**, upload PDF và ảnh được chấp nhận, xem các tệp thực, chọn một fixture mock tương thích hoặc nhận trạng thái **chưa có mô hình/trích xuất tự động**, xây báo cáo có dẫn nguồn, sửa/duyệt/lưu, tạo phiên hội chẩn bằng link, lưu kết quả và tìm lại ca sau khi khởi động lại server. Không phụ thuộc vào duy nhất `DEMO-001`.

Không có nghĩa là hệ thống đã đủ yêu cầu bảo mật hay chứng nhận để dùng trên bệnh nhân thật.

---

## 2. CẤU TRÚC NGƯỜI DÙNG, TRANG VÀ LUỒNG NGHIỆP VỤ

### 2.1. Các vai trò trong hệ thống demo

- **DEMO_ADMIN:** quản trị tài khoản demo, mẫu dữ liệu, cấu hình hệ thống, phiên hội chẩn; không sửa history bất biến.
- **CLINICIAN_DEMO:** tạo/xem ca, tải file, yêu cầu xử lý, chỉnh sửa và xác nhận báo cáo bằng **tài khoản demo có định danh**, không chỉ nhập tên tùy ý để giả danh bác sĩ thật.
- **VIEWER_DEMO:** xem các ca demo được phân quyền và báo cáo; không sửa/xác nhận.

Ứng dụng local tối thiểu phải có login phiên demo hoặc cơ chế chọn demo account gắn server-side identity có giải thích; **đối với bản public bắt buộc có auth + phân quyền server-side**, CSRF/cookie/session và rate limiting hợp lý. Không dùng tên được nhập vào ô text như bằng chứng định danh bác sĩ. Nếu auth production chưa đạt, khóa hoặc sandbox những hành động nhạy cảm khi public.

### 2.2. Menu/trang mục tiêu

1. `/` — Dashboard: thống kê ca theo trạng thái (số thật từ DB), thao tác gần đây, bắt đầu ca mới.
2. `/cases` — Danh sách ca: tìm theo mã/tên giả lập, filter trạng thái/ngày, sắp xếp, phân trang; create/archival.
3. `/cases/new` — Wizard tạo ca (mã ca, metadata mô phỏng, upload hồ sơ PDF và 1 ảnh X-quang); validation và thông báo.
4. `/cases/:caseId` — Trang ca 5 khu vực: **Tổng quan**, **Hồ sơ & nguồn**, **X-quang**, **Báo cáo & duyệt**, **Lịch sử & nhật ký**; nút hội chẩn.
5. `/cases/:caseId/consultations` — Phiên hội chẩn/đường dẫn Zoom, tình trạng, biên bản/kết luận demo.
6. `/research-data` — VinDr-CXR: công bố vs tập dự kiến vs tập thực tế; ground truth, nguồn ảnh.
7. `/test-plan` — MT1/MT2/MT3, cách đo, mẫu rubric, ma trận 30 ca kiểm thử; tất cả AI KPI chưa đo nếu chưa có dữ liệu thật.
8. `/settings` — Chỉ admin: cấu hình Demo Mode, Zoom URL, giới hạn upload, chính sách mock, thông số an toàn.
9. `/about` — Giới thiệu, giới hạn AI, chính sách dữ liệu giả, link nguồn và link demo đã xác thực.

Giữ routes cũ `/demo` để chuyển hướng đến danh sách ca mẫu hoặc `DEMO-001`, tránh phá link trên slide trước đó.

### 2.3. Trạng thái ca bệnh và tác vụ

`CREATED → FILES_UPLOADED → READY_FOR_PROCESSING → PROCESSING → REVIEW_READY → IN_REVIEW → APPROVED → CONSULTATION_READY → CONSULTED → ARCHIVED`

Các trạng thái phụ: `NEEDS_INPUT`, `PROCESSING_FAILED`, `UNSUPPORTED_IMAGE_VIEW`, `EXTRACTION_UNAVAILABLE`, `PREDICTION_UNAVAILABLE`.

- State transitions được kiểm tra **ở backend**; không gán status tùy ý từ client.
- Có thể retry tác vụ lỗi mà không xóa report version cũ.
- Trạng thái ca và trạng thái báo cáo là hai thực thể khác nhau; `APPROVED` phải chỉ tới approved report version cụ thể.
- Chỉ cho archive khi có confirmation; mặc định là soft-delete/archival và giữ audit.

### 2.4. Flow chuẩn A — Tạo ca mới

1. Người dùng đăng nhập demo, chọn `Tạo ca`.
2. Nhập thông tin phi định danh (ví dụ mã ca, tên giả lập, ghi chú); server cấp `case_id` duy nhất.
3. Upload **tối đa 2 trang PDF** cho profile KPI mẫu hoặc lựa chọn hồ sơ khác nhiều trang nhưng phải ghi ngoài phạm vi phép đo p95; upload 1 ảnh PNG/JPG/DICOM nếu backend hỗ trợ đúng cách.
4. Server kiểm tra kích thước, MIME thực tế, magic bytes, file đọc được, scan/path traversal, giới hạn trang; lưu file dưới ID ngẫu nhiên, không tin filename.
5. Hiện màn hình tệp đã nhận và status `FILES_UPLOADED`.
6. Khi nhấn `Phân tích` cho case chưa có AI thật:
   - **Fixture khớp**: cho phép dùng fixture/ground truth đã được seed và liên kết với đúng file hash; gắn nhãn `MOCK FIXTURE`.
   - **Không có fixture khớp**: chỉ trích xuất text PDF bằng kỹ thuật có thật nếu hỗ trợ; trạng thái các trường `NOT_PROCESSED` hoặc `UNVERIFIED`, ảnh `PREDICTION_UNAVAILABLE`; **không sinh ba score chung**.
   - Có thể cho người dùng demo **nhập kết quả mẫu thủ công** kèm badge `MANUAL_DEMO_INPUT`, quote thực từ file và ba score do người dùng nhập; không ghi là AI tạo.
7. Người dùng mở các tab kết quả, tạo draft báo cáo từ những phần đã sẵn sàng, mọi phần chưa xác thực ghi rõ.
8. Chỉnh sửa / xác nhận / tạo phiên hội chẩn / xuất PDF-JSON.

### 2.5. Flow B — Mở các ca seed và thử nghiệm

- DEMO-001: PDF đủ 2 trang + ảnh minh họa + score mock 0.91/0.78/0.15; dị ứng `missing`.
- DEMO-002: dị ứng `negative` có trích dẫn; scores mock **khác ca 001**; dùng minh họa nhãn đa nhãn.
- DEMO-003: PDF văn bản đầy đủ, có nhiều thời điểm/tài liệu; đảm bảo phân biệt thời điểm xét nghiệm với thời gian nhập viện.
- DEMO-SCAN-004: hồ sơ PDF hình ảnh scan, OCR tự động **chưa có**; hiển thị mock OCR fixture nếu đã seed kèm nhãn, hoặc `OCR_UNAVAILABLE`.
- DEMO-INCOMPLETE-005: thiếu trang thứ 2; hiển thị cảnh báo, cho xem phần có dữ liệu, không suy luận trang vắng.
- DEMO-BAD-IMAGE-006: ảnh hỏng; hiển thị lỗi, không có predictions.
- DEMO-AP-007: X-quang có metadata `AP`; ngoài phạm vi PA của nghiên cứu, chặn nhãn suy luận mặc định.
- DEMO-CONFLICT-008: hồ sơ mâu thuẫn (ví dụ dị ứng ở hai nguồn khác nhau), hiển thị cảnh báo cần đối chiếu; không tự giải quyết.

**Tất cả đều là dữ liệu hư cấu** (trừ ảnh dùng nguồn được phép), có script seed idempotent, bảng giải thích ý nghĩa từng ca và tệp ground truth. Không gắn nhãn ảnh bệnh lý như một kết luận lâm sàng nếu chỉ là ảnh minh họa. Đảm bảo mỗi `quote` có thể tìm trong đúng PDF/nguồn của ca đó, trừ trường `missing`.

### 2.6. Flow C — Bác sĩ chỉnh sửa, phê duyệt và hội chẩn

1. Bản AI Draft giữ nguyên bất biến (`AI_DRAFT`), gồm cảnh báo dữ liệu mock.
2. `Edit` tạo version mới `DOCTOR_EDITED`, `parent_version_id`, actor identity và note thay đổi.
3. `Approve` cần user role `CLINICIAN_DEMO`, checklist đã xem hồ sơ/ảnh, xác nhận có trách nhiệm; tạo `DOCTOR_APPROVED` bất biến, không overwrite.
4. Bản approved có thể được dùng làm tài liệu trước phiên hội chẩn; nếu sửa tiếp → tạo version mới và phê duyệt lại.
5. Tạo phiên hội chẩn: ngày giờ dự kiến, title, liên kết Zoom HTTPS cấu hình, trạng thái `SCHEDULED`/`OPENED`/`COMPLETED`/`CANCELED`; không gọi Zoom API hoặc gửi thông tin bệnh nhân nếu chưa được phép.
6. Sau hội chẩn có form biên bản/ghi chú phiên DEMO, người ghi, thời gian, trỏ tới version báo cáo đã dùng. Không tự gọi là ý kiến chuyên gia thật.
7. Nhật ký hiển thị dòng thời gian cho toàn bộ thao tác; diff 2 bản và export history/JSON/PDF.

---

## 3. KIẾN TRÚC KỸ THUẬT & ADAPTERS

### 3.1. Stack và tổ chức

Giữ React + TypeScript + FastAPI + Pydantic + SQLAlchemy; dùng SQLite local và chuẩn bị PostgreSQL production. Khuyến nghị React Query/TanStack Query (hoặc cơ chế fetch hiện có), React Router, PDF.js/PyMuPDF, ReportLab để xuất PDF, Alembic migrations. Chỉ thêm thư viện nếu phục vụ chức năng rõ ràng.

Mô hình lớp:

`React UI → FastAPI Routes → Domain Services → Repositories/DB + File Storage + AI Adapter Interfaces`

Không để React truy cập trực tiếp DB hoặc file tùy đường dẫn; không hardcode fixture trong component.

### 3.2. Hai AI adapter tách biệt và dễ thay

```python
from typing import Protocol

class DocumentExtractionProvider(Protocol):
    def extract(self, case_id: str, document_ids: list[str]) -> dict: ...

class ChestXrayProvider(Protocol):
    def predict(self, case_id: str, image_id: str) -> dict: ...
```

Implementation cần có:

- `FixtureDocumentProvider`: dựa trên hash/ID file seed; trả kết quả có `fixture_id`, `source`, `is_mock=true`; không gọi OCR/LLM thật.
- `FixtureXrayProvider`: chỉ trả điểm 3 nhãn nếu file đúng fixture; có `PA`, provenance, threshold `mock_threshold` và `is_mock=true`.
- `NoModelDocumentProvider`/`NoModelXrayProvider`: trả trạng thái `UNAVAILABLE`, không giả kết quả thành công.
- `ManualDemoEntry`: nhập dữ liệu minh họa, xác định nguồn/actor, luôn gắn `manual_demo_input=true`.
- Khung interface cho `RealOcrExtractionProvider` và `RealCxrProvider` **chưa kích hoạt**, chỉ thêm adapter thật sau khi có mô hình, dữ liệu được cấp quyền và test phù hợp.

Response chuẩn phải có: `case_id`, `run_id`, `status`, `processing_mode`, `is_mock`, `provider`, `provider_version`, `fixture_id`, `created_at_utc`, `input_file_ids`, `input_hashes`, `warnings`, `results`. Không được che giấu mock ở layer report/export.

### 3.3. Pipeline ảnh thật về sau (CHƯA triển khai AI)

- Training (tài liệu nghiên cứu): `DICOM + labels → QC → train/validation split (giữ official test) → preprocessing → CNN → 3 logits → BCEWithLogitsLoss → optimizer`.
- Inference thực sau này: `PA image → preprocessing → CNN → 3 logits → sigmoid → threshold cho từng nhãn (chốt validation) → report`.
- `BCEWithLogitsLoss` **nhận trực tiếp logits**; không sigmoid trước khi tính loss.
- UI chỉ hiển thị `Mock Visual Markers`, `Expert Box` hoặc `Grad-CAM` với provenance tương ứng; không đổi tên marker vẽ tay thành expert annotation/Grad-CAM.
- Dữ liệu AP/không rõ tư thế được đánh dấu ngoài phạm vi, không tự suy luận đáng tin.

### 3.4. PDF OCR và citation

- Nếu PDF có text: có thể triển khai **trích xuất text thật** bằng PyMuPDF để hiển thị/search và lấy `page_number`/`rect`; đây là *text extraction*, không phải AI trích xuất 5 trường tự động.
- PDF scan: cho upload và xem; khi chưa có OCR thật, trả `OCR_UNAVAILABLE` hoặc fixture đã seed. Không bịa quote từ một scan mới.
- `source_ref`: `file_id`, `file_version_id`, `page`, `quote`, `char_start/end` hoặc `bbox`, `source_kind`, `verification_status`.
- Click-to-citation dùng đúng file version; highlight khi có bbox, fallback hiển thị câu nguồn đối chiếu nếu không có tọa độ.
- Chỉ đánh `verified` khi hệ thống tìm thấy quote trong text/source phù hợp hoặc đối chiếu thủ công có audit. `citation_presence` và `citation_correctness` là hai chỉ số riêng.
- Phân biệt `present`, `negative`, `missing`, `conflicting`, `unverified`, `not_processed` ở các trường hồ sơ; `negative` phải có nguồn phủ định.

### 3.5. Vận hành tác vụ xử lý

- `POST /process` tạo processing job, trả `job_id`, dùng polling `GET /jobs/{id}`; UI có loading, success, partial, error, retry.
- Trong SQLite local có thể xử lý sync/BackgroundTasks với trạng thái persisted; nếu mất job sau restart phải recover/mark failed một cách minh bạch. Không cần Celery nếu không cần.
- `run` lưu snapshot input hash, provider, output, failures; không overwrite kết quả từ run trước.
- Tạo draft mới khi chạy lại phải liên kết tới run được chọn, không chỉnh sửa draft cũ.

---

## 4. THIẾT KẾ DỮ LIỆU / CƠ SỞ DỮ LIỆU

Đề xuất schema quan hệ (điều chỉnh tương thích model hiện có), tối thiểu:

| Table | Trường chính / quy tắc |
|---|---|
| `users` | `id`, `username`, `password_hash` hoặc auth subject, `role`, `active`, `created_at` |
| `cases` | `id`, `case_code`, `display_name`, `is_demo`, `status`, `created_by`, timestamps, `archived_at` |
| `case_files` | `id`, `case_id`, `kind=document/image`, `storage_key`, `sha256`, `mime_detected`, `size`, `pages`, `view_position`, `file_version`, `uploaded_by` |
| `processing_jobs` | `id`, `case_id`, `status`, `mode`, `started_at`, `ended_at`, `error_code`, `error_message` |
| `analysis_runs` | `id`, `case_id`, `job_id`, `provider`, `is_mock`, `fixture_id`, `model_version`, `input_snapshot`, `output_snapshot`, `created_at` |
| `extracted_fields` | `id`, `run_id`, `field_code`, `value_json`, `status`, `confidence_nullable`, `source_ref_json` |
| `image_predictions` | `id`, `run_id`, `image_id`, `label_code`, `score_nullable`, `threshold_nullable`, `source_type`, `overlay_metadata_json` |
| `reports` | `id`, `case_id`, `created_at` (logical report container) |
| `report_versions` | `id`, `report_id`, `version_no`, `parent_version_id`, `status`, `content_json`, `content_text`, `author_id`, `created_at_utc`, `analysis_run_ids` |
| `report_approvals` | `id`, `version_id`, `approved_by`, `approved_at_utc`, `confirmation_text`, `actor_type=DEMO` |
| `consultations` | `id`, `case_id`, `report_version_id`, `title`, `scheduled_at`, `meeting_url_ref`, `status`, `notes`, timestamps |
| `audit_events` | `id`, `case_id`, `actor_id`, `action`, `target_kind`, `target_id`, `time_utc`, `metadata_json` |
| `dataset_plans` | `id`, `version`, `dataset`, `official_counts_json`, `proposed_counts_json`, `actual_counts_json_nullable`, `label_rule`, `source` |

**Ràng buộc:** FK case isolation trên mọi route; unique `(report_id, version_no)`; transaction cho edit/approve; atomic writes cho file; không lưu raw PDF blob trực tiếp vào logs; immutable `report_versions` và `audit_events` (chỉ append). DB migrations phải giữ và map được versions/audits hiện có, nếu không khả thi báo rõ blocker và làm migration kiểm chứng trên DB copy.

**Lưu file:** `storage/cases/{case_id}/{random_file_id}` với path server quản lý; an toàn path traversal, chỉ route có quyền truy cập mới stream file. JSON/PDF export được tạo server-side có metadata provenance.

---

## 5. ĐỊNH NGHĨA API CHI TIẾT

Giữ endpoint cũ khi khả thi; bổ sung routes REST dưới `/api`:

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/health` | Health và version |
| POST | `/api/auth/login` | Đăng nhập demo nếu dùng auth |
| GET | `/api/auth/me` | Identity và role |
| GET | `/api/dashboard/summary` | Số lượng thực từ DB |
| GET/POST | `/api/cases` | List (filter/search/page) / create |
| GET/PATCH | `/api/cases/{id}` | Detail / cập nhật metadata có kiểm soát |
| POST | `/api/cases/{id}/archive` | Soft archive, audit |
| POST | `/api/cases/{id}/files` | Upload multipart PDF/ảnh |
| GET | `/api/cases/{id}/files` | Danh sách tệp |
| GET | `/api/cases/{id}/files/{fileId}` | Stream file đúng ca/role |
| POST | `/api/cases/{id}/process` | Tạo run/job, chọn provider mock/no-model |
| GET | `/api/jobs/{jobId}` | Theo dõi tiến độ |
| GET | `/api/cases/{id}/runs` | Lịch sử xử lý |
| GET | `/api/cases/{id}/extraction` | Kết quả 5 trường theo run |
| GET | `/api/cases/{id}/predictions` | 3 nhãn theo run, có provenance |
| POST | `/api/cases/{id}/manual-extraction` | Thủ công thêm dữ liệu mô phỏng với nguồn |
| POST | `/api/cases/{id}/manual-predictions` | Điểm mô phỏng do người dùng nhập, có disclaimer |
| GET/POST | `/api/cases/{id}/reports` | List / tạo AI draft mới từ run |
| GET | `/api/cases/{id}/reports/{versionId}` | Đọc version |
| POST | `/api/cases/{id}/reports/{versionId}/edit` | Tạo version DOCTOR_EDITED |
| POST | `/api/cases/{id}/reports/{versionId}/approve` | Tạo DOCTOR_APPROVED |
| GET | `/api/cases/{id}/reports/compare?left=&right=` | Diff 2 version |
| GET | `/api/cases/{id}/reports/{versionId}/export?format=json|pdf` | Xuất JSON/PDF |
| GET/POST | `/api/cases/{id}/consultations` | Danh sách/tạo phiên |
| PATCH | `/api/cases/{id}/consultations/{consultId}` | Update status/biên bản |
| GET | `/api/cases/{id}/audit` | Audit timeline |
| GET | `/api/research/data-plan` | Dữ liệu công bố/kế hoạch/thực tế |
| GET | `/api/test-plan` | KPI mục tiêu + ma trận 30 test |
| GET | `/api/demo/config` | Cấu hình safe-to-expose; trạng thái Zoom |

**Chuẩn API:** Pydantic schemas; status code 200/201/202/400/401/403/404/409/413/415/422; error JSON `{code, message, details?, request_id}`; `limit`/`offset` hoặc cursor; auth và check ownership. Validate `case_id`, `fileId`, cross-case report version, role, file type/size và transition. `POST` không được bí mật tạo score giả nếu adapter trả unavailable. Cần tests cho request trùng lặp (idempotency) và concurrent editing (optimistic locking/version conflict).

---

## 6. FRONTEND UX — MỘT HỆ THỐNG THẬT, KHÔNG PHẢI TRANG TEST

### Dashboard & Case Management

- Trang đầu là dashboard với mục **Ca bệnh**, **Hồ sơ chờ xử lý**, **Báo cáo chờ duyệt**, **Phiên hội chẩn**, **Dữ liệu nghiên cứu**.
- Trang quản lý ca có nút `Tạo ca mới`, bảng/các card danh sách, search, filter, sort, pagination, empty/loading/errors, archive.
- Wizard tạo ca có **upload thật**, progress, file validation, retry, xem file; không cần `case_id` hardcoded.
- Ca mới tự động có trang chi tiết có file vừa tải, không mặc định nhảy vào DEMO-001.

### Case Detail & Clinical Review

- Header hiển thị `CASE-ID`, badge `MÔ PHỎNG`, trạng thái, thời điểm, người tạo; tab nội dung tương ứng dữ liệu thật.
- PDF viewer nhiều tài liệu, chọn trang, zoom, highlight, báo thiếu nguồn; click field phải nhảy đúng nguồn và có fallback khi không thể highlight.
- Xray viewer zoom/fit, pose PA/AP/UNKNOWN, 3 label score/mock state, bật overlays có legend; lỗi file phải hiển thị rõ, không có score nếu không chạy.
- Report composer từ run đã chọn, hiển thị đầy đủ nguồn và giới hạn. `Dữ liệu nào chưa có` phải hiện trong báo cáo, không tự ghi âm tính.
- Save/Approve bằng API, có loading/confirm, tránh double submit; history timeline, diff; xuất JSON và **PDF thật**.
- Consultation tab quản lý link Zoom, mở link đúng config HTTPS, biên bản sau hội chẩn.

### Chính sách làm rõ trạng thái

Luôn hiển thị ít nhất:

- **MOCK_FIXTURE:** đầu ra seed có sẵn theo hash, không phải mô hình tính.
- **MANUAL_DEMO_INPUT:** người dùng tự nhập, không phải AI.
- **REAL_TEXT_EXTRACTION:** hệ thống đọc được text từ PDF, nhưng chưa suy ra 5 trường y tế.
- **NOT_PROCESSED / MODEL_UNAVAILABLE / OCR_UNAVAILABLE:** chưa thể phân tích.
- **REAL_AI (sau này):** chỉ khi đã thực sự tích hợp và đo đúng, chưa dùng trong giai đoạn này.

Badge/mock note phải tồn tại trong UI, file xuất PDF/JSON và API. Không có đối tượng nào được render kết quả AI từ một fixture không khớp input hash của ca.

### Responsive & Accessibility

Desktop-first 1366×768, nhưng hoạt động trên tablet/mobile; nhãn form rõ, keyboard access, focus states, contrast, loading, error alerts. Không để hàng đống nút disabled không giải thích.

---

## 7. CÁC BỘ DỮ LIỆU MẪU ĐỂ BÁO CÁO THẦY

### 7.1. Seed tối thiểu 8 ca

| ID | Loại | Nội dung & kết quả mong đợi |
|---|---|---|
| `DEMO-001` | Bình thường có missing | PDF 2 trang, tiền sử tăng huyết áp, dị ứng missing, điểm mock 0.91/0.78/0.15, file ảnh minh họa PA |
| `DEMO-002` | Phủ định có nguồn | Dị ứng negative với câu phủ định nguyên văn, điểm mock khác DEMO-001 |
| `DEMO-003` | Nhiều ngày giờ | Ngày khám/nhập viện/chụp khác nhau, trích đúng `test_datetime` |
| `DEMO-SCAN-004` | Scan khó đọc | PDF scan, OCR fixture **hoặc unavailable**, không giả làm OCR thật |
| `DEMO-INCOMPLETE-005` | Thiếu trang | Cảnh báo thiếu trang, chỉ dùng nội dung còn tồn tại |
| `DEMO-BAD-IMAGE-006` | File ảnh hỏng | File không đọc được, prediction unavailable |
| `DEMO-AP-007` | Ngoài phạm vi | Ảnh AP, banner outside PA scope, không trả score giả mặc định |
| `DEMO-CONFLICT-008` | Mâu thuẫn | Hai trích dẫn hồ sơ trái nhau, báo cần bác sĩ xác minh |

- Sinh hồ sơ mock tiếng Việt bằng ReportLab hoặc thư viện đang có, **font tiếng Việt thực**; file hiển thị và text extraction được test.
- Chia dữ liệu demo thành `fixtures/` (mã ca, ground truth, scores, nguồn), `assets/` (PDF, ảnh có phép). Seed idempotent không ghi đè report người dùng đã sửa.
- Với trường `missing` không cần quote; với `present` hoặc `negative` phải có quote đúng file/trang; với `conflicting` phải lưu **cả hai nguồn**.
- Sử dụng ảnh do project sở hữu hoặc giấy phép rõ; ảnh minh họa không khẳng định các score tương ứng với bệnh lý thật. Mỗi ảnh có `source_url/license/attribution` nếu cần.
- Có thể bổ sung thêm 3–5 hồ sơ biểu mẫu, bảng thuốc, scan mờ, ảnh sai định dạng để demo robustness, nhưng **không tự tuyên bố bộ 100 hồ sơ đã được chuyên gia đánh giá**.

### 7.2. 3 sản phẩm yêu cầu từ thầy — phải dựng thành màn demo sẵn

**Sản phẩm A — Báo cáo mẫu có dẫn nguồn**:
- Có chỗ mở PDF trái, trích xuất phải, bấm “tiền sử” nhảy trang/câu.
- Chứng minh rõ `missing` khác `negative`, ví dụ DEMO-001 vs DEMO-002.

**Sản phẩm B — Một ảnh và ba điểm số**:
- Một ảnh PA được phép hiển thị, ba score mock và ngưỡng demo, legend vùng minh họa.
- Có nút mở một ví dụ **overlay lệch vùng** để thảo luận giới hạn mô hình; vì chưa có Grad-CAM thật, chỉ gọi là *minh họa lỗi định vị*, **không** nói là kết quả Grad-CAM đã đo.
- Nếu có box chuyên gia hợp pháp từ nguồn ảnh cho phép thì ghi `expert_annotation` có attribution; nếu không, dùng `illustrative_marker` phân biệt rõ.

**Sản phẩm C — Lịch sử trước/sau bác sĩ sửa**:
- Phiên bản AI DRAFT, DOCTOR_EDITED, DOCTOR_APPROVED của một ca có thể tương tác; có diff, người duyệt DEMO, timestamp.
- Tạo file export PDF và JSON chứa trạng thái mock, câu nguồn, actor và provenance.

### 7.3. Bảng dữ liệu nghiên cứu tách bạch

VinDr-CXR chính thức: **15.000 train + 3.000 test = 18.000 ảnh**. Kế hoạch lấy **3.000–5.000 từ train chính thức** cho giai đoạn đầu. Ví dụ `3.200 train nội bộ + 800 validation nội bộ` là **kế hoạch minh họa**, không phải đã chạy. Test chính thức không dùng để tuning.

| Tập | Số lượng | Mục đích | Cardiomegaly + | Pleural Effusion + | Lung Opacity + |
|---|---:|---|---|---|---|
| Official training | 15.000 | Tập nguồn phát triển | Chưa thống kê theo quy tắc thống nhất | Chưa thống kê | Chưa thống kê |
| Planned sub-train | 3.200 (ví dụ) | Training baseline | Chưa thống kê | Chưa thống kê | Chưa thống kê |
| Planned validation | 800 (ví dụ) | Chọn checkpoint/ngưỡng | Chưa thống kê | Chưa thống kê | Chưa thống kê |
| Official test | 3.000 | Final independent test | Chưa thống kê | Chưa thống kê | Chưa thống kê |

Phần dữ liệu phải cho phép gắn trạng thái `published`, `planned`, `measured`; bảng ca dương thực tế **chỉ có số khi đã nhập từ annotation và quy tắc được chốt**. Không nhập số tưởng tượng hoặc suy ra từ tỷ lệ công bố rồi gọi là số mẫu đã chọn.

**Quy tắc đa chuyên gia phải sửa lỗi của bản cũ:** VinDr-CXR train có **3 lượt đọc/bác sĩ độc lập trên mỗi ảnh** (nếu chọn majority nhị phân ở mức ảnh thì ít nhất **2/3**, không phải 3/5). Test có quá trình đồng thuận **5 bác sĩ**, không tự xem là 5 nhãn độc lập để bỏ phiếu 3/5 nếu ground truth test đã được giải quyết bằng consensus. Với box, cách gộp IoU cần thiết kế riêng, không mặc định majority box bằng một con số đơn lẻ. Ghi rõ quy tắc đang *đề xuất*, cần xác nhận từ tài liệu và thầy trước khi tạo labels thực.

Hồ sơ: tối thiểu **100 hồ sơ test độc lập theo mục tiêu MT1**, nên có tập hồ sơ phát triển riêng. Tám ca demo không được tính là kết quả kiểm thử F1. Có thể cung cấp `data_templates/record_ground_truth_template.csv` và script validate để nhập dữ liệu sau.

---

## 8. TIÊU CHÍ ĐÁNH GIÁ, KIỂM THỬ VÀ THỐNG KÊ

### 8.1. Ba mục tiêu MT1/MT2/MT3

| Nhóm | KPI mục tiêu (chưa có kết quả thật) | Điều kiện báo cáo |
|---|---|---|
| MT1 | F1 ≥0.90 trên ≥100 hồ sơ test | F1 theo từng trường; tách citation coverage vs citation correctness |
| MT1 | 100% trường có nguồn hoặc thiếu dữ liệu | Nguồn chính xác, thiếu/negative rõ |
| MT2 | Macro-AUROC ≥0.85 | Test độc lập; AUROC từng nhãn + số dương |
| MT2 | Sensitivity ≥0.85 tại Specificity ≥0.75 | Threshold từng nhãn chốt validation, báo test |
| MT2 | ≥90% nhận định có căn cứ | Rubric và chuyên gia xác nhận trên mẫu độc lập |
| MT3 | ≥95% của 30 test scenarios | 29/30 = 96.7%, ghi PASS/FAIL có bằng chứng |
| MT3 | p95 ≤60s | Tính từ upload hoàn tất đến AI Draft ready, 2 trang + 1 ảnh, cấu hình máy và số lượt đo |
| MT3 | Lưu đầy đủ bản AI và bác sĩ | Versioning + audit + DB persistence |

**Không dùng 18 pytest để tuyên bố 18/30 hoặc ≥95% của 30 nghiệp vụ nếu chưa có ánh xạ và chạy đủ.** Đây là hai mức kiểm thử khác nhau. Có thể đo tốc độ mock workflow nhưng dán nhãn `MOCK SYSTEM LATENCY`, không thay thế KPI thời gian khi tích hợp AI thật.

### 8.2. Tối thiểu 30 kịch bản nghiệp vụ để Agent cài test

| ID | Kịch bản kiểm thử |
|---|---|
| TC01 | Login demo và role |
| TC02 | List cases và pagination |
| TC03 | Create case mới |
| TC04 | Upload PDF 2 trang |
| TC05 | Upload ảnh hợp lệ |
| TC06 | Reject PDF sai MIME / binary |
| TC07 | Reject upload quá dung lượng |
| TC08 | Tránh path traversal filename |
| TC09 | Chuyển đúng trang PDF từ citation |
| TC10 | Highlight/trích dẫn đúng quote |
| TC11 | Phân biệt missing và negative |
| TC12 | Conflict có hai nguồn |
| TC13 | Run mock trên file fixture khớp hash |
| TC14 | File mới không fixture → unavailable thay vì score giả |
| TC15 | Ba nhãn đa nhãn và disclaimer mock |
| TC16 | Ngoài phạm vi PA → cảnh báo/chặn |
| TC17 | File ảnh hỏng → không score |
| TC18 | Thiếu trang → không bịa nội dung |
| TC19 | Create AI Draft từ run |
| TC20 | AI Draft bất biến sau edit |
| TC21 | Tạo doctor edited version |
| TC22 | Approval cần quyền clinician + confirm |
| TC23 | Approved bất biến, sửa tiếp tạo bản mới |
| TC24 | History + diff giữa hai bản |
| TC25 | Xuất JSON đúng case/version/mock flag |
| TC26 | Xuất PDF đúng case/version/mock flag |
| TC27 | Tạo phiên Zoom dạng link HTTPS, không gửi PHI |
| TC28 | Consultations notes và status được lưu |
| TC29 | Restart/F5 giữ case, version, audit |
| TC30 | Cross-case access/IDOR bị từ chối |

Bổ sung tests về concurrent edit, duplicate submit, state transition, SQL injection, XSS trong PDF/title/report, CORS và hành vi public session. Với frontend viết Vitest và ít nhất một Playwright E2E từ `Create Case` đến `Approved` khi môi trường cho phép. Lưu log test, thời gian, cấu hình và test command vào `docs/TEST_REPORT.md`.

### 8.3. Khuyến nghị UX cho buổi báo cáo

- Một nút **“Trình diễn theo nhận xét GVHD”** mở sẵn DEMO-001 và dẫn tour các bước; không che giấu phần đang mock.
- Có mục “Nguồn” hiển thị câu gốc khi bấm trường.
- Có một case lỗi và một case phủ định có nguồn để chuyển nhanh.
- Bảng dữ liệu nghiên cứu có legend `Công bố`, `Kế hoạch`, `Chưa thống kê`, `Thực đo`.
- Có slide/demo page hiển thị URL thật và QR **chỉ sau khi deploy kiểm chứng**.

---

## 9. TRIỂN KHAI AN TOÀN, CẤU HÌNH VÀ TÀI LIỆU

### 9.1. Cấu hình mẫu

```env
APP_ENV=development
DEMO_MODE=true
DATABASE_URL=sqlite:///./storage/telemedicine_demo.db
UPLOAD_DIR=./storage/cases
MAX_UPLOAD_MB=20
MAX_PDF_PAGES=20
CORS_ORIGINS=http://localhost:5173
ZOOM_MEETING_URL=
PUBLIC_DEMO_URL=
MOCK_PROVIDER=fixture_only
# PUBLIC AUTH: define secret through deployment, never commit it
SESSION_SECRET=
```

Không commit `.env`, SQLite chứa dữ liệu người dùng, file upload thực tế hoặc API keys. Cấu hình public cần persistence và xác thực; không dùng SQLite ephemeral mất DB trên restart. Không mặc định enable public anonymous write.

### 9.2. README phải có

- Architecture và sơ đồ module.
- Requirements (Python/Node), setup Windows PowerShell, seed/migrations, chạy backend/frontend, tests.
- Tài khoản demo và cách reset mật khẩu/seed an toàn; không commit mật khẩu dùng cho public.
- Giải thích fixture match và vì sao upload ảnh mới **không có score AI**.
- Hướng dẫn thêm ảnh có phép sử dụng và hồ sơ mô phỏng.
- Hướng dẫn deploy frontend/backend/DB, cấu hình CORS, link demo, QR.
- Giới hạn sản phẩm y tế, không dùng lâm sàng.

### 9.3. Deliverables bắt buộc

1. Code **nâng cấp ngay trên repo hiện có**, giữ các trang/tab và chức năng đang chạy.
2. Migration DB + backup guidance; no destructive reset.
3. 8 seed cases có assets/ground truth nhất quán và quyền sử dụng rõ.
4. `UPGRADE_TASKS.md`, `docs/UPGRADE_DESIGN.md`, `docs/API.md`, `docs/DATA_DICTIONARY.md`.
5. `docs/FEATURE_MATRIX.md`: chức năng thật / mock / chưa có.
6. `docs/DEMO_SCRIPT.md`: walkthrough 5–7 phút cho giảng viên; link và QR có điều kiện.
7. `docs/DATA_SPLIT_PLAN.md` + sample ground truth template cho hồ sơ.
8. `docs/TEST_PLAN.md` 30 cases + `docs/TEST_REPORT.md` kết quả chạy thực tế.
9. `docs/DEPLOY.md`, `.env.example`, README cập nhật.
10. Ảnh chụp màn hình sản phẩm A/B/C **từ ứng dụng thực** nếu môi trường cho phép; không dùng mockup như bằng chứng đã triển khai.

---

## 10. KẾ HOẠCH THỰC THI THEO ƯU TIÊN

### U0 — Khảo sát, lập kế hoạch và bảo toàn dữ liệu

- [ ] Inventory repo, thống kê đúng những gì hiện chạy, dependencies và tests hiện có.
- [ ] Tạo `UPGRADE_TASKS.md`, `UPGRADE_DESIGN.md`, lập migration/backup.
- [ ] Chạy suite cũ, lưu baseline trước thay đổi (bao gồm 18 pytest đã được báo cáo, xác minh lại thực tế).

### U1 — Nâng cấp domain, DB, file upload và quản lý ca

- [ ] Migration tương thích; models case/files/jobs/runs/users/consultations.
- [ ] Dashboard, create case, search/filter/pagination/archive.
- [ ] File upload/validation/preview thực sự, không hardcode.
- [ ] Auth/roles tối thiểu và kiểm tra quyền backend; local demo khởi động thuận tiện.

### U2 — Mock AI adapter & kết quả có nguồn

- [ ] Fixture matching theo file hash và ID, no-model fallback, manual demo entry.
- [ ] Text extraction thật từ PDF có text (nếu khả thi) và nguồn; OCR scan vẫn mock/unavailable.
- [ ] Xray viewer hỗ trợ file mới và scope PA, markers có provenance.
- [ ] Job/run state, retry, warnings và history.

### U3 — Workflow báo cáo + phiên hội chẩn

- [ ] Report composer từ analysis run; AI Draft immutable.
- [ ] Edit/approve, audit log, diff, conflict control.
- [ ] Xuất JSON + PDF, consultation schedule/link/status/notes.

### U4 — Seed và data/KPI theo nhận xét thầy

- [ ] Tám ca seed chính xác, PDF/quote khớp, dữ liệu giả rõ.
- [ ] Đầy đủ 3 sản phẩm thầy yêu cầu, màn tour/quick switch.
- [ ] Research table published/planned/measured, quy tắc train readers/test consensus.
- [ ] Test plan F1/citation/AUROC/p95/30 business scenarios, không claim kết quả AI.

### U5 — Regression, E2E, bàn giao và link demo

- [ ] Chạy suite hiện có và test mới, sửa lỗi.
- [ ] Kiểm tra F5/restart, DB persistence, lỗi, phân quyền, upload, PDF export.
- [ ] Viết tài liệu, báo cáo PASS/FAIL/limitations.
- [ ] Nếu có môi trường và quyền deploy, triển khai và xác minh URL bằng trình duyệt khác; nếu không có, hướng dẫn deploy, không bịa link.

**Nếu bị giới hạn thời gian:** ưu tiên U0 → U1 → U2 → U3 → U4; không bỏ integrity checks chỉ để thêm UI. Khi kết thúc, báo cáo chi tiết phần hoàn thành và chưa hoàn thành thay vì khẳng định đã xong toàn bộ.

---

## 11. NGHIỆM THU CUỐI CÙNG (DEFINITION OF DONE)

### PASS luồng mới

`Login demo → Dashboard → Tạo ca mới → Upload hồ sơ + ảnh → Xem file → Phân tích (mock fixture nếu khớp / unavailable nếu không) → Xem nguồn/3 nhãn (nếu fixture) → Tạo draft → Chỉnh sửa → Bác sĩ demo duyệt → Xuất PDF & JSON → Tạo phiên hội chẩn → Lưu biên bản → Tìm lại ca → Restart vẫn còn đầy đủ`.

### PASS sản phẩm theo thầy

- [ ] **Một báo cáo mẫu có thể click xem đoạn nguồn**; quote và trang tồn tại thật.
- [ ] **Một ảnh + 3 điểm số** có nguồn provenance và label MOCK, không bịa Grad-CAM/khung chuyên gia.
- [ ] **Một báo cáo trước và sau bác sĩ chỉnh sửa** với actor/time/immutable version/diff và bản lưu.
- [ ] **Bảng chia tập và số ca dương theo nhãn** phân biệt số công bố, kế hoạch và thực tế.
- [ ] **Một tình huống lỗi** (thiếu trang/ảnh hỏng) và một tình huống `negative` được minh họa.
- [ ] **Link demo thật trong slide**, nếu đã deploy; nếu chưa deploy, ghi rõ blocker và cung cấp hướng dẫn.
- [ ] **Tình trạng KPI trung thực**; không lấy 30 integration tests hay điểm mock làm kết quả AI.

### Không được tự nhận hoàn thành khi

- Website chỉ xem ca seed, không tạo được ca mới hoặc upload/lưu thật.
- Upload mọi ảnh đều trả 0.91/0.78/0.15 dù không có mô hình thật.
- Frontend sửa thành công nhưng F5 mất dữ liệu hoặc bản AI Draft bị overwrite.
- Tài khoản viewer có thể approve bằng sửa request API.
- Có PDF report trên UI nhưng file tải về không tạo được.
- Có Grad-CAM hay annotation “chuyên gia” chỉ từ hình vẽ giả lập.
- Các kết quả mock bị hiểu nhầm là dữ liệu lâm sàng đã được chứng thực.

---

## 12. MẪU LỆNH ĐỂ GIAO VIỆC CHO AGENT

```text
Bạn đang làm việc TRỰC TIẾP trên repository Telemedicine AI hiện có. Hãy đọc toàn bộ TELEMEDICINE_AI_FULL_SYSTEM_UPGRADE_SPEC.md và đối chiếu TELEMEDICINE_AI_DEMO_SPEC.md cùng code thực tế.

Mục tiêu: nâng cấp prototype với các trang demo đã có thành HỆ THỐNG NGHIỆP VỤ HOÀN CHỈNH. Giữ nguyên và mở rộng code cũ. Cho phép quản lý nhiều ca, tạo ca và upload file thật, xử lý qua adapter mock/no-model an toàn, trích dẫn PDF, viewer X-quang, tạo/sửa/duyệt/lưu phiên bản báo cáo, hội chẩn bằng link Zoom, lưu trữ và xuất JSON/PDF; thêm 8 ca seed, dữ liệu nghiên cứu và 30 kịch bản kiểm thử.

AI hồ sơ và AI X-quang CHƯA triển khai thật; TUYỆT ĐỐI không nhận dữ liệu mới rồi gắn kết quả fixture như suy luận thật. Mock phải rõ trong UI/API/PDF/JSON. Không tuyên bố đạt F1, AUROC hoặc độ trễ production.

BƯỚC 1: Khảo sát repository, chạy tests hiện có, lập UPGRADE_TASKS.md và UPGRADE_DESIGN.md; nêu các migration cần thiết và các rủi ro.
BƯỚC 2: Triển khai lần lượt U1→U5 theo đặc tả, chạy test sau từng phần, không phá dữ liệu/version cũ.
BƯỚC 3: Tạo báo cáo nghiệm thu có liệt kê từng tính năng Real/Mock/Not implemented, số test thực chạy, bug còn lại, lệnh chạy local và các việc cần thực hiện để deploy link demo.

Hãy trực tiếp chỉnh sửa code và thử nghiệm trong môi trường repo. Không chỉ trả lời bằng kế hoạch hoặc tạo trang thiết kế tĩnh.
```

---

**Ghi chú kết thúc:** Tài liệu này nhằm phục vụ seminar và nghiên cứu sinh viên, không phải đặc tả phần mềm y tế được xác nhận tuân thủ pháp lý cho triển khai bệnh viện. Mọi dữ liệu và tài khoản demo phải phi định danh, có nguồn gốc hợp lệ và không dùng để ra quyết định điều trị.
