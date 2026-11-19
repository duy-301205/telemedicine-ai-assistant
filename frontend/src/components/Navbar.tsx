import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Copy, 
  Check, 
  ExternalLink, 
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
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
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  config, 
  activeTab, 
  onNavigate,
  currentRole,
  onRoleChange,
  onToggleMobileSidebar,
  onToggleDesktopSidebar,
  isSidebarCollapsed
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

  const getPageTitle = (tab: string) => {
    if (tab === '/') return { title: 'Tổng quan hệ thống', sub: 'Chỉ số & tiến trình chuẩn bị hội chẩn' };
    if (tab === '/cases/new') return { title: 'Tạo ca bệnh mới', sub: 'Khởi tạo hồ sơ lâm sàng & chỉ định' };
    if (tab === '/cases' || tab === '/demo') return { title: 'Danh sách ca bệnh', sub: 'Tìm kiếm, lọc trạng thái & quản lý ca' };
    if (tab.startsWith('/cases/')) return { title: 'Chi tiết hồ sơ ca bệnh', sub: 'Truy vết nguồn PDF & phân tích X-quang' };
    if (tab === '/consultations') return { title: 'Lịch hội chẩn trực tuyến', sub: 'Phiên hội chẩn đa chuyên khoa từ xa' };
    return { title: 'Hệ thống Telemedicine AI', sub: 'Trợ lý chuẩn bị hội chẩn từ xa' };
  };

  const roleMeta = getRoleLabel(currentRole);
  const pageMeta = getPageTitle(activeTab);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Side: Sidebar Toggle & Page Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
            title="Mở menu điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={onToggleDesktopSidebar}
            className="hidden lg:flex items-center gap-1.5 p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200/90 transition-colors shadow-xs"
            title={isSidebarCollapsed ? 'Mở rộng thanh sidebar' : 'Thu gọn thanh sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-sky-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Page Title & Breadcrumb */}
          <div className="hidden sm:block">
            <h1 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
              {pageMeta.title}
            </h1>
            <p className="text-[11px] text-slate-400 font-normal">
              {pageMeta.sub}
            </p>
          </div>
        </div>

        {/* Right Actions: Zoom Link, Copy Demo Link & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {config?.zoom_enabled && (
            <button
              onClick={handleOpenZoom}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Tham gia phòng họp hội chẩn Zoom demo"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phòng Zoom</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Sao chép liên kết phiên bản Web Demo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden md:inline">{copied ? 'Đã sao chép!' : 'Sao chép link'}</span>
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors shadow-xs"
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
                    className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                      currentRole === acc.role ? 'bg-sky-50/70 font-bold text-sky-800' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{acc.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">@{acc.username} &bull; {acc.role}</p>
                    </div>
                    {currentRole === acc.role && (
                      <Check className="w-4 h-4 text-sky-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
