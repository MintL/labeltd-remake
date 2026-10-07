import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.resolve(webRoot, '../legacy');
const outputRoot = path.join(webRoot, 'public/legacy');
const files = [
  'spel.vbp',
  'spel.frm',
  'spel.frx',
  'lbltd.frm',
  'txt/map1.txt',
  'txt/map2.txt',
  'txt/map3.txt',
  'txt/names.txt',
  'txt/player/map.txt',
  'txt/player/map1.txt',
];

for (const relative of files) {
  const target = path.join(outputRoot, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(sourceRoot, relative), target);
}

console.log(`Synced ${files.length} original VB6 source and data files into web/public/legacy`);
