import React, { useState } from 'react';
import { 
  Video, 
  Copy, 
  Check, 
  ExternalLink, 
  Activity, 
  FileText, 
  Database, 
  ShieldCheck, 
  Info 
} from 'lucide-react';
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
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => onNavigate('/')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                Telemedicine AI
              </span>
              <span className="bg-sky-50 text-sky-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-sky-200/70">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5 font-normal">
              Trợ lý chuẩn bị hội chẩn y tế từ xa
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
          <button
            onClick={() => onNavigate('/')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === '/' 
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Tổng quan
          </button>
          
          <button
            onClick={() => onNavigate('/demo')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab.startsWith('/cases') || activeTab === '/demo'
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Ca hội chẩn</span>
          </button>

          <button
            onClick={() => onNavigate('/research-data')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === '/research-data'
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Dữ liệu VinDr-CXR</span>
          </button>

          <button
            onClick={() => onNavigate('/test-plan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === '/test-plan'
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>KPI & Kiểm thử</span>
          </button>

          <button
            onClick={() => onNavigate('/about')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === '/about'
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Giới hạn</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Zoom Button */}
          {config?.zoom_enabled ? (
            <button
              onClick={handleOpenZoom}
              title="Mở phòng họp Zoom (Không gửi dữ liệu hồ sơ sang Zoom)"
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs shadow-sky-600/20 transition-all hover:scale-[1.02]"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Mở Zoom</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          ) : (
            <button
              disabled
              title="Chưa cấu hình URL Zoom trong ZOOM_MEETING_URL (.env)"
              className="flex items-center gap-1.5 bg-slate-100 text-slate-400 text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 cursor-not-allowed"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Zoom (Chưa cấu hình)</span>
              <span className="sm:hidden">Zoom</span>
            </button>
          )}

          {/* Copy Demo Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200/90 transition-colors shadow-xs"
            title="Sao chép liên kết demo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Sao chép link'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
