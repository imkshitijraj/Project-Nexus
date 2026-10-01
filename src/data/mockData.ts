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
  UserSession,
  SecurityEvent
} from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr-0',
    name: 'Kshitij Raj',
    email: 'kshitij.raj@nexus.io',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'Super Admin',
    department: 'Core Platform Architecture & Lead Engineering',
    status: 'online',
    joinedAt: '2024-01-01',
    isProjectLead: true,
    password: 'Nexus@2026!#',
    pin: '1234'
  },
  {
    id: 'usr-1',
    name: 'Sarah Connor',
    email: 'sarah.c@nexus.io',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Super Admin',
    department: 'Executive Operations',
    status: 'online',
    joinedAt: '2024-01-15',
    password: 'Sarah@Nexus2026',
    pin: '2244'
  },
  {
    id: 'usr-2',
    name: 'Alex Mercer',
    email: 'alex.m@nexus.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Project Manager',
    department: 'Product Delivery',
    status: 'online',
    joinedAt: '2024-02-01',
    password: 'Alex@Nexus2026',
    pin: '3366'
  },
  {
    id: 'usr-3',
    name: 'Elena Rostova',
    email: 'elena.r@nexus.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Team Lead',
    department: 'Core Architecture',
    status: 'busy',
    joinedAt: '2024-02-10',
    password: 'Elena@Nexus2026',
    pin: '4488'
  },
  {
    id: 'usr-4',
    name: 'Marcus Vance',
    email: 'marcus.v@nexus.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    department: 'Backend Engineering',
    status: 'online',
    joinedAt: '2024-03-05',
    password: 'Marcus@Nexus2026',
    pin: '5500'
  },
  {
    id: 'usr-5',
    name: 'Aria Chen',
    email: 'aria.c@nexus.io',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'Member',
    department: 'Product Design & UX',
    status: 'offline',
    joinedAt: '2024-03-12',
    password: 'Aria@Nexus2026',
    pin: '6622'
  },
  {
    id: 'usr-6',
    name: 'Devon Hayes',
    email: 'devon.h@nexus.io',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    role: 'Viewer/Guest',
    department: 'Security & Compliance',
    status: 'online',
    joinedAt: '2024-04-01',
    password: 'Devon@Nexus2026',
    pin: '7799'
  }
];

