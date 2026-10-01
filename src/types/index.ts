export type RoleType = 
  | 'Super Admin'
  | 'Organization Admin'
  | 'Workspace Admin'
  | 'Project Manager'
  | 'Team Lead'
  | 'Member'
  | 'Viewer/Guest'
  | 'Custom Role';

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Archived';
export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type ProjectStatus = 'Active' | 'Planning' | 'On Hold' | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: RoleType;
  department: string;
  status: 'online' | 'busy' | 'offline';
  joinedAt: string;
  isProjectLead?: boolean;
  password?: string;
  pin?: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'LOGIN_SUCCESS' | 'MFA_CHALLENGE' | 'FAILED_LOGIN' | 'SESSION_TERMINATED' | 'PASSWORD_CHANGE' | 'WORKSPACE_UNLOCKED';
  ipAddress: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  authToken: string | null;
  sessionExpiry: string | null;
  mfaRequired: boolean;
  mfaVerified: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization: string;
  plan: 'Enterprise' | 'Startup' | 'Pro';
  membersCount: number;
  projectsCount: number;
  isPasswordProtected: boolean;
  securityPasscode: string;
  isUnlocked?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  projectName?: string;
  assignee: User;
  reporter: User;
  dueDate: string;
  startDate?: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  subtasks: Subtask[];
  checklists: ChecklistItem[];
  dependencies: string[]; // task IDs
  comments: TaskComment[];
  attachmentsCount: number;
  escalationTier?: number; // 0: Normal, 1: Lead, 2: PM, 3: Executive
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  tasksCount: number;
  completedTasksCount: number;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  status: ProjectStatus;
  priority: TaskPriority;
  owner: User;
  members: User[];
  startDate: string;
  deadline: string;
  progress: number;
  budget: {
    estimated: number;
    actual: number;
    currency: string;
  };
  milestones: Milestone[];
  risksCount: number;
  health: 'Healthy' | 'At Risk' | 'Critical';
}

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1-5
  probability: 1 | 2 | 3 | 4 | 5; // 1-5
  impactScore: number; // severity * probability
  status: 'Identified' | 'Mitigating' | 'Monitored' | 'Closed';
  owner: User;
  mitigationPlan: string;
  dueDate: string;
}

export interface WorkflowAutomation {
  id: string;
  name: string;
  trigger: 'task_overdue' | 'status_changed' | 'milestone_reached' | 'priority_urgent';
  condition: string;
  action: 'escalate_tier' | 'notify_slack' | 'assign_lead' | 'webhook_post';
  enabled: boolean;
  executionsCount: number;
  lastRun?: string;
}

export interface EscalationRule {
  id: string;
  name: string;
  overdueThresholdHours: number;
  targetRole: RoleType;
  notificationChannels: ('Email' | 'In-App' | 'Slack')[];
  active: boolean;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  sender: User;
  content: string;
  timestamp: string;
  reactions: { emoji: string; count: number; users: string[] }[];
  threadCount?: number;
  attachments?: { name: string; size: string; type: string }[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  description?: string;
  unreadCount?: number;
  membersCount: number;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'Architecture' | 'Product' | 'Operations' | 'API' | 'Guides';
  author: User;
  lastUpdated: string;
  version: string;
  content: string;
  tags: string[];
}

export interface Integration {
  id: string;
  name: string;
  iconName: string;
  category: 'Communication' | 'Development' | 'Cloud Storage' | 'Productivity';
  connected: boolean;
  status: 'Healthy' | 'Config Needed' | 'Syncing';
  lastSynced?: string;
  description: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  previousValue: string;
  newValue: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Blocked';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'assignment' | 'mention' | 'deadline' | 'escalation' | 'automation';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyMasked: string;
  role: string;
  createdAt: string;
  lastUsed: string;
}
