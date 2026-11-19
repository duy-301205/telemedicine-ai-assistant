import os
import io
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

font_path = "C:/Windows/Fonts/arial.ttf"
font_bold_path = "C:/Windows/Fonts/arialbd.ttf"
if os.path.exists(font_path):
    try:
        pdfmetrics.registerFont(TTFont("ArialVN", font_path))
        pdfmetrics.registerFont(TTFont("ArialVNBold", font_bold_path if os.path.exists(font_bold_path) else font_path))
        MAIN_FONT = "ArialVN"
        BOLD_FONT = "ArialVNBold"
    except Exception:
        MAIN_FONT = "Helvetica"
        BOLD_FONT = "Helvetica-Bold"
else:
    MAIN_FONT = "Helvetica"
    BOLD_FONT = "Helvetica-Bold"

def generate_report_pdf_bytes(report_data: dict, case_data: dict) -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Top Header
    c.setFont(BOLD_FONT, 13)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — TRUNG TÂM TELEMEDICINE")
    c.setFont(MAIN_FONT, 10)
    c.drawString(50, height - 68, "BÁO CÁO SƠ BỘ CHUẨN BỊ HỘI CHẨN Y TẾ TỪ XA")
    c.line(50, height - 75, width - 50, height - 75)

    # Watermark
    c.setFont(BOLD_FONT, 10)
    c.setFillColorRGB(0.85, 0.2, 0.1)
    c.drawString(50, height - 95, "DEMO / MOCK PROTOTYPE — KHÔNG SỬ DỤNG CHO QUYẾT ĐỊNH LÂM SÀNG")
    c.setFillColorRGB(0, 0, 0)

    # Case & Version Metadata Table
    c.setFont(BOLD_FONT, 10)
    c.drawString(50, height - 125, f"Mã ca: {case_data.get('id', 'N/A')}")
    c.drawString(220, height - 125, f"Bệnh nhân: {case_data.get('patient_name_demo', 'N/A')}")
    c.drawString(420, height - 125, f"Tuổi/Giới: {case_data.get('age', '--')} / {case_data.get('gender', '--')}")

    status_str = report_data.get("status", "AI_DRAFT")
    c.drawString(50, height - 145, f"Phiên bản: Version {report_data.get('version_number', 1)} ({status_str})")
    c.drawString(220, height - 145, f"Người thực hiện: {report_data.get('actor_label', 'Bác sĩ Demo')}")
    c.drawString(420, height - 145, f"Thời điểm: {str(report_data.get('created_at', ''))[:19]}")

    c.setStrokeColorRGB(0.8, 0.8, 0.8)
    c.line(50, height - 155, width - 50, height - 155)

    content = report_data.get("content", {})
    y = height - 180

    def draw_section(title, text, max_lines=4):
        nonlocal y
        if y < 100:
            c.showPage()
            y = height - 60
        c.setFont(BOLD_FONT, 10)
        c.setFillColorRGB(0.1, 0.3, 0.6)
        c.drawString(50, y, title)
        c.setFillColorRGB(0, 0, 0)
        y -= 16

        c.setFont(MAIN_FONT, 9)
        lines = str(text).split("\n")
        for line in lines[:max_lines]:
            while len(line) > 95:
                c.drawString(60, y, line[:95])
                line = line[95:]
                y -= 13
            c.drawString(60, y, line)
            y -= 13
        y -= 8

    draw_section("I. TÓM TẮT TÌNH TRẠNG CA BỆNH", content.get("summary", "Không có tóm tắt."))
    draw_section("II. GHI CHÚ LÂM SÀNG & TIỀN SỬ DỊ ỨNG", content.get("clinical_notes", "Chưa ghi nhận."))
    draw_section("III. QUAN SÁT VÀ PHÂN TÍCH X-QUANG SƠ BỘ", content.get("xray_observations", "Chưa phân tích."))
    
    pts = content.get("attention_points", [])
    pts_text = "\n".join([f"• {p}" for p in pts]) if pts else "Không có lưu ý đặc biệt."
    draw_section("IV. CÁC ĐIỂM CẦN BÁC SĨ HỘI CHẨN LƯU Ý", pts_text, max_lines=6)

    draw_section("V. ĐỀ XUẤT KẾ HOẠCH HỘI CHẨN", content.get("recommended_action", "Hội chẩn theo lịch hẹn."))

    # Citations attached
    refs = content.get("source_references", [])
    if refs and y > 120:
        c.setFont(BOLD_FONT, 9)
        c.setFillColorRGB(0.2, 0.2, 0.2)
        c.drawString(50, y, "VI. CÁC ĐOẠN TRÍCH DẪN NGUỒN ĐỐI CHIẾU:")
        y -= 14
        c.setFont(MAIN_FONT, 8)
        for r in refs[:4]:
            c.drawString(60, y, f"- {r.get('field', '')} (Trang {r.get('page', 1)}): \"{r.get('quote', '')[:80]}\"")
            y -= 12

    # Signature Footer
    c.setFont(BOLD_FONT, 9)
    c.drawString(width - 200, 75, "BÁC SĨ THẨM ĐỊNH (DEMO)")
    c.setFont(MAIN_FONT, 8)
    c.drawString(width - 200, 60, f"{report_data.get('actor_label', 'Bác sĩ Demo')}")
    c.drawString(width - 200, 48, "Xác nhận đối chiếu lâm sàng")

    c.setFont(MAIN_FONT, 8)
    c.setFillColorRGB(0.5, 0.5, 0.5)
    c.drawString(50, 45, f"Bản in xuất từ hệ thống Telemedicine AI — ID: {report_data.get('id', 'N/A')}")

    c.save()
    buffer.seek(0)
    return buffer.getvalue()
