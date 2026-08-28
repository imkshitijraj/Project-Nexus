#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const projectRoot = resolve(dirname(process.argv[1]), '..');
const runtimeRoot = process.env.SITES_RUNTIME_ROOT || resolve(projectRoot, '.sites-runtime');
const expectedHome = resolve(runtimeRoot, 'home');
const expectedCache = resolve(runtimeRoot, 'npm-cache');

mkdirSync(expectedHome, { recursive: true });
mkdirSync(expectedCache, { recursive: true });
mkdirSync(resolve(runtimeRoot, 'xdg-config'), { recursive: true });
mkdirSync(resolve(runtimeRoot, 'tmp'), { recursive: true });
mkdirSync(resolve(runtimeRoot, 'wrangler/logs'), { recursive: true });

process.env.SITES_ENV_READY = '1';
process.env.SITES_PROJECT_ROOT = projectRoot;
process.env.HOME = expectedHome;
process.env.XDG_CONFIG_HOME = resolve(runtimeRoot, 'xdg-config');
process.env.TMPDIR = resolve(runtimeRoot, 'tmp');
process.env.WRANGLER_WRITE_LOGS = 'false';
process.env.WRANGLER_LOG_PATH = resolve(runtimeRoot, 'wrangler/logs');
process.env.MINIFLARE_REGISTRY_PATH = resolve(runtimeRoot, 'wrangler/registry');
process.env.npm_config_cache = expectedCache;
process.env.npm_config_audit = 'false';
process.env.npm_config_fund = 'false';
process.env.npm_config_update_notifier = 'false';

function run(cmd, args, opts = {}) {
  console.log('> ' + [cmd].concat(args).join(' '));
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, env: process.env, ...opts });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`${cmd} exited ${res.status}`);
}

try {
  // Ensure npm is available
  run('npm', ['--version']);

  console.log('[sites] running npm ci with project cache');
  run('npm', ['ci', '--cache', expectedCache]);

  // Ensure vinext is available
  const vinextPath = resolve(projectRoot, 'node_modules', '.bin', 'vinext');
  const vinextWin = vinextPath + '.cmd';
  if (!existsSync(vinextPath) && !existsSync(vinextWin)) {
    console.error('vinext is unavailable. Run npm run install:ci or ensure vinext is installed.');
    process.exit(69);
  }

  // Compute lockfile sha256
  const lockfile = resolve(projectRoot, 'package-lock.json');
  const lockData = readFileSync(lockfile);
  const lockfileSha256 = createHash('sha256').update(lockData).digest('hex');

  // Write .sites-install.json
  const installMeta = {
    lockfile_sha256: lockfileSha256,
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
  };
  writeFileSync(resolve(projectRoot, 'node_modules', '.sites-install.json'), JSON.stringify(installMeta, null, 2) + '\n');
  console.log('[sites] npm ci passed and vinext is available');
  process.exit(0);
} catch (err) {
  console.error('[sites] install-ci failed:', err);
  process.exit(1);
}
