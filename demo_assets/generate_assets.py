import os
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import pypdf

ASSETS_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Register Vietnamese Font
font_path = "C:/Windows/Fonts/arial.ttf"
font_bold_path = "C:/Windows/Fonts/arialbd.ttf"
if os.path.exists(font_path):
    pdfmetrics.registerFont(TTFont("ArialVN", font_path))
    pdfmetrics.registerFont(TTFont("ArialVNBold", font_bold_path if os.path.exists(font_bold_path) else font_path))
    MAIN_FONT = "ArialVN"
    BOLD_FONT = "ArialVNBold"
else:
    MAIN_FONT = "Helvetica"
    BOLD_FONT = "Helvetica-Bold"

def generate_pdf_demo_001():
    pdf_path = os.path.join(ASSETS_DIR, "sample_case_2pages.pdf")
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    # ---------------- PAGE 1 ----------------
    c.setFont(BOLD_FONT, 14)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — TRUNG TÂM TELEMEDICINE")
    c.setFont(MAIN_FONT, 10)
    c.drawString(50, height - 68, "HỆ THỐNG TRỢ LÝ AI HỖ TRỢ CHUẨN BỊ HỘI CHẨN (PROTOTYPE DEMO)")
    c.line(50, height - 75, width - 50, height - 75)

    c.setFont(BOLD_FONT, 12)
    c.setFillColorRGB(0.8, 0.1, 0.1)
    c.drawString(50, height - 105, "MÃ CA: DEMO-001 — HỒ SƠ MÔ PHỎNG, KHÔNG PHẢI BỆNH NHÂN THẬT")
    c.setFillColorRGB(0, 0, 0)

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 135, "I. THÔNG TIN HÀNH CHÍNH")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 155, "Họ và tên: Nguyễn Văn Giả Định (Demo)")
    c.drawString(300, height - 155, "Tuổi: 68     Giới tính: Nam")
    c.drawString(60, height - 175, "Khoa phòng: Nội Hô hấp — Hội chẩn từ xa")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 210, "II. BỆNH SỬ VÀ LÝ DO KHÁM")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 230, "Triệu chứng: Bệnh nhân ho khan, khó thở trong 3 ngày.")
    c.drawString(60, height - 250, "Bệnh nhân cảm thấy mệt mỏi tăng dần khi gắng sức, không sốt, không đau ngực dữ dội.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 285, "III. TIỀN SỬ BỆNH")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 305, "Tiền sử: Tăng huyết áp.")
    c.drawString(60, height - 325, "Được chẩn đoán tăng huyết áp 5 năm trước, điều trị ngoại trú định kỳ.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 360, "IV. ĐIỀU TRỊ HIỆN TẠI VÀ THUỐC ĐANG DÙNG")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 380, "Thuốc đang dùng: Amlodipine 5 mg/ngày.")
    c.drawString(60, height - 400, "Tuân thủ uống thuốc vào buổi sáng sau ăn.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 435, "V. TÌNH TRẠNG DỊ ỨNG")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 455, "(Mục này không có ghi nhận thông tin trong hồ sơ ban đầu)")

    c.setFont(MAIN_FONT, 9)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.line(50, 60, width - 50, 60)
    c.drawString(50, 45, "Trang 1 / 2 — DEMO-001 — Dữ liệu giả lập kỹ thuật")
    c.drawRightString(width - 50, 45, "Bảo mật: MÔ PHỎNG NỘI BỘ")

    c.showPage()

    # ---------------- PAGE 2 ----------------
    c.setFillColorRGB(0, 0, 0)
    c.setFont(BOLD_FONT, 14)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — PHIẾU CẬN LÂM SÀNG & GHI CHÚ")
    c.setFont(MAIN_FONT, 10)
    c.drawString(50, height - 68, "MÃ CA HỒ SƠ: DEMO-001 (TIẾP THEO)")
    c.line(50, height - 75, width - 50, height - 75)

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 105, "VI. CHỈ ĐỊNH CHẨN ĐOÁN HÌNH ẢNH")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 125, "Thời điểm chụp X-quang: 15/11/2026, 08:30 (giờ Việt Nam).")
    c.drawString(60, height - 145, "Kỹ thuật: Chụp X-quang ngực thẳng tư thế sau - trước (PA view).")
    c.drawString(60, height - 165, "Chỉ định thực hiện bởi: BS. Khám Sơ Bộ.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 205, "VII. GHI CHÚ PHÁP LÝ VÀ PHẠM VI HỆ THỐNG DEMO")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 225, "Ghi chú: Đây là hồ sơ biên soạn phục vụ demo kỹ thuật. Ảnh X-quang minh họa được ghép rời, KHÔNG phải phim của bệnh nhân trong hồ sơ.")
    c.drawString(60, height - 250, "Cảnh báo an toàn y tế:")
    c.drawString(70, height - 270, "1. Toàn bộ điểm số phân tích và đề xuất văn bản do AI sinh ra chỉ là dữ liệu giả lập (MOCK).")
    c.drawString(70, height - 290, "2. Không sử dụng kết quả này trực tiếp cho quyết định điều trị, chỉ định thuốc hoặc can thiệp y khoa.")
    c.drawString(70, height - 310, "3. Bác sĩ hội chẩn chịu trách nhiệm thẩm định và xác nhận cuối cùng trước khi đưa vào biên bản hội chẩn.")

    c.setFont(MAIN_FONT, 9)
    c.setFillColorRGB(0.4, 0.4, 0.4)
    c.line(50, 60, width - 50, 60)
    c.drawString(50, 45, "Trang 2 / 2 — DEMO-001 — Dữ liệu giả lập kỹ thuật")
    c.drawRightString(width - 50, 45, "Hết hồ sơ DEMO-001")

    c.save()
    print(f"Generated: {pdf_path}")


def generate_pdf_demo_missing_page():
    pdf_path = os.path.join(ASSETS_DIR, "sample_case_missing_page.pdf")
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    c.setFont(BOLD_FONT, 14)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — CA THIẾU TRANG (DEMO-MISSING-PAGE)")
    c.setFont(MAIN_FONT, 10)
    c.drawString(50, height - 68, "HỆ THỐNG TRỢ LÝ AI HỖ TRỢ CHUẨN BỊ HỘI CHẨN")
    c.line(50, height - 75, width - 50, height - 75)

    c.setFont(BOLD_FONT, 12)
    c.setFillColorRGB(0.8, 0.2, 0)
    c.drawString(50, height - 105, "MÃ CA: DEMO-MISSING-PAGE — TÌNH HUỐNG LỖI HỒ SƠ KHÔNG ĐỦ TRANG")
    c.setFillColorRGB(0, 0, 0)

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 135, "I. THÔNG TIN HÀNH CHÍNH")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 155, "Họ tên: Trần Văn Thiếu (Demo)    Tuổi: 55    Giới: Nam")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 190, "II. TRIỆU CHỨNG")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 210, "Triệu chứng: Sốt nhẹ và đau tức ngực âm ỉ.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 245, "III. CẢNH BÁO TỆP HỒ SƠ")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 265, "Tệp quét chỉ gồm 1 trang. Hồ sơ gốc yêu cầu tối thiểu 2 trang (thiếu trang kết quả xét nghiệm).")

    c.line(50, 60, width - 50, 60)
    c.drawString(50, 45, "Trang 1 / 1 (THIẾU TRANG 2)")
    c.save()
    print(f"Generated: {pdf_path}")


