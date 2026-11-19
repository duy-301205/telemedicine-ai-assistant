import {
  CaseItem,
  CaseDetail,
  ExtractionData,
  PredictionData,
  ReportVersion,
  ReportContent,
  AuditLogItem,
  DemoConfig,
  ResearchDataPlan
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    let errorDetail = `Lỗi máy chủ (${res.status})`;
    try {
      const errObj = await res.json();
      if (errObj.detail) {
        if (typeof errObj.detail === 'string') {
          errorDetail = errObj.detail;
        } else if (errObj.detail.message) {
          errorDetail = errObj.detail.message;
        } else {
          errorDetail = JSON.stringify(errObj.detail);
        }
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  getDemoConfig: () => fetchJson<DemoConfig>('/demo/config'),
  listCases: () => fetchJson<CaseItem[]>('/cases'),
  getCaseDetail: (caseId: string) => fetchJson<CaseDetail>(`/cases/${caseId}`),
  getDocumentUrl: (caseId: string) => `${API_BASE}/cases/${caseId}/document`,
  getImageUrl: (caseId: string) => `${API_BASE}/cases/${caseId}/image`,
  getExtraction: (caseId: string) => fetchJson<ExtractionData>(`/cases/${caseId}/extraction`),
  getPredictions: (caseId: string) => fetchJson<PredictionData>(`/cases/${caseId}/predictions`),
  listReports: (caseId: string) => fetchJson<ReportVersion[]>(`/cases/${caseId}/reports`),
  getReport: (caseId: string, versionId: string) => fetchJson<ReportVersion>(`/cases/${caseId}/reports/${versionId}`),
  saveDraftEdit: (caseId: string, data: {
    parent_version_id: string;
    actor_label: string;
    content: ReportContent;
    change_summary?: string;
  }) => fetchJson<ReportVersion>(`/cases/${caseId}/reports/draft-edit`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  approveReport: (caseId: string, versionId: string, data: {
    actor_label: string;
    confirmation_checked: boolean;
    notes?: string;
  }) => fetchJson<ReportVersion>(`/cases/${caseId}/reports/${versionId}/approve`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAuditLogs: (caseId: string) => fetchJson<AuditLogItem[]>(`/cases/${caseId}/audit-logs`),
  getDataPlan: () => fetchJson<ResearchDataPlan>('/research/data-plan'),
};
