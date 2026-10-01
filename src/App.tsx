import React from 'react';
import { NexusProvider, useNexus } from './context/NexusContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { AICopilotDrawer } from './components/layout/AICopilotDrawer';
import { TaskModal } from './components/views/TaskModal';
import { LoginView } from './components/auth/LoginView';
import { LockScreenModal } from './components/auth/LockScreenModal';
import { WorkspaceGateModal } from './components/auth/WorkspaceGateModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { ProjectsView } from './components/views/ProjectsView';
import { AutomationView } from './components/views/AutomationView';
import { RiskManagementView } from './components/views/RiskManagementView';
import { CollaborationView } from './components/views/CollaborationView';
import { DocsView } from './components/views/DocsView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { BudgetView } from './components/views/BudgetView';
import { SecurityAdminView } from './components/views/SecurityAdminView';
import { ApiDocView } from './components/views/ApiDocView';
import { SpecsView } from './components/views/SpecsView';

const NexusContent: React.FC = () => {
  const { currentView, toastMessage, isAuthenticated } = useNexus();

  // If user is unauthenticated, show the zero-trust login portal
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'projects':
      case 'calendar':
        return <ProjectsView />;
      case 'automation':
        return <AutomationView />;
      case 'risks':
        return <RiskManagementView />;
      case 'collaboration':
        return <CollaborationView />;
      case 'docs':
        return <DocsView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'budget':
        return <BudgetView />;
      case 'security':
      case 'audit':
      case 'admin':
        return <SecurityAdminView />;
      case 'api-docs':
        return <ApiDocView />;
      case 'specs':
        return <SpecsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f17] text-slate-100 font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto relative bg-[#0b0f17]">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <TaskModal />
      <CommandPalette />
      <NotificationDrawer />
      <AICopilotDrawer />
      <LockScreenModal />
      <WorkspaceGateModal />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-indigo-500/50 text-white text-xs font-medium shadow-2xl shadow-indigo-500/20 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <NexusProvider>
      <NexusContent />
    </NexusProvider>
  );
};

export default App;