export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Nexus Global Enterprise',
    slug: 'nexus-global',
    organization: 'Nexus Technologies Inc.',
    plan: 'Enterprise',
    membersCount: 48,
    projectsCount: 12,
    isPasswordProtected: true,
    securityPasscode: 'NEXUS-2026',
    isUnlocked: false
  },
  {
    id: 'ws-2',
    name: 'Apollo Engineering Labs',
    slug: 'apollo-labs',
    organization: 'Nexus Technologies Inc.',
    plan: 'Enterprise',
    membersCount: 24,
    projectsCount: 6,
    isPasswordProtected: true,
    securityPasscode: 'APOLLO-2026',
    isUnlocked: false
  },
  {
    id: 'ws-3',
    name: 'Orion Product Incubator',
    slug: 'orion-incubator',
    organization: 'Nexus Technologies Inc.',
    plan: 'Startup',
    membersCount: 9,
    projectsCount: 3,
    isPasswordProtected: true,
    securityPasscode: 'ORION-2026',
    isUnlocked: false
  }
];

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Workflow Automation Engine & Rules Engine',
    key: 'WAE',
    description: 'High-throughput event driven triggers, SLA monitoring, and automated multi-tier escalation pipeline.',
    status: 'Active',
    priority: 'Urgent',
    owner: mockUsers[1],
    members: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3]],
    startDate: '2026-08-01',
    deadline: '2026-10-31',
    progress: 74,
    budget: {
      estimated: 120000,
      actual: 89400,
      currency: 'USD',
    },
    milestones: [
      { id: 'm-1', title: 'Architecture Specification & RFC', dueDate: '2026-08-15', completed: true, tasksCount: 8, completedTasksCount: 8, projectId: 'proj-1' },
      { id: 'm-2', title: 'Core Event Broker & Trigger Router', dueDate: '2026-09-15', completed: true, tasksCount: 14, completedTasksCount: 14, projectId: 'proj-1' },
      { id: 'm-3', title: 'Visual Rule Canvas & Webhooks', dueDate: '2026-10-15', completed: false, tasksCount: 10, completedTasksCount: 6, projectId: 'proj-1' },
      { id: 'm-4', title: 'Performance Benchmark & Security Audit', dueDate: '2026-10-30', completed: false, tasksCount: 6, completedTasksCount: 1, projectId: 'proj-1' }
    ],
    risksCount: 3,
    health: 'Healthy'
  },
  {
    id: 'proj-2',
    name: 'Nexus AI Intelligence & Copilot Suite',
    key: 'AIC',
    description: 'Autonomous natural language project query, risk vector prediction, and automated executive summary synthesizer.',
    status: 'Active',
    priority: 'High',
    owner: mockUsers[2],
    members: [mockUsers[2], mockUsers[3], mockUsers[4]],
    startDate: '2026-08-15',
    deadline: '2026-11-20',
    progress: 58,
    budget: {
      estimated: 185000,
      actual: 112000,
      currency: 'USD',
    },
    milestones: [
      { id: 'm-5', title: 'LLM Context Orchestrator', dueDate: '2026-09-10', completed: true, tasksCount: 6, completedTasksCount: 6, projectId: 'proj-2' },
      { id: 'm-6', title: 'Risk Prediction Model Fine-Tuning', dueDate: '2026-10-20', completed: false, tasksCount: 9, completedTasksCount: 4, projectId: 'proj-2' },
      { id: 'm-7', title: 'Natural Language Task Generator', dueDate: '2026-11-15', completed: false, tasksCount: 8, completedTasksCount: 3, projectId: 'proj-2' }
    ],
    risksCount: 2,
    health: 'Healthy'
  },
  {
    id: 'proj-3',
    name: 'Multi-Region Kubernetes & Zero-Trust Mesh',
    key: 'K8S',
    description: 'FedRAMP-ready cloud storage isolation, automated disaster recovery, and mTLS mesh across cloud providers.',
    status: 'Active',
    priority: 'High',
    owner: mockUsers[0],
    members: [mockUsers[0], mockUsers[3]],
    startDate: '2026-07-01',
    deadline: '2026-10-15',
    progress: 89,
    budget: {
      estimated: 95000,
      actual: 91500,
      currency: 'USD',
    },
    milestones: [
      { id: 'm-8', title: 'Cross-Cloud VPC Peering', dueDate: '2026-08-01', completed: true, tasksCount: 5, completedTasksCount: 5, projectId: 'proj-3' },
      { id: 'm-9', title: 'Data Encryption at Rest & KMS', dueDate: '2026-09-01', completed: true, tasksCount: 7, completedTasksCount: 7, projectId: 'proj-3' },
      { id: 'm-10', title: 'Chaos Engineering & Failover Testing', dueDate: '2026-10-10', completed: false, tasksCount: 4, completedTasksCount: 3, projectId: 'proj-3' }
    ],
    risksCount: 1,
    health: 'At Risk'
  },
  {
    id: 'proj-4',
    name: 'Unified Design System & Mobile Client',
    key: 'MOB',
    description: 'Sub-millisecond native mobile interactions, offline SQLite cache synchronization, and dark obsidian UI.',
    status: 'Planning',
    priority: 'Medium',
    owner: mockUsers[4],
    members: [mockUsers[4], mockUsers[1]],
    startDate: '2026-09-20',
    deadline: '2026-12-15',
    progress: 22,
    budget: {
      estimated: 80000,
      actual: 17200,
      currency: 'USD',
    },
    milestones: [
      { id: 'm-11', title: 'Design Token Standardization', dueDate: '2026-10-05', completed: true, tasksCount: 6, completedTasksCount: 5, projectId: 'proj-4' },
      { id: 'm-12', title: 'React Native Shared Core', dueDate: '2026-11-10', completed: false, tasksCount: 12, completedTasksCount: 1, projectId: 'proj-4' }
    ],
    risksCount: 0,
    health: 'Healthy'
  }
];

