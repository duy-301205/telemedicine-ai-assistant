import React from 'react';
import { X, ArrowRight, GitCompare, CheckCircle2, FileText } from 'lucide-react';
import { ReportVersion } from '../types';

interface VersionDiffModalProps {
  v1: ReportVersion;
  v2: ReportVersion;
  onClose: () => void;
}

export const VersionDiffModal: React.FC<VersionDiffModalProps> = ({ v1, v2, onClose }) => {
  const isDifferent = (str1: string = '', str2: string = '') => {
    return str1.trim() !== str2.trim();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
              <GitCompare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">So Sánh Phiên Bản Báo Cáo (Side-by-Side Diff)</h3>
              <p className="text-xs text-slate-400">
                Đối chiếu thay đổi giữa Version {v1.version_number} ({v1.status}) và Version {v2.version_number} ({v2.status})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs font-semibold text-slate-700">
          <div className="flex items-center justify-between pr-4 border-r border-slate-200">
            <span>
              Bản gốc: <strong>Version {v1.version_number}</strong> ({v1.actor_label})
            </span>
            <span className="font-mono text-slate-400">
              {new Date(v1.created_at).toLocaleTimeString('vi-VN')}
            </span>
          </div>
          <div className="flex items-center justify-between pl-4">
            <span>
              Bản đối chiếu: <strong>Version {v2.version_number}</strong> ({v2.actor_label})
            </span>
            <span className="font-mono text-slate-400">
              {new Date(v2.created_at).toLocaleTimeString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Diff Content Body */}
        <div className="p-6 space-y-6 overflow-auto flex-1 text-xs sm:text-sm">
          {/* Summary Diff */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">
              1. Tóm tắt tình trạng ca bệnh
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed">
                {v1.content.summary}
              </div>
              <div
                className={`p-3 rounded-lg leading-relaxed ${
                  isDifferent(v1.content.summary, v2.content.summary)
                    ? 'bg-amber-50 border-2 border-amber-400 text-amber-950 font-medium'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                {v2.content.summary}
              </div>
            </div>
          </div>

          {/* Clinical Notes Diff */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">
              2. Ghi chú lâm sàng & Dị ứng
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed whitespace-pre-line">
                {v1.content.clinical_notes}
              </div>
              <div
                className={`p-3 rounded-lg leading-relaxed whitespace-pre-line ${
                  isDifferent(v1.content.clinical_notes, v2.content.clinical_notes)
                    ? 'bg-amber-50 border-2 border-amber-400 text-amber-950 font-medium'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                {v2.content.clinical_notes}
              </div>
            </div>
          </div>

          {/* Xray Observations Diff */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">
              3. Phân tích X-quang
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed whitespace-pre-line">
                {v1.content.xray_observations}
              </div>
              <div
                className={`p-3 rounded-lg leading-relaxed whitespace-pre-line ${
                  isDifferent(v1.content.xray_observations, v2.content.xray_observations)
                    ? 'bg-amber-50 border-2 border-amber-400 text-amber-950 font-medium'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                {v2.content.xray_observations}
              </div>
            </div>
          </div>

          {/* Recommended Action Diff */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">
              4. Đề xuất kế hoạch hội chẩn
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed">
                {v1.content.recommended_action}
              </div>
              <div
                className={`p-3 rounded-lg leading-relaxed ${
                  isDifferent(v1.content.recommended_action, v2.content.recommended_action)
                    ? 'bg-amber-50 border-2 border-amber-400 text-amber-950 font-medium'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                {v2.content.recommended_action}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-400 rounded-sm inline-block"></span>
            <span>Khung viền vàng biểu thị nội dung có thay đổi giữa hai phiên bản</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
          >
            Đóng so sánh
          </button>
        </div>
      </div>
    </div>
  );
};
