import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Target, 
  HelpCircle, 
  CheckCircle2, 
  FileSpreadsheet, 
  AlertTriangle,
  Scale
} from 'lucide-react';
import { ResearchDataPlan, KpiTarget } from '../types';
import { api } from '../api/client';

export const TestPlanPage: React.FC = () => {
  const [kpis, setKpis] = useState<KpiTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDataPlan()
      .then((data) => {
        setKpis(data.kpi_targets || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Kế Hoạch Kiểm Thử & Các Chỉ Số KPI Mục Tiêu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Quy chuẩn đánh giá thực nghiệm cho 3 mục tiêu (MT1, MT2, MT3)
            </p>
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="mt-4 p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>LƯU Ý MINH BẠCH HỌC THUẬT:</strong> Các chỉ số dưới đây là <strong>MỤC TIÊU ĐỀ XUẤT (CHƯA ĐO)</strong>. Hệ thống nguyên mẫu hiện tại không tạo biểu đồ KPI giả mạo và không tuyên bố đã đạt kết quả khi chưa hoàn thành huấn luyện mô hình trên dữ liệu độc lập được phê duyệt.
          </span>
        </div>

        {/* KPI Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-800 text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-3">Mã MT</th>
                <th className="py-3 px-3">Hạng mục đánh giá</th>
                <th className="py-3 px-3">Chỉ số KPI mục tiêu</th>
                <th className="py-3 px-3 text-center">Trạng thái hiện tại</th>
                <th className="py-3 px-3">Phương pháp đo lường chuẩn hóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {kpis.map((kpi, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-sky-700">
                    {kpi.code}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-900">
                    {kpi.name}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-800">
                    {kpi.target}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full text-[10px] border border-amber-300">
                      {kpi.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 text-[11px] leading-relaxed">
                    {kpi.measurement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evaluation Rubrics & Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rubric Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Scale className="w-4 h-4 text-sky-600" />
            Mẫu Tiêu Chí Thẩm Định Lâm Sàng Độc Lập
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Đánh giá chất lượng báo cáo sơ bộ bởi 2 bác sĩ chuyên khoa độc lập (Rubric thang 4 mức):
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-emerald-700">Mức 4 (Xuất sắc):</span> Báo cáo chính xác 100% dữ liệu nguồn, phát hiện đúng tổn thương X-quang, nhận diện rõ dữ liệu thiếu.
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-blue-700">Mức 3 (Đạt yêu cầu):</span> Không có sai lệch nghiêm trọng, bác sĩ chỉ cần chỉnh sửa nhẹ thuật ngữ trước khi hội chẩn.
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-amber-700">Mức 2 (Cần chỉnh sửa nhiều):</span> Bỏ sót trường quan trọng hoặc ghi nhận sai thông tin thuốc/dị ứng.
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-rose-700">Mức 1 (Không đạt):</span> Ảo giác thông tin (Hallucination) hoặc tự suy đoán khi thiếu tài liệu.
            </div>
          </div>
        </div>

        {/* 30 Test Scenarios Protocol */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Khung 30 Kịch Bản Kiểm Thử (MT3: ≥ 96.7% PASS)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Phân bổ 30 kịch bản kiểm thử quy trình khép kín:
          </p>
          <ul className="text-xs space-y-2 text-slate-700">
            <li className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span>15 ca tiêu chuẩn: Đủ hồ sơ 2 trang + X-quang PA</span>
              <span className="font-mono font-bold text-slate-800">15 / 30 ca</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span>5 ca thiếu trường (không có dị ứng / thiếu thuốc)</span>
              <span className="font-mono font-bold text-slate-800">5 / 30 ca</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span>5 ca bất thường: Thiếu trang hồ sơ (MISSING_PAGE)</span>
              <span className="font-mono font-bold text-slate-800">5 / 30 ca</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span>5 ca tệp ảnh lỗi (INVALID_IMAGE / sai định dạng)</span>
              <span className="font-mono font-bold text-slate-800">5 / 30 ca</span>
            </li>
          </ul>
          <p className="text-[11px] text-slate-500 italic mt-2">
            Tiêu chí đạt: Ít nhất 29/30 ca (96.7%) phải xử lý đúng logic và lưu trữ phiên bản thành công.
          </p>
        </div>
      </div>
    </div>
  );
};
