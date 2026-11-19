import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, FileText, ExternalLink, Bookmark, CheckCircle2 } from 'lucide-react';
import { SourceCitation } from '../types';

interface PdfViewerProps {
  caseId: string;
  activePage: number;
  onPageChange: (page: number) => void;
  selectedSource: SourceCitation | null;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  caseId,
  activePage,
  onPageChange,
  selectedSource,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'interactive' | 'native'>('interactive');

  const pdfUrl = `/api/cases/${caseId}/document#page=${activePage}`;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 80));
  const handleResetZoom = () => setZoomLevel(100);

  const isHighlighted = (quoteText: string) => {
    if (!selectedSource) return false;
    return selectedSource.quote.includes(quoteText) || quoteText.includes(selectedSource.quote);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Top Toolbar */}
      <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-100">Hồ sơ bệnh án gốc (PDF 2 trang)</span>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-xs mr-1">Trang:</span>
          <button
            onClick={() => onPageChange(1)}
            className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
              activePage === 1
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            1
          </button>
          <button
            onClick={() => onPageChange(2)}
            className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
              activePage === 2
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            2
          </button>
        </div>

        {/* View Mode & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 px-1.5 py-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-2 py-0.5 text-xs rounded font-medium ${
                viewMode === 'interactive' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Văn bản trích xuất
            </button>
            <button
              onClick={() => setViewMode('native')}
              className={`px-2 py-0.5 text-xs rounded font-medium ${
                viewMode === 'native' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              PDF Gốc
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-sky-400 text-slate-300 transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-300 w-10 text-center font-mono">{zoomLevel}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-sky-400 text-slate-300 transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:text-sky-400 text-slate-400 transition-colors ml-0.5"
              title="Đặt lại kích thước"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <a
            href={`/api/cases/${caseId}/document`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors hidden md:block"
            title="Mở PDF toàn màn hình trong tab mới"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start">
        {viewMode === 'native' ? (
          <div className="w-full h-full min-h-[560px] bg-white rounded-lg shadow border border-slate-300 overflow-hidden">
            <iframe
              src={pdfUrl}
              title={`PDF ca ${caseId}`}
              className="w-full h-full min-h-[620px] border-0"
            />
          </div>
        ) : (
          /* High-Fidelity Interactive Page Representation */
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-2xl bg-white text-slate-900 rounded-lg shadow-xl border border-slate-300 p-8 sm:p-10 font-sans transition-transform duration-150 relative min-h-[700px]"
          >
            {/* Page Header */}
            <div className="border-b-2 border-slate-800 pb-3 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-slate-900 uppercase">
                    BỆNH VIỆN ĐA KHOA MÔ PHỎNG — TRUNG TÂM TELEMEDICINE
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    HỆ THỐNG TRỢ LÝ AI HỖ TRỢ CHUẨN BỊ HỘI CHẨN (PROTOTYPE DEMO)
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
                  Trang {activePage} / 2
                </span>
              </div>
            </div>

            {/* PAGE 1 CONTENT */}
            {activePage === 1 && (
              <div className="space-y-5 text-sm">
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-800 font-bold text-xs uppercase tracking-wider">
                  MÃ CA: {caseId} — HỒ SƠ MÔ PHỎNG, KHÔNG PHẢI BỆNH NHÂN THẬT
                </div>

                {/* Section I */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    I. THÔNG TIN HÀNH CHÍNH
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div><strong>Họ và tên:</strong> Nguyễn Văn Giả Định (Demo)</div>
                    <div><strong>Tuổi:</strong> 68 &nbsp;&nbsp; <strong>Giới tính:</strong> Nam</div>
                    <div className="col-span-2"><strong>Khoa phòng:</strong> Nội Hô hấp — Hội chẩn từ xa</div>
                  </div>
                </div>

                {/* Section II: Symptoms */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    II. BỆNH SỬ VÀ LÝ DO KHÁM
                  </h4>
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      selectedSource?.section === 'Triệu chứng'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/50 shadow-md'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <p className={`font-medium ${isHighlighted('Triệu chứng') ? 'text-amber-900 bg-amber-200/60 px-1 py-0.5 rounded' : 'text-slate-800'}`}>
                      Triệu chứng: Bệnh nhân ho khan, khó thở trong 3 ngày.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Bệnh nhân cảm thấy mệt mỏi tăng dần khi gắng sức, không sốt, không đau ngực dữ dội.
                    </p>
                    {selectedSource?.section === 'Triệu chứng' && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded w-fit">
                        <Bookmark className="w-3 h-3" /> Đang chọn: Đoạn gốc trích dẫn triệu chứng
                      </div>
                    )}
                  </div>
                </div>

                {/* Section III: Medical History */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    III. TIỀN SỬ BỆNH
                  </h4>
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      selectedSource?.section === 'Tiền sử'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/50 shadow-md'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <p className={`font-medium ${isHighlighted('Tiền sử') ? 'text-amber-900 bg-amber-200/60 px-1 py-0.5 rounded' : 'text-slate-800'}`}>
                      Tiền sử: Tăng huyết áp.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Được chẩn đoán tăng huyết áp 5 năm trước, điều trị ngoại trú định kỳ.
                    </p>
                    {selectedSource?.section === 'Tiền sử' && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded w-fit">
                        <Bookmark className="w-3 h-3" /> Đang chọn: Đoạn gốc trích dẫn tiền sử
                      </div>
                    )}
                  </div>
                </div>

                {/* Section IV: Medications */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    IV. ĐIỀU TRỊ HIỆN TẠI VÀ THUỐC ĐANG DÙNG
                  </h4>
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      selectedSource?.section === 'Thuốc đang dùng'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/50 shadow-md'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <p className={`font-medium ${isHighlighted('Thuốc đang dùng') ? 'text-amber-900 bg-amber-200/60 px-1 py-0.5 rounded' : 'text-slate-800'}`}>
                      Thuốc đang dùng: Amlodipine 5 mg/ngày.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Tuân thủ uống thuốc vào buổi sáng sau ăn.
                    </p>
                    {selectedSource?.section === 'Thuốc đang dùng' && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded w-fit">
                        <Bookmark className="w-3 h-3" /> Đang chọn: Đoạn gốc trích dẫn thuốc điều trị
                      </div>
                    )}
                  </div>
                </div>

                {/* Section V: Allergies */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    V. TÌNH TRẠNG DỊ ỨNG
                  </h4>
                  <div className="p-3 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 text-xs text-slate-600">
                    <p className="italic text-slate-500">
                      (Mục này không có ghi nhận thông tin trong hồ sơ ban đầu)
                    </p>
                    <p className="mt-1 text-[11px] text-amber-800 font-medium">
                      ⚠️ Lưu ý AI: Hệ thống gắn nhãn <span className="font-bold underline">Chưa có dữ liệu</span> (missing); không được khẳng định bệnh nhân &quot;Không dị ứng&quot; vì thiếu câu phủ định tường minh.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 2 CONTENT */}
            {activePage === 2 && (
              <div className="space-y-6 text-sm">
                <div className="p-2.5 bg-slate-100 border border-slate-300 rounded text-slate-800 font-bold text-xs uppercase tracking-wider">
                  MÃ CA HỒ SƠ: {caseId} (TIẾP THEO — PHIẾU CẬN LÂM SÀNG & GHI CHÚ)
                </div>

                {/* Section VI: Test Datetime */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    VI. CHỈ ĐỊNH CHẨN ĐOÁN HÌNH ẢNH
                  </h4>
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      selectedSource?.section === 'Thời điểm chụp X-quang'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/50 shadow-md'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <p className={`font-medium ${isHighlighted('Thời điểm chụp') ? 'text-amber-900 bg-amber-200/60 px-1 py-0.5 rounded' : 'text-slate-800'}`}>
                      Thời điểm chụp X-quang: 15/11/2026, 08:30 (giờ Việt Nam).
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Kỹ thuật: Chụp X-quang ngực thẳng tư thế sau - trước (PA view).
                    </p>
                    <p className="text-xs text-slate-500">
                      Chỉ định thực hiện bởi: BS. Khám Sơ Bộ.
                    </p>
                    {selectedSource?.section === 'Thời điểm chụp X-quang' && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded w-fit">
                        <Bookmark className="w-3 h-3" /> Đang chọn: Đoạn gốc thời điểm chỉ định
                      </div>
                    )}
                  </div>
                </div>

                {/* Section VII: Legal & Safety Notes */}
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-red-600 rounded-full inline-block"></span>
                    VII. GHI CHÚ PHÁP LÝ VÀ PHẠM VI HỆ THỐNG DEMO
                  </h4>
                  <div className="p-3.5 rounded-lg border border-red-200 bg-red-50/70 text-xs text-red-950 space-y-2">
                    <p className="font-medium">
                      Ghi chú: Đây là hồ sơ biên soạn phục vụ demo kỹ thuật. Ảnh X-quang minh họa được ghép rời, KHÔNG phải phim của bệnh nhân trong hồ sơ.
                    </p>
                    <div className="border-t border-red-200 pt-2 space-y-1 text-slate-700">
                      <p className="font-bold text-red-900">Cảnh báo an toàn y tế:</p>
                      <p>1. Toàn bộ điểm số phân tích và đề xuất văn bản do AI sinh ra chỉ là dữ liệu giả lập (MOCK).</p>
                      <p>2. Không sử dụng kết quả này trực tiếp cho quyết định điều trị, chỉ định thuốc hoặc can thiệp y khoa.</p>
                      <p>3. Bác sĩ hội chẩn chịu trách nhiệm thẩm định và xác nhận cuối cùng trước khi đưa vào biên bản hội chẩn.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-300 pt-3 mt-8 flex justify-between items-center text-[11px] text-slate-400">
              <span>Trang {activePage} / 2 — {caseId} — Dữ liệu giả lập kỹ thuật</span>
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Bản mẫu chuẩn mực (Idempotent Seed)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