export const mockTasks: Task[] = [
  {
    id: 'TASK-101',
    title: 'Implement Event-Driven Webhook Dispatcher with Circuit Breaker',
    description: 'Ensure outbound webhooks handle exponential backoff, rate limiting (max 500 req/sec), and dead-letter queue routing upon 5xx failure responses.',
    status: 'In Progress',
    priority: 'Urgent',
    projectId: 'proj-1',
    projectName: 'Workflow Automation Engine & Rules Engine',
    assignee: mockUsers[3],
    reporter: mockUsers[1],
    dueDate: '2026-10-02',
    startDate: '2026-09-24',
    estimatedHours: 32,
    loggedHours: 19.5,
    tags: ['Backend', 'Webhooks', 'Resilience'],
    subtasks: [
      { id: 'st-1', title: 'Create Redis Streams event buffer queue', completed: true },
      { id: 'st-2', title: 'Implement HMAC-SHA256 signature verification payload', completed: true },
      { id: 'st-3', title: 'Configure exponential retry policy (1s, 5s, 30s, 5m)', completed: false },
      { id: 'st-4', title: 'Integration tests for unreachable endpoint simulation', completed: false }
    ],
    checklists: [
      { id: 'cl-1', text: 'Peer code review passed', done: false },
      { id: 'cl-2', text: 'Telemetry metric `webhook.dispatch.latency` emitted', done: true },
      { id: 'cl-3', text: 'Zero memory leak under 5,000 concurrent payloads', done: false }
    ],
    dependencies: [],
    comments: [
      {
        id: 'c-1',
        userId: 'usr-2',
        userName: 'Alex Mercer',
        userAvatar: mockUsers[1].avatar,
        content: 'Marcus, please ensure we include idempotency keys in the HTTP header `X-Nexus-Delivery-Id`.',
        createdAt: '2026-09-26 11:20'
      },
      {
        id: 'c-2',
        userId: 'usr-4',
        userName: 'Marcus Vance',
        userAvatar: mockUsers[3].avatar,
        content: 'Done! Added `X-Nexus-Delivery-Id` and `X-Nexus-Signature-256`. Unit tests passing.',
        createdAt: '2026-09-27 15:45'
      }
    ],
    attachmentsCount: 3,
    escalationTier: 0,
    createdAt: '2026-09-20',
    updatedAt: '2026-09-28'
  },
  {
    id: 'TASK-102',
    title: 'Visual Automation Rule Canvas Drag-and-Drop Interface',
    description: 'Develop the node-based canvas for connecting triggers (e.g. Task Overdue, Milestone Complete) with actions (Escalate, Send Slack, Webhook).',
    status: 'In Progress',
    priority: 'High',
    projectId: 'proj-1',
    projectName: 'Workflow Automation Engine & Rules Engine',
    assignee: mockUsers[4],
    reporter: mockUsers[2],
    dueDate: '2026-10-06',
    startDate: '2026-09-25',
    estimatedHours: 40,
    loggedHours: 26,
    tags: ['UI/UX', 'Frontend', 'Canvas'],
    subtasks: [
      { id: 'st-5', title: 'Design SVG bezier curve connectors between nodes', completed: true },
      { id: 'st-6', title: 'Add rule validation before saving', completed: true },
      { id: 'st-7', title: 'Support conditional branching (IF/ELSE) blocks', completed: false }
    ],
    checklists: [
      { id: 'cl-4', text: 'Mobile responsive pinch-to-zoom check', done: false },
      { id: 'cl-5', text: 'Keyboard shortcuts for duplicating nodes', done: true }
    ],
    dependencies: ['TASK-101'],
    comments: [],
    attachmentsCount: 5,
    escalationTier: 0,
    createdAt: '2026-09-22',
    updatedAt: '2026-09-27'
  },
  {
    id: 'TASK-103',
    title: 'Automated Multi-Tier SLA Escalation Engine',
    description: 'Tasks overdue by >24h escalate to Team Lead; overdue by >48h notify Project Manager; overdue by >72h alert Executive Operations.',
    status: 'In Review',
    priority: 'Urgent',
    projectId: 'proj-1',
    projectName: 'Workflow Automation Engine & Rules Engine',
    assignee: mockUsers[2],
    reporter: mockUsers[0],
    dueDate: '2026-09-29',
    startDate: '2026-09-18',
    estimatedHours: 24,
    loggedHours: 22,
    tags: ['Escalation', 'SLA', 'Backend'],
    subtasks: [
      { id: 'st-8', title: 'Cron evaluator running every 60 seconds', completed: true },
      { id: 'st-9', title: 'Email & Push notification dispatcher triggers', completed: true },
      { id: 'st-10', title: 'Audit log record generation for every escalation step', completed: true }
    ],
    checklists: [
      { id: 'cl-6', text: 'Checked edge case with holiday calendar', done: true },
      { id: 'cl-7', text: 'Admin bypass toggle verified', done: true }
    ],
    dependencies: [],
    comments: [
      {
        id: 'c-3',
        userId: 'usr-0',
        userName: 'Sarah Connor',
        userAvatar: mockUsers[0].avatar,
        content: 'Elena, great job on the 3-tier escalation structure. Moving this to final QA stage.',
        createdAt: '2026-09-28 09:15'
      }
    ],
    attachmentsCount: 1,
    escalationTier: 1,
    createdAt: '2026-09-18',
    updatedAt: '2026-09-28'
  },
  {
    id: 'TASK-104',
    title: 'AI Copilot Natural Language Task & Subtask Generator',
    description: 'Allow managers to input a brief PRD or meeting notes and automatically synthesize fully-formed task trees with estimates and assignees.',
    status: 'In Progress',
    priority: 'High',
    projectId: 'proj-2',
    projectName: 'Nexus AI Intelligence & Copilot Suite',
    assignee: mockUsers[2],
    reporter: mockUsers[1],
    dueDate: '2026-10-12',
    startDate: '2026-09-22',
    estimatedHours: 35,
    loggedHours: 18,
    tags: ['AI/ML', 'LLM', 'Copilot'],
    subtasks: [
      { id: 'st-11', title: 'Structured JSON schema output validation', completed: true },
      { id: 'st-12', title: 'Skill matching algorithm for auto-assignee suggestion', completed: false }
    ],
    checklists: [
      { id: 'cl-8', text: 'Prompt injection sanitization tested', done: true }
    ],
    dependencies: [],
    comments: [],
    attachmentsCount: 2,
    escalationTier: 0,
    createdAt: '2026-09-21',
    updatedAt: '2026-09-28'
  },
  {
    id: 'TASK-105',
    title: 'Disaster Recovery Automated Failover & Read Replica Health Check',
    description: 'Ensure cross-region RDS PostgreSQL replica automatically promotes to primary in under 45 seconds if health probe fails 3 consecutive times.',
    status: 'Completed',
    priority: 'Urgent',
    projectId: 'proj-3',
    projectName: 'Multi-Region Kubernetes & Zero-Trust Mesh',
    assignee: mockUsers[3],
    reporter: mockUsers[0],
    dueDate: '2026-09-24',
    startDate: '2026-09-10',
    estimatedHours: 28,
    loggedHours: 27.5,
    tags: ['DevOps', 'PostgreSQL', 'HighAvailability'],
    subtasks: [
      { id: 'st-13', title: 'Route53 DNS health probe setup', completed: true },
      { id: 'st-14', title: 'Simulated network partition drill', completed: true },
      { id: 'st-15', title: 'Zero data loss RPO validation report', completed: true }
    ],
    checklists: [
      { id: 'cl-9', text: 'SOC2 Compliance checklist attached', done: true }
    ],
    dependencies: [],
    comments: [
      {
        id: 'c-4',
        userId: 'usr-1',
        userName: 'Sarah Connor',
        userAvatar: mockUsers[0].avatar,
        content: 'Verified. Promotion latency was 38.2s during Sunday drill. Excellent work.',
        createdAt: '2026-09-25 14:02'
      }
    ],
    attachmentsCount: 4,
    escalationTier: 0,
    createdAt: '2026-09-10',
    updatedAt: '2026-09-25'
  },
  {
    id: 'TASK-106',
    title: 'Dark Mode Obsidian Glass Theme & Micro-Interactions',
    description: 'Implement curated HSL dark mode palette, smooth backdrop-blur navigation, card hover elevations, and custom animated status indicators.',
    status: 'Completed',
    priority: 'Medium',
    projectId: 'proj-4',
    projectName: 'Unified Design System & Mobile Client',
    assignee: mockUsers[4],
    reporter: mockUsers[1],
    dueDate: '2026-09-25',
    startDate: '2026-09-15',
    estimatedHours: 20,
    loggedHours: 19,
    tags: ['DesignSystem', 'CSS', 'FramerMotion'],
    subtasks: [
      { id: 'st-16', title: 'Contrast ratios pass WCAG AAA standards', completed: true },
      { id: 'st-17', title: 'Smooth theme transition CSS variables', completed: true }
    ],
    checklists: [
      { id: 'cl-10', text: 'Tested in Safari, Chrome, Firefox, Edge', done: true }
    ],
    dependencies: [],
    comments: [],
    attachmentsCount: 6,
    escalationTier: 0,
    createdAt: '2026-09-15',
    updatedAt: '2026-09-25'
  },
  {
    id: 'TASK-107',
    title: 'Interactive Gantt Chart Dependency Line Calculation',
    description: 'Render interactive SVG dependency arrows linking predecessor tasks to successor tasks with drag-to-reschedule date synchronization.',
    status: 'To Do',
    priority: 'High',
    projectId: 'proj-1',
    projectName: 'Workflow Automation Engine & Rules Engine',
    assignee: mockUsers[3],
    reporter: mockUsers[2],
    dueDate: '2026-10-18',
    startDate: '2026-10-05',
    estimatedHours: 30,
    loggedHours: 4,
    tags: ['Gantt', 'Frontend', 'SVG'],
    subtasks: [
      { id: 'st-18', title: 'Compute critical path traversal algorithm', completed: false },
      { id: 'st-19', title: 'Handle milestone diamond markers', completed: false }
    ],
    checklists: [],
    dependencies: ['TASK-102'],
    comments: [],
    attachmentsCount: 1,
    escalationTier: 0,
    createdAt: '2026-09-24',
    updatedAt: '2026-09-27'
  },
  {
    id: 'TASK-108',
    title: 'Enterprise Single Sign-On (SAML 2.0 & OIDC) Integration',
    description: 'Add support for Okta, Azure AD, and Google Workspace SSO with Just-In-Time (JIT) role mapping and SCIM provisioning.',
    status: 'Backlog',
    priority: 'Medium',
    projectId: 'proj-3',
    projectName: 'Multi-Region Kubernetes & Zero-Trust Mesh',
    assignee: mockUsers[0],
    reporter: mockUsers[0],
    dueDate: '2026-11-05',
    startDate: '2026-10-20',
    estimatedHours: 40,
    loggedHours: 0,
    tags: ['Security', 'SSO', 'Auth'],
    subtasks: [],
    checklists: [],
    dependencies: [],
    comments: [],
    attachmentsCount: 0,
    escalationTier: 0,
    createdAt: '2026-09-25',
    updatedAt: '2026-09-25'
  }
];

