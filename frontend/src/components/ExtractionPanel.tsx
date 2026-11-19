import React from 'react';
import { 
  FileCheck2, 
  HelpCircle, 
  Clock, 
  Pill, 
  HeartPulse, 
  AlertCircle, 
  FileSearch, 
  CheckCircle,
  ExternalLink 
} from 'lucide-react';
import { ExtractionData, SourceCitation } from '../types';

interface ExtractionPanelProps {
  extraction: ExtractionData | null;
  selectedFieldKey: string | null;
  onSelectField: (fieldKey: string, source: SourceCitation | null, page: number) => void;
}

export const ExtractionPanel: React.FC<ExtractionPanelProps> = ({
  extraction,
  selectedFieldKey,
  onSelectField,
}) => {
  if (!extraction || !extraction.fields) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center h-full">
        <FileSearch className="w-10 h-10 text-slate-300 mb-2 animate-pulse" />
        <h4 className="font-bold text-slate-700 text-sm">Đang tải dữ liệu trích xuất hồ sơ...</h4>
        <p className="text-xs text-slate-400 mt-1">Đang phân tích và truy vết dẫn nguồn từ tệp PDF</p>
      </div>
    );
  }

  const { fields } = extraction;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã có nguồn
          </span>
        );
      case 'missing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
            <HelpCircle className="w-3 h-3 text-amber-600" /> Chưa có dữ liệu
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
            <CheckCircle className="w-3 h-3 text-sky-600" /> Phủ định có căn cứ
          </span>
        );
      default:
        return null;
    }
  };

  const fieldConfigs = [
    {
      key: 'symptoms',
      label: '1. Triệu chứng lâm sàng',
      icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
      data: fields.symptoms,
    },
    {
      key: 'medical_history',
      label: '2. Tiền sử bệnh lý',
      icon: <FileCheck2 className="w-4 h-4 text-sky-600" />,
      data: fields.medical_history,
    },
    {
      key: 'medications',
      label: '3. Thuốc đang sử dụng',
      icon: <Pill className="w-4 h-4 text-emerald-600" />,
      data: fields.medications,
    },
    {
      key: 'allergies',
      label: '4. Tiền sử dị ứng',
      icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
      data: fields.allergies,
    },
    {
      key: 'test_datetime',
      label: '5. Thời điểm chụp X-quang',
      icon: <Clock className="w-4 h-4 text-indigo-600" />,
      data: fields.test_datetime,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-sky-600" />
            <span>5 Nhóm trường trích xuất hồ sơ</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Nhấn vào từng trường để đối chiếu trực tiếp đoạn trích dẫn gốc trong PDF
          </p>
        </div>
        <span className="text-[10px] font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200 font-bold">
          MODE: {extraction.mode.toUpperCase()}
        </span>
      </div>

      {/* Field Cards List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {fieldConfigs.map(({ key, label, icon, data }) => {
          if (!data) return null;
          const isSelected = selectedFieldKey === key;
          const hasSource = Boolean(data.source);

          return (
            <div
              key={key}
              onClick={() => {
                if (data.source) {
                  onSelectField(key, data.source, data.source.page_number);
                } else {
                  onSelectField(key, null, 1);
                }
              }}
              className={`rounded-xl border p-3.5 transition-all cursor-pointer select-none ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/40 shadow-xs ring-1 ring-sky-400'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              {/* Field Title & Status Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800">
                  {icon}
                  <span>{label}</span>
                </div>
                {renderStatusBadge(data.status)}
              </div>

              {/* Value Area */}
              <div className="mt-1">
                {data.status === 'missing' ? (
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs">
                    <p className="font-semibold">Chưa có thông tin ghi nhận trong hồ sơ ban đầu.</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 font-normal">
                      (Hệ thống giữ nguyên nhãn thiếu dữ liệu, không tự gán &quot;Không dị ứng&quot;)
                    </p>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    {Array.isArray(data.value) ? (
                      <ul className="list-disc list-inside space-y-0.5 font-medium">
                        {data.value.map((v, i) => (
                          <li key={i} className="text-slate-800">{v}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{data.value}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Source Citation Area */}
              {hasSource && data.source && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-600">
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-sky-800 flex items-center justify-between">
                      <span>Nguồn: Trang {data.source.page_number} — {data.source.section}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Nhấn để đối chiếu &rarr;</span>
                    </div>
                    <p className="italic text-slate-700 bg-slate-50/70 p-1.5 rounded border border-slate-200 mt-1 leading-snug">
                      &quot;{data.source.quote}&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* Note */}
              {data.note && (
                <p className="text-[11px] text-slate-400 mt-1.5 italic">
                  * {data.note}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center font-medium">
        Truy vết nguồn trực tiếp theo yêu cầu đánh giá báo cáo có căn cứ (MT1)
      </div>
    </div>
  );
};
