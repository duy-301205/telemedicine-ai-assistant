import React, { useState } from 'react';
import { Video, Copy, Check, ExternalLink, Activity, FileText, Database, ShieldCheck, Info } from 'lucide-react';
import { DemoConfig } from '../types';

interface NavbarProps {
  config: DemoConfig | null;
  activeTab: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ config, activeTab, onNavigate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = config?.public_demo_url || window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenZoom = () => {
    if (config?.zoom_enabled && config.zoom_meeting_url) {
      window.open(config.zoom_meeting_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
          <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">Telemedicine AI</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                PROTOTYPE DEMO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Trợ lý chuẩn bị hội chẩn y tế từ xa</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => onNavigate('/')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === '/' ? 'bg-sky-700 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => onNavigate('/demo')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab.startsWith('/cases') || activeTab === '/demo'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-400" />
            Ca hội chẩn
          </button>
          <button
            onClick={() => onNavigate('/research-data')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === '/research-data' ? 'bg-sky-700 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            Dữ liệu VinDr-CXR
          </button>
          <button
            onClick={() => onNavigate('/test-plan')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === '/test-plan' ? 'bg-sky-700 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            KPI & Kiểm thử
          </button>
          <button
            onClick={() => onNavigate('/about')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === '/about' ? 'bg-sky-700 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Info className="w-4 h-4 text-slate-400" />
            Giới hạn
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom Teleconference Button */}
          {config?.zoom_enabled ? (
            <button
              onClick={handleOpenZoom}
              title="Mở phòng họp Zoom (Không gửi dữ liệu hồ sơ sang Zoom)"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Mở Zoom</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          ) : (
            <button
              disabled
              title="Chưa cấu hình URL Zoom trong ZOOM_MEETING_URL (.env)"
              className="flex items-center gap-1.5 bg-slate-800 text-slate-500 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 cursor-not-allowed opacity-70"
            >
              <Video className="w-4 h-4" />
              <span>Mở Zoom (Chưa cấu hình)</span>
            </button>
          )}

          {/* Copy Demo Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-700 transition-colors"
            title="Sao chép liên kết demo vào slide báo cáo"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Sao chép link'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
