import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Workspace,
  Project,
  Task,
  RiskItem,
  WorkflowAutomation,
  EscalationRule,
  Channel,
  ChatMessage,
  KnowledgeDocument,
  Integration,
  AuditLogEntry,
  NotificationItem,
  ApiKey,
  TaskStatus,
  UserSession,
  SecurityEvent
} from '../types';
import {
  mockUsers,
  mockWorkspaces,
  mockProjects,
  mockTasks,
  mockRisks,
  mockAutomations,
  mockEscalationRules,
  mockChannels,
  mockMessages,
  mockDocuments,
  mockIntegrations,
  mockAuditLogs,
  mockNotifications,
  mockApiKeys,
  mockSessions,
  mockSecurityEvents
} from '../data/mockData';

export type NavigationView = 
  | 'dashboard'
  | 'projects'
  | 'automation'
  | 'risks'
  | 'collaboration'
  | 'docs'
  | 'calendar'
  | 'integrations'
  | 'analytics'
  | 'budget'
  | 'audit'
  | 'security'
  | 'admin'
  | 'api-docs'
  | 'specs';

interface NexusContextType {
  // Navigation & Workspace
  currentView: NavigationView;
  setCurrentView: (view: NavigationView) => void;
  activeWorkspace: Workspace;
  setActiveWorkspace: (ws: Workspace) => void;
  workspaces: Workspace[];
  currentUser: User;
  
  // Projects & Filter
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  
  // Tasks & CRUD
  tasks: Task[];
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  updateTask: (updatedTask: Task) => void;
  addTask: (newTask: Partial<Task>) => void;
  
  // Risks
  risks: RiskItem[];
  addRisk: (risk: Partial<RiskItem>) => void;
  
  // Automations
  automations: WorkflowAutomation[];
  toggleAutomation: (id: string) => void;
  runAutomationTest: (id: string) => void;
  escalationRules: EscalationRule[];
  
  // Collaboration & Chat
  channels: Channel[];
  activeChannel: Channel;
  setActiveChannel: (channel: Channel) => void;
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  
  // Knowledge Docs
  documents: KnowledgeDocument[];
  activeDocument: KnowledgeDocument | null;
  setActiveDocument: (doc: KnowledgeDocument | null) => void;
  
  // Integrations
  integrations: Integration[];
  toggleIntegration: (id: string) => void;
  
  // Audit Logs
  auditLogs: AuditLogEntry[];
  
  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  
  // AI Copilot
  isAICopilotOpen: boolean;
  setIsAICopilotOpen: (open: boolean) => void;
  
  // Command Palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  
  // API Keys
  // API Keys
  apiKeys: ApiKey[];
  generateApiKey: (name: string, role: string) => void;

