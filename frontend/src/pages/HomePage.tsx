import React from 'react';
import { 
  Activity, 
  ArrowRight, 
  FileText, 
  Layers, 
  CheckCircle2, 
  ShieldAlert, 
  Database, 
  GitBranch, 
  ExternalLink 
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            Đề tài KLTN: Trợ lý AI hỗ trợ chuẩn bị hội chẩn Telemedicine
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Hệ Thống Trợ Lý AI Chuẩn Bị Hội Chẩn Y Tế Từ Xa
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Nguyên mẫu (Prototype) minh họa luồng thao tác khép kín: trích xuất hồ sơ bệnh án dẫn nguồn PDF, đối chiếu ảnh X-quang ngực thẳng với 3 dấu hiệu nghi ngờ, sinh bản thảo báo cáo, hỗ trợ bác sĩ chỉnh sửa và phê duyệt lưu phiên bản bất biến.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/cases/DEMO-001')}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Vào Ca Mẫu DEMO-001</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/demo')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-5 py-3 rounded-xl border border-slate-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Xem danh sách 4 ca giả lập</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights (The 4 core steps requested by teacher) */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-sky-600" />
          Quy trình hội chẩn 4 bước đã được hiện thực hóa
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Trích Xuất Có Dẫn Nguồn</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trích xuất 5 trường thông tin. Bấm vào trường tự động mở đúng trang PDF và hiển thị câu trích dẫn gốc. Phân biệt rõ &quot;Chưa có dữ liệu&quot; và &quot;Phủ định có căn cứ&quot;.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm">3 Điểm Số X-quang MOCK</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Minh họa 3 dấu hiệu: Tim to (0.91), Tràn dịch (0.78), Đám mờ (0.15) kèm 3 vùng chú ý trên phim ngực thẳng PA; ghi rõ disclaimer không phải kết quả AI thực tế.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Bác Sĩ Chỉnh Sửa & Duyệt</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Khởi tạo AI Draft bất biến. Cho phép Bác sĩ Demo chỉnh sửa và lưu thành phiên bản mới, thực hiện phê duyệt có hộp thoại xác nhận thẩm định y khoa.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Lưu Bất Biến & So Sánh</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lưu trữ vĩnh viễn trong SQLite. Cho phép xem toàn bộ chuỗi lịch sử phiên bản, nhật ký kiểm toán (Audit Logs) và so sánh song song (Diff) trước/sau.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-950 flex flex-col sm:flex-row items-start gap-4">
        <ShieldAlert className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
        <div className="space-y-1.5 text-xs sm:text-sm">
          <h4 className="font-bold text-amber-900">Cam kết an toàn y tế và liêm chính học thuật</h4>
          <p className="text-slate-700 leading-relaxed">
            Hệ thống là bản thử nghiệm kỹ thuật phục vụ báo cáo tiến độ. Toàn bộ hồ sơ bệnh án, ảnh X-quang và điểm số là dữ liệu giả lập (Mock fixtures). Không khẳng định đạt KPI F1 hay AUROC khi chưa huấn luyện và kiểm thử độc lập.
          </p>
        </div>
      </div>
    </div>
  );
};