def generate_pdf_demo_002_negative_allergy():
    pdf_path = os.path.join(ASSETS_DIR, "sample_case_negative_allergy.pdf")
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    # Page 1
    c.setFont(BOLD_FONT, 14)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — CA DEMO-002 (CÓ PHỦ ĐỊNH RÕ RÀNG)")
    c.setFont(MAIN_FONT, 10)
    c.drawString(50, height - 68, "PHÂN BIỆT RÕ GIỮA DỮ LIỆU THIẾU (MISSING) VÀ PHỦ ĐỊNH (NEGATIVE)")
    c.line(50, height - 75, width - 50, height - 75)

    c.setFont(BOLD_FONT, 12)
    c.drawString(50, height - 105, "MÃ CA: DEMO-002 — HỒ SƠ ĐỐI CHỨNG DỊ ỨNG")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 135, "I. TRIỆU CHỨNG LÂM SÀNG")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 155, "Triệu chứng: Khó thở nhẹ khi leo cầu thang, ho ít đờm trắng.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 190, "II. TIỀN SỬ BỆNH")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 210, "Tiền sử: Đái tháo đường type 2 đang theo dõi định kỳ.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 245, "III. THUỐC ĐANG DÙNG")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 265, "Thuốc đang dùng: Metformin 500 mg x 2 viên/ngày.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 300, "IV. TIỀN SỬ DỊ ỨNG")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 320, "Dị ứng: Không ghi nhận tiền sử dị ứng thuốc hay thức ăn.")

    c.line(50, 60, width - 50, 60)
    c.drawString(50, 45, "Trang 1 / 2 — DEMO-002")
    c.showPage()

    # Page 2
    c.setFont(BOLD_FONT, 14)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — PHIẾU CẬN LÂM SÀNG DEMO-002")
    c.line(50, height - 75, width - 50, height - 75)
    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 105, "V. THỜI ĐIỂM CHỤP PHIM")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 125, "Thời điểm chụp X-quang: 16/11/2026, 09:15 (giờ Việt Nam).")
    c.line(50, 60, width - 50, 60)
    c.drawString(50, 45, "Trang 2 / 2 — DEMO-002")
    c.save()
    print(f"Generated: {pdf_path}")