  // Authentication, Identity & Session Security
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  switchUser: (user: User) => void;
  users: User[];
  isSessionLocked: boolean;
  lockSession: () => void;
  unlockSession: () => void;
  userSessions: UserSession[];
  revokeSession: (id: string) => void;
  securityEvents: SecurityEvent[];
  mfaEnabled: boolean;
  toggleMfa: () => void;
  // Workspace Security Enclave & Passkey Protection
  isWorkspaceUnlocked: boolean;
  unlockWorkspace: (passcode: string) => boolean;
  lockWorkspace: () => void;
  
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export const NexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard');
  const [workspaces] = useState<Workspace[]>(mockWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(mockWorkspaces[0]);
  
  // Auth & User identity
  const [users] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('nexus_current_user');
    return saved ? JSON.parse(saved) : mockUsers[0]; // Kshitij Raj (Lead Architect)
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('nexus_auth');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [userSessions, setUserSessions] = useState<UserSession[]>(mockSessions);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  
  // Workspace security passkey unlock state
  const [unlockedWorkspaces, setUnlockedWorkspaces] = useState<Record<string, boolean>>(() => {
    const saved = sessionStorage.getItem('nexus_unlocked_workspaces');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [projects] = useState<Project[]>(mockProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('nexus_tasks');
    return saved ? JSON.parse(saved) : mockTasks;
  });
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [risks, setRisks] = useState<RiskItem[]>(mockRisks);
  const [automations, setAutomations] = useState<WorkflowAutomation[]>(mockAutomations);
  const [escalationRules] = useState<EscalationRule[]>(mockEscalationRules);
  
  const [channels] = useState<Channel[]>(mockChannels);
  const [activeChannel, setActiveChannel] = useState<Channel>(mockChannels[1]);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  
  const [documents] = useState<KnowledgeDocument[]>(mockDocuments);
  const [activeDocument, setActiveDocument] = useState<KnowledgeDocument | null>(mockDocuments[0]);
  
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync tasks to local storage
  useEffect(() => {
    localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Global keyboard shortcut for Command Palette (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, status: newStatus, updatedAt: 'Just now' };
          
          // Log audit entry
          const newAudit: AuditLogEntry = {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            user: currentUser.name,
            action: 'TASK_STATUS_TRANSITION',
            entity: t.id,
            previousValue: t.status,
            newValue: newStatus,
            ipAddress: '192.168.1.1',
            status: 'Success'
          };
          setAuditLogs((prevLogs) => [newAudit, ...prevLogs]);
          
          // Check if automation triggers
          automations.forEach((auto) => {
            if (auto.enabled && auto.trigger === 'status_changed') {
              showToast(`Automation Triggered: "${auto.name}"`);
            }
          });
          
          return updated;
        }
        return t;
      })
    );
    showToast(`Task ${taskId} moved to ${newStatus}`);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
    showToast(`Task ${updatedTask.id} updated`);
  };

  const addTask = (newTask: Partial<Task>) => {
    const taskObj: Task = {
      id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      title: newTask.title || 'New Untitled Task',
      description: newTask.description || 'Task description pending definition.',
      status: newTask.status || 'To Do',
      priority: newTask.priority || 'Medium',
      projectId: newTask.projectId || projects[0].id,
      projectName: projects.find((p) => p.id === newTask.projectId)?.name || projects[0].name,
      assignee: newTask.assignee || currentUser,
      reporter: currentUser,
      dueDate: newTask.dueDate || '2026-10-25',
      estimatedHours: newTask.estimatedHours || 16,
      loggedHours: 0,
      tags: newTask.tags || ['Feature'],
      subtasks: newTask.subtasks || [],
      checklists: newTask.checklists || [],
      dependencies: [],
      comments: [],
      attachmentsCount: 0,
      escalationTier: 0,
      createdAt: 'Just now',
      updatedAt: 'Just now'
    };

    setTasks((prev) => [taskObj, ...prev]);
    showToast(`Created Task ${taskObj.id}: ${taskObj.title}`);
  };

  const addRisk = (risk: Partial<RiskItem>) => {
    const s = risk.severity || 3;
    const p = risk.probability || 3;
    const newRiskItem: RiskItem = {
      id: `RSK-0${risks.length + 1}`,
      title: risk.title || 'New Identified Operational Risk',
      description: risk.description || 'Risk description.',
      projectId: risk.projectId || projects[0].id,
      projectName: projects.find((p) => p.id === risk.projectId)?.name || projects[0].name,
      severity: s,
      probability: p,
      impactScore: s * p,
      status: risk.status || 'Identified',
      owner: risk.owner || currentUser,
      mitigationPlan: risk.mitigationPlan || 'Plan in development.',
      dueDate: risk.dueDate || '2026-10-30'
    };
    setRisks((prev) => [newRiskItem, ...prev]);
    showToast(`Added Risk ${newRiskItem.id}`);
  };

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
    showToast(`Updated automation rule state`);
  };

  const runAutomationTest = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              executionsCount: a.executionsCount + 1,
              lastRun: 'Just now'
            }
          : a
      )
    );
    showToast(`Test execution completed successfully for rule`);
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannel.id,
      sender: currentUser,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: []
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id
          ? {
              ...int,
              connected: !int.connected,
              status: !int.connected ? 'Healthy' : 'Config Needed',
              lastSynced: !int.connected ? 'Just now' : undefined
            }
          : int
      )
    );
    showToast(`Integration updated`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const generateApiKey = (name: string, role: string) => {
    const randomHex = Math.random().toString(16).substring(2, 6);
    const newKey: ApiKey = {
      id: `k-${Date.now()}`,
      name,
      keyMasked: `nx_live_${randomHex}••••••••${Date.now().toString().slice(-4)}`,
      role,
      createdAt: 'Just now',
      lastUsed: 'Never'
    };
    setApiKeys((prev) => [newKey, ...prev]);
    showToast(`Generated new API key "${name}"`);
  };

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsSessionLocked(false);
    localStorage.setItem('nexus_current_user', JSON.stringify(user));
    localStorage.setItem('nexus_auth', JSON.stringify(true));

    const newSecEvent: SecurityEvent = {
      id: `sec-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'LOGIN_SUCCESS',
      ipAddress: '192.168.1.104',
      details: `User ${user.name} (${user.role}) authenticated with hardware TOTP 2FA.`,
      severity: 'info'
    };
    setSecurityEvents((prev) => [newSecEvent, ...prev]);

    const newAudit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user: user.name,
      action: 'USER_AUTHENTICATION_SUCCESS',
      entity: user.email,
      previousValue: 'Unauthenticated',
      newValue: `Role: ${user.role} | Token Verified`,
      ipAddress: '192.168.1.104',
      status: 'Success'
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
    showToast(`Welcome back, ${user.name}!`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('nexus_auth', JSON.stringify(false));

    const newAudit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user: currentUser.name,
      action: 'USER_LOGOUT',
      entity: currentUser.email,
      previousValue: 'Active Session',
      newValue: 'Terminated',
      ipAddress: '192.168.1.104',
      status: 'Success'
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
    showToast('Secure session terminated');
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('nexus_current_user', JSON.stringify(user));
    showToast(`Switched active profile to ${user.name} (${user.role})`);
  };

  const lockSession = () => {
    setIsSessionLocked(true);
    showToast('Workstation locked. PIN required to resume.');
  };

  const unlockSession = () => {
    setIsSessionLocked(false);
    showToast('Workstation unlocked');
  };

  const revokeSession = (id: string) => {
    setUserSessions((prev) => prev.filter((s) => s.id !== id));
    showToast('Session remotely revoked');
  };

  const toggleMfa = () => {
    setMfaEnabled((prev) => !prev);
    showToast(`Hardware 2FA / MFA ${!mfaEnabled ? 'Enabled' : 'Disabled'}`);
  };

  const isWorkspaceUnlocked = !activeWorkspace.isPasswordProtected || !!unlockedWorkspaces[activeWorkspace.id];

  const unlockWorkspace = (passcode: string): boolean => {
    const trimmed = passcode.trim();
    const correctCode = activeWorkspace.securityPasscode;
    const isMasterPassword = currentUser.password && trimmed === currentUser.password;
    const isPasscodeMatch = trimmed === correctCode;

    if (isPasscodeMatch || isMasterPassword) {
      setUnlockedWorkspaces((prev) => {
        const next = { ...prev, [activeWorkspace.id]: true };
        sessionStorage.setItem('nexus_unlocked_workspaces', JSON.stringify(next));
        return next;
      });

      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        user: currentUser.name,
        action: 'WORKSPACE_ENCLAVE_DECRYPTED',
        entity: activeWorkspace.name,
        previousValue: 'Encrypted Vault',
        newValue: 'Decrypted Session',
        ipAddress: '192.168.1.104',
        status: 'Success'
      };
      setAuditLogs((prev) => [audit, ...prev]);

      const secEvent: SecurityEvent = {
        id: `sec-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'WORKSPACE_UNLOCKED',
        ipAddress: '192.168.1.104',
        details: `Workspace "${activeWorkspace.name}" unlocked by ${currentUser.name}.`,
        severity: 'info'
      };
      setSecurityEvents((prev) => [secEvent, ...prev]);

      showToast(`Workspace "${activeWorkspace.name}" decrypted and unlocked`);
      return true;
    } else {
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        user: currentUser.name,
        action: 'WORKSPACE_DECRYPT_FAILED',
        entity: activeWorkspace.name,
        previousValue: 'Locked',
        newValue: 'Invalid Passkey Provided',
        ipAddress: '192.168.1.104',
        status: 'Blocked'
      };
      setAuditLogs((prev) => [audit, ...prev]);
      showToast('Incorrect Workspace Security Passkey');
      return false;
    }
  };

  const lockWorkspace = () => {
    setUnlockedWorkspaces((prev) => {
      const next = { ...prev, [activeWorkspace.id]: false };
      sessionStorage.setItem('nexus_unlocked_workspaces', JSON.stringify(next));
      return next;
    });
    showToast(`Workspace "${activeWorkspace.name}" locked`);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <NexusContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeWorkspace,
        setActiveWorkspace,
        workspaces,
        currentUser,
        projects,
        activeProjectId,
        setActiveProjectId,
        tasks,
        selectedTask,
        setSelectedTask,
        updateTaskStatus,
        updateTask,
        addTask,
        risks,
        addRisk,
        automations,
        toggleAutomation,
        runAutomationTest,
        escalationRules,
        channels,
        activeChannel,
        setActiveChannel,
        messages,
        sendMessage,
        documents,
        activeDocument,
        setActiveDocument,
        integrations,
        toggleIntegration,
        auditLogs,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isAICopilotOpen,
        setIsAICopilotOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        apiKeys,
        generateApiKey,
        // Auth exports
        isAuthenticated,
        login,
        logout,
        switchUser,
        users,
        isSessionLocked,
        lockSession,
        unlockSession,
        userSessions,
        revokeSession,
        securityEvents,
        mfaEnabled,
        toggleMfa,
        // Workspace Security Enclave exports
        isWorkspaceUnlocked,
        unlockWorkspace,
        lockWorkspace,
        toastMessage,
        showToast
      }}
    >
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('useNexus must be used within a NexusProvider');
  }
  return context;
};
