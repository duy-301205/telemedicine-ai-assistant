import React from 'react';
import { Info, ShieldAlert, CheckCircle2, AlertCircle, ArrowUpRight, Cpu, User } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-2">
      {/* Title & Author */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md w-fit">
          <Info className="w-4 h-4" /> Báo Cáo Kỹ Thuật Đề Tài Khóa Luận Tốt Nghiệp
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hệ Thống Trợ Lý AI Chuẩn Bị Hội Chẩn Telemedicine
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <strong>Sinh viên thực hiện:</strong> Hoàng Mạnh Duy &bull; K68A3
          </div>
          <div>
            <strong>Mục tiêu hiện tại:</strong> Xây dựng Prototype Web thao tác từ đầu đến cuối
          </div>
          <div className="sm:col-span-2 text-slate-500">
            * Hệ thống chưa công bố mô hình chẩn đoán đã qua kiểm chứng lâm sàng thực tế.
          </div>
        </div>
      </div>

      {/* Module Status Breakdown: REAL vs MOCK */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-600" />
          Hiện Trạng Triển Khai Từng Phân Hệ
        </h3>

        <div className="space-y-3 text-xs sm:text-sm">
          {/* Module 1 */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-emerald-950 font-bold">1. Phân hệ Báo cáo & Quản lý phiên bản:</strong>
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                  HOẠT ĐỘNG THẬT (REAL)
                </span>
              </div>
              <p className="text-slate-700 mt-1 leading-relaxed text-xs">
                Backend FastAPI + SQLite lưu trữ vĩnh viễn các phiên bản bất biến (AI Draft, Doctor Edited, Doctor Approved) và nhật ký kiểm toán (Audit Log). Kiểm tra so sánh diff trước/sau và hỗ trợ mở phòng họp Zoom an toàn.
              </p>
            </div>
          </div>

          {/* Module 2 */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-amber-950 font-bold">2. Phân hệ Trích xuất thực thể bệnh án:</strong>
                <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                  GIẢ LẬP CÓ CĂN CỨ (SEED MOCK)
                </span>
              </div>
              <p className="text-slate-700 mt-1 leading-relaxed text-xs">
                Toàn bộ quote trích dẫn nguồn 100% khớp văn bản tệp PDF thật được tạo bằng ReportLab. Định hướng nâng cấp sau seminar: Tích hợp thư viện PyMuPDF và mô hình NLP/OCR để tự động hóa trích xuất trên ≥100 hồ sơ độc lập.
              </p>
            </div>
          </div>

          {/* Module 3 */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-amber-950 font-bold">3. Phân hệ Phân tích hình ảnh X-quang:</strong>
                <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                  GIẢ LẬP KỸ THUẬT (MOCK FIXTURE)
                </span>
              </div>
              <p className="text-slate-700 mt-1 leading-relaxed text-xs">
                Sử dụng ảnh đồ họa tự tạo và 3 điểm số fixtures (0.91, 0.78, 0.15) để kiểm thử giao diện. Định hướng nghiên cứu tiếp theo: Huấn luyện mạng DenseNet121 / EfficientNet với hàm mất mát BCEWithLogitsLoss (nhận 3 logits) trên ảnh ngực thẳng PA của tập VinDr-CXR khi được cấp quyền sử dụng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Medical Disclaimers */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-950 space-y-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-bold text-red-900">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span>Tuyên bố giới hạn y tế bắt buộc</span>
        </div>
        <p className="leading-relaxed text-slate-700 text-xs">
          Ứng dụng web này không đưa ra chẩn đoán y khoa xác định, không đề xuất phác đồ điều trị hay kê đơn thuốc. Các điểm số chỉ mang ý nghĩa dấu hiệu nghi ngờ phục vụ kỹ thuật tổng hợp thông tin hỗ trợ bác sĩ. Bác sĩ chuyên khoa luôn là người chịu trách nhiệm thẩm định và quyết định lâm sàng cuối cùng.
        </p>
      </div>
    </div>
  );
};
