import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Copy, 
  Check, 
  ExternalLink, 
  Activity, 
  FileText, 
  FolderPlus,
  Calendar,
  Database, 
  ShieldCheck, 
  User,
  ChevronDown
} from 'lucide-react';
import { DemoConfig, UserAccount } from '../types';
import { api } from '../api/client';

interface NavbarProps {
  config: DemoConfig | null;
  activeTab: string;
  onNavigate: (route: string) => void;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  config, 
  activeTab, 
  onNavigate,
  currentRole,
  onRoleChange
}) => {
  const [copied, setCopied] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);

  useEffect(() => {
    api.getDemoAccounts()
      .then(setAccounts)
      .catch((err) => console.warn('Could not fetch accounts:', err));
  }, []);

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'DEMO_ADMIN':
        return { title: 'Quản trị viên', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'CLINICIAN_DEMO':
        return { title: 'Bác sĩ lâm sàng', badge: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'VIEWER_DEMO':
        return { title: 'Quan sát viên', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { title: role, badge: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const roleMeta = getRoleLabel(currentRole);

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
              <span className="bg-sky-50 text-sky-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-200/70">
                ENTERPRISE DEMO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5 font-normal">
              Trợ lý chuẩn bị hội chẩn y tế từ xa
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
          <button
            onClick={() => onNavigate('/')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === '/' 
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Tổng quan
          </button>
          
          <button
            onClick={() => onNavigate('/cases')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              (activeTab.startsWith('/cases') && activeTab !== '/cases/new') || activeTab === '/demo'
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Ca bệnh</span>
          </button>

          <button
            onClick={() => onNavigate('/cases/new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === '/cases/new'
                ? 'bg-teal-50 text-teal-700 border border-teal-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5 text-teal-600" />
            <span>+ Tạo ca mới</span>
          </button>

          <button
            onClick={() => onNavigate('/consultations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === '/consultations'
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Lịch hội chẩn</span>
          </button>

          <button
            onClick={() => onNavigate('/research-data')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === '/research-data'
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>VinDr-CXR</span>
          </button>

          <button
            onClick={() => onNavigate('/test-plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === '/test-plan'
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>KPI & Test (30/30)</span>
          </button>
        </nav>

        {/* Right Actions: Role Switcher & Zoom */}
        <div className="flex items-center gap-2.5">
          
          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
              title="Chuyển đổi vai trò người dùng"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${roleMeta.badge}`}>
                {roleMeta.title}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 font-semibold text-slate-500 text-[10px] uppercase tracking-wider">
                  Chọn vai trò đăng nhập
                </div>
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      onRoleChange(acc.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex flex-col hover:bg-slate-50 transition-colors ${
                      currentRole === acc.role ? 'bg-sky-50/60 font-semibold text-sky-800' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{acc.full_name}</span>
                      {currentRole === acc.role && <Check className="w-3.5 h-3.5 text-sky-600" />}
                    </div>
                    <span className="text-[10px] text-slate-400">{acc.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zoom Button */}
          {config?.zoom_enabled ? (
            <button
              onClick={handleOpenZoom}
              title="Mở phòng họp Zoom (Không gửi dữ liệu hồ sơ sang Zoom)"
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs shadow-sky-600/20 transition-all hover:scale-[1.02]"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vào Zoom</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          ) : (
            <button
              disabled
              title="Chưa cấu hình URL Zoom trong ZOOM_MEETING_URL"
              className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-400 text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 cursor-not-allowed"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Zoom</span>
            </button>
          )}

          {/* Copy Demo Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200/90 transition-colors shadow-xs"
            title="Sao chép liên kết demo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{copied ? 'Đã chép' : 'Link'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
