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
  Activity
} from 'lucide-react';
import { 
  CaseDetail, 
  ExtractionData, 
  PredictionData, 
  ReportVersion, 
  AuditLogItem, 
  SourceCitation, 
  ReportContent 
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
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({ caseId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'xray' | 'report' | 'history'>('documents');

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [extraction, setExtraction] = useState<ExtractionData | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportVersion[]>([]);
  const [currentReport, setCurrentReport] = useState<ReportVersion | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // PDF Viewer navigation state
  const [activePdfPage, setActivePdfPage] = useState<number>(1);
  const [selectedSource, setSelectedSource] = useState<SourceCitation | null>(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
        return (
          <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-200">
            AI DRAFT
          </span>
        );
      case 'DOCTOR_EDITED':
        return (
          <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">
            DOCTOR EDITED
          </span>
        );
      case 'DOCTOR_APPROVED':
        return (
          <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
            DOCTOR APPROVED
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
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
                  {caseDetail.id}
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
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Chế độ: <strong className="text-slate-700">DỮ LIỆU MÔ PHỎNG (MOCK)</strong></span>
                <span>&bull;</span>
                <span>Số phiên bản báo cáo: <strong className="text-slate-700">{caseDetail.report_versions_count}</strong></span>
              </p>
            </div>
          </div>

          {/* Error Tag if any */}
          {caseDetail.error_type && (
            <div className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300">
              <FileWarning className="w-4 h-4 text-amber-700" />
              <span>Tình huống lỗi: {caseDetail.error_type}</span>
            </div>
          )}
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
      </div>
    </div>
  );
};
