// main.ts — hands in the Vice City Trophy Ledger entry.
// Copies app/ and screenshots/ from this repository into the output directory
// (MAKEFUN_OUTPUT_DIR, or /output) and writes dossier.json there with
// buildDossier from vendor/makefun-frontend.ts. Node 22, standard library only.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = resolve(import.meta.dirname);
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

function copyEntryTree(sourceDir: string, targetDir: string): void {
  if (!existsSync(sourceDir)) return;
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function buildEntry(): void {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  copyEntryTree(join(repoRoot, 'app'), join(outputDir, 'app'));
  copyEntryTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

buildEntry();
console.log('Vice City Trophy Ledger entry written to ' + outputDir);
