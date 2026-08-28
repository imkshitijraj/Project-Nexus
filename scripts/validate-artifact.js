#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const worker = resolve(projectRoot, 'dist/server/index.js');
const hosting = resolve(projectRoot, 'dist/.openai/hosting.json');

async function main() {
  try {
    // ensure files exist
    await readFile(worker, 'utf8');
    await readFile(hosting, 'utf8');
  } catch (err) {
    console.error('Missing Sites artifact files (expected dist/server/index.js and dist/.openai/hosting.json)');
    process.exit(66);
  }

  try {
    const hostingJson = JSON.parse(await readFile(hosting, 'utf8'));
    const workerUrl = pathToFileURL(worker);
    workerUrl.searchParams.set('sites-validation', `${process.pid}-${Date.now()}`);
    const mod = await import(workerUrl.href);
    if (!mod.default || typeof mod.default.fetch !== 'function') {
      console.error('dist/server/index.js must have an ESM default export with fetch(request, env, ctx)');
      process.exit(1);
    }
    console.log('Validated Sites artifact: ESM Worker default.fetch and hosting manifest are present.');
  } catch (err) {
    console.error('Artifact validation failed:', err);
    process.exit(1);
  }
}

main();
