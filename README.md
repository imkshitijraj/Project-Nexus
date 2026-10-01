# Project Nexus — Unified Work & Workflow Intelligence Platform

> **Final Year Engineering Capstone Project**  
> **Lead Architect & System Designer:** Kshitij Raj  
> Built strictly according to the **Project Nexus — Complete Project Outline (36 Sections)**.

---

## 🚀 Overview

Project Nexus is a next-generation centralized workspace that consolidates project management, automated SLA escalations, real-time team collaboration, architecture documentation, risk governance, and natural-language AI intelligence into a single unified platform.

---

## 🔐 Multi-Layer Enterprise Security Architecture

Project Nexus implements a **Defense-in-Depth** security perimeter composed of three distinct protection layers:

### 🛡️ Layer 1: Identity & Authentication Barrier (Login Portal)
- **Strict Password Protection**: Validates user email and checks against salted hashes (`Argon2id`).
- **Brute-Force Lockout Defense**: 5 consecutive failed password attempts trigger an automated **60-second security lockout** and broadcast an alert event to the immutable audit log.
- **Hardware 2FA / Rotating TOTP**: 6-digit TOTP token rotating on a 30-second cryptographic clock, required alongside password verification.
- **Evaluator Persona Directory**: Allows presentation evaluators to inspect user roles while requiring password authentication.
  - **Kshitij Raj (Lead Architect & Super Admin)**: `kshitij.raj@nexus.io` / Password: `Nexus@2026!#`
  - **Sarah Connor (Executive Operations)**: `sarah.c@nexus.io` / Password: `Sarah@Nexus2026`
  - **Alex Mercer (Project Manager)**: `alex.m@nexus.io` / Password: `Alex@Nexus2026`
  - **Elena Rostova (Team Lead)**: `elena.r@nexus.io` / Password: `Elena@Nexus2026`
  - **Marcus Vance (Member / Backend)**: `marcus.v@nexus.io` / Password: `Marcus@Nexus2026`

### 🔑 Layer 2: Zero-Knowledge Workspace Enclave Shield (Workspace Gate)
- **Tenant-Level Passkey Encryption**: Individual organizational workspaces cannot be viewed or accessed until decrypted using the authorized workspace passkey or account master password.
- **Workspace Security Passkeys**:
  - `Nexus Global Enterprise` (`ws-1`): **`NEXUS-2026`**
  - `Apollo Engineering Labs` (`ws-2`): **`APOLLO-2026`**
  - `Orion Product Incubator` (`ws-3`): **`ORION-2026`**
- **Dynamic Lock & Re-lock**: Immediate on-demand locking via the **"Lock Workspace"** button in the Top Header or Sidebar to showcase password barrier compliance during viva/defense.
- **Workspace Switching Inside Gate**: Evaluators can toggle between different workspaces directly from the locked enclave modal to test distinct passkeys.

### 🔒 Layer 3: Workstation Screen & Biometric Lock
- Immediate quick-lock for compliance when stepping away from the workstation.
- Requires 4-digit PIN (Demo: `1234`) or simulated Touch ID / Windows Hello biometric verification.

---

## 🌟 Key Capabilities & 36-Section Architecture

### 1. Project Management & Multi-Views (§ 5)
- **Kanban Board**: Drag/move workflow columns (`Backlog`, `To Do`, `In Progress`, `In Review`, `Completed`), tags, assignees, subtasks progress, time logged, and quick stage transitions.
- **List View**: Structured view grouped by status with priority indicators and assignees.
- **Table View**: High-density tabular data grid for rapid status auditing.
- **Calendar View**: Deliverable deadline grid synchronized with external calendars.
- **Timeline View**: Chronological start-to-finish delivery spans.
- **Gantt Chart View**: Interactive critical-path Gantt schedule with task bars and milestone diamond markers.

### 2. Task Management Lifecycle (§ 6)
- **Full Lifecycle**: Create → Assign → Prioritize → Work → Review → Complete → Archive.
- **Interactive Task Drawer**:
  - Live Stopwatch Time Tracking (estimated vs. actual hours).
  - Subtask checklists with progress bars.
  - Acceptance criteria checklists.
  - Architectural tags & dependency relations.
  - Discussion and comment threads.

### 3. Autonomous Workflow Automation & SLA Escalation Engine (§ 7, § 8)
- **Event-Driven Triggers**: Evaluates `task_overdue`, `status_changed`, `milestone_reached`, and `priority_urgent`.
- **3-Tier SLA Escalation Pipeline**:
  - **Tier 1 (12h Overdue)**: Direct in-app & Slack notification to Team Lead.
  - **Tier 2 (24h Overdue)**: Project Manager intervention alert with email digest.
  - **Tier 3 (48h Overdue)**: Executive Operations flag with immutable audit log recording.
- **Visual Rule Management**: Enable/disable toggles, rule conditions, and one-click test execution.

### 4. Enterprise Risk Management & 5×5 Matrix (§ 9)
- **5×5 Probability × Severity Heatmap Matrix**:
  - Interactive cells color-coded by risk impact (1 to 25).
  - Filter ledger by clicking specific cells.
- **Risk Register Ledger**: Owner assignment, status (Identified, Mitigating, Monitored, Closed), and contingency plans.

### 5. Nexus Intelligence AI Copilot Suite (§ 16)
- **Natural Language Task Synthesis**: Instantly generate structured tasks with estimations and tags from specs.
- **Automated Risk Scanner**: Scan active telemetry for emerging operational bottlenecks.
- **Executive Summary Synthesizer**: Auto-generate portfolio status reports.

### 6. Real-Time Team Collaboration & Channels (§ 10, § 22)
- **Channels & DMs**: Public channels (`#general-announcements`, `#proj-workflow-engine`, `#ai-copilot-dev`), private compliance channels, and direct messages.
- **Rich Messaging**: Thread replies, emoji reactions, file attachments, and automated system event links.

### 7. Governance, RBAC & Immutable Audit Trail (§ 3, § 4, § 21, § 24, § 25)
- **Cryptographic Audit Logs**: Captures timestamps, actor, action, previous vs new value diffs, client IP, and authorization status.
- **RBAC Matrix**: Multi-role permission matrix across Super Admin, Org Admin, Workspace Admin, PM, Team Lead, Member, and Viewer.
- **API Key Lifecycle**: Create and revoke masked API tokens with scoped permissions.

### 8. Interactive REST API & 24 Database Entities Explorer (§ 26, § 27)
- **API Playground**: Live cURL examples with interactive "Try It Out" execution.
- **Relational Schema**: Complete specifications for User, Organization, Workspace, Project, Task, Subtask, Milestone, Risk, Budget, and AuditLog entities.

---

## 🛠️ Technology Stack (§ 28)

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite.
- **State Management**: Centralized reactive state store with LocalStorage persistence.
- **Typography**: Plus Jakarta Sans & JetBrains Mono via Google Fonts.
- **Styling**: Curated dark obsidian glassmorphism (`#0b0f17` palette) with neon accents and micro-animations.

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

The application is live at `http://localhost:3000/`.

---

## ⌨️ Universal Shortcuts
- `⌘K` or `Ctrl+K`: Open Universal Command Palette (search projects, tasks, docs, and navigate).
- Default Demo Workstation Lock PIN: `1234`
