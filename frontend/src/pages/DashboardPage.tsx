import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  FolderPlus, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Calendar,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import { api } from '../api/client';
import { DashboardSummary } from '../types';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    api.getDashboardSummary()
      .then((data) => {
        setSummary(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải dữ liệu bảng điều khiển.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string, errorType?: string | null) => {
    if (errorType === 'MISSING_PAGE') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Thiếu trang</span>;
    }
    if (errorType === 'INVALID_IMAGE') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Ảnh lỗi</span>;
    }
    if (errorType === 'DATA_CONFLICT') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Mâu thuẫn nguồn</span>;
    }
    if (errorType === 'AP_VIEW_WARNING') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">Cảnh báo AP</span>;
    }

    switch (status) {
      case 'DOCTOR_APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Bác sĩ đã duyệt</span>;
      case 'DOCTOR_EDITED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Đã chỉnh sửa</span>;
      case 'AI_DRAFT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">Bản thảo AI</span>;
      case 'CONSULTATION_READY':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">Sẵn sàng hội chẩn</span>;
      case 'FILES_UPLOADED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Đã tải tệp</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Khởi tạo</span>;
    }
  };

  return (
    <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-sky-200 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Hệ thống Quản lý Ca Bệnh & Trợ lý Hội chẩn Telemedicine v2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Trung tâm Điều phối Ca Bệnh & Chuẩn bị Hội chẩn Y tế từ xa
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
            Hệ thống hỗ trợ toàn trình từ tiếp nhận hồ sơ, kiểm tra dữ liệu nguồn PDF, tải ảnh X-quang ngực, chuẩn bị báo cáo sơ bộ đa phiên bản bất biến và điều phối lịch họp hội chẩn liên viện.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/cases/new')}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Tiếp nhận Ca Mới</span>
            </button>
            <button
              onClick={() => onNavigate('/cases')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Danh sách Ca Bệnh</span>
            </button>
            <button
              onClick={() => onNavigate('/consultations')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Lịch Hội Chẩn</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <Activity className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Cases */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-sky-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số ca bệnh</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{summary?.total_cases ?? '--'}</span>
            <span className="text-xs text-slate-500">ca đã khởi tạo</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Hoạt động: {summary?.active_cases ?? '--'}</span>
            <span>•</span>
            <span>Lưu trữ: {summary?.archived_cases ?? '--'}</span>
          </div>
        </div>

        {/* Doctor Approved */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Báo cáo đã duyệt</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{summary?.status_counts?.DOCTOR_APPROVED ?? 0}</span>
            <span className="text-xs text-slate-500">hồ sơ hoàn tất</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Sẵn sàng tiến hành hội chẩn
          </div>
        </div>

        {/* AI Draft & Editing */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang soạn thảo</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-700">
              {(summary?.status_counts?.AI_DRAFT ?? 0) + (summary?.status_counts?.DOCTOR_EDITED ?? 0)}
            </span>
            <span className="text-xs text-slate-500">ca chờ thẩm định</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            AI Draft: {summary?.status_counts?.AI_DRAFT ?? 0} • Bác sĩ sửa: {summary?.status_counts?.DOCTOR_EDITED ?? 0}
          </div>
        </div>

        {/* Consultations */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lịch hội chẩn</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-700">{summary?.total_consultations ?? 0}</span>
            <span className="text-xs text-slate-500">buổi hội chẩn</span>
          </div>
          <div className="mt-2 text-[11px] text-teal-600 font-medium">
            Tích hợp phòng Zoom an toàn
          </div>
        </div>

        {/* Warnings / Edge Cases */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ca cần chú ý</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">
              {(summary?.status_counts?.MISSING_PAGE ?? 0) + (summary?.status_counts?.INVALID_IMAGE ?? 0)}
            </span>
            <span className="text-xs text-slate-500">tình huống ngoại lệ</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Thiếu trang: {summary?.status_counts?.MISSING_PAGE ?? 0} • Ảnh lỗi: {summary?.status_counts?.INVALID_IMAGE ?? 0}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Cases & Status Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Cases Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ca bệnh tiếp nhận gần đây</h2>
              <p className="text-xs text-slate-500">Hồ sơ bệnh nhân giả lập và trạng thái xử lý hiện tại</p>
            </div>
            <button
              onClick={() => onNavigate('/cases')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-3 px-4">Mã ca</th>
                  <th className="py-3 px-4">Họ và tên bệnh nhân (Demo)</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {summary?.recent_cases?.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 font-bold">
                      {c.case_code || c.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {c.patient_name_demo}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(c.status, c.error_type)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {c.created_at ? c.created_at.slice(0, 10) : '--'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate(`/cases/${c.id}`)}
                        className="px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-colors"
                      >
                        Chi tiết ca
                      </button>
                    </td>
                  </tr>
                ))}
                {(!summary?.recent_cases || summary.recent_cases.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Chưa có ca bệnh nào. Bấm "+ Tiếp nhận Ca Mới" để bắt đầu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Standard Flow Guide & Notice */}
        <div className="space-y-4">
          {/* Quick Flow Helper */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Quy trình nghiệp vụ 5 bước</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <div>
                  <p className="font-semibold text-slate-800">Tạo ca & Upload tài liệu</p>
                  <p className="text-[11px] text-slate-500">Tải lên tệp PDF trích sao bệnh án (≥2 trang) và ảnh X-quang chuẩn PA.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <div>
                  <p className="font-semibold text-slate-800">AI trích xuất & Phân tích Mock</p>
                  <p className="text-[11px] text-slate-500">Trích xuất 5 nhóm trường có nguồn dẫn; phân tích 3 nhãn X-quang (VinDr-CXR scope).</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <div>
                  <p className="font-semibold text-slate-800">Hiệu chỉnh lâm sàng</p>
                  <p className="text-[11px] text-slate-500">Bác sĩ kiểm tra trích dẫn, bổ sung dị ứng nếu thiếu, tạo phiên bản Doctor Edited.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                <div>
                  <p className="font-semibold text-slate-800">Phê duyệt & Xuất báo cáo</p>
                  <p className="text-[11px] text-slate-500">Xác nhận lâm sàng, khóa bản Approved bất biến, xuất tệp PDF chính thức.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center shrink-0 text-[11px]">5</span>
                <div>
                  <p className="font-semibold text-slate-800">Lên lịch & Họp hội chẩn</p>
                  <p className="text-[11px] text-slate-500">Điều phối phòng họp trực tuyến Zoom an toàn, lưu biên bản kết luận.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Model Scope Card */}
          <div className="bg-amber-50/60 rounded-xl border border-amber-200/80 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Phạm vi mô hình & Tính liêm chính</span>
            </div>
            <p className="text-amber-900/80 text-[11px] leading-relaxed">
              Mô hình X-quang chỉ được kiểm chứng cho phim chụp <strong>tư thế đứng PA</strong>. Các phim tư thế nằm (AP) sẽ cảnh báo bóng tim to giả tạo. Hệ thống <strong>không sinh điểm số giả lập</strong> cho các ảnh mới không thuộc fixture kiểm thử.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
