import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Layers,
  Image as ImageIcon,
  Sparkles,
  UploadCloud,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { PredictionData, PredictionLabel } from '../types';

interface XrayPanelProps {
  caseId: string;
  prediction: PredictionData | null;
  error?: string | null;
  onRunAiProcess?: () => Promise<void>;
  onAttachSampleData?: () => Promise<void>;
  onUploadImage?: (file: File) => Promise<void>;
  isProcessing?: boolean;
}

export const XrayPanel: React.FC<XrayPanelProps> = ({ 
  caseId, 
  prediction, 
  error,
  onRunAiProcess,
  onAttachSampleData,
  onUploadImage,
  isProcessing = false
}) => {
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [selectedLabelCode, setSelectedLabelCode] = useState<string | null>(null);
  const [imgError, setImgError] = useState<boolean>(false);

  if (error) {
    return (
      <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-xs">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-rose-900 mb-1">Ảnh X-quang không hợp lệ</h3>
        <p className="text-sm text-rose-700 mb-4">{error}</p>
        <div className="text-xs bg-white p-3.5 rounded-xl border border-rose-200 text-slate-600 text-left leading-relaxed">
          <strong>Quy chuẩn hệ thống:</strong> Với các ca tệp ảnh lỗi hoặc hỏng định dạng (`INVALID_IMAGE`), hệ thống từ chối phân tích và không hiển thị 3 điểm số giả lập như thể đã thực hiện thành công.
        </div>
      </div>
    );
  }

  const imageUrl = `/api/cases/${caseId}/image`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
      {/* Left Column: Image Viewer with 3 Markers Overlay */}
      <div className="lg:col-span-7 flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        {/* Image Controls Header */}
        <div className="bg-slate-900/90 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Phim X-quang Ngực Thẳng (PA View)</span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
              {prediction?.is_mock ? 'MOCK FIXTURE' : (prediction ? 'CLINICAL' : 'CHƯA PHÂN TÍCH')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {prediction && prediction.labels && prediction.labels.length > 0 && !imgError && (
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  showOverlays
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showOverlays ? 'Hiện 3 vùng chú ý' : 'Ẩn vùng chú ý'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Viewport */}
        <div className="relative flex-1 min-h-[500px] flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
          {imgError ? (
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <ImageIcon className="w-8 h-8 text-sky-400" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Chưa có ảnh X-quang hoặc tệp chưa khả dụng</h4>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Ca bệnh này chưa có tệp ảnh X-quang ngực thẳng PA hoặc tệp chưa được nạp. Bạn có thể nạp ảnh mẫu chuẩn VinDr-CXR hoặc tải ảnh từ máy tính.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {onAttachSampleData && (
                  <button
                    onClick={async () => {
                      await onAttachSampleData();
                      setImgError(false);
                    }}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>⚡ Gắn ảnh mẫu VinDr-CXR (PA)</span>
                  </button>
                )}

                <label className="w-full sm:w-auto cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors">
                  <UploadCloud className="w-4 h-4 text-sky-400" />
                  <span>Tải ảnh từ máy tính</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0] && onUploadImage) {
                        await onUploadImage(e.target.files[0]);
                        setImgError(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative inline-block max-w-full max-h-full">
              <img
                src={imageUrl}
                alt="Minh họa X-quang ngực thẳng"
                onError={() => setImgError(true)}
                onLoad={() => setImgError(false)}
                className="max-h-[520px] w-auto rounded-lg object-contain border border-slate-800 shadow-2xl select-none"
              />

              {/* Visual Bounding Boxes / Attention Markers (3 points) */}
              {showOverlays && prediction && prediction.labels && (
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
                        className={`absolute border-2 rounded-lg transition-all duration-300 pointer-events-auto cursor-pointer ${
                          isHighlighted
                            ? 'ring-4 ring-white/70 bg-white/20'
                            : 'bg-black/15 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedLabelCode(lbl.code === selectedLabelCode ? null : lbl.code)}
                        title={`${box.label}: ${box.description}`}
                      >
                        <span
                          style={{ backgroundColor: box.color }}
                          className="absolute -top-6 left-0 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow whitespace-nowrap"
                        >
                          {box.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>* Vùng khoanh là đồ họa minh họa kỹ thuật — không phải bản đồ nhiệt Grad-CAM thật</span>
          <span className="text-slate-500 font-mono">Model: {prediction?.model_name || 'VinDr-CXR Mock'}</span>
        </div>
      </div>

      {/* Right Column: 3 Scores & Scientific Disclaimers */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        {prediction && prediction.labels && prediction.labels.length > 0 ? (
          <>
            {/* Main Score Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span>Ba điểm số dự đoán MOCK</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Bài toán phân loại đa nhãn (Multi-label classification)
                  </p>
                </div>
                <span className="bg-amber-50 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  {prediction.is_mock ? 'MOCK FIXTURE' : 'CLINICAL'}
                </span>
              </div>

              {/* List of Scores */}
              <div className="mt-4 space-y-3">
                {prediction.labels.map((lbl: PredictionLabel) => {
                  const isSelected = selectedLabelCode === lbl.code;
                  const percent = Math.round(lbl.score * 100);
                  const isHigh = lbl.score >= lbl.threshold_mock;

                  return (
                    <div
                      key={lbl.code}
                      onClick={() => setSelectedLabelCode(isSelected ? null : lbl.code)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/40 shadow-xs ring-1 ring-sky-400'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 mb-1">
                        <span className="flex items-center gap-1.5">
                          {lbl.name_vi}
                          <span className="font-mono text-xs text-slate-400 font-normal">({lbl.code})</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-extrabold text-slate-900">{lbl.score.toFixed(2)}</span>
                          {isHigh ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              Nghi ngờ
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Bình thường
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative mt-2 border border-slate-200">
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
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-600 z-10"
                          style={{ left: `${lbl.threshold_mock * 100}%` }}
                          title={`Ngưỡng giả lập: ${lbl.threshold_mock}`}
                        />
                      </div>

                      {/* Finding Note */}
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                        {lbl.finding_description}
                      </p>

                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Ngưỡng phân định: {lbl.threshold_mock.toFixed(2)}</span>
                        <span>Xác suất minh họa: {percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regulatory Disclaimers */}
            <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-4 text-xs space-y-2 text-amber-950 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Tuyên bố minh bạch dữ liệu:</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-700">
                {prediction.disclaimer}
              </p>
              <div className="border-t border-amber-200/80 pt-2 space-y-1 text-[11px] text-amber-900">
                <p>• <strong>Giới hạn tư thế chụp:</strong> Dữ liệu VinDr-CXR áp dụng cho tư thế ngực thẳng PA. Chưa kiểm chứng trên tư thế AP hoặc bệnh nhân hồi sức nằm tại giường.</p>
                <p>• <strong>Ngưỡng giả định:</strong> Ngưỡng 0.50 chỉ là fixture phục vụ hiển thị UI, chưa được hiệu chỉnh thực nghiệm trên tập validation.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Điểm số phân tích tổn thương X-quang</h3>
                <p className="text-[11px] text-slate-500">Mô hình AI dự đoán đa nhãn (Multi-label Mock)</p>
              </div>
            </div>

            <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm mb-1">Chưa có kết quả dự đoán tổn thương</h4>
              <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto leading-relaxed">
                Ca này chưa chạy phân tích mô hình X-quang. Bạn có thể kích hoạt phân tích tự động hoặc gắn dữ liệu mẫu hoàn chỉnh.
              </p>

              <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
                {onRunAiProcess && (
                  <button
                    onClick={onRunAiProcess}
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isProcessing ? 'Đang phân tích...' : '⚡ Chạy AI Phân tích Tổn thương'}</span>
                  </button>
                )}

                {onAttachSampleData && (
                  <button
                    onClick={onAttachSampleData}
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>⚡ Gắn toàn bộ dữ liệu mẫu & Phân tích</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Ghi chú kỹ thuật:</span>
              </p>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Sau khi phân tích, hệ thống sẽ xuất 3 điểm số mô phỏng (Tim to, Tràn dịch màng phổi, Thâm nhiễm) tương thích với tư thế PA của bộ dữ liệu VinDr-CXR.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