export const mockRisks: RiskItem[] = [
  {
    id: 'RSK-01',
    title: 'Outbound Webhook Delivery Latency Spike at Peak Load',
    description: 'If third-party customer endpoints respond sluggishly (>10s), worker thread pool could starve if concurrency limit is breached.',
    projectId: 'proj-1',
    projectName: 'Workflow Automation Engine & Rules Engine',
    severity: 4,
    probability: 3,
    impactScore: 12,
    status: 'Mitigating',
    owner: mockUsers[3],
    mitigationPlan: 'Segregate worker pools per tier and enforce strict 3-second connect timeout with asynchronous non-blocking libuv dispatch.',
    dueDate: '2026-10-04'
  },
  {
    id: 'RSK-02',
    title: 'Third-Party LLM Provider Rate Limiting & Token Quota Exhaustion',
    description: 'Concurrent executive summary synthesis jobs during end-of-quarter spikes might trigger HTTP 429 quota exhaustion.',
    projectId: 'proj-2',
    projectName: 'Nexus AI Intelligence & Copilot Suite',
    severity: 4,
    probability: 4,
    impactScore: 16,
    status: 'Identified',
    owner: mockUsers[2],
    mitigationPlan: 'Deploy self-hosted fallback model (Llama-3-70B on internal GPU cluster) and Redis-backed response caching for identical project trees.',
    dueDate: '2026-10-10'
  },
  {
    id: 'RSK-03',
    title: 'Cloud Infrastructure Egress Cost Overrun on Cross-Region DB Sync',
    description: 'Continuous continuous WAL streaming across EU and US regions without compression could inflate AWS egress budget by 28%.',
    projectId: 'proj-3',
    projectName: 'Multi-Region Kubernetes & Zero-Trust Mesh',
    severity: 3,
    probability: 3,
    impactScore: 9,
    status: 'Monitored',
    owner: mockUsers[0],
    mitigationPlan: 'Enabled zstandard level-6 compression on pg_wal stream; budget anomaly alert threshold placed at $250/day.',
    dueDate: '2026-10-01'
  },
  {
    id: 'RSK-04',
    title: 'Regulatory Data Sovereignty Compliance under GDPR Article 44',
    description: 'European enterprise customers require project attachments to remain strictly within Frankfurt AWS eu-central-1.',
    projectId: 'proj-1',
    projectName: 'Workflow Automation Engine & Rules Engine',
    severity: 5,
    probability: 2,
    impactScore: 10,
    status: 'Closed',
    owner: mockUsers[5],
    mitigationPlan: 'Architected Geo-Fenced S3 Multi-Bucket router based on workspace country metadata.',
    dueDate: '2026-09-15'
  }
];

