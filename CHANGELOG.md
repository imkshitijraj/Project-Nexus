# Project Nexus Changelog

This changelog records the major production deployments completed for Project Nexus, from the first MVP to the current enterprise reliability release.

## Current Release — Incident & Reliability Command Center

### Added

- Incident and Reliability Command Center
- Persistent operational service catalog
- Live service-health monitoring
- SEV-1 through SEV-4 incident classification
- Incident commander assignment and status workflows
- Approval-gated production changes
- Implementation and rollback plans
- Recovery runbooks and drill tracking
- Recovery Time Objective (RTO), Recovery Point Objective (RPO), and availability targets
- Project-level permission enforcement
- Conflict protection and rate limiting
- Immutable reliability evidence logs
- Responsive light and dark interfaces

## Portfolio Governance Control Plane

### Added

- Persistent project risk register
- Probability and impact scoring
- Risk owners, mitigation plans, deadlines, and statuses
- Interactive risk heat map and filtering
- Governed milestone calendar with month and agenda views
- Milestone ownership, blocking, completion, and notifications
- Editable project health, progress, and target dates
- Mandatory reasons for controlled changes
- Conflict protection for simultaneous edits
- Searchable governance change ledger
- Project-level permission enforcement
- Dashboard alerts and command-palette updates

## Editable Budgets & Revision Logs

### Added

- Editable budget records for every project
- Allocation, actual spend, commitments, forecast, and notes
- Mandatory reason for every budget change
- Automatic before-and-after revision history
- Searchable, project-filtered budget logs
- Administrator and manager edit permissions
- Conflict protection for simultaneous edits
- Immutable security audit records

## Enterprise Operations Control Plane

### Added

- Deadline reminder automation
- Approval escalation rules
- Recurring-task automation
- Risk alerts and automatic status updates
- Durable automation rules and execution history
- Execution outcomes and request IDs
- Portfolio productivity analytics
- Workload forecasting
- Budget-variance analysis
- PDF and Excel-compatible report exports
- Integration control center for Google Calendar, Gmail, Slack, GitHub, Google Drive, and webhooks
- HTTPS-only webhook registration
- Workspace security and data-retention policies
- Custom role builder
- Scoped API keys with one-time display, hashing, expiration, and revocation
- Optional SSO-readiness controls
- Administrator-only enterprise commands and audit records

### Configuration

- External OAuth integrations require administrator credentials.
- SSO requires identity-provider configuration.

## Collaborative Operations Control Plane

### Added

- Persistent collaborative task management
- Workspace-member assignments and due dates
- Enforced task dependencies
- Project-scoped role authorization
- Comments with verified email mentions
- Operational notifications
- Project activity ledger
- Rate-limited server commands
- Searchable audit history
- CSV audit export
- Global command palette with `Ctrl/Cmd + K`
- Production error tracking with request IDs

## Multi-User Workspace

### Added

- Verified workspace invitations
- Administrator, manager, member, and viewer workspace roles
- Owner, manager, contributor, and viewer project roles
- Server-enforced command permissions
- Member suspension and role controls
- Approval and rejection workflows
- Access audit history
- Invitation expiration and revocation
- Protected initial administrator activation
- Project-specific Access tab

## Secure Access & Security Center

### Added

- Secure ChatGPT sign-in experience
- Verified identity-based access
- Security risk score
- Suspicious login detection
- Blocked and flagged access events
- Active-session controls
- Role and permission matrix
- Adaptive access protection
- Emergency workspace lockdown
- Secure sign-out
- Responsive mobile security interface

## Persistent Project Workspace

### Added

- Hosted database persistence
- Reload-safe project creation
- Real loading and saving states
- Authenticated project creation
- Database migration support
- Safe fallback to demonstration data

## Initial Interactive MVP

### Added

- Executive portfolio dashboard
- Project portfolio and project creation
- Kanban-style task management
- Team capacity and workload views
- Portfolio calendar
- Budget tracking and alerts
- Risk register with heat map
- Executive report templates
- Responsive desktop and mobile navigation
- Light and dark appearance settings
- Notification center
- Realistic demonstration data

## Current Production Link

[Open Project Nexus](https://project-nexus.imkshitijraj.chatgpt.site)
