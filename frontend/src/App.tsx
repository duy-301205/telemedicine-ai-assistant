import React, { useState, useEffect } from 'react';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CaseListPage } from './pages/CaseListPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { CaseCreatePage } from './pages/CaseCreatePage';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { ResearchDataPage } from './pages/ResearchDataPage';
import { TestPlanPage } from './pages/TestPlanPage';
import { AboutPage } from './pages/AboutPage';
import { DemoConfig } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);
  const [currentRole, setCurrentRole] = useState<string>('CLINICIAN_DEMO');

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
      return <DashboardPage onNavigate={handleNavigate} />;
    }
    if (currentRoute === '/cases/new') {
      return (
        <CaseCreatePage
          onBack={() => handleNavigate('/cases')}
          onCaseCreated={(newId) => handleNavigate(`/cases/${newId}`)}
        />
      );
    }
    if (currentRoute === '/cases' || currentRoute === '/demo') {
      return (
        <CaseListPage
          onSelectCase={(id) => handleNavigate(`/cases/${id}`)}
          onNavigateNew={() => handleNavigate('/cases/new')}
          currentRole={currentRole}
        />
      );
    }
    if (currentRoute.startsWith('/cases/')) {
      const caseId = currentRoute.replace('/cases/', '');
      return (
        <CaseDetailPage
          caseId={caseId}
          onBack={() => handleNavigate('/cases')}
          currentRole={currentRole}
        />
      );
    }
    if (currentRoute === '/consultations') {
      return (
        <ConsultationsPage
          onSelectCase={(id) => handleNavigate(`/cases/${id}`)}
          config={demoConfig}
        />
      );
    }
    if (currentRoute === '/research-data' || currentRoute === '/research') {
      return <ResearchDataPage />;
    }
    if (currentRoute === '/test-plan') {
      return <TestPlanPage />;
    }
    if (currentRoute === '/about') {
      return <AboutPage />;
    }
    return <DashboardPage onNavigate={handleNavigate} />;
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* 1. Global Persistent Medical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Global Navigation Bar with Role Switcher */}
      <Navbar
        config={demoConfig}
        activeTab={currentRoute}
        onNavigate={handleNavigate}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />

      {/* 3. Main Route Container (Wide desktop layout max-w-[1760px]) */}
      <main className="flex-1 w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {renderContent()}
      </main>

      {/* 4. Global Professional Footer */}
      <footer className="bg-white border-t border-slate-200/90 py-6 mt-auto">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            <p className="font-semibold text-slate-700">
              Telemedicine AI Assistant — Hệ thống Quản lý Ca bệnh & Chuẩn bị Hội chẩn Y tế từ xa
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hệ thống hoạt động với SQLite Database thật; Hai pipeline AI trích xuất thực thể và dự đoán VinDr-CXR chạy trên bộ Mock Adapters kỹ thuật theo quy chuẩn an toàn.
            </p>
          </div>

          <div className="flex items-center gap-4 font-medium text-slate-600 shrink-0">
            <button onClick={() => handleNavigate('/research-data')} className="hover:text-sky-600 transition-colors">
              VinDr-CXR Plan
            </button>
            <span>&bull;</span>
            <button onClick={() => handleNavigate('/test-plan')} className="hover:text-sky-600 transition-colors">
              Kiểm thử 30/30 TC
            </button>
            <span>&bull;</span>
            <button onClick={() => handleNavigate('/about')} className="hover:text-sky-600 transition-colors">
              Giới hạn hệ thống
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
