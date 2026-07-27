# Security Policy

## Reporting

Do not publish a suspected vulnerability in a public issue. Send a private report to the repository owner with:

- affected route or component
- reproduction steps
- expected and observed behavior
- impact assessment
- suggested remediation, if known

## Deployment requirements

- Keep secrets outside the repository
- Configure `NEXUS_OWNER_EMAIL` through the deployment environment
- Inject verified identity headers only from a trusted reverse proxy
- Strip inbound copies of trusted identity headers at the public edge
- Apply D1 migrations before enabling writes
- Restrict database and Worker access using least privilege
- Rotate API keys and webhook secrets on a defined schedule
- Back up production data and test restoration regularly

## Supported versions

Security fixes are applied to the latest release on the default branch.