def generate_pdf_demo_003_timestamps():
    """DEMO-003: Nhiều mốc thời gian khác nhau để kiểm tra trích xuất đúng test_datetime"""
    pdf_path = os.path.join(ASSETS_DIR, "sample_case_demo003_timestamps.pdf")
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    # Page 1
    c.setFont(BOLD_FONT, 14)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — CA DEMO-003 (NHIỀU MỐC THỜI GIAN)")
    c.setFont(MAIN_FONT, 10)
    c.drawString(50, height - 68, "KIỂM TRA PHÂN BIỆT THỜI ĐIỂM XÉT NGHIỆM VS THỜI ĐIỂM KHÁM / NHẬP VIỆN")
    c.line(50, height - 75, width - 50, height - 75)

    c.setFont(BOLD_FONT, 12)
    c.drawString(50, height - 105, "MÃ CA: DEMO-003 — ĐẶC TẢ MỐC THỜI GIAN")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 135, "I. QUÁ TRÌNH DIỄN BIẾN LÂM SÀNG VÀ TIẾP NHẬN")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 155, "Thời điểm khám ban đầu: 10/11/2026, 08:00 tại phòng khám Ngoại trú.")
    c.drawString(60, height - 175, "Thời điểm nhập viện: 12/11/2026, 14:30 chuyển khoa Nội Tim Mạch.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 205, "II. BỆNH SỬ")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 225, "Triệu chứng: Đau tức ngực trái khi vận động nhẹ, kèm theo khó thở.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 255, "III. TIỀN SỬ BỆNH VÀ THUỐC")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 275, "Tiền sử: Bệnh mạch vành đặt stent năm 2021.")
    c.drawString(60, height - 295, "Thuốc đang dùng: Clopidogrel 75 mg/ngày, Atorvastatin 20 mg/ngày.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 325, "IV. DỊ ỨNG")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 345, "Dị ứng: Không ghi nhận tiền sử dị ứng thuốc.")

    c.line(50, 60, width - 50, 60)
    c.drawString(50, 45, "Trang 1 / 2 — DEMO-003")
    c.showPage()

    # Page 2
    c.setFont(BOLD_FONT, 14)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — PHIẾU CẬN LÂM SÀNG DEMO-003")
    c.line(50, height - 75, width - 50, height - 75)

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 105, "V. THỜI ĐIỂM THỰC HIỆN X-QUANG PHỔI")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 125, "Thời điểm chụp X-quang: 14/11/2026, 10:15 (giờ Việt Nam).")
    c.drawString(60, height - 145, "Yêu cầu: Trích xuất đúng mốc 14/11/2026 10:15 thay vì ngày khám 10/11 hay nhập viện 12/11.")

    c.line(50, 60, width - 50, 60)
    c.drawString(50, 45, "Trang 2 / 2 — DEMO-003")
    c.save()
    print(f"Generated: {pdf_path}")


