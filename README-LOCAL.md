# Local development and CI (Windows / WSL)

This project is primarily developed for a Sites/Cloudflare worker environment. The repository includes shell helpers under `scripts/` that assume a Unix-like environment; for Windows and CI we provide Node-based wrappers.

Prerequisites
- Node.js >= 22.13.0 (use nvm or install from nodejs.org)
- Git (recommended)
- For full parity use WSL or Git Bash if you need GNU utilities used by some shell scripts.

Common commands

# Install dependencies (Windows-friendly wrapper)
npm run install:ci:node

# Build (use Node wrapper on Windows)
npm run build:win

# Run tests (after build)
npm run test:win

Notes
- If you want to run the original shell scripts on Windows, use WSL or Git Bash.
- The project includes a lightweight DB test shim at `db/test-shim.mjs` which is used when `cloudflare:workers` cannot be loaded during tests. Set `SKIP_CLOUDFLARE=1` or `NODE_ENV=test` to enable the shim.
