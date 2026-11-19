export interface SourceCitation {
  document_id: string;
  page_number: number;
  section: string;
  quote: string;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FieldExtraction {
  value: string | string[] | null;
  status: 'present' | 'missing' | 'negative';
  source?: SourceCitation | null;
  note?: string | null;
}

export interface ExtractionData {
  case_id: string;
  mode: string;
  fields: {
    symptoms?: FieldExtraction;
    medical_history?: FieldExtraction;
    medications?: FieldExtraction;
    allergies?: FieldExtraction;
    test_datetime?: FieldExtraction;
    [key: string]: FieldExtraction | undefined;
  };
}

export interface PredictionVisualBox {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  description: string;
}

export interface PredictionLabel {
  code: string;
  name_vi: string;
  score: number;
  threshold_mock: number;
  is_suspected: boolean;
  finding_description: string;
  visual_box?: PredictionVisualBox | null;
}

export interface PredictionData {
  case_id: string;
  mode: string;
  is_mock: boolean;
  image_id?: string;
  image_source_type: string;
  paired_with_document: boolean;
  model_name: string;
  labels: PredictionLabel[];
  disclaimer: string;
}

export interface ReportContent {
  summary: string;
  clinical_notes: string;
  xray_observations: string;
  attention_points: string[];
  recommended_action: string;
  source_references?: Array<{
    field: string;
    page: number;
    quote: string;
  }>;
}

export interface ReportVersion {
  id: string;
  case_id: string;
  version_number: number;
  status: 'AI_DRAFT' | 'DOCTOR_EDITED' | 'DOCTOR_APPROVED';
  parent_version_id?: string | null;
  actor_label: string;
  actor_role: string;
  content: ReportContent;
  change_summary?: string | null;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  case_id: string;
  version_id: string;
  actor_label: string;
  action: string;
  source_version_id?: string | null;
  timestamp_utc: string;
  change_summary?: string | null;
}

export interface CaseItem {
  id: string;
  patient_name_demo: string;
  age?: number | null;
  gender?: string | null;
  status: string;
  is_mock: boolean;
  error_type?: string | null;
  error_message?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface CaseDetail extends CaseItem {
  has_document: boolean;
  has_image: boolean;
  latest_version?: ReportVersion | null;
  report_versions_count: number;
}

export interface DemoConfig {
  demo_mode: boolean;
  disclaimer: string;
  zoom_meeting_url?: string | null;
  zoom_enabled: boolean;
  public_demo_url?: string | null;
}

export interface DataPlanSplit {
  split_name: string;
  count: number;
  role: string;
  cardiomegaly_positive: string;
  pleural_effusion_positive: string;
  lung_opacity_positive: string;
  notes: string;
}

export interface KpiTarget {
  code: string;
  name: string;
  target: string;
  status: string;
  measurement: string;
}

export interface ResearchDataPlan {
  dataset_name: string;
  published_total: number;
  projection_status: string;
  posture_scope: string;
  label_consolidation_rule: string;
  splits: DataPlanSplit[];
  kpi_targets: KpiTarget[];
}
