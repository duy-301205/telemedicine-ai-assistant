import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  FileWarning, 
  ShieldAlert,
  User
} from 'lucide-react';
import { CaseItem } from '../types';
import { api } from '../api/client';

interface CaseListPageProps {
  onSelectCase: (caseId: string) => void;
}

export const CaseListPage: React.FC<CaseListPageProps> = ({ onSelectCase }) => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listCases()
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm text-slate-600">Đang tải danh sách ca hội chẩn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-800 max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h4 className="font-bold">Không thể tải danh sách ca</h4>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  const getStatusBadge = (c: CaseItem) => {
    if (c.error_type === 'MISSING_PAGE') {
      return (
        <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-md border border-amber-300 flex items-center gap-1">
          <FileWarning className="w-3.5 h-3.5 text-amber-700" /> Thiếu trang hồ sơ
        </span>
      );
    }
    if (c.error_type === 'INVALID_IMAGE') {
      return (
        <span className="bg-red-100 text-red-900 text-[11px] font-bold px-2.5 py-1 rounded-md border border-red-300 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-red-700" /> Ảnh X-quang hỏng
        </span>
      );
    }
    switch (c.status) {
      case 'AI_DRAFT':
        return (
          <span className="bg-sky-100 text-sky-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-sky-200">
            AI Draft
          </span>
        );
      case 'DOCTOR_EDITED':
        return (
          <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-amber-300">
            Bác sĩ đã sửa
          </span>
        );
      case 'DOCTOR_APPROVED':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-300">
            Đã duyệt
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded">
            {c.status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            Danh Sách Ca Bệnh Mô Phỏng (Demo Cases)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Chọn một ca để kiểm tra luồng chuẩn mực hoặc các tình huống dữ liệu thiếu / file hỏng
          </p>
        </div>
        <span className="bg-sky-50 text-sky-800 text-xs font-semibold px-3 py-1 rounded-full border border-sky-200 self-start sm:self-auto">
          {cases.length} ca có sẵn trong DB
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cases.map((c) => {
          const isPrimary = c.id === 'DEMO-001';

          return (
            <div
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className={`rounded-2xl border p-5 transition-all cursor-pointer bg-white flex flex-col justify-between shadow-sm hover:shadow-md ${
                isPrimary
                  ? 'border-sky-400 ring-2 ring-sky-200/50 hover:border-sky-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                      {c.id}
                    </span>
                    {isPrimary && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-600 text-white px-2 py-0.5 rounded">
                        Ca chính báo cáo
                      </span>
                    )}
                  </div>
                  {getStatusBadge(c)}
                </div>

                <div className="space-y-1.5 mb-3">
                  <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {c.patient_name_demo}
                  </h3>
                  {c.age && (
                    <p className="text-xs text-slate-500">
                      {c.age} tuổi &bull; {c.gender} &bull; Chế độ: Dữ liệu mô phỏng
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {c.notes || 'Không có ghi chú thêm.'}
                </p>

                {c.error_message && (
                  <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded text-red-900 text-xs flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{c.error_message}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Khởi tạo: {new Date(c.created_at).toLocaleDateString('vi-VN')}
                </span>
                <span className="text-xs font-bold text-sky-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Mở ca &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
