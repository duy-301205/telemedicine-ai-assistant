import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Video, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { api } from '../api/client';
import { ConsultationItem, CaseItem, DemoConfig } from '../types';

interface ConsultationsPageProps {
  onSelectCase: (caseId: string) => void;
  config: DemoConfig | null;
}

export const ConsultationsPage: React.FC<ConsultationsPageProps> = ({ onSelectCase, config }) => {
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal create
  const [showModal, setShowModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('2026-11-25 09:30:00');
  const [zoomUrl, setZoomUrl] = useState(config?.zoom_meeting_url || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Conclusion modal
  const [editingCon, setEditingCon] = useState<ConsultationItem | null>(null);
  const [conclusionNotes, setConclusionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('COMPLETED');

  const loadData = () => {
    setLoading(true);
    Promise.all([api.listAllConsultations(), api.listCases()])
      .then(([conList, caseList]) => {
        setConsultations(conList);
        setCases(caseList);
        if (caseList.length > 0 && !selectedCaseId) {
          setSelectedCaseId(caseList[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load consultations:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !title.trim()) return;

    setSubmitting(true);
    try {
      await api.createConsultation(selectedCaseId, {
        title: title.trim(),
        scheduled_at: scheduledAt,
        zoom_meeting_url: zoomUrl.trim() || undefined,
        notes: notes.trim() || undefined
      });
      setShowModal(false);
      setTitle('');
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo lịch hội chẩn');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateConclusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCon) return;

    try {
      await api.updateConsultation(editingCon.id, {
        status: newStatus,
        conclusion_notes: conclusionNotes.trim()
      });
      setEditingCon(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật hội chẩn');
    }
  };

  const filtered = consultations.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const getCaseName = (caseId: string) => {
    const found = cases.find((c) => c.id === caseId);
    return found ? `${found.patient_name_demo} (${found.case_code || found.id})` : caseId;
  };

  return (
    <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" />
            <span>Điều phối Lịch Hội chẩn Y tế từ xa</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Quản lý các buổi hội chẩn liên viện, kết nối phòng họp truyền hình trực tuyến và lưu biên bản kết luận
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Lên lịch Hội chẩn mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        {[
          { id: 'ALL', label: 'Tất cả', count: consultations.length },
          { id: 'SCHEDULED', label: 'Đã lên lịch', count: consultations.filter(c => c.status === 'SCHEDULED').length },
          { id: 'COMPLETED', label: 'Đã hoàn thành', count: consultations.filter(c => c.status === 'COMPLETED').length },
          { id: 'CANCELED', label: 'Đã hủy', count: consultations.filter(c => c.status === 'CANCELED').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === tab.id
                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200/70 text-[10px] text-slate-700">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <th className="py-3 px-4">Tiêu đề Buổi hội chẩn</th>
                <th className="py-3 px-4">Ca bệnh / Bệnh nhân</th>
                <th className="py-3 px-4">Thời gian tổ chức</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Kết luận / Ghi chú</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filtered.map((con) => (
                <tr key={con.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{con.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{con.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onSelectCase(con.case_id)}
                      className="text-sky-600 hover:text-sky-700 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>{getCaseName(con.case_id)}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{con.scheduled_at}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {con.status === 'SCHEDULED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        Đã lên lịch
                      </span>
                    )}
                    {con.status === 'COMPLETED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Đã hoàn thành
                      </span>
                    )}
                    {con.status === 'CANCELED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                        Đã hủy
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-500 text-[11px]">
                    {con.conclusion_notes || 'Chưa ghi nhận kết luận hội chẩn'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {con.zoom_meeting_url && (
                      <button
                        onClick={() => window.open(con.zoom_meeting_url!, '_blank', 'noopener,noreferrer')}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold inline-flex items-center gap-1"
                        title="Vào phòng Zoom"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Vào Zoom</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingCon(con);
                        setConclusionNotes(con.conclusion_notes || '');
                        setNewStatus(con.status === 'SCHEDULED' ? 'COMPLETED' : con.status);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Kết luận
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không có buổi hội chẩn nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Lên lịch Buổi hội chẩn Y tế từ xa
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Chọn ca bệnh *</label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium bg-white"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.patient_name_demo} ({c.case_code || c.id}) - {c.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Tiêu đề hội chẩn *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Hội chẩn Nội Tim Mạch - Phổi"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Thời gian dự kiến *</label>
                <input
                  type="text"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Đường dẫn phòng họp Zoom</label>
                <input
                  type="url"
                  value={zoomUrl}
                  onChange={(e) => setZoomUrl(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Mục tiêu / Ghi chú buổi họp</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nội dung chuyên môn cần thẩm định..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Lưu lịch hội chẩn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Conclusion Modal */}
      {editingCon && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Biên bản Kết luận Hội chẩn: {editingCon.title}
            </h3>

            <form onSubmit={handleUpdateConclusion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Trạng thái buổi họp</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium bg-white"
                >
                  <option value="SCHEDULED">Đang lên lịch (SCHEDULED)</option>
                  <option value="COMPLETED">Đã hoàn thành (COMPLETED)</option>
                  <option value="CANCELED">Hủy bỏ (CANCELED)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Kết luận chuyên môn / Phác đồ thống nhất *</label>
                <textarea
                  rows={4}
                  required
                  value={conclusionNotes}
                  onChange={(e) => setConclusionNotes(e.target.value)}
                  placeholder="Ghi rõ chẩn đoán thống nhất, chỉ định thuốc, xét nghiệm bổ sung hoặc phẫu thuật..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCon(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Lưu kết luận hội chẩn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
