# Project Nexus

### Enterprise project operations, in one command center.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-7BB661?style=flat-square)](LICENSE)

Project Nexus is a full-stack project and portfolio management platform built for teams that need delivery visibility, controlled execution, and operational accountability. It combines project planning, automation, collaboration, finance, governance, reporting, security, and reliability management in a responsive workspace.

Designed and developed by **Kshitij Raj**.

## Highlights

- Executive portfolio dashboard with health, workload, delivery, and budget signals
- Projects, Kanban tasks, dependencies, milestones, timelines, and OKRs
- Multi-user workspaces with roles, invitations, project access, and approvals
- Comments, mentions, notifications, activity history, and audit exports
- Budget revisions, expenses, invoices, vendors, forecasts, and ROI views
- Risks, incidents, service health, change approvals, and recovery runbooks
- Automation rules for reminders, recurring tasks, escalation, SLA, and status updates
- Reports with productivity, capacity, budget variance, and export workflows
- Knowledge base with templates, rich documents, and version history
- Resource planning with capacity, workload, skills, leave, and timesheets
- Enterprise controls for policies, API keys, data retention, and SSO readiness
- Installable progressive web app with a responsive offline shell

## Technology

| Layer | Stack |
|---|---|
| Interface | React 19, Next.js 16, TypeScript |
| Runtime | Vinext, Cloudflare Workers |
| Data | Cloudflare D1, Drizzle ORM |
| Build | Vite 8 |
| Testing | Node test runner, ESLint |
| Offline | Web App Manifest, Service Worker |

## Project structure

```text
app/
  api/                 Protected server commands and exports
  page.tsx             Main workspace and navigation
  *-control.tsx        Domain control planes
  expansion-suite.tsx  Search, knowledge, resources, finance and views
db/
  schema.ts            Application data model
drizzle/               Versioned database migrations
lib/
  automation-engine.ts Automation evaluation logic
public/                PWA manifest, icons and service worker
tests/                 Rendered application checks
worker/                Cloudflare Worker entry point
```

## Run locally

### Requirements

- Node.js 22.13 or newer
- npm 10 or newer

### Setup

```bash
git clone https://github.com/imkshitijraj/Project-Nexus.git
cd Project-Nexus
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Configuration

Project Nexus expects identity to be supplied by an authentication gateway:

| Header | Purpose |
|---|---|
| `x-nexus-user-email` | Verified account email |
| `x-nexus-user-name` | Optional display name |
| `x-nexus-user-name-encoding` | Use `percent-encoded-utf-8` for encoded names |

Set the first administrator through:

```env
NEXUS_OWNER_EMAIL=owner@example.com
```

The interface automatically enters a safe demonstration workspace when no verified identity is available. Protected database writes still require a verified user and active workspace membership.

## Database

The application uses a D1 binding named `DB`.

```bash
npm run db:generate
npx wrangler d1 migrations apply project-nexus --local
```

Apply the same migrations to the production database during deployment.

## Quality checks

```bash
npm run lint
npm test
npm run validate:artifact
```

## Security

- Role and project-level authorization is enforced on server commands
- API credentials are displayed once and stored only as hashes
- Webhook registration accepts HTTPS endpoints only
- Sensitive configuration belongs in environment variables
- Audit and governance evidence is append-only in application workflows

Read [SECURITY.md](SECURITY.md) before deploying a public instance.

## Roadmap

The prioritized product roadmap is maintained in [ROADMAP.md](ROADMAP.md). Release history is available in [CHANGELOG.md](CHANGELOG.md).

## License

Released under the [MIT License](LICENSE).