def generate_pdf_demo_scan004():
    """DEMO-SCAN-004: Hồ sơ mô phỏng scan (OCR Unavailable / Mock fixture)"""
    pdf_path = os.path.join(ASSETS_DIR, "sample_case_scan004.pdf")
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    c.setFont(BOLD_FONT, 14)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — CA DEMO-SCAN-004")
    c.setFont(MAIN_FONT, 10)
    c.drawString(50, height - 68, "BẢN SCAN TÀI LIỆU CHỮ VIẾT TAY / CHẤT LƯỢNG MỜ (OCR UNAVAILABLE)")
    c.line(50, height - 75, width - 50, height - 75)

    c.setFont(BOLD_FONT, 12)
    c.setFillColorRGB(0.6, 0.4, 0.1)
    c.drawString(50, height - 105, "MÃ CA: DEMO-SCAN-004 — TÀI LIỆU SCAN HÌNH ẢNH")
    c.setFillColorRGB(0, 0, 0)

    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 140, "[Bản scan văn bản cũ chất lượng 150 DPI, có vết ố mờ]")
    c.drawString(60, height - 165, "Triệu chứng: Ho khan kéo dài kèm sụt cân 2 kg trong tháng qua.")
    c.drawString(60, height - 190, "Tiền sử: Viêm phế quản mạn tính.")
    c.drawString(60, height - 215, "Thuốc đang dùng: Salbutamol xịt khi khó thở.")
    c.drawString(60, height - 240, "Dị ứng: Không rõ tiền sử dị ứng do chữ scan bị mờ.")
    c.drawString(60, height - 265, "Thời điểm chụp X-quang: 15/11/2026, 16:00 (giờ Việt Nam).")

    c.line(50, 60, width - 50, 60)
    c.drawString(50, 45, "Trang 1 / 1 — DEMO-SCAN-004")
    c.save()
    print(f"Generated: {pdf_path}")


def generate_pdf_demo_conflict008():
    """DEMO-CONFLICT-008: Hồ sơ có thông tin mâu thuẫn cần bác sĩ đối chiếu cả hai nguồn"""
    pdf_path = os.path.join(ASSETS_DIR, "sample_case_conflict008.pdf")
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    # Page 1
    c.setFont(BOLD_FONT, 14)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — CA DEMO-CONFLICT-008")
    c.setFont(MAIN_FONT, 10)
    c.drawString(50, height - 68, "TÌNH HUỐNG HỒ SƠ CÓ THÔNG TIN MÂU THUẪN (CONFLICTING SOURCES)")
    c.line(50, height - 75, width - 50, height - 75)

    c.setFont(BOLD_FONT, 12)
    c.setFillColorRGB(0.8, 0.2, 0.1)
    c.drawString(50, height - 105, "MÃ CA: DEMO-CONFLICT-008 — CẢNH BÁO MÂU THUẪN NGUỒN")
    c.setFillColorRGB(0, 0, 0)

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 135, "I. BỆNH SỬ")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 155, "Triệu chứng: Sốt nhẹ về chiều, ho khan kéo dài 2 tuần.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 185, "II. TIỀN SỬ BỆNH")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 205, "Tiền sử: Đái tháo đường type 2.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 235, "III. THUỐC ĐANG DÙNG")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 255, "Thuốc đang dùng: Metformin 500 mg x 2 viên/ngày.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 285, "IV. GHI NHẬN DỊ ỨNG BAN ĐẦU (NGUỒN 1)")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 305, "Dị ứng (Mục IV): Không ghi nhận tiền sử dị ứng thuốc hay thức ăn.")

    c.line(50, 60, width - 50, 60)
    c.drawString(50, 45, "Trang 1 / 2 — DEMO-CONFLICT-008")
    c.showPage()

    # Page 2
    c.setFont(BOLD_FONT, 14)
    c.drawString(50, height - 50, "BỆNH VIỆN ĐA KHOA MÔ PHỎNG — PHIẾU KHÁM BỔ SUNG & CẬN LÂM SÀNG")
    c.line(50, height - 75, width - 50, height - 75)

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 105, "V. KHÁM BỔ SUNG TẠI KHOA ĐIỀU TRỊ (NGUỒN 2)")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 125, "Khám bổ sung (Mục V): Ghi nhận nghi ngờ dị ứng Penicillin xuất hiện ban đỏ năm 2022.")

    c.setFont(BOLD_FONT, 11)
    c.drawString(50, height - 165, "VI. CHỈ ĐỊNH CHẨN ĐOÁN HÌNH ẢNH")
    c.setFont(MAIN_FONT, 10)
    c.drawString(60, height - 185, "Thời điểm chụp X-quang: 17/11/2026, 11:00 (giờ Việt Nam).")

    c.line(50, 60, width - 50, 60)
    c.drawString(50, 45, "Trang 2 / 2 — DEMO-CONFLICT-008")
    c.save()
    print(f"Generated: {pdf_path}")