export const mockAutomations: WorkflowAutomation[] = [
  {
    id: 'auto-1',
    name: 'Auto-Escalate Critical Tasks Overdue by >24 Hours',
    trigger: 'task_overdue',
    condition: 'Priority == "Urgent" && HoursOverdue >= 24',
    action: 'escalate_tier',
    enabled: true,
    executionsCount: 38,
    lastRun: '2026-09-28 08:30'
  },
  {
    id: 'auto-2',
    name: 'Instant Slack Alert on Critical Risk Identification',
    trigger: 'priority_urgent',
    condition: 'Risk.ImpactScore >= 12',
    action: 'notify_slack',
    enabled: true,
    executionsCount: 14,
    lastRun: '2026-09-27 14:15'
  },
  {
    id: 'auto-3',
    name: 'Auto-Assign QA Lead When Task Status Changes to In Review',
    trigger: 'status_changed',
    condition: 'NewStatus == "In Review"',
    action: 'assign_lead',
    enabled: true,
    executionsCount: 89,
    lastRun: '2026-09-28 11:02'
  },
  {
    id: 'auto-4',
    name: 'Outbound CI/CD Webhook Trigger on Milestone Completion',
    trigger: 'milestone_reached',
    condition: 'Milestone.Progress == 100',
    action: 'webhook_post',
    enabled: false,
    executionsCount: 6,
    lastRun: '2026-09-15 16:40'
  }
];

