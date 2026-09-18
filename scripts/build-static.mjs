import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

const outDir = 'dist';

const entries = [
  'index.html',
  'styles.css',
  'app.js',
  'sw.js',
  'LiveWebStudio-Tuner',
  'secretchat',
  'naghshe-Tuner',
  'Generator-Color-Palette--Tuner',
  'Element-Samples-Tuner',
  'apps',
  'tr file'
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of entries) {
  await stat(entry);
  await cp(entry, join(outDir, entry), {
    recursive: true,
    force: true,
    errorOnExist: false
  });
}

console.log('Static build complete:', entries.join(', '));
