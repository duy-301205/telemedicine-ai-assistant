import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  HelpCircle,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { PredictionData, PredictionLabel } from '../types';

interface XrayPanelProps {
  caseId: string;
  prediction: PredictionData | null;
  error?: string | null;
}

export const XrayPanel: React.FC<XrayPanelProps> = ({ caseId, prediction, error }) => {
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [selectedLabelCode, setSelectedLabelCode] = useState<string | null>(null);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-xl p-8 text-center max-w-xl mx-auto shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-900 mb-1">Ảnh X-quang không hợp lệ</h3>
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <div className="text-xs bg-white p-3 rounded border border-red-200 text-slate-600 text-left">
          <strong>Quy chuẩn hệ thống:</strong> Với các ca tệp ảnh lỗi hoặc hỏng định dạng (`INVALID_IMAGE`), hệ thống từ chối phân tích và không hiển thị 3 điểm số giả lập như thể đã thực hiện thành công.
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm text-slate-600">Đang tải phân tích hình ảnh X-quang...</p>
      </div>
    );
  }

  const imageUrl = `/api/cases/${caseId}/image`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left Column: Image Viewer with 3 Markers Overlay */}
      <div className="lg:col-span-7 flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        {/* Image Controls Header */}
        <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Phim X-quang Ngực Thẳng (PA View)</span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">
              ILLUSTRATIVE MOCK
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOverlays(!showOverlays)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                showOverlays
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showOverlays ? 'Hiện 3 vùng chú ý' : 'Ẩn vùng chú ý'}</span>
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="relative flex-1 min-h-[460px] flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
          <div className="relative inline-block max-w-full max-h-full">
            <img
              src={imageUrl}
              alt="Minh họa X-quang ngực thẳng"
              className="max-h-[500px] w-auto rounded object-contain border border-slate-800 shadow-2xl select-none"
            />

            {/* Visual Bounding Boxes / Attention Markers (3 points) */}
            {showOverlays && (
              <div className="absolute inset-0 pointer-events-none">
                {prediction.labels.map((lbl) => {
                  if (!lbl.visual_box) return null;
                  const box = lbl.visual_box;
                  const isHighlighted = selectedLabelCode === lbl.code;

                  return (
                    <div
                      key={lbl.code}
                      style={{
                        left: `${box.x * 100}%`,
                        top: `${box.y * 100}%`,
                        width: `${box.width * 100}%`,
                        height: `${box.height * 100}%`,
                        borderColor: box.color,
                      }}
                      className={`absolute border-2 rounded transition-all duration-300 pointer-events-auto cursor-pointer ${
                        isHighlighted
                          ? 'ring-4 ring-white/60 bg-white/20'
                          : 'bg-black/10 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedLabelCode(lbl.code === selectedLabelCode ? null : lbl.code)}
                      title={`${box.label}: ${box.description}`}
                    >
                      <span
                        style={{ backgroundColor: box.color }}
                        className="absolute -top-6 left-0 text-[10px] font-bold text-white px-1.5 py-0.5 rounded shadow whitespace-nowrap"
                      >
                        {box.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-950/90 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>* Vùng khoanh là đồ họa minh họa kỹ thuật — không phải bản đồ nhiệt Grad-CAM thật</span>
          <span className="text-slate-500 font-mono">Model ID: {prediction.model_name}</span>
        </div>
      </div>

      {/* Right Column: 3 Scores & Scientific Disclaimers */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        {/* Main Score Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-600" />
                Ba điểm số dự đoán MOCK
              </h3>
              <p className="text-[11px] text-slate-500">
                Bài toán phân loại đa nhãn (Multi-label classification)
              </p>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-200">
              MOCK FIXTURE
            </span>
          </div>

          {/* List of 3 Scores */}
          <div className="mt-4 space-y-3.5">
            {prediction.labels.map((lbl: PredictionLabel) => {
              const isSelected = selectedLabelCode === lbl.code;
              const percent = Math.round(lbl.score * 100);
              const isHigh = lbl.score >= lbl.threshold_mock;

              return (
                <div
                  key={lbl.code}
                  onClick={() => setSelectedLabelCode(isSelected ? null : lbl.code)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/60 shadow-sm ring-1 ring-sky-400'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      {lbl.name_vi}
                      <span className="font-mono text-xs text-slate-400 font-normal">({lbl.code})</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{lbl.score.toFixed(2)}</span>
                      {isHigh ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          Nghi ngờ
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Bình thường
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative mt-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        lbl.code === 'cardiomegaly'
                          ? 'bg-rose-500'
                          : lbl.code === 'pleural_effusion'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                    {/* Mock Threshold Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-700 z-10"
                      style={{ left: `${lbl.threshold_mock * 100}%` }}
                      title={`Ngưỡng giả lập: ${lbl.threshold_mock}`}
                    />
                  </div>

                  {/* Finding Note */}
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    {lbl.finding_description}
                  </p>

                  {/* Mock threshold explanation */}
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Ngưỡng phân định: {lbl.threshold_mock.toFixed(2)}</span>
                    <span>Xác suất minh họa: {percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regulatory & Safety Disclaimers */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs space-y-2 text-amber-950 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Tuyên bố minh bạch dữ liệu:</span>
          </div>
          <p className="leading-relaxed">
            {prediction.disclaimer}
          </p>
          <div className="border-t border-amber-200/80 pt-2 space-y-1 text-[11px] text-amber-800">
            <p>• <strong>Giới hạn tư thế chụp:</strong> Dữ liệu VinDr-CXR áp dụng cho tư thế ngực thẳng PA. Chưa kiểm chứng trên tư thế AP hoặc bệnh nhân hồi sức nằm tại giường.</p>
            <p>• <strong>Ngưỡng giả định:</strong> Ngưỡng 0.50 chỉ là fixture phục vụ hiển thị UI, chưa được hiệu chỉnh thực nghiệm trên tập validation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
