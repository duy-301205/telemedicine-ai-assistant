import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  ClipboardList, 
  History, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle,
  FileWarning,
  User,
  Activity,
  Calendar,
  Files,
  UploadCloud,
  Play,
  Video,
  ExternalLink,
  Plus,
  Loader2,
  Clock,
  Download
} from 'lucide-react';
import { 
  CaseDetail, 
  ExtractionData, 
  PredictionData, 
  ReportVersion, 
  AuditLogItem, 
  SourceCitation, 
  ReportContent,
  CaseFile,
  ConsultationItem
} from '../types';
import { api } from '../api/client';
import { PdfViewer } from '../components/PdfViewer';
import { ExtractionPanel } from '../components/ExtractionPanel';
import { XrayPanel } from '../components/XrayPanel';
import { ReportEditor } from '../components/ReportEditor';
import { VersionHistory } from '../components/VersionHistory';

interface CaseDetailPageProps {
  caseId: string;
  onBack: () => void;
  currentRole?: string;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({ caseId, onBack, currentRole = 'CLINICIAN_DEMO' }) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'xray' | 'report' | 'history' | 'consultations' | 'files'>('documents');

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [extraction, setExtraction] = useState<ExtractionData | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportVersion[]>([]);
  const [currentReport, setCurrentReport] = useState<ReportVersion | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);

  // PDF Viewer navigation state
  const [activePdfPage, setActivePdfPage] = useState<number>(1);
  const [selectedSource, setSelectedSource] = useState<SourceCitation | null>(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New consultation modal state
  const [showConModal, setShowConModal] = useState(false);
  const [conTitle, setConTitle] = useState('Hội chẩn Chuyên khoa Nội Tim Mạch - Hô Hấp');
  const [conTime, setConTime] = useState('2026-11-25 09:30:00');
  const [conZoom, setConZoom] = useState('https://zoom.us/j/99988877766');

  // File upload state in Files tab
  const [uploadKind, setUploadKind] = useState<'document' | 'image'>('document');
  const [uploadViewPos, setUploadViewPos] = useState('PA');
  const [isUploading, setIsUploading] = useState(false);

  const loadCaseData = async () => {
    try {
      setLoading(true);
      const detail = await api.getCaseDetail(caseId);
      setCaseDetail(detail);

      // Load Extraction
      try {
        const ext = await api.getExtraction(caseId);
        setExtraction(ext);
        setExtractionError(null);
      } catch (err: any) {
        setExtraction(null);
        setExtractionError(err.message);
      }

      // Load Prediction
      try {
        const pred = await api.getPredictions(caseId);
        setPrediction(pred);
        setPredictionError(null);
      } catch (err: any) {
        setPrediction(null);
        setPredictionError(err.message);
      }

      // Load Reports
      try {
        const repList = await api.listReports(caseId);
        setReports(repList);
        if (repList.length > 0) {
          setCurrentReport(repList[repList.length - 1]);
        }
      } catch {
        // no reports yet
      }

      // Load Audit Logs
      try {
        const logs = await api.getAuditLogs(caseId);
        setAuditLogs(logs);
      } catch {
        // ignore
      }

      // Load Files
      try {
        const fList = await api.listCaseFiles(caseId);
        setFiles(fList);
      } catch {
        // ignore
      }

      // Load Consultations
      try {
        const cList = await api.listCaseConsultations(caseId);
        setConsultations(cList);
      } catch {
        // ignore
      }

      setLoading(false);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  const handleSelectField = (fieldKey: string, source: SourceCitation | null, page: number) => {
    setSelectedFieldKey(fieldKey);
    setSelectedSource(source);
    setActivePdfPage(page);
  };

  const handleSaveEdit = async (
    content: ReportContent,
    actorLabel: string,
    changeSummary: string
  ) => {
    if (!currentReport) return;
    try {
      setIsSaving(true);
      const newVersion = await api.saveDraftEdit(caseId, {
        parent_version_id: currentReport.id,
        actor_label: actorLabel,
        content,
        change_summary: changeSummary,
      });

      setReports((prev) => [...prev, newVersion]);
      setCurrentReport(newVersion);
      setNotification({
        type: 'success',
        message: `Đã lưu bản chỉnh sửa Version ${newVersion.version_number} thành công!`,
      });

      const logs = await api.getAuditLogs(caseId);
      setAuditLogs(logs);
      const detail = await api.getCaseDetail(caseId);
      setCaseDetail(detail);

      setIsSaving(false);
    } catch (err: any) {
      setNotification({ type: 'error', message: `Lỗi khi lưu: ${err.message}` });
      setIsSaving(false);
    }
  };

  const handleApprove = async (actorLabel: string, notes: string) => {
    if (!currentReport) return;
    try {
      setIsSaving(true);
      const approvedVer = await api.approveReport(caseId, currentReport.id, {
        actor_label: actorLabel,
        confirmation_checked: true,
        notes,
      });

      setReports((prev) => [...prev, approvedVer]);
      setCurrentReport(approvedVer);
      setNotification({
        type: 'success',
        message: `Đã phê duyệt báo cáo thành công (Version ${approvedVer.version_number})!`,
      });

      const logs = await api.getAuditLogs(caseId);
      setAuditLogs(logs);
      const detail = await api.getCaseDetail(caseId);
      setCaseDetail(detail);

      setIsSaving(false);
    } catch (err: any) {
      setNotification({ type: 'error', message: `Lỗi khi duyệt: ${err.message}` });
      setIsSaving(false);
    }
  };

  const handleRunProcessing = async () => {
    try {
      setIsProcessing(true);
      await api.processCase(caseId, { view_position: uploadViewPos });
      setNotification({ type: 'success', message: 'Đã hoàn thành chạy trích xuất & phân tích AI!' });
      await loadCaseData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Lỗi khi chạy xử lý AI' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setIsUploading(true);
      await api.uploadCaseFile(caseId, file, uploadKind, uploadViewPos, 'Bác sĩ lâm sàng');
      setNotification({ type: 'success', message: `Đã tải lên tệp ${file.name} thành công!` });
      await loadCaseData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Lỗi khi tải tệp lên' });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCreateCaseConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createConsultation(caseId, {
        title: conTitle,
        scheduled_at: conTime,
        zoom_meeting_url: conZoom || undefined,
        created_by: 'Bác sĩ điều trị'
      });
      setShowConModal(false);
      setNotification({ type: 'success', message: 'Đã lên lịch hội chẩn thành công!' });
      const cList = await api.listCaseConsultations(caseId);
      setConsultations(cList);
    } catch (err: any) {
      alert(err.message || 'Lỗi lên lịch hội chẩn');
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="font-bold text-slate-700">Đang tải dữ liệu ca {caseId}...</h3>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
        Không tìm thấy thông tin ca bệnh: {caseId}
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AI_DRAFT':
        return <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-200">AI DRAFT</span>;
      case 'DOCTOR_EDITED':
        return <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-200">DOCTOR EDITED</span>;
      case 'DOCTOR_APPROVED':
        return <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">DOCTOR APPROVED</span>;
      case 'CONSULTATION_READY':
        return <span className="bg-teal-50 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-full border border-teal-200">CONSULTATION READY</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs text-slate-400 hover:text-slate-700 px-2"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Case Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-xs"
              title="Quay lại danh sách ca"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-base font-extrabold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200/80">
                  {caseDetail.case_code || caseDetail.id}
                </span>
                <span className="text-base font-bold text-slate-900">
                  {caseDetail.patient_name_demo}
                </span>
                {caseDetail.age && (
                  <span className="text-xs text-slate-500 font-medium">
                    ({caseDetail.age} tuổi &bull; {caseDetail.gender})
                  </span>
                )}
                {getStatusBadge(caseDetail.status)}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span>Mã nội bộ: <strong className="font-mono text-slate-700">{caseDetail.id}</strong></span>
                <span>&bull;</span>
                <span>Người tạo: <strong className="text-slate-700">{caseDetail.created_by || 'Hệ thống'}</strong></span>
                <span>&bull;</span>
                <span>Số phiên bản báo cáo: <strong className="text-slate-700">{caseDetail.report_versions_count}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {caseDetail.error_type && (
              <div className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300">
                <FileWarning className="w-4 h-4 text-amber-700" />
                <span>{caseDetail.error_type}</span>
              </div>
            )}

            {currentReport && (
              <a
                href={`/api/cases/${caseId}/reports/${currentReport.id}/export?format=pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 flex items-center gap-1.5 transition-colors shadow-xs"
                title="Mở hoặc tải về tệp báo cáo PDF chính thức"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Xuất PDF</span>
              </a>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 mt-5 -mb-3 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Hồ sơ bệnh án & Dẫn nguồn</span>
          </button>

          <button
            onClick={() => setActiveTab('xray')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'xray'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>2. Phân tích X-quang (3 Mock Scores)</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'report'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>3. Báo cáo sơ bộ & Chỉnh sửa</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>4. Lịch sử phiên bản ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'consultations'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>5. Hội chẩn ({consultations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'files'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Files className="w-4 h-4" />
            <span>6. Tệp đính kèm ({files.length})</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Workstation */}
      <div className="w-full">
        
        {/* TAB 1: Documents & Citations */}
        {activeTab === 'documents' && (
          <div>
            {extractionError ? (
              <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-xs">
                <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-amber-950 mb-1">Không thể trích xuất hồ sơ</h3>
                <p className="text-sm text-amber-800 mb-4">{extractionError}</p>
                <div className="text-xs bg-white p-3.5 rounded-xl border border-amber-200 text-slate-600 text-left leading-relaxed">
                  <strong>Nguyên tắc y khoa an toàn:</strong> Khi hồ sơ thiếu trang hoặc không đủ điều kiện trích xuất, hệ thống từ chối xử lý và không dùng mô hình để suy đoán nội dung bị thiếu.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-230px)] min-h-[600px] max-h-[850px]">
                {/* Left Column: PDF Viewer */}
                <div className="lg:col-span-7 h-full overflow-hidden">
                  <PdfViewer
                    caseId={caseId}
                    activePage={activePdfPage}
                    onPageChange={setActivePdfPage}
                    selectedSource={selectedSource}
                  />
                </div>

                {/* Right Column: Extraction Panel */}
                <div className="lg:col-span-5 h-full overflow-hidden">
                  <ExtractionPanel
                    extraction={extraction}
                    selectedFieldKey={selectedFieldKey}
                    onSelectField={handleSelectField}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: X-Ray Analysis */}
        {activeTab === 'xray' && (
          <div className="w-full">
            <XrayPanel
              caseId={caseId}
              prediction={prediction}
              error={predictionError}
            />
          </div>
        )}

        {/* TAB 3: Report Editor */}
        {activeTab === 'report' && (
          <div className="w-full">
            <ReportEditor
              caseId={caseId}
              currentReport={currentReport}
              onSaveEdit={handleSaveEdit}
              onApprove={handleApprove}
              isSaving={isSaving}
            />
          </div>
        )}

        {/* TAB 4: Version History */}
        {activeTab === 'history' && (
          <div className="w-full">
            <VersionHistory
              reports={reports}
              auditLogs={auditLogs}
              currentVersionId={currentReport?.id || ''}
              onSelectVersion={(ver) => {
                setCurrentReport(ver);
                setActiveTab('report');
              }}
            />
          </div>
        )}

        {/* TAB 5: Consultations */}
        {activeTab === 'consultations' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Buổi Hội Chẩn Liên Viện Cho Ca {caseDetail.case_code || caseDetail.id}</h3>
                <p className="text-xs text-slate-500">Lịch họp trực tuyến và ghi nhận kết luận thẩm định chuyên môn</p>
              </div>

              <button
                onClick={() => setShowConModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Lên lịch hội chẩn cho ca này</span>
              </button>
            </div>

            <div className="space-y-3">
              {consultations.map((con) => (
                <div key={con.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{con.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                        {con.status}
                      </span>
                    </div>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Thời gian: {con.scheduled_at} &bull; Người tạo: {con.created_by || 'BS'}
                    </p>
                    {con.conclusion_notes && (
                      <p className="mt-2 p-2 bg-white rounded border border-slate-200 text-slate-700">
                        <strong>Kết luận:</strong> {con.conclusion_notes}
                      </p>
                    )}
                  </div>

                  {con.zoom_meeting_url && (
                    <button
                      onClick={() => window.open(con.zoom_meeting_url!, '_blank', 'noopener,noreferrer')}
                      className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
                    >
                      <Video className="w-4 h-4" />
                      <span>Vào phòng Zoom</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </button>
                  )}
                </div>
              ))}

              {consultations.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  Chưa có lịch hội chẩn nào cho ca bệnh này.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Files & AI Processing */}
        {activeTab === 'files' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Quản lý Tệp Đính kèm & Xử lý AI</h3>
                <p className="text-xs text-slate-500">Danh sách tệp PDF và ảnh X-quang được lưu trữ trong storage/cases/{caseId}</p>
              </div>

              <button
                onClick={handleRunProcessing}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>Chạy lại AI Trích xuất & Phân tích</span>
              </button>
            </div>

            {/* Upload form */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
              <span className="font-bold text-slate-800 block">Tải thêm tệp đính kèm vào ca bệnh:</span>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={uploadKind}
                  onChange={(e) => setUploadKind(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  <option value="document">Hồ sơ bệnh án (PDF)</option>
                  <option value="image">Hình ảnh X-quang (PNG/JPG)</option>
                </select>

                {uploadKind === 'image' && (
                  <select
                    value={uploadViewPos}
                    onChange={(e) => setUploadViewPos(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                  >
                    <option value="PA">Tư thế PA (Khuyên dùng)</option>
                    <option value="AP">Tư thế AP (Nằm tại giường)</option>
                  </select>
                )}

                <label className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-sky-600" /> : <UploadCloud className="w-4 h-4 text-slate-500" />}
                  <span>{isUploading ? 'Đang tải...' : 'Chọn tệp tải lên'}</span>
                  <input
                    type="file"
                    accept={uploadKind === 'document' ? '.pdf' : 'image/*'}
                    onChange={handleAddFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Files List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Tên tệp</th>
                    <th className="py-2.5 px-3">Loại tệp</th>
                    <th className="py-2.5 px-3">Dung lượng</th>
                    <th className="py-2.5 px-3">Số trang / Tư thế</th>
                    <th className="py-2.5 px-3">Mã băm SHA256</th>
                    <th className="py-2.5 px-3 text-right">Tải về</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {files.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{f.original_filename}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${f.kind === 'document' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'}`}>
                          {f.kind.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{(f.size_bytes / 1024).toFixed(1)} KB</td>
                      <td className="py-2.5 px-3">{f.kind === 'document' ? `${f.page_count} trang` : f.view_position}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 max-w-xs truncate" title={f.sha256_hash}>
                        {f.sha256_hash.slice(0, 16)}...
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href={f.kind === 'document' ? `/api/cases/${caseId}/document` : `/api/cases/${caseId}/image`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 hover:underline font-semibold"
                        >
                          Mở tệp &rarr;
                        </a>
                      </td>
                    </tr>
                  ))}
                  {files.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Chưa có bản ghi tệp nào trong bảng case_files.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Consultation Modal */}
      {showConModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Lên lịch Hội chẩn Ca {caseDetail.case_code || caseDetail.id}
            </h3>

            <form onSubmit={handleCreateCaseConsultation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Tiêu đề buổi hội chẩn *</label>
                <input
                  type="text"
                  required
                  value={conTitle}
                  onChange={(e) => setConTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Thời gian tổ chức *</label>
                <input
                  type="text"
                  required
                  value={conTime}
                  onChange={(e) => setConTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Phòng họp Zoom URL</label>
                <input
                  type="url"
                  value={conZoom}
                  onChange={(e) => setConZoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Xác nhận lên lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