export const mockEscalationRules: EscalationRule[] = [
  {
    id: 'esc-1',
    name: 'Tier 1 Escalation: Direct Team Lead Alert',
    overdueThresholdHours: 12,
    targetRole: 'Team Lead',
    notificationChannels: ['In-App', 'Slack'],
    active: true
  },
  {
    id: 'esc-2',
    name: 'Tier 2 Escalation: Project Manager Intervention',
    overdueThresholdHours: 24,
    targetRole: 'Project Manager',
    notificationChannels: ['Email', 'In-App', 'Slack'],
    active: true
  },
  {
    id: 'esc-3',
    name: 'Tier 3 Escalation: Executive Operations Review',
    overdueThresholdHours: 48,
    targetRole: 'Super Admin',
    notificationChannels: ['Email', 'In-App', 'Slack'],
    active: true
  }
];

export const mockChannels: Channel[] = [
  { id: 'ch-1', name: 'general-announcements', type: 'public', description: 'Company-wide updates and major releases', unreadCount: 0, membersCount: 48 },
  { id: 'ch-2', name: 'proj-workflow-engine', type: 'public', description: 'Real-time discussion for Project Nexus Core Engine', unreadCount: 3, membersCount: 12 },
  { id: 'ch-3', name: 'ai-copilot-dev', type: 'public', description: 'Model fine-tuning, prompts, and synthetic task generation', unreadCount: 1, membersCount: 8 },
  { id: 'ch-4', name: 'security-and-audit', type: 'private', description: 'Confidential security incidents, compliance & SOC2', unreadCount: 0, membersCount: 5 }
];

export const mockMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    channelId: 'ch-2',
    sender: mockUsers[1],
    content: 'Team, milestone 2 for the Event Broker has officially been completed! All 14 underlying tasks are green.',
    timestamp: '10:14 AM',
    reactions: [{ emoji: '🚀', count: 5, users: ['usr-1', 'usr-3', 'usr-4'] }, { emoji: '🎉', count: 3, users: ['usr-2', 'usr-5'] }],
    threadCount: 4
  },
  {
    id: 'msg-2',
    channelId: 'ch-2',
    sender: mockUsers[3],
    content: 'PR #142 for the Circuit Breaker is live on staging. It handled 8,000 synthetic failure payloads with zero dropped messages.',
    timestamp: '10:35 AM',
    reactions: [{ emoji: '🔥', count: 4, users: ['usr-1', 'usr-2'] }],
    attachments: [{ name: 'circuit_breaker_benchmark.pdf', size: '1.2 MB', type: 'pdf' }]
  },
  {
    id: 'msg-3',
    channelId: 'ch-2',
    sender: mockUsers[2],
    content: 'Reviewing PR #142 right now. Code cleanliness is top tier. Merging into `main` after automated E2E tests finish.',
    timestamp: '11:02 AM',
    reactions: [{ emoji: '👍', count: 2, users: ['usr-3'] }]
  },
  {
    id: 'msg-4',
    channelId: 'ch-3',
    sender: mockUsers[2],
    content: 'Testing the new prompt chain for Task Breakdown. Inputting a 2-page spec generates 8 tasks with realistic hour estimates and dependencies.',
    timestamp: '09:20 AM',
    reactions: [{ emoji: '🤖', count: 3, users: ['usr-1', 'usr-4'] }]
  }
];

