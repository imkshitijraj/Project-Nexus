#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
    p.on('exit', (code) => code === 0 ? resolvePromise() : reject(new Error(`${cmd} exited ${code}`)));
    p.on('error', reject);
  });
}

(async () => {
  try {
    console.log('Running vinext build (node wrapper)...');
    await run('npx', ['vinext', 'build']);
    // run validate-artifact.js
    await run(process.execPath, [resolve(__dirname, 'validate-artifact.js')]);
    console.log('Build verified.');
  } catch (err) {
    console.error('build-verified.js failed:', err);
    process.exit(1);
  }
})();
