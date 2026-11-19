import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  FileWarning, 
  ShieldAlert,
  User,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Archive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CaseItem } from '../types';
import { api } from '../api/client';

interface CaseListPageProps {
  onSelectCase: (caseId: string) => void;
  onNavigateNew?: () => void;
  currentRole?: string;
}

export const CaseListPage: React.FC<CaseListPageProps> = ({ 
  onSelectCase, 
  onNavigateNew,
  currentRole = 'CLINICIAN_DEMO'
}) => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadCases = () => {
    setLoading(true);
    api.listCases({
      search: search.trim() || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined
    })
      .then((data) => {
        setCases(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCases();
  };

  const handleArchive = async (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc chắn muốn lưu trữ / đóng ca bệnh ${caseId}?`)) return;

    try {
      await api.archiveCase(caseId);
      loadCases();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu trữ ca bệnh');
    }
  };

  const getStatusBadge = (c: CaseItem) => {
    if (c.error_type === 'MISSING_PAGE') {
      return (
        <span className="bg-amber-50 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
          <FileWarning className="w-3 h-3 text-amber-700" /> Thiếu trang hồ sơ
        </span>
      );
    }
    if (c.error_type === 'INVALID_IMAGE') {
      return (
        <span className="bg-rose-50 text-rose-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-rose-700" /> Ảnh X-quang hỏng
        </span>
      );
    }
    if (c.error_type === 'DATA_CONFLICT') {
      return (
        <span className="bg-purple-50 text-purple-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-purple-300 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-purple-700" /> Mâu thuẫn nguồn
        </span>
      );
    }
    if (c.error_type === 'AP_VIEW_WARNING') {
      return (
        <span className="bg-orange-50 text-orange-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-orange-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-orange-700" /> Cảnh báo AP
        </span>
      );
    }

    switch (c.status) {
      case 'AI_DRAFT':
        return (
          <span className="bg-sky-50 text-sky-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
            Bản thảo AI
          </span>
        );
      case 'DOCTOR_EDITED':
        return (
          <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
            Bác sĩ đã sửa
          </span>
        );
      case 'DOCTOR_APPROVED':
        return (
          <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã duyệt
          </span>
        );
      case 'CONSULTATION_READY':
        return (
          <span className="bg-teal-50 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
            Sẵn sàng hội chẩn
          </span>
        );
      case 'FILES_UPLOADED':
        return (
          <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
            Đã tải tệp
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
            {c.status}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            <span>Danh Sách Ca Bệnh Hội Chẩn</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý hồ sơ bệnh nhân, theo dõi trạng thái AI Draft, bác sĩ hiệu chỉnh, phê duyệt và các tình huống ngoại lệ
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateNew && (
            <button
              onClick={onNavigateNew}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tiếp nhận Ca Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'Tất cả ca' },
            { id: 'AI_DRAFT', label: 'Bản thảo AI' },
            { id: 'DOCTOR_EDITED', label: 'Đã chỉnh sửa' },
            { id: 'DOCTOR_APPROVED', label: 'Đã duyệt' },
            { id: 'MISSING_PAGE', label: 'Thiếu trang' },
            { id: 'INVALID_IMAGE', label: 'Ảnh lỗi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên bệnh nhân, mã ca..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Tìm
          </button>
        </form>

      </div>

      {loading && (
        <div className="p-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Đang tải danh sách ca bệnh...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-800 max-w-lg mx-auto">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <h4 className="font-bold">Không thể tải danh sách ca</h4>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {cases.map((c) => {
            const isPrimary = c.id === 'DEMO-001';

            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className={`rounded-2xl border p-5 transition-all cursor-pointer bg-white flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isPrimary
                    ? 'border-sky-300 ring-2 ring-sky-100 hover:border-sky-400'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {c.case_code || c.id}
                      </span>
                      {isPrimary && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-600 text-white px-2 py-0.5 rounded-full">
                          Ca chuẩn mẫu
                        </span>
                      )}
                    </div>
                    {getStatusBadge(c)}
                  </div>

                  <div className="space-y-1 mb-3">
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      {c.patient_name_demo}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {c.age ? `${c.age} tuổi` : '-- tuổi'} &bull; {c.gender || 'Chưa rõ'} &bull; Người tạo: {c.created_by || 'Hệ thống'}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    {c.notes || 'Không có ghi chú thêm.'}
                  </p>

                  {c.error_message && (
                    <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{c.error_message}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : '--'}
                  </span>

                  <div className="flex items-center gap-2">
                    {currentRole === 'DEMO_ADMIN' && !c.id.startsWith('DEMO-') && (
                      <button
                        onClick={(e) => handleArchive(e, c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Lưu trữ ca bệnh"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span className="text-xs font-bold text-sky-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Xem chi tiết &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {cases.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400">
              Không tìm thấy ca bệnh nào phù hợp với điều kiện tìm kiếm.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
