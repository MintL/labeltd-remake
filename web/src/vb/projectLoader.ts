import { FrxResources } from './frx';
import { VirtualFileSystem } from './virtualFs';

export interface LegacyProject {
  /** The original VB6 project file, decoded from Windows-1252. */
  projectText: string;
  /** The startup form's original `.frm` text, including designer and procedures. */
  formText: string;
  formFile: string;
  startupForm: string;
  frx: FrxResources;
  fileSystem: VirtualFileSystem;
}

// These are data files shipped with the original project, not parsed game rules.
const bundledTextFiles = [
  'txt/map1.txt',
  'txt/map2.txt',
  'txt/map3.txt',
  'txt/names.txt',
  'txt/player/map.txt',
  'txt/player/map1.txt',
];

/** Load the actual VB6 source and assets before the synchronous VM starts. */
export async function loadLegacyProject(baseUrl = `${import.meta.env.BASE_URL}legacy`): Promise<LegacyProject> {
  const projectText = await fetchWindows1252(joinUrl(baseUrl, 'spel.vbp'));
  const startupForm = /^Startup\s*=\s*"?([^"\r\n]+)"?/mi.exec(projectText)?.[1]?.trim();
  const forms = [...projectText.matchAll(/^Form\s*=\s*([^\r\n]+)/gmi)]
    .map(match => match[1].trim().replace(/\\/g, '/').split('/').pop() ?? '');
  if (!startupForm || forms.length === 0) throw new Error('The VB6 project has no startup form');

  let formFile = '';
  let formText = '';
  for (const candidate of forms) {
    const source = await fetchWindows1252(joinUrl(baseUrl, candidate));
    if (new RegExp(`^Begin\\s+VB\\.Form\\s+${escapeRegExp(startupForm)}\\b`, 'mi').test(source)) {
      formFile = candidate;
      formText = source;
      break;
    }
  }
  if (!formFile) throw new Error(`Startup form ${startupForm} was not found in the VB6 project`);

  const frxFile = formFile.replace(/\.frm$/i, '.frx');
  if (frxFile === formFile) throw new Error(`Startup form has no .frm extension: ${formFile}`);
  const [frxBuffer, ...texts] = await Promise.all([
    fetchArrayBuffer(joinUrl(baseUrl, frxFile)),
    ...bundledTextFiles.map(path => fetchWindows1252(joinUrl(baseUrl, path))),
  ]);
  const files = Object.fromEntries(bundledTextFiles.map((path, index) => [path, texts[index]]));
  return {
    projectText,
    formText,
    formFile,
    startupForm,
    frx: new FrxResources(frxBuffer, frxFile),
    fileSystem: new VirtualFileSystem(files),
  };
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}: HTTP ${response.status}`);
  return response.arrayBuffer();
}

async function fetchWindows1252(url: string): Promise<string> {
  return new TextDecoder('windows-1252').decode(await fetchArrayBuffer(url));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