def generate_xray_illustration():
    """Tạo ảnh minh họa X-quang ngực thẳng PA giả lập rõ ràng với 3 vùng chỉ thị"""
    img_path = os.path.join(ASSETS_DIR, "xray_illustration.png")
    w, h = 600, 600
    img = Image.new("RGB", (w, h), color=(15, 20, 28))
    draw = ImageDraw.Draw(img)

    for i in range(150):
        intensity = int(15 + i * 0.15)
        r = 280 - i
        draw.ellipse([300 - r, 300 - int(r*1.05), 300 + r, 300 + int(r*1.05)], outline=(intensity, intensity, int(intensity*1.2)))

    draw.line([(300, 80), (300, 520)], fill=(70, 75, 85), width=22)

    for y_offset in range(120, 480, 40):
        draw.arc([140, y_offset, 320, y_offset + 60], 160, 340, fill=(65, 70, 80), width=8)
        draw.arc([280, y_offset, 460, y_offset + 60], 200, 20, fill=(65, 70, 80), width=8)

    draw.line([(170, 110), (300, 130)], fill=(85, 90, 100), width=10)
    draw.line([(300, 130), (430, 110)], fill=(85, 90, 100), width=10)

    draw.ellipse([320, 140, 470, 450], fill=(22, 28, 38))
    draw.ellipse([130, 140, 280, 450], fill=(22, 28, 38))
    draw.ellipse([230, 260, 410, 470], fill=(55, 60, 72))

    draw.arc([110, 420, 290, 530], 190, 350, fill=(75, 80, 95), width=6)
    draw.arc([310, 440, 490, 550], 190, 350, fill=(75, 80, 95), width=6)

    draw.rectangle([10, 10, w - 10, 50], fill=(30, 35, 45))
    draw.text((20, 15), "ẢNH MINH HỌA KỸ THUẬT — KHÔNG PHẢI PHIM BỆNH NHÂN THẬT", fill=(240, 200, 80))
    draw.text((20, 32), "CHẾ ĐỘ MOCK: Dùng để minh họa 3 chỉ số trong buổi báo cáo", fill=(200, 210, 225))

    draw.text((20, 560), "Tư thế mô phỏng: PA (Chest X-ray)", fill=(150, 160, 175))
    draw.text((360, 560), "Nguồn: Asset đồ họa tự tạo", fill=(150, 160, 175))

    img.save(img_path)
    print(f"Generated: {img_path}")


