// NusaData — Indonesia in Numbers: the hand-in program.
//
// This file is the entrypoint of the repository. It runs under Node 22
// with only the standard library, in a container with no network: it
// copies the static site in app/ and the screenshots in screenshots/
// into the output directory, then writes /output/dossier.json, the
// summary the judge reads, using the vendored make.fun library at
// vendor/makefun-frontend.ts (that file is the kit's copy, unchanged).
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Fail fast with a readable message when the screenshots are missing:
// buildDossier would refuse the entry anyway, but only after copying.
const shotDir = join(outputDir, 'screenshots');
const shotCount = existsSync(shotDir)
  ? readdirSync(shotDir).filter((f) => !f.startsWith('.')).length
  : 0;
if (shotCount < 3 || shotCount > 4) {
  throw new Error(`expected 3 or 4 screenshots in screenshots/, found ${shotCount}`);
}

// The caps below are the scorer's own: the dossier text is capped at
// 160 KiB, at most 4 screenshots of at most 256 KiB each, and app/ holds
// at most 993 files and directories totalling at most 16 MiB. An entry
// past any of them is refused here, exactly as the scorer would refuse it.
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

// Short run summary so a failed or partial hand-in is obvious at a glance.
const appFiles = readdirSync(join(outputDir, 'app'));
console.log(
  `handed in ${appFiles.length} app files, ${shotCount} screenshots, dossier ${dossierPath}`,
);