export const mockDocuments: KnowledgeDocument[] = [
  {
    id: 'doc-1',
    title: 'Project Nexus System Architecture & RFC-001',
    category: 'Architecture',
    author: mockUsers[0],
    lastUpdated: '2026-09-24',
    version: 'v2.4.0',
    tags: ['RFC', 'Architecture', 'ZeroTrust'],
    content: `# Project Nexus Architecture Overview

## 1. High-Level Vision
Project Nexus is an all-in-one mission control platform that replaces fragmented stacks (Jira + Asana + Slack + Notion + Datadog) with a single, ultra-fast real-time collaborative workspace.

## 2. Core Pillars
- **Unified State**: Tasks, Git commits, PRs, risks, and chat logs share the exact same entity graph.
- **Autonomous SLA Engine**: Escalation rules ensure deadlines are never missed without human intervention.
- **Deep AI Integration**: Contextual project copilot provides proactive workload balancing and risk mitigation.

## 3. Security Boundary
- End-to-end mTLS communication.
- Row-Level Security (RLS) on all tenant tables in PostgreSQL.
- Immutable cryptographically chained audit logging for compliance.`
  },
  {
    id: 'doc-2',
    title: 'Workflow Automation & Trigger Specification',
    category: 'Product',
    author: mockUsers[1],
    lastUpdated: '2026-09-26',
    version: 'v1.8.2',
    tags: ['Automation', 'Webhooks', 'Rules'],
    content: `# Workflow Automation Engine (WAE)

## Trigger Types
1. **Task Overdue**: Evaluates cron timestamp against task due date.
2. **Status Transition**: Triggered on state change (e.g. Backlog -> In Progress).
3. **Milestone Progress**: Fires when milestone completion reaches 100%.

## Action Dispatch Pipeline
- Webhook dispatch with exponential backoff (1s, 5s, 30s).
- Direct Slack / Discord webhook dispatch.
- In-App push notification & high-priority toast.`
  },
  {
    id: 'doc-3',
    title: 'REST API & Webhooks Developer Integration Guide',
    category: 'API',
    author: mockUsers[3],
    lastUpdated: '2026-09-27',
    version: 'v3.1.0',
    tags: ['API', 'Developers', 'Webhooks'],
    content: `# Nexus Developer API

All API requests require a Bearer API Key generated in your Workspace Settings:
\`Authorization: Bearer nx_live_79a2fc8b...\`

### Base URL
\`https://api.nexus.io/v1\`

### Endpoints
- \`GET /v1/projects\`: List all accessible workspace projects.
- \`POST /v1/tasks\`: Programmatically create task with subtasks & assignees.
- \`POST /v1/webhooks\`: Register external listener endpoint.`
  }
];

export const mockIntegrations: Integration[] = [
  { id: 'int-1', name: 'GitHub Enterprise', iconName: 'github', category: 'Development', connected: true, status: 'Healthy', lastSynced: '2 mins ago', description: 'Bi-directional PR synchronization, commit timeline linking, and branch status.' },
  { id: 'int-2', name: 'Slack Workplace', iconName: 'slack', category: 'Communication', connected: true, status: 'Healthy', lastSynced: 'Just now', description: 'Broadcast task escalations, @mentions, and channel activity digests.' },
  { id: 'int-3', name: 'Google Calendar', iconName: 'calendar', category: 'Productivity', connected: true, status: 'Healthy', lastSynced: '15 mins ago', description: 'Synchronize sprint deadlines, milestone dates, and team standup meetings.' },
  { id: 'int-4', name: 'Google Drive & Cloud Storage', iconName: 'folder', category: 'Cloud Storage', connected: true, status: 'Healthy', lastSynced: '1 hour ago', description: 'Attach Drive documents and cloud assets with live permission checks.' },
  { id: 'int-5', name: 'GitLab CI/CD', iconName: 'gitlab', category: 'Development', connected: false, status: 'Config Needed', description: 'Trigger automated regression pipelines upon milestone completion.' },
  { id: 'int-6', name: 'Discord Dev Community', iconName: 'message-square', category: 'Communication', connected: false, status: 'Config Needed', description: 'Broadcast developer changelogs to community Discord server.' },
  { id: 'int-7', name: 'Zoom Video Conferencing', iconName: 'video', category: 'Communication', connected: true, status: 'Healthy', lastSynced: 'Yesterday', description: 'One-click instant sprint review and standup video conference rooms.' }
];

export const mockAuditLogs: AuditLogEntry[] = [
  { id: 'aud-109', timestamp: '2026-09-28 11:32:05', user: 'Elena Rostova', action: 'TASK_STATUS_UPDATE', entity: 'TASK-103', previousValue: 'In Progress', newValue: 'In Review', ipAddress: '192.168.1.42', status: 'Success' },
  { id: 'aud-108', timestamp: '2026-09-28 10:15:22', user: 'System (Automation Engine)', action: 'ESCALATION_TRIGGERED', entity: 'TASK-103', previousValue: 'Tier 0 (Normal)', newValue: 'Tier 1 (Lead Alert)', ipAddress: '10.0.4.12', status: 'Success' },
  { id: 'aud-107', timestamp: '2026-09-28 09:40:11', user: 'Alex Mercer', action: 'RISK_REGISTER_UPDATE', entity: 'RSK-02', previousValue: 'Severity 3', newValue: 'Severity 4', ipAddress: '192.168.1.18', status: 'Success' },
  { id: 'aud-106', timestamp: '2026-09-27 18:22:44', user: 'Sarah Connor', action: 'API_KEY_GENERATED', entity: 'nx_live_prod_webhook_09', previousValue: 'None', newValue: 'Active (Scopes: read, write)', ipAddress: '172.16.0.5', status: 'Success' },
  { id: 'aud-105', timestamp: '2026-09-27 14:10:02', user: 'Devon Hayes', action: 'POLICY_MODIFICATION_ATTEMPT', entity: 'WorkspaceRetentionPolicy', previousValue: '365 Days', newValue: '30 Days', ipAddress: '203.0.113.89', status: 'Blocked' },
  { id: 'aud-104', timestamp: '2026-09-26 16:55:18', user: 'Marcus Vance', action: 'TASK_COMPLETED', entity: 'TASK-105', previousValue: 'In Review', newValue: 'Completed', ipAddress: '192.168.1.77', status: 'Success' }
];

