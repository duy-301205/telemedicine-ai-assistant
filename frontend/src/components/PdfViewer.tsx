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

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 130));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 90));
  const handleResetZoom = () => setZoomLevel(100);

  const isHighlighted = (sectionName: string) => {
    return selectedSource?.section === sectionName;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/70 rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
      {/* Top Toolbar */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          <FileText className="w-4 h-4 text-sky-600" />
          <span className="font-bold text-slate-800">Hồ sơ bệnh án gốc (PDF 2 trang)</span>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 px-2 py-1 rounded-lg border border-slate-200/80">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Trang:</span>
          <button
            onClick={() => onPageChange(1)}
            className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
              activePage === 1
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            1
          </button>
          <button
            onClick={() => onPageChange(2)}
            className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all ${
              activePage === 2
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            2
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                viewMode === 'interactive' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Văn bản
            </button>
            <button
              onClick={() => setViewMode('native')}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                viewMode === 'native' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              PDF Gốc
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100/90 px-2 py-1 rounded-lg border border-slate-200/80 text-slate-600">
            <button
              onClick={handleZoomOut}
              className="p-0.5 hover:text-sky-600 transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-9 text-center text-slate-700 font-semibold">{zoomLevel}%</span>
            <button
              onClick={handleZoomIn}
              className="p-0.5 hover:text-sky-600 transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-0.5 hover:text-sky-600 text-slate-400 transition-colors ml-0.5"
              title="Đặt lại zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* External Link */}
          <a
            href={`/api/cases/${caseId}/document`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors"
            title="Mở tệp PDF trong tab mới"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
        {viewMode === 'native' ? (
          <div className="w-full h-full min-h-[500px] bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <iframe
              src={pdfUrl}
              title={`PDF ca ${caseId}`}
              className="w-full h-full min-h-[550px] border-0"
            />
          </div>
        ) : (
          /* High-Fidelity Responsive Paper Document */
          <div
            style={{ fontSize: `${(zoomLevel / 100) * 14}px` }}
            className="w-full max-w-3xl bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200/80 p-6 sm:p-8 font-sans transition-all"
          >
            {/* Hospital Letterhead */}
            <div className="border-b-2 border-slate-900 pb-3 mb-5 flex justify-between items-start gap-4">
              <div>
                <h3 className="font-extrabold text-[1.05em] tracking-wider text-slate-900 uppercase">
                  BỆNH VIỆN ĐA KHOA MÔ PHỎNG — TRUNG TÂM TELEMEDICINE
                </h3>
                <p className="text-[0.85em] text-slate-500 font-medium">
                  HỆ THỐNG TRỢ LÝ AI HỖ TRỢ CHUẨN BỊ HỘI CHẨN (PROTOTYPE DEMO)
                </p>
              </div>
              <span className="text-[0.8em] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 flex-shrink-0">
                Trang {activePage} / 2
              </span>
            </div>

            {/* PAGE 1 CONTENT */}
            {activePage === 1 && (
              <div className="space-y-4">
                <div className="p-2.5 bg-rose-50 border border-rose-200/80 rounded-lg text-rose-800 font-bold text-[0.85em] uppercase tracking-wide">
                  MÃ CA: {caseId} — HỒ SƠ MÔ PHỎNG, KHÔNG PHẢI BỆNH NHÂN THẬT
                </div>

                {/* Section I */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-[0.9em] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    I. THÔNG TIN HÀNH CHÍNH
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[0.85em] text-slate-700 bg-slate-50/80 p-3 rounded-lg border border-slate-200">
                    <div><strong>Họ và tên:</strong> Nguyễn Văn Giả Định (Demo)</div>
                    <div><strong>Tuổi:</strong> 68 &nbsp;&bull;&nbsp; <strong>Giới tính:</strong> Nam</div>
                    <div className="col-span-2"><strong>Khoa phòng:</strong> Nội Hô hấp — Hội chẩn từ xa</div>
                  </div>
                </div>

                {/* Section II: Symptoms */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-[0.9em] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    II. BỆNH SỬ VÀ LÝ DO KHÁM
                  </h4>
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      isHighlighted('Triệu chứng')
                        ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/60 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <p className={`font-semibold ${isHighlighted('Triệu chứng') ? 'text-amber-950 bg-amber-200/60 px-1 rounded' : 'text-slate-800'}`}>
                      Triệu chứng: Bệnh nhân ho khan, khó thở trong 3 ngày.
                    </p>
                    <p className="text-[0.85em] text-slate-500 mt-1">
                      Bệnh nhân cảm thấy mệt mỏi tăng dần khi gắng sức, không sốt, không đau ngực dữ dội.
                    </p>
                    {isHighlighted('Triệu chứng') && (
                      <div className="mt-2 flex items-center gap-1 text-[0.75em] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded w-fit">
                        <Bookmark className="w-3 h-3 text-amber-700" /> Trích dẫn nguồn: Trang 1 — mục Triệu chứng
                      </div>
                    )}
                  </div>
                </div>

                {/* Section III: Medical History */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-[0.9em] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    III. TIỀN SỬ BỆNH
                  </h4>
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      isHighlighted('Tiền sử')
                        ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/60 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <p className={`font-semibold ${isHighlighted('Tiền sử') ? 'text-amber-950 bg-amber-200/60 px-1 rounded' : 'text-slate-800'}`}>
                      Tiền sử: Tăng huyết áp.
                    </p>
                    <p className="text-[0.85em] text-slate-500 mt-1">
                      Được chẩn đoán tăng huyết áp 5 năm trước, điều trị ngoại trú định kỳ.
                    </p>
                    {isHighlighted('Tiền sử') && (
                      <div className="mt-2 flex items-center gap-1 text-[0.75em] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded w-fit">
                        <Bookmark className="w-3 h-3 text-amber-700" /> Trích dẫn nguồn: Trang 1 — mục Tiền sử
                      </div>
                    )}
                  </div>
                </div>

                {/* Section IV: Medications */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-[0.9em] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    IV. ĐIỀU TRỊ HIỆN TẠI VÀ THUỐC ĐANG DÙNG
                  </h4>
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      isHighlighted('Thuốc đang dùng')
                        ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/60 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <p className={`font-semibold ${isHighlighted('Thuốc đang dùng') ? 'text-amber-950 bg-amber-200/60 px-1 rounded' : 'text-slate-800'}`}>
                      Thuốc đang dùng: Amlodipine 5 mg/ngày.
                    </p>
                    <p className="text-[0.85em] text-slate-500 mt-1">
                      Tuân thủ uống thuốc vào buổi sáng sau ăn.
                    </p>
                    {isHighlighted('Thuốc đang dùng') && (
                      <div className="mt-2 flex items-center gap-1 text-[0.75em] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded w-fit">
                        <Bookmark className="w-3 h-3 text-amber-700" /> Trích dẫn nguồn: Trang 1 — mục Thuốc đang dùng
                      </div>
                    )}
                  </div>
                </div>

                {/* Section V: Allergies */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-[0.9em] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-amber-500 rounded-full inline-block"></span>
                    V. TÌNH TRẠNG DỊ ỨNG
                  </h4>
                  <div className="p-3 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 text-[0.85em] text-slate-700">
                    <p className="italic text-slate-500 font-medium">
                      (Mục này không có ghi nhận thông tin trong hồ sơ ban đầu)
                    </p>
                    <p className="mt-1 text-[0.85em] text-amber-900 font-medium leading-relaxed">
                      ⚠️ Lưu ý AI: Hệ thống gắn nhãn <span className="font-bold underline">Chưa có dữ liệu</span> (missing); không được khẳng định bệnh nhân &quot;Không dị ứng&quot; vì tài liệu thiếu câu phủ định tường minh.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 2 CONTENT */}
            {activePage === 2 && (
              <div className="space-y-5">
                <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-bold text-[0.85em] uppercase tracking-wide">
                  MÃ CA HỒ SƠ: {caseId} (TIẾP THEO — PHIẾU CẬN LÂM SÀNG & GHI CHÚ)
                </div>

                {/* Section VI: Test Datetime */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-[0.9em] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-sky-600 rounded-full inline-block"></span>
                    VI. CHỈ ĐỊNH CHẨN ĐOÁN HÌNH ẢNH
                  </h4>
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      isHighlighted('Thời điểm chụp X-quang')
                        ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/60 shadow-sm'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <p className={`font-semibold ${isHighlighted('Thời điểm chụp X-quang') ? 'text-amber-950 bg-amber-200/60 px-1 rounded' : 'text-slate-800'}`}>
                      Thời điểm chụp X-quang: 15/11/2026, 08:30 (giờ Việt Nam).
                    </p>
                    <p className="text-[0.85em] text-slate-500 mt-1">
                      Kỹ thuật: Chụp X-quang ngực thẳng tư thế sau - trước (PA view).
                    </p>
                    <p className="text-[0.85em] text-slate-500">
                      Chỉ định thực hiện bởi: BS. Khám Sơ Bộ.
                    </p>
                    {isHighlighted('Thời điểm chụp X-quang') && (
                      <div className="mt-2 flex items-center gap-1 text-[0.75em] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded w-fit">
                        <Bookmark className="w-3 h-3 text-amber-700" /> Trích dẫn nguồn: Trang 2 — mục Thời điểm chụp X-quang
                      </div>
                    )}
                  </div>
                </div>

                {/* Section VII: Legal & Safety Notes */}
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-[0.9em] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-rose-600 rounded-full inline-block"></span>
                    VII. GHI CHÚ PHÁP LÝ VÀ PHẠM VI HỆ THỐNG DEMO
                  </h4>
                  <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/60 text-[0.85em] text-rose-950 space-y-2">
                    <p className="font-semibold text-rose-900">
                      Ghi chú: Đây là hồ sơ biên soạn phục vụ demo kỹ thuật. Ảnh X-quang minh họa được ghép rời, KHÔNG phải phim của bệnh nhân trong hồ sơ.
                    </p>
                    <div className="border-t border-rose-200 pt-2 space-y-1 text-slate-700 text-[0.9em]">
                      <p className="font-bold text-rose-900">Cảnh báo an toàn y tế:</p>
                      <p>1. Toàn bộ điểm số phân tích và đề xuất văn bản do AI sinh ra chỉ là dữ liệu giả lập (MOCK).</p>
                      <p>2. Không sử dụng kết quả này trực tiếp cho quyết định điều trị, chỉ định thuốc hoặc can thiệp y khoa.</p>
                      <p>3. Bác sĩ hội chẩn chịu trách nhiệm thẩm định và xác nhận cuối cùng trước khi đưa vào biên bản hội chẩn.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Bottom Footer */}
            <div className="border-t border-slate-200 pt-3 mt-6 flex justify-between items-center text-[0.75em] text-slate-400">
              <span>Trang {activePage} / 2 — {caseId} — Dữ liệu giả lập kỹ thuật</span>
              <span className="flex items-center gap-1 text-slate-500 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Bản mẫu chuẩn mực (Idempotent Seed)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
