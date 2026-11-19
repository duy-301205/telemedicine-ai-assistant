import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  CheckCircle, 
  Download, 
  UserCheck, 
  Lock, 
  Edit3,
  Bookmark,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ReportVersion, ReportContent } from '../types';

interface ReportEditorProps {
  caseId: string;
  currentReport: ReportVersion | null;
  onSaveEdit: (content: ReportContent, actorLabel: string, changeSummary: string) => Promise<void>;
  onApprove: (actorLabel: string, notes: string) => Promise<void>;
  onGenerateInitial?: () => Promise<void>;
  isSaving: boolean;
}

export const ReportEditor: React.FC<ReportEditorProps> = ({
  caseId,
  currentReport,
  onSaveEdit,
  onApprove,
  onGenerateInitial,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [actorLabel, setActorLabel] = useState('Bác sĩ Demo (TS.BS. Trần Hội Chẩn)');
  const [changeSummary, setChangeSummary] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveConfirmChecked, setApproveConfirmChecked] = useState(false);
  const [approveNotes, setApproveNotes] = useState('Đã đối chiếu đầy đủ dữ liệu nguồn PDF và ảnh X-quang');

  // Form state
  const [summary, setSummary] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [xrayObservations, setXrayObservations] = useState('');
  const [attentionPointsText, setAttentionPointsText] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');

  // Sync form when currentReport changes
  useEffect(() => {
    if (currentReport) {
      setSummary(currentReport.content.summary || '');
      setClinicalNotes(currentReport.content.clinical_notes || '');
      setXrayObservations(currentReport.content.xray_observations || '');
      setAttentionPointsText((currentReport.content.attention_points || []).join('\n'));
      setRecommendedAction(currentReport.content.recommended_action || '');
      setIsEditing(false);
    }
  }, [currentReport]);

  const handleSaveInitial = async () => {
    const attentionPoints = attentionPointsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedContent: ReportContent = {
      summary: summary.trim() || 'Bản thảo ban đầu ca bệnh.',
      clinical_notes: clinicalNotes.trim() || 'Chưa ghi nhận bệnh sử chi tiết.',
      xray_observations: xrayObservations.trim() || 'Chưa có nhận định hình ảnh.',
      attention_points: attentionPoints,
      recommended_action: recommendedAction.trim() || 'Hội chẩn chuyên khoa theo lịch.',
      source_references: [],
    };

    await onSaveEdit(
      updatedContent,
      actorLabel.trim() || 'Bác sĩ Demo',
      'Khởi tạo bản thảo báo cáo đầu tiên (V1)'
    );
  };

  if (!currentReport) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Bản Thảo Báo Cáo Sơ Bộ (Chưa khởi tạo)</h3>
              <p className="text-xs text-slate-500">Ca bệnh chưa có bản thảo báo cáo sơ bộ. Bác sĩ có thể tự soạn hoặc để AI tạo bản thảo tự động.</p>
            </div>
          </div>

          {onGenerateInitial && (
            <button
              onClick={onGenerateInitial}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>{isSaving ? 'Đang tạo...' : '⚡ Tự động tạo Bản thảo Sơ bộ (AI Draft V1)'}</span>
            </button>
          )}
        </div>

        {/* Doctor direct draft form */}
        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase text-slate-600 tracking-wider">
            Hoặc tự khởi tạo báo cáo trực tiếp (Bác sĩ nhập thủ công):
          </h4>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Người soạn thảo / Bác sĩ lâm sàng:
            </label>
            <input
              type="text"
              value={actorLabel}
              onChange={(e) => setActorLabel(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="VD: TS.BS. Trần Hội Chẩn"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. Tóm tắt ca bệnh (Summary):
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Tóm tắt ngắn gọn tình trạng bệnh nhân, tuổi, giới, lý do hội chẩn..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. Nhận định lâm sàng (Clinical Notes):
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Triệu chứng chính, diễn tiến bệnh, thuốc đang điều trị..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              3. Nhận định hình ảnh X-quang (X-ray Observations):
            </label>
            <textarea
              rows={2}
              value={xrayObservations}
              onChange={(e) => setXrayObservations(e.target.value)}
              placeholder="Mô tả tổn thương ghi nhận trên phim X-quang ngực..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              4. Điểm cần lưu ý (Attention Points - mỗi dòng một điểm):
            </label>
            <textarea
              rows={2}
              value={attentionPointsText}
              onChange={(e) => setAttentionPointsText(e.target.value)}
              placeholder="Dị ứng thuốc&#10;Tương tác thuốc&#10;Cận lâm sàng bổ sung cần làm"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              5. Đề xuất hành động / Kế hoạch xử trí (Recommended Action):
            </label>
            <textarea
              rows={2}
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              placeholder="Đề xuất hội chẩn chuyên khoa, hướng điều trị và theo dõi..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveInitial}
              disabled={isSaving || !summary.trim() || !clinicalNotes.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu Bản Thảo Báo Cáo V1'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    const attentionPoints = attentionPointsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedContent: ReportContent = {
      summary,
      clinical_notes: clinicalNotes,
      xray_observations: xrayObservations,
      attention_points: attentionPoints,
      recommended_action: recommendedAction,
      source_references: currentReport.content.source_references,
    };

    await onSaveEdit(
      updatedContent,
      actorLabel.trim() || 'Bác sĩ Demo',
      changeSummary.trim() || 'Chỉnh sửa bởi Bác sĩ Demo'
    );
    setIsEditing(false);
    setChangeSummary('');
  };

  const handleConfirmApprove = async () => {
    if (!approveConfirmChecked) return;
    await onApprove(actorLabel.trim() || 'Bác sĩ Demo', approveNotes);
    setShowApproveModal(false);
  };

  const handleExportPdf = () => {
    const url = `/api/cases/${caseId}/reports/${currentReport.id}/export?format=pdf`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleExportJson = () => {
    const exportData = {
      export_metadata: {
        exported_at: new Date().toISOString(),
        system: 'Telemedicine AI Demo Prototype',
        disclaimer: 'HỒ SƠ MÔ PHỎNG — KHÔNG DÙNG CHO CHẨN ĐOÁN LÂM SÀNG',
        is_mock: true,
      },
      report_id: currentReport.id,
      case_id: currentReport.case_id,
      version_number: currentReport.version_number,
      status: currentReport.status,
      actor_label: currentReport.actor_label,
      content: currentReport.content,
      change_summary: currentReport.change_summary,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${caseId}_v${currentReport.version_number}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AI_DRAFT':
        return (
          <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-200 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-sky-600" /> Bản AI Draft (Bất biến)
          </span>
        );
      case 'DOCTOR_EDITED':
        return (
          <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5 text-amber-600" /> Bác sĩ đã chỉnh sửa
          </span>
        );
      case 'DOCTOR_APPROVED':
        return (
          <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Đã phê duyệt chính thức
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col w-full">
      {/* Top Header & Actions Bar */}
      <div className="bg-slate-50/70 border-b border-slate-200/80 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                Báo Cáo Sơ Bộ Chuẩn Bị Hội Chẩn
              </h3>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold border border-slate-200">
                Version {currentReport.version_number}
              </span>
              {getStatusBadge(currentReport.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tác giả: <strong className="text-slate-700">{currentReport.actor_label}</strong> &bull; Lưu lúc:{' '}
              {new Date(currentReport.created_at).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa nội dung
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Đang lưu...' : 'Lưu bản chỉnh sửa'}
              </button>
            </div>
          )}

          {/* Approve Button */}
          {currentReport.status !== 'DOCTOR_APPROVED' && (
            <button
              onClick={() => setShowApproveModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Xác nhận báo cáo
            </button>
          )}

          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold border border-sky-200 transition-colors shadow-xs"
            title="Xuất báo cáo định dạng PDF chính thức"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" /> Xuất PDF
          </button>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
            title="Xuất báo cáo định dạng JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Xuất JSON
          </button>
        </div>
      </div>

      {/* Actor Bar */}
      <div className="bg-sky-50/40 border-b border-sky-100/80 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-sky-950 gap-2">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
          <span className="font-bold text-slate-700">Bác sĩ thao tác (Demo):</span>
          <input
            type="text"
            value={actorLabel}
            onChange={(e) => setActorLabel(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 w-64 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs"
            placeholder="Nhập tên bác sĩ demo..."
          />
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          * Quy tắc bất biến: Mọi lần lưu sẽ sinh version mới, không ghi đè bản AI Draft gốc.
        </div>
      </div>

      {/* Report Body */}
      <div className="p-6 space-y-6 flex-1 max-w-5xl">
        {/* Change summary if editing */}
        {isEditing && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-1.5">
            <label className="text-xs font-bold text-amber-950 block">
              Tóm tắt thay đổi phiên bản mới:
            </label>
            <input
              type="text"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Ví dụ: Bổ sung lưu ý lâm sàng về tiền sử dị ứng và chỉ định siêu âm tim..."
              className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}

        {/* 1. Summary */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            1. Tóm tắt tình trạng ca bệnh
          </label>
          {isEditing ? (
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          ) : (
            <p className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm text-slate-800 leading-relaxed font-normal">
              {summary}
            </p>
          )}
        </div>

        {/* 2. Clinical Notes & Allergies Alert */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            2. Ghi chú lâm sàng & Dữ liệu cần bổ sung
          </label>
          {isEditing ? (
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          ) : (
            <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {clinicalNotes}
            </div>
          )}
        </div>

        {/* 3. X-ray Observations */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            3. Quan sát và phân tích X-quang sơ bộ
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              value={xrayObservations}
              onChange={(e) => setXrayObservations(e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          ) : (
            <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {xrayObservations}
            </div>
          )}
        </div>

        {/* 4. Attention Points */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            4. Các điểm cần Bác sĩ hội chẩn lưu ý kiểm tra
          </label>
          {isEditing ? (
            <textarea
              rows={3}
              value={attentionPointsText}
              onChange={(e) => setAttentionPointsText(e.target.value)}
              placeholder="Mỗi điểm một dòng..."
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono text-xs"
            />
          ) : (
            <ul className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1.5 text-xs text-amber-950">
              {(currentReport.content.attention_points || []).map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-amber-600">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 5. Recommended Action */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            5. Đề xuất kế hoạch hội chẩn
          </label>
          {isEditing ? (
            <textarea
              rows={2}
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          ) : (
            <p className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm text-slate-800 leading-relaxed">
              {recommendedAction}
            </p>
          )}
        </div>

        {/* Citation References */}
        {currentReport.content.source_references && currentReport.content.source_references.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-sky-600" /> Các đoạn trích dẫn nguồn đính kèm báo cáo:
            </h4>
            <div className="space-y-1.5">
              {currentReport.content.source_references.map((ref, i) => (
                <div key={i} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 flex justify-between">
                  <span><strong>{ref.field}:</strong> &quot;{ref.quote}&quot;</span>
                  <span className="text-slate-400 font-semibold">Trang {ref.page}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-600 text-white p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-base">Xác Nhận Phê Duyệt Báo Cáo</h4>
                <p className="text-xs text-emerald-100">Tạo phiên bản DOCTOR_APPROVED có thẩm định y khoa</p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs">
                <strong>Hành động này sẽ:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700">
                  <li>Tạo một phiên bản báo cáo mới với trạng thái <strong>DOCTOR_APPROVED</strong>.</li>
                  <li>Lưu vết kiểm toán (Audit Log) với tên Bác sĩ demo và mốc thời gian UTC.</li>
                  <li>Bản phê duyệt sẽ trở thành phiên bản chính thức để đối chiếu trong hội chẩn.</li>
                </ul>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Bác sĩ phê duyệt:
                </label>
                <input
                  type="text"
                  value={actorLabel}
                  onChange={(e) => setActorLabel(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ghi chú thẩm định:
                </label>
                <textarea
                  rows={2}
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={approveConfirmChecked}
                  onChange={(e) => setApproveConfirmChecked(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-700 font-medium leading-snug">
                  Tôi đã đối chiếu kỹ lưỡng thông tin nguồn trong PDF và ảnh X-quang, xác nhận thông qua bản báo cáo sơ bộ này.
                </span>
              </label>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end gap-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                disabled={!approveConfirmChecked || isSaving}
                onClick={handleConfirmApprove}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                {isSaving ? 'Đang lưu...' : 'Xác nhận & Lưu phiên bản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