export const mockNotifications: NotificationItem[] = [
  { id: 'notif-1', title: 'Task Escalation Tier 1', description: 'Task "Automated Multi-Tier SLA Escalation Engine" has been escalated to Team Lead due to SLA threshold.', type: 'escalation', read: false, timestamp: '15 mins ago' },
  { id: 'notif-2', title: 'Alex Mercer mentioned you', description: '"Marcus, please ensure we include idempotency keys in the HTTP header..."', type: 'mention', read: false, timestamp: '1 hour ago' },
  { id: 'notif-3', title: 'Upcoming Project Milestone', description: 'Milestone "Visual Rule Canvas & Webhooks" due in 17 days.', type: 'deadline', read: true, timestamp: '5 hours ago' },
  { id: 'notif-4', title: 'Automation Rule Executed', description: 'Rule "Auto-Assign QA Lead" assigned Elena Rostova to TASK-103.', type: 'automation', read: true, timestamp: 'Yesterday' }
];

export const mockApiKeys: ApiKey[] = [
  { id: 'k-1', name: 'Production GitHub Actions Sync', keyMasked: 'nx_live_9482••••••••39d1', role: 'Full Admin', createdAt: '2026-08-10', lastUsed: '3 mins ago' },
  { id: 'k-2', name: 'Slack Bot Automation Token', keyMasked: 'nx_live_8810••••••••74ae', role: 'Read & Write', createdAt: '2026-08-22', lastUsed: 'Just now' },
  { id: 'k-3', name: 'Readonly BI Dashboard Analytics', keyMasked: 'nx_live_1204••••••••99bf', role: 'Read Only', createdAt: '2026-09-01', lastUsed: '2 hours ago' }
];

export const mockSessions: UserSession[] = [
  {
    id: 'sess-current',
    device: 'Desktop Workstation (Windows 11 x64)',
    browser: 'Chrome 128.0 (Hardware Encrypted)',
    ipAddress: '192.168.1.104',
    location: 'New Delhi, India',
    lastActive: 'Active Now',
    isCurrent: true
  },
  {
    id: 'sess-mobile',
    device: 'Apple iPhone 16 Pro (iOS 18.2)',
    browser: 'Mobile Safari (Biometric Protected)',
    ipAddress: '103.21.244.18',
    location: 'New Delhi, India',
    lastActive: '42 mins ago',
    isCurrent: false
  },
  {
    id: 'sess-remote',
    device: 'Developer Laptop (MacBook Pro M3 Max)',
    browser: 'VS Code Remote Tunnel (mTLS)',
    ipAddress: '172.16.4.12',
    location: 'Bangalore, India',
    lastActive: 'Yesterday at 18:20',
    isCurrent: false
  }
];

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'sec-ev-1',
    timestamp: '2026-09-28 13:45:20',
    type: 'LOGIN_SUCCESS',
    ipAddress: '192.168.1.104',
    details: 'User Kshitij Raj authenticated with password + Hardware TOTP 2FA.',
    severity: 'info'
  },
  {
    id: 'sec-ev-2',
    timestamp: '2026-09-28 12:10:05',
    type: 'MFA_CHALLENGE',
    ipAddress: '192.168.1.104',
    details: 'Zero-trust step-up challenge passed for Admin Settings route.',
    severity: 'info'
  },
  {
    id: 'sec-ev-3',
    timestamp: '2026-09-27 22:15:44',
    type: 'FAILED_LOGIN',
    ipAddress: '45.133.1.92',
    details: 'Failed credential attempt from unrecognized ASN (Blocked by Cloudflare WAF).',
    severity: 'warning'
  },
  {
    id: 'sec-ev-4',
    timestamp: '2026-09-27 19:30:12',
    type: 'PASSWORD_CHANGE',
    ipAddress: '192.168.1.104',
    details: 'Account security credentials rotated with Argon2id salt generation.',
    severity: 'info'
  }
];
