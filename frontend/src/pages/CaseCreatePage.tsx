import React, { useState } from 'react';
import { 
  FolderPlus, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { api } from '../api/client';

interface CaseCreatePageProps {
  onBack: () => void;
  onCaseCreated: (caseId: string) => void;
}

export const CaseCreatePage: React.FC<CaseCreatePageProps> = ({ onBack, onCaseCreated }) => {
  const [patientName, setPatientName] = useState('');
  const [caseCode, setCaseCode] = useState('');
  const [age, setAge] = useState<number | ''>(58);
  const [gender, setGender] = useState('Nam');
  const [notes, setNotes] = useState('');

  // Files
  const [docFile, setDocFile] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [viewPosition, setViewPosition] = useState('PA');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        setError('Tệp hồ sơ lâm sàng bắt buộc phải có định dạng .pdf');
        return;
      }
      setDocFile(f);
      setError(null);
    }
  };

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const ext = f.name.toLowerCase();
      if (!ext.endsWith('.png') && !ext.endsWith('.jpg') && !ext.endsWith('.jpeg')) {
        setError('Tệp X-quang phải có định dạng .png, .jpg hoặc .jpeg');
        return;
      }
      setImgFile(f);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Vui lòng nhập tên bệnh nhân giả lập.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setStatusMessage('Đang khởi tạo ca bệnh trong cơ sở dữ liệu...');
      const created = await api.createCase({
        patient_name_demo: patientName.trim(),
        case_code: caseCode.trim() || undefined,
        age: age === '' ? undefined : Number(age),
        gender,
        notes: notes.trim() || undefined,
        created_by: 'Bác sĩ Tiếp nhận (CLINICIAN_DEMO)'
      });

      const caseId = created.id;

      // Upload Document if selected
      if (docFile) {
        setStatusMessage('Đang lưu trữ tệp PDF bệnh án và trích xuất số trang...');
        await api.uploadCaseFile(caseId, docFile, 'document', 'UNKNOWN', 'Bác sĩ Lâm Sàng');
      }

      // Upload Image if selected
      if (imgFile) {
        setStatusMessage('Đang lưu trữ tệp hình ảnh X-quang...');
        await api.uploadCaseFile(caseId, imgFile, 'image', viewPosition, 'Kỹ thuật viên X-Quang');
      }

      // Trigger processing if files uploaded
      if (docFile || imgFile) {
        setStatusMessage('Đang chạy adapter trích xuất thực thể và phân tích tổn thương...');
        try {
          await api.processCase(caseId, { view_position: viewPosition });
        } catch (procErr: any) {
          console.warn('Processing warning:', procErr);
        }
      }

      setStatusMessage('Hoàn tất! Đang chuyển đến trang chi tiết ca bệnh...');
      setTimeout(() => {
        onCaseCreated(caseId);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo ca bệnh.');
      setLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FolderPlus className="w-6 h-6 text-sky-600" />
              <span>Tiếp nhận Ca bệnh & Tải lên Hồ sơ Mới</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Nhập thông tin hành chính giả lập và đính kèm hồ sơ PDF, ảnh X-quang để hệ thống phân tích sơ bộ
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {statusMessage && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 shrink-0 text-sky-600 animate-spin" />
          <span className="font-medium">{statusMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Thông tin bệnh nhân */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Thông tin Hành chính Bệnh nhân (Mô phỏng)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700">Họ và tên bệnh nhân (Demo) *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="VD: Trần Văn Thử Nghiệm (Demo)"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Mã ca bệnh (Tùy chọn)</label>
              <input
                type="text"
                value={caseCode}
                onChange={(e) => setCaseCode(e.target.value)}
                placeholder="Tự sinh nếu để trống (TM-2026-xxx)"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Tuổi</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Giới tính</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-medium bg-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="font-semibold text-slate-700">Tóm tắt lý do khám / Ghi chú ban đầu</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú lâm sàng ban đầu hoặc thông tin chuyển tuyến..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-medium"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Upload Files */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Đính kèm Tệp Hồ sơ Lâm sàng & Ảnh X-quang
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Document PDF Picker */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Hồ sơ Bệnh án PDF (Chuẩn ≥2 trang)</span>
                </span>
                {docFile && <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Đã chọn</span>}
              </div>

              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-sky-400 bg-white cursor-pointer transition-colors group">
                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-sky-500 transition-colors" />
                <span className="mt-2 text-xs font-medium text-slate-600 group-hover:text-slate-900">
                  {docFile ? docFile.name : 'Bấm để chọn tệp PDF hoặc kéo thả vào đây'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">Định dạng .pdf (Tối đa 20MB)</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleDocChange}
                  className="hidden"
                />
              </label>

              {docFile && (
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Dung lượng: {(docFile.size / 1024).toFixed(1)} KB</span>
                  <button
                    type="button"
                    onClick={() => setDocFile(null)}
                    className="text-rose-600 hover:underline"
                  >
                    Hủy chọn
                  </button>
                </div>
              )}
            </div>

            {/* X-ray Image Picker */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-teal-600" />
                  <span>Hình ảnh X-quang Ngực</span>
                </span>
                {imgFile && <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Đã chọn</span>}
              </div>

              <div className="flex items-center gap-3">
                <label className="font-medium text-slate-600">Tư thế chụp:</label>
                <select
                  value={viewPosition}
                  onChange={(e) => setViewPosition(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-xs focus:ring-1 focus:ring-sky-500"
                >
                  <option value="PA">PA (Ngực thẳng đứng - Khuyên dùng)</option>
                  <option value="AP">AP (Nằm tại giường - Ngoài scope VinDr)</option>
                </select>
              </div>

              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-teal-400 bg-white cursor-pointer transition-colors group">
                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-teal-500 transition-colors" />
                <span className="mt-2 text-xs font-medium text-slate-600 group-hover:text-slate-900">
                  {imgFile ? imgFile.name : 'Bấm để chọn ảnh X-quang hoặc kéo thả'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">Định dạng .png, .jpg, .jpeg</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImgChange}
                  className="hidden"
                />
              </label>

              {imgFile && (
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Dung lượng: {(imgFile.size / 1024).toFixed(1)} KB</span>
                  <button
                    type="button"
                    onClick={() => setImgFile(null)}
                    className="text-rose-600 hover:underline"
                  >
                    Hủy chọn
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-lg text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              Lưu ý kỹ thuật: Nếu tải lên tệp mẫu có mã băm SHA256 tương ứng các fixture kiểm nghiệm (sample_case_2pages.pdf, xray_illustration.png,...), adapter sẽ tải dữ liệu trích xuất mẫu chuẩn mực. Với tệp mới tự chọn, adapter từ chối dự đoán giả lập và yêu cầu bác sĩ nhập thủ công nếu muốn.
            </span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
            <span>Tạo Ca & Bắt đầu Xử lý</span>
          </button>
        </div>

      </form>

    </div>
  );
};
