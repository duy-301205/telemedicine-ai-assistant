import {
  CaseItem,
  CaseDetail,
  CaseFile,
  ExtractionData,
  PredictionData,
  ReportVersion,
  ReportContent,
  AuditLogItem,
  ConsultationItem,
  DashboardSummary,
  UserAccount,
  DemoConfig,
  ResearchDataPlan
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('telemed_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {})
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
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
  // Auth
  getDemoAccounts: () => fetchJson<UserAccount[]>('/auth/demo-accounts'),
  login: (username: string) => fetchJson<{ access_token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username })
  }),
  getMe: (role?: string) => fetchJson<any>(`/auth/me${role ? `?role=${role}` : ''}`),

  // Config & Dashboard
  getDemoConfig: () => fetchJson<DemoConfig>('/demo/config'),
  getDashboardSummary: () => fetchJson<DashboardSummary>('/dashboard/summary'),

  // Cases Management
  listCases: (params?: { search?: string; status?: string; include_archived?: boolean }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.append('search', params.search);
    if (params?.status && params.status !== 'ALL') sp.append('status', params.status);
    if (params?.include_archived) sp.append('include_archived', 'true');
    const q = sp.toString();
    return fetchJson<CaseItem[]>(`/cases${q ? `?${q}` : ''}`);
  },
  getCaseDetail: (caseId: string) => fetchJson<CaseDetail>(`/cases/${caseId}`),
  createCase: (data: { patient_name_demo: string; case_code?: string; age?: number; gender?: string; notes?: string; created_by?: string }) =>
    fetchJson<CaseDetail>('/cases', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateCase: (caseId: string, data: { patient_name_demo?: string; age?: number; gender?: string; notes?: string; status?: string }) =>
    fetchJson<CaseDetail>(`/cases/${caseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  archiveCase: (caseId: string) =>
    fetchJson<{ status: string; message: string }>(`/cases/${caseId}`, {
      method: 'DELETE'
    }),

  // Files
  uploadCaseFile: async (caseId: string, file: File, kind: 'document' | 'image', viewPosition: string = 'PA', uploadedBy: string = 'Demo User'): Promise<CaseFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    formData.append('view_position', viewPosition);
    formData.append('uploaded_by', uploadedBy);

    const token = localStorage.getItem('telemed_token');
    const res = await fetch(`${API_BASE}/cases/${caseId}/files`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });

    if (!res.ok) {
      let errText = `Upload thất bại (${res.status})`;
      try {
        const errObj = await res.json();
        if (errObj.detail) errText = typeof errObj.detail === 'string' ? errObj.detail : errObj.detail.message || JSON.stringify(errObj.detail);
      } catch {}
      throw new Error(errText);
    }
    return res.json();
  },
  listCaseFiles: (caseId: string) => fetchJson<CaseFile[]>(`/cases/${caseId}/files`),
  getDocumentUrl: (caseId: string) => `${API_BASE}/cases/${caseId}/document`,
  getImageUrl: (caseId: string) => `${API_BASE}/cases/${caseId}/image`,

  // AI Pipeline & Manual Overrides
  processCase: (caseId: string, payload?: { mode?: string; view_position?: string }) =>
    fetchJson<any>(`/cases/${caseId}/process`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    }),
  attachSampleData: (caseId: string) =>
    fetchJson<any>(`/cases/${caseId}/attach-sample-data`, {
      method: 'POST'
    }),
  getExtraction: (caseId: string) => fetchJson<ExtractionData>(`/cases/${caseId}/extraction`),
  getPredictions: (caseId: string) => fetchJson<PredictionData>(`/cases/${caseId}/predictions`),
  manualExtraction: (caseId: string, fields: any) =>
    fetchJson<any>(`/cases/${caseId}/manual-extraction`, {
      method: 'POST',
      body: JSON.stringify(fields)
    }),
  manualPredictions: (caseId: string, labels: any[], disclaimer?: string) =>
    fetchJson<any>(`/cases/${caseId}/manual-predictions`, {
      method: 'POST',
      body: JSON.stringify({ labels, disclaimer })
    }),

  // Reports
  listReports: (caseId: string) => fetchJson<ReportVersion[]>(`/cases/${caseId}/reports`),
  getReport: (caseId: string, versionId: string) => fetchJson<ReportVersion>(`/cases/${caseId}/reports/${versionId}`),
  generateInitialReport: (caseId: string, actorLabel?: string) =>
    fetchJson<ReportVersion>(`/cases/${caseId}/reports/generate-initial${actorLabel ? `?actor_label=${encodeURIComponent(actorLabel)}` : ''}`, {
      method: 'POST'
    }),
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
  compareReports: (caseId: string, v1: string, v2: string) =>
    fetchJson<any>(`/cases/${caseId}/reports/compare?v1=${v1}&v2=${v2}`),
  getReportPdfExportUrl: (caseId: string, versionId: string) =>
    `${API_BASE}/cases/${caseId}/reports/${versionId}/export?format=pdf`,
  getReportJsonExportUrl: (caseId: string, versionId: string) =>
    `${API_BASE}/cases/${caseId}/reports/${versionId}/export?format=json`,
  getAuditLogs: (caseId: string) => fetchJson<AuditLogItem[]>(`/cases/${caseId}/audit-logs`),

  // Consultations
  listAllConsultations: () => fetchJson<ConsultationItem[]>('/consultations'),
  listCaseConsultations: (caseId: string) => fetchJson<ConsultationItem[]>(`/cases/${caseId}/consultations`),
  createConsultation: (caseId: string, data: {
    title: string;
    scheduled_at: string;
    zoom_meeting_url?: string;
    notes?: string;
    created_by?: string;
  }) => fetchJson<ConsultationItem>(`/cases/${caseId}/consultations`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateConsultation: (consultationId: string, data: {
    status?: string;
    conclusion_notes?: string;
    zoom_meeting_url?: string;
  }) => fetchJson<ConsultationItem>(`/consultations/${consultationId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  // Research
  getDataPlan: () => fetchJson<ResearchDataPlan>('/research/data-plan'),
};
