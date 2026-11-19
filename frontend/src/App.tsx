import React, { useState, useEffect } from 'react';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CaseListPage } from './pages/CaseListPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { ResearchDataPage } from './pages/ResearchDataPage';
import { TestPlanPage } from './pages/TestPlanPage';
import { AboutPage } from './pages/AboutPage';
import { DemoConfig } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('/cases/DEMO-001');
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);

  useEffect(() => {
    api.getDemoConfig()
      .then(setDemoConfig)
      .catch((err) => {
        console.warn('Could not fetch demo config:', err);
      });
  }, []);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (currentRoute === '/') {
      return <HomePage onNavigate={handleNavigate} />;
    }
    if (currentRoute === '/demo') {
      return <CaseListPage onSelectCase={(id) => handleNavigate(`/cases/${id}`)} />;
    }
    if (currentRoute.startsWith('/cases/')) {
      const caseId = currentRoute.replace('/cases/', '');
      return (
        <CaseDetailPage
          caseId={caseId}
          onBack={() => handleNavigate('/demo')}
        />
      );
    }
    if (currentRoute === '/research-data') {
      return <ResearchDataPage />;
    }
    if (currentRoute === '/test-plan') {
      return <TestPlanPage />;
    }
    if (currentRoute === '/about') {
      return <AboutPage />;
    }
    return <HomePage onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      {/* 1. Global Persistent Medical Disclaimer */}
      <DisclaimerBanner />

      {/* 2. Top Navigation Bar */}
      <Navbar
        config={demoConfig}
        activeTab={currentRoute}
        onNavigate={handleNavigate}
      />

      {/* 3. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>

      {/* 4. Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-slate-200">
              Đề tài KLTN: Trợ lý AI hỗ trợ chuẩn bị hội chẩn Telemedicine
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sinh viên thực hiện: Hoàng Mạnh Duy (K68A3) &bull; Prototype Web Demo (Idempotent SQLite DB)
            </p>
          </div>
          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <p>CHẾ ĐỘ MÔ PHỎNG KỸ THUẬT &bull; MOCK DATA FIXTURES</p>
            <p className="text-amber-500 font-medium">Không sử dụng trực tiếp cho chẩn đoán hoặc kê đơn y tế</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
