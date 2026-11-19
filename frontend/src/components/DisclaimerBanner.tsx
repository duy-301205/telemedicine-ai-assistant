import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 mx-auto">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
        <span>
          <strong className="font-semibold text-amber-800">DEMO / MOCK PROTOTYPE:</strong> Toàn bộ điểm số AI, vùng khoanh ảnh và trích xuất hồ sơ chỉ là dữ liệu mô phỏng kỹ thuật —{' '}
          <span className="underline decoration-amber-500 font-semibold">KHÔNG DÙNG CHO QUYẾT ĐỊNH LÂM SÀNG</span>.
        </span>
      </div>
    </div>
  );
};
