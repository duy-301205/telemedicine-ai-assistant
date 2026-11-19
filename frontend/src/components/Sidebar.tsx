import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FolderPlus, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  User, 
  Shield, 
  Sparkles,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;               // For mobile drawer
  isCollapsed: boolean;          // For desktop icon-only vs full width
  onToggleCollapse: () => void;  // Toggle collapse on desktop
  onCloseMobile: () => void;     // Close drawer on mobile
  activeTab: string;
  onNavigate: (route: string) => void;
  currentRole: string;
  onRoleChange?: (role: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
  activeTab,
  onNavigate,
  currentRole,
}) => {
  const navItems = [
    {
      route: '/',
      label: 'Tổng quan',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      exact: true,
      description: 'Chỉ số & tiến độ ca bệnh'
    },
    {
      route: '/cases',
      label: 'Danh sách ca bệnh',
      icon: <FileText className="w-5 h-5 shrink-0" />,
      exact: false,
      match: (tab: string) => (tab.startsWith('/cases') && tab !== '/cases/new') || tab === '/demo',
      description: 'Quản lý hồ sơ lâm sàng'
    },
    {
      route: '/cases/new',
      label: '+ Tạo ca mới',
      icon: <FolderPlus className="w-5 h-5 shrink-0" />,
      exact: true,
      description: 'Thêm hồ sơ hội chẩn mới'
    },
    {
      route: '/consultations',
      label: 'Lịch hội chẩn',
      icon: <Calendar className="w-5 h-5 shrink-0" />,
      exact: true,
      description: 'Phiên họp trực tuyến Zoom'
    },
  ];

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.match) return item.match(activeTab);
    if (item.exact) return activeTab === item.route;
    return activeTab.startsWith(item.route);
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

  const sidebarWidthClass = isCollapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-xs select-none ${sidebarWidthClass} ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header: Brand & Collapse Toggle */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between gap-2">
          {!isCollapsed ? (
            <div 
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors whitespace-nowrap block">
                  Telemedicine
                </span>
                <span className="text-[10px] text-sky-700 font-semibold bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200/70 inline-block">
                  AI PROTOTYPE
                </span>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => onNavigate('/')}
              className="mx-auto cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition-colors"
              title="Telemedicine AI"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu nghiệp vụ
            </div>
          )}

          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <button
                key={item.route}
                onClick={() => {
                  onNavigate(item.route);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  active
                    ? 'bg-sky-50 text-sky-800 border border-sky-200/90 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <span className={`${active ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <div className="text-left overflow-hidden">
                    <span className="block truncate">{item.label}</span>
                    <span className="block text-[10px] text-slate-400 font-normal truncate">
                      {item.description}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User Role & System Status */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {!isCollapsed ? (
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-bold text-slate-800 truncate">Vai trò hiện tại</span>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${roleMeta.badge}`}>
                {roleMeta.title}
              </span>
              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Hệ thống trực tuyến (Live)</span>
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-2" title={`Vai trò: ${roleMeta.title}`}>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                <User className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
