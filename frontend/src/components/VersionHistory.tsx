import React, { useState } from 'react';
import { 
  History, 
  GitCommit, 
  Clock, 
  User, 
  ShieldCheck, 
  Edit3, 
  Lock, 
  GitCompare,
  ArrowRight,
  FileText,
  ListFilter
} from 'lucide-react';
import { ReportVersion, AuditLogItem } from '../types';
import { VersionDiffModal } from './VersionDiffModal';

interface VersionHistoryProps {
  reports: ReportVersion[];
  auditLogs: AuditLogItem[];
  currentVersionId: string;
  onSelectVersion: (version: ReportVersion) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  reports,
  auditLogs,
  currentVersionId,
  onSelectVersion,
}) => {
  const [diffPair, setDiffPair] = useState<{ v1: ReportVersion; v2: ReportVersion } | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AI_DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
            <Lock className="w-3 h-3 text-sky-600" /> AI Draft
          </span>
        );
      case 'DOCTOR_EDITED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
            <Edit3 className="w-3 h-3 text-amber-600" /> Bác sĩ sửa
          </span>
        );
      case 'DOCTOR_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Phê duyệt
          </span>
        );
      default:
        return null;
    }
  };

  const handleCompareWithV1 = (targetVersion: ReportVersion) => {
    const v1 = reports.find((r) => r.version_number === 1) || reports[0];
    setDiffPair({ v1, v2: targetVersion });
  };

  return (
    <div className="space-y-6">
      {/* Version Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-sky-600" />
              Lịch sử các phiên bản báo cáo (Audit Trail & Versioning)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tất cả các bản ghi đều bất biến (Immutable), lưu trữ đầy đủ trong cơ sở dữ liệu SQLite
            </p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-full text-slate-700">
            Tổng cộng: {reports.length} phiên bản
          </span>
        </div>

        {/* Timeline List */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {reports.map((report) => {
            const isCurrent = report.id === currentVersionId;

            return (
              <div key={report.id} className="relative group">
                {/* Node icon on timeline */}
                <div
                  className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    report.status === 'DOCTOR_APPROVED'
                      ? 'bg-emerald-500 border-emerald-200'
                      : report.status === 'DOCTOR_EDITED'
                      ? 'bg-amber-500 border-amber-200'
                      : 'bg-sky-500 border-sky-200'
                  }`}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>

                {/* Card Container */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-sky-50/40 border-sky-400 shadow-sm ring-1 ring-sky-300'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-800">
                        Version {report.version_number}
                      </span>
                      {getStatusBadge(report.status)}
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">
                          Đang xem
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {report.version_number > 1 && (
                        <button
                          onClick={() => handleCompareWithV1(report)}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg transition-colors shadow-xs"
                          title="So sánh với bản AI Draft ban đầu"
                        >
                          <GitCompare className="w-3.5 h-3.5 text-sky-600" />
                          <span>So sánh với V1</span>
                        </button>
                      )}
                      {!isCurrent && (
                        <button
                          onClick={() => onSelectVersion(report)}
                          className="text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline px-2 py-1"
                        >
                          Mở xem bản này &rarr;
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metadata info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mt-2 bg-white/80 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Người tạo/thao tác: <strong>{report.actor_label}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Thời điểm: {new Date(report.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                    {report.parent_version_id && (
                      <div className="col-span-full font-mono text-[11px] text-slate-400">
                        Kế thừa từ bản gốc: {report.parent_version_id}
                      </div>
                    )}
                  </div>

                  {/* Change summary */}
                  {report.change_summary && (
                    <p className="text-xs text-slate-700 mt-2 font-medium bg-amber-50/50 p-2 rounded border border-amber-100">
                      📝 Tóm tắt: {report.change_summary}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-slate-500" />
          Nhật ký kiểm toán hệ thống (Audit Logs)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Thời gian (UTC)</th>
                <th className="py-2.5 px-3">Hành động</th>
                <th className="py-2.5 px-3">Bác sĩ / Nhân vật</th>
                <th className="py-2.5 px-3">Mã phiên bản</th>
                <th className="py-2.5 px-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-slate-500">
                    {new Date(log.timestamp_utc).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-800">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        log.action === 'APPROVED_BY_DOCTOR'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'SAVED_DOCTOR_EDIT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-700">{log.actor_label}</td>
                  <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{log.version_id}</td>
                  <td className="py-2 px-3 text-slate-600">{log.change_summary || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff Modal */}
      {diffPair && (
        <VersionDiffModal
          v1={diffPair.v1}
          v2={diffPair.v2}
          onClose={() => setDiffPair(null)}
        />
      )}
    </div>
  );
};
