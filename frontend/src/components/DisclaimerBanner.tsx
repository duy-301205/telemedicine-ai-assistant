import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <aside aria-label="Cảnh báo an toàn y tế" className="bg-amber-500/10 border-b border-amber-500/20 text-amber-950 px-4 sm:px-6 py-2 text-xs font-medium">
      <div className="w-full max-w-[1760px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 flex-shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </span>
          <p className="leading-snug">
            <strong className="font-semibold text-amber-900">DEMO / MOCK PROTOTYPE:</strong> Toàn bộ điểm số AI, vùng chú ý X-quang và thông tin trích xuất là dữ liệu mô phỏng kỹ thuật —{' '}
            <span className="font-semibold text-amber-900 underline decoration-amber-400">KHÔNG DÙNG CHO QUYẾT ĐỊNH LÂM SÀNG</span>.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-amber-800/80 flex-shrink-0">
          <Info className="w-3.5 h-3.5" />
          <span>Phiên bản phục vụ báo cáo tiến độ hội chẩn từ xa</span>
        </div>
      </div>
    </aside>
  );
};