def generate_xray_ap_view():
    """Tạo ảnh minh họa X-quang chụp tư thế AP (Trước - Sau) để demo ngoài phạm vi PA"""
    img_path = os.path.join(ASSETS_DIR, "xray_ap_view.png")
    w, h = 600, 600
    img = Image.new("RGB", (w, h), color=(18, 22, 30))
    draw = ImageDraw.Draw(img)

    for i in range(140):
        intensity = int(18 + i * 0.14)
        r = 270 - i
        draw.ellipse([300 - r, 300 - int(r*1.05), 300 + r, 300 + int(r*1.05)], outline=(intensity, intensity, int(intensity*1.1)))

    draw.line([(300, 90), (300, 510)], fill=(75, 80, 90), width=24)

    # In AP view, heart appears artificially larger due to magnification
    draw.ellipse([210, 250, 430, 480], fill=(65, 70, 82))

    draw.rectangle([10, 10, w - 10, 55], fill=(45, 20, 20))
    draw.text((20, 15), "TƯ THẾ CHỤP: AP (TRƯỚC - SAU) — BỆNH NHÂN TẠI GIƯỜNG", fill=(255, 120, 120))
    draw.text((20, 33), "CẢNH BÁO: NGOÀI PHẠM VI NGHIÊN CỨU PA CỦA VINDR-CXR (BÓNG TIM BỊ PHÓNG ĐẠI)", fill=(255, 220, 200))

    draw.text((20, 560), "Tư thế: AP (Anteroposterior view)", fill=(220, 150, 150))
    draw.text((320, 560), "Mô hình: Không hỗ trợ suy luận", fill=(220, 150, 150))

    img.save(img_path)
    print(f"Generated: {img_path}")


def generate_invalid_image():
    """Tạo file ảnh hỏng / giả lập lỗi cho DEMO-BAD-IMAGE-006 / DEMO-INVALID-IMAGE"""
    bad_img_path = os.path.join(ASSETS_DIR, "xray_invalid.png")
    with open(bad_img_path, "wb") as f:
        f.write(b"CORRUPTED_IMAGE_HEADER_DATA_NOT_A_VALID_PNG_OR_DICOM")
    print(f"Generated: {bad_img_path}")


def verify_text_quotes():
    """Unit verification that all quotes exist in the generated PDFs"""
    pdf_path = os.path.join(ASSETS_DIR, "sample_case_2pages.pdf")
    reader = pypdf.PdfReader(pdf_path)
    assert len(reader.pages) == 2, f"Expected 2 pages, got {len(reader.pages)}"

    p1_text = reader.pages[0].extract_text()
    p2_text = reader.pages[1].extract_text()

    required_p1_quotes = [
        "DEMO-001",
        "Triệu chứng: Bệnh nhân ho khan, khó thở trong 3 ngày.",
        "Tiền sử: Tăng huyết áp.",
        "Thuốc đang dùng: Amlodipine 5 mg/ngày."
    ]
    for q in required_p1_quotes:
        assert q in p1_text, f"Quote not found in Page 1: '{q}'\nPage text: {p1_text}"

    required_p2_quotes = [
        "Thời điểm chụp X-quang: 15/11/2026, 08:30 (giờ Việt Nam).",
        "Ghi chú: Đây là hồ sơ biên soạn phục vụ demo kỹ thuật. Ảnh X-quang minh họa được ghép rời, KHÔNG phải phim của bệnh nhân trong hồ sơ."
    ]
    for q in required_p2_quotes:
        assert q in p2_text, f"Quote not found in Page 2: '{q}'\nPage text: {p2_text}"

    print("ALL QUOTES VERIFIED SUCCESSFULLY IN PDF!")


if __name__ == "__main__":
    generate_pdf_demo_001()
    generate_pdf_demo_missing_page()
    generate_pdf_demo_002_negative_allergy()
    generate_pdf_demo_003_timestamps()
    generate_pdf_demo_scan004()
    generate_pdf_demo_conflict008()
    generate_xray_illustration()
    generate_xray_ap_view()
    generate_invalid_image()
    verify_text_quotes()
