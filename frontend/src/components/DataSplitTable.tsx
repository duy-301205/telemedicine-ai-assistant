import React from 'react';
import { Database, AlertCircle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ResearchDataPlan } from '../types';

interface DataSplitTableProps {
  dataPlan: ResearchDataPlan | null;
}

export const DataSplitTable: React.FC<DataSplitTableProps> = ({ dataPlan }) => {
  if (!dataPlan) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm text-slate-600">Đang tải kế hoạch phân chia dữ liệu VinDr-CXR...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Bộ Dữ Liệu {dataPlan.dataset_name} & Kế Hoạch Phân Bổ (Train / Val / Test)
              </h3>
              <p className="text-xs text-slate-500">
                Tổng số lượng công bố: <strong>{dataPlan.published_total.toLocaleString()} ảnh</strong> (15.000 Train + 3.000 Test)
              </p>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
            {dataPlan.projection_status}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Tài liệu nghiên cứu đề cương dự kiến chọn <strong>3.000 – 5.000 ảnh</strong> từ tập train 15.000 ảnh của VinDr-CXR để phục vụ phát triển ban đầu. Trong đó, tập <strong>Test 3.000 ảnh chính thức</strong> được giữ độc lập tuyệt đối để đánh giá khách quan khi được phê duyệt quyền truy cập.
        </p>

        {/* Data Split Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-800 text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-3">Tập dữ liệu</th>
                <th className="py-3 px-3 text-right">Số lượng</th>
                <th className="py-3 px-3">Vai trò phân công</th>
                <th className="py-3 px-3 text-center">Tim to (+)</th>
                <th className="py-3 px-3 text-center">Tràn dịch (+)</th>
                <th className="py-3 px-3 text-center">Đám mờ (+)</th>
                <th className="py-3 px-3">Ghi chú minh bạch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {dataPlan.splits.map((split, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {split.split_name}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                    {split.count.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {split.role}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-mono">
                      {split.cardiomegaly_positive}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-mono">
                      {split.pleural_effusion_positive}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-mono">
                      {split.lung_opacity_positive}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">
                    {split.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnote on Numbers */}
        <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Ghi chú bắt buộc theo đặc tả:</strong> Con số 3.200 (Train con) + 800 (Validation con) là ví dụ phân bổ 4.000 ảnh từ train chính thức, <em>không phải số liệu thực nghiệm đã chạy</em>. Số ca dương của từng nhãn ghi rõ <strong>&quot;Chưa thống kê&quot;</strong>, tuyệt đối không bịa số liệu.
          </span>
        </div>
      </div>

      {/* Rules & Limitations Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Majority Voting Rule */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span>Quy Tắc Tổng Hợp Nhãn Đa Chuyên Gia</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {dataPlan.label_consolidation_rule}
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
            <p>• <strong>Xử lý đa hộp (Bounding boxes):</strong> Hợp nhất các box trùng lặp bằng IoU threshold hoặc chọn nhãn cấp độ ảnh (image-level label).</p>
            <p>• <strong>Bất đồng thuận:</strong> Áp dụng Majority Voting (≥3/5 bác sĩ đồng thuận) trước khi đưa vào huấn luyện mô hình.</p>
          </div>
        </div>

        {/* Posture Scope */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Phạm Vi Tư Thế Chụp & Giới Hạn Lâm Sàng</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {dataPlan.posture_scope}
          </p>
          <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200 text-xs space-y-1 text-amber-900">
            <p>• <strong>PA (Posteroanterior):</strong> Tư thế chuẩn ngực thẳng đứng, giảm biến dạng phóng đại của bóng tim.</p>
            <p>• <strong>AP / Nằm:</strong> Không áp dụng suy luận vì bóng tim thường bị bè to sinh lý, dễ gây dương tính giả.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
