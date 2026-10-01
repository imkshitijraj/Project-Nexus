import React, { useState } from 'react';
import {
  ScrollText,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronRight,
  Shield,
  Zap,
  Terminal,
  Cpu,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface SpecSection {
  id: number;
  title: string;
  category: 'Foundation' | 'Core Platform' | 'Collaboration' | 'Intelligence' | 'Architecture' | 'Delivery';
  details: string[];
}

export const SpecsView: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(1);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const sections: SpecSection[] = [
    {
      id: 1,
      title: 'Project Overview',
      category: 'Foundation',
      details: [
        'Project Name: Nexus — Complete Project Management & Workflow Operations Platform',
        'Purpose: Centralized mission control workspace unifying projects, tasks, teams, communication, documents, workflows, deadlines, reporting, and cloud integrations.',
        'Target Users: Individuals, cross-functional squads, high-growth startups, and enterprises.',
        'Core Idea: Replace fragmented software stacks (Jira, Asana, Slack, Notion, Datadog) with one cohesive, real-time operating system.'
      ]
    },
    {
      id: 2,
      title: 'Problem Statement & Differentiation',
      category: 'Foundation',
      details: [
        'Operational Friction: Teams currently juggle 5-8 disparate tools, creating communication silos, stale status reports, and missed deadlines.',
        'Centralized Workflows: Nexus aggregates entity state so tasks, commits, PRs, chat threads, and SLA triggers operate on a unified graph.',
        'Differentiators: Autonomous 3-tier escalation engine, native AI project copilot, and zero-latency real-time collaboration.'
      ]
    },
    {
      id: 3,
      title: 'User Types & Roles',
      category: 'Foundation',
      details: [
        'Roles Defined: Super Admin, Organization Admin, Workspace Admin, Project Manager, Team Lead, Member, Viewer/Guest, and Custom Roles.',
        'Governance: Fine-grained RBAC matrix controlling create/edit/delete access, financial budget approval authority, and administrative capability.'
      ]
    },
    {
      id: 4,
      title: 'Workspace and Organization System',
      category: 'Foundation',
      details: [
        'Multi-Tenant Hierarchy: Organizations → Workspaces → Squads/Teams → Members.',
        'Capabilities: Workspace switching, invitation tokens, member provisioning, custom retention policies, API key scoping, and SAML 2.0 / OIDC SSO.'
      ]
    },
    {
      id: 5,
      title: 'Project Management & Multi-Views',
      category: 'Core Platform',
      details: [
        'Entity Attributes: Name, key, description, status, priority, owner, members, deadlines, milestones, subtasks, dependencies, files, risks, and budget tracking.',
        '6 Native View Modes: Kanban Board, List View, Table View, Calendar View, Timeline View, and Gantt Chart.'
      ]
    },
    {
      id: 6,
      title: 'Task Management Lifecycle',
      category: 'Core Platform',
      details: [
        'Lifecycle Stages: Create → Assign → Prioritize → Work → Review → Complete → Archive.',
        'Features: Real-time stopwatch time tracking, interactive subtasks, acceptance criteria checklists, dependency graphs, comments, attachments, and recurring deadlines.'
      ]
    },
    {
      id: 7,
      title: 'Workflow Automation Engine',
      category: 'Core Platform',
      details: [
        'Trigger System: Task overdue, status change, milestone 100% completion, priority urgent flag.',
        'Conditional Actions: Multi-tier SLA escalation, outbound webhooks with exponential retry, Slack alerts, and automated QA assignment.'
      ]
    },
    {
      id: 8,
      title: 'Deadlines & Escalation Engine',
      category: 'Core Platform',
      details: [
        'Tier 1 (12h Overdue): Direct in-app & Slack alert to Team Lead.',
        'Tier 2 (24h Overdue): Escalation to Project Manager with email digest.',
        'Tier 3 (48h Overdue): Executive Operations review flag with immutable audit log recording.'
      ]
    },
    {
      id: 9,
      title: 'Enterprise Risk Management',
      category: 'Core Platform',
      details: [
        '5×5 Severity × Probability Heatmap Matrix with dynamic score calculation.',
        'Risk Register: Identified, Mitigating, Monitored, Closed statuses with assigned mitigation owners and target completion dates.'
      ]
    },
    {
      id: 10,
      title: 'Real-Time Team Collaboration',
      category: 'Collaboration',
      details: [
        'Channels & DMs: Public channels, private squads, direct messaging, rich message formatting, and file attachments.',
        'Interactions: Emoji reactions, message threads, user mentions, and automated system event notifications.'
      ]
    },
    {
      id: 11,
      title: 'Documents & Knowledge Base',
      category: 'Collaboration',
      details: [
        'Wiki & Knowledge Base: Categorized RFCs (Architecture, Product, API, Operations), version control tags (v2.4.0), markdown editor/viewer, and document linking.'
      ]
    },
    {
      id: 12,
      title: 'Chronological Calendar & Schedules',
      category: 'Collaboration',
      details: [
        'Interactive calendar synchronizing project delivery deadlines, sprint milestones, team meetings, and recurring review events.'
      ]
    },
    {
      id: 13,
      title: 'Communication Integrations',
      category: 'Collaboration',
      details: [
        'Pre-built connectors for Slack, Discord, Microsoft Teams, Gmail, and Zoom with connection health probes and channel mapping.'
      ]
    },
    {
      id: 14,
      title: 'Development Integrations',
      category: 'Collaboration',
      details: [
        'GitHub Enterprise & GitLab: Track branch statuses, pull request approvals, automated commits linking, and webhook receivers.'
      ]
    },
    {
      id: 15,
      title: 'Cloud Storage & Asset Integrations',
      category: 'Collaboration',
      details: [
        'Google Drive, OneDrive, Dropbox, and S3-compatible cloud storage with asset permissions and versioning.'
      ]
    },
    {
      id: 16,
      title: 'AI Intelligence Copilot Suite',
      category: 'Intelligence',
      details: [
        'Autonomous Project Manager Copilot: Natural language task breakdown, proactive risk detection, executive summary synthesizer, and contextual project queries.'
      ]
    },
    {
      id: 17,
      title: 'Analytics & Reporting Dashboards',
      category: 'Intelligence',
      details: [
        'Productivity velocity metrics, team workload capacity utilization, task completion graphs, and 1-click CSV data export.'
      ]
    },
    {
      id: 18,
      title: 'Budget & Financial Governance',
      category: 'Intelligence',
      details: [
        'Authorized budget vs actual expenditure tracking, burn rate velocity, operational category breakdowns, and financial variance monitoring.'
      ]
    },
    {
      id: 19,
      title: 'Unified Notification Center',
      category: 'Intelligence',
      details: [
        'Live notification drawer with type categorization (Escalations, Mentions, Deadlines, Automations) and mark-all-read capabilities.'
      ]
    },
    {
      id: 20,
      title: 'Global Omnisearch (Cmd+K)',
      category: 'Intelligence',
      details: [
        'Universal command palette allowing instant keyboard navigation across projects, tasks, documents, and workspace settings.'
      ]
    },
    {
      id: 21,
      title: 'Immutable Audit Trail',
      category: 'Architecture',
      details: [
        'Cryptographic mutation records capturing timestamps, actor IDs, actions, entity keys, previous vs new values, and client IP addresses.'
      ]
    },
    {
      id: 22,
      title: 'Channel & Communication Logs',
      category: 'Architecture',
      details: [
        'Audit-safe communication logging with moderation capabilities, retention policy adherence, and full message history search.'
      ]
    },
    {
      id: 23,
      title: 'Complete Activity Timeline',
      category: 'Architecture',
      details: [
        'Unified chronological event stream merging code commits, task transitions, comments, and automated SLA escalations.'
      ]
    },
    {
      id: 24,
      title: 'Enterprise Security Architecture',
      category: 'Architecture',
      details: [
        'JWT & OAuth 2.0 authentication, MFA hardware key support, Row-Level Security (RLS), API rate limiting, and zero-trust session management.'
      ]
    },
    {
      id: 25,
      title: 'Admin Governance Panel',
      category: 'Architecture',
      details: [
        'Centralized administration over organizations, workspaces, member roles, security policies, data retention, and system settings.'
      ]
    },
    {
      id: 26,
      title: 'REST API & Webhooks Strategy',
      category: 'Architecture',
      details: [
        'OpenAPI 3.0 specification, Bearer token authentication, idempotency headers (X-Nexus-Delivery-Id), and webhook HMAC signatures.'
      ]
    },
    {
      id: 27,
      title: 'Database Architecture (24 Core Entities)',
      category: 'Architecture',
      details: [
        'Relational data model: User, Organization, Workspace, Team, Role, Permission, Project, Task, Subtask, Milestone, Dependency, Comment, Message, Document, File, CalendarEvent, Notification, Automation, Workflow, Risk, Budget, Integration, Webhook, and AuditLog.'
      ]
    },
    {
      id: 28,
      title: 'Proposed Technical Stack',
      category: 'Architecture',
      details: [
        'Frontend: React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons.',
        'Backend: Node.js, Express, PostgreSQL, Prisma ORM, Redis Streams.',
        'Deployment: Docker containerization, multi-cloud Kubernetes, Vercel/Railway CDN.'
      ]
    },
    {
      id: 29,
      title: 'Modern UI/UX Design System',
      category: 'Architecture',
      details: [
        'Curated obsidian dark palette, glassmorphism panels, responsive desktop-first layout, micro-interactions, and WCAG AAA compliance.'
      ]
    },
    {
      id: 30,
      title: 'Event & Notification Architecture',
      category: 'Delivery',
      details: [
        'Event Flow: Task overdue → Event emitted → Automation engine evaluates rules → Dispatcher sends In-App/Slack alert → Appended to Audit Log.'
      ]
    },
    {
      id: 31,
      title: 'Deployment & CI/CD Pipeline',
      category: 'Delivery',
      details: [
        'Automated GitHub Actions workflow, zero-downtime rolling deploys, database migration checks, and distributed S3 asset synchronization.'
      ]
    },
    {
      id: 32,
      title: 'Testing Requirements',
      category: 'Delivery',
      details: [
        'Unit testing (Jest/Vitest), API integration testing, E2E UI testing, circuit breaker chaos drill, and security penetration test audits.'
      ]
    },
    {
      id: 33,
      title: 'Required Developer Documentation',
      category: 'Delivery',
      details: [
        'Comprehensive README.md, architecture RFCs, database schema definitions, API cURL examples, environment variables, and admin guides.'
      ]
    },
    {
      id: 34,
      title: 'Phased Development Roadmap',
      category: 'Delivery',
      details: [
        'Phase 1: Foundation (Auth, Workspaces, Users, Core UI)',
        'Phase 2: Project Management (Tasks, Kanban, List, Gantt, Dependencies)',
        'Phase 3: Collaboration (Chat, Documents, Notifications)',
        'Phase 4: Automation (Rule Engine, Escalations, Webhooks)',
        'Phase 5: Integrations (GitHub, Slack, Google Calendar, Drive)',
        'Phase 6: Analytics & AI (Copilot, Risk Matrix, Workload Balance)',
        'Phase 7: Enterprise (SSO, MFA, Advanced Audit System, Retention)'
      ]
    },
    {
      id: 35,
      title: 'Definition of Done',
      category: 'Delivery',
      details: [
        'Operational frontend and backend interfaces, responsive layout, test coverage, zero console errors, security controls verified, and complete developer handoff documentation.'
      ]
    },
    {
      id: 36,
      title: 'Handoff Requirements & Open Questions',
      category: 'Delivery',
      details: [
        'Specification provides complete architectural context for any engineering team to implement and scale Project Nexus.',
        'Open Question 1: Self-hosted vs SaaS LLM inference cost threshold for large enterprise tenants.',
        'Open Question 2: WebSocket vs Server-Sent Events (SSE) for high-scale real-time collaboration.'
      ]
    }
  ];

  const categories = ['all', 'Foundation', 'Core Platform', 'Collaboration', 'Intelligence', 'Architecture', 'Delivery'];

  const filtered = sections.filter((s) =>
    filterCategory === 'all' ? true : s.category === filterCategory
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Official Developer Specification
          </span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            All 36 Sections Covered
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <ScrollText className="w-6 h-6 text-indigo-400" />
          Project Nexus — Complete 36-Section Architecture Specification
        </h1>
        <p className="text-xs text-slate-400 max-w-3xl mt-1 leading-relaxed">
          The definitive reference manual and developer handoff document synthesized directly from the Project Nexus complete project outline.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
              filterCategory === c
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filtered.map((sec) => {
          const isExpanded = expandedSection === sec.id;
          return (
            <div
              key={sec.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'bg-slate-900/80 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60'
              }`}
            >
              <button
                onClick={() => setExpandedSection(isExpanded ? null : sec.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    § {sec.id < 10 ? '0' + sec.id : sec.id}
                  </span>
                  <span className="text-sm font-bold text-white">{sec.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {sec.category}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-5 pt-1 border-t border-slate-800/60 text-xs space-y-2 animate-in fade-in">
                  {sec.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
