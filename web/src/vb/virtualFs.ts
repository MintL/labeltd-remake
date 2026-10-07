interface OpenInputFile {
  path: string;
  text: string;
  cursor: number;
}

/** Synchronous, read-only VB6 `Open ... For Input` filesystem. */
export class VirtualFileSystem {
  readonly appPath: string;
  private readonly files = new Map<string, string>();
  private readonly handles = new Map<number, OpenInputFile>();

  constructor(files: Record<string, string> = {}, appPath = '/legacy') {
    this.appPath = '/' + appPath.replace(/\\/g, '/').split('/').filter(Boolean).join('/');
    for (const [path, content] of Object.entries(files)) this.addText(path, content);
  }

  /** Additional map files can be supplied by the browser without changing the interpreter. */
  addText(path: string, content: string): void {
    this.files.set(this.normalizePath(path).toLowerCase(), content);
  }

  exists(path: string): boolean {
    return this.files.has(this.normalizePath(path).toLowerCase());
  }

  readText(path: string): string {
    const normalized = this.normalizePath(path);
    const text = this.files.get(normalized.toLowerCase());
    if (text === undefined) throw new Error(`File not found: ${normalized}`);
    return text;
  }

  /** Accepts both `App.Path & "\\txt\\map1.txt"` and `"\\txt\\map1.txt"`. */
  normalizePath(path: string): string {
    let forward = path.replace(/\\/g, '/');
    if (/^[a-z]:/i.test(forward) || forward.startsWith('//')) {
      throw new Error(`Path is outside the browser filesystem: ${path}`);
    }
    const root = this.appPath.toLowerCase();
    if (forward.toLowerCase() === root) return this.appPath;
    if (forward.toLowerCase().startsWith(root + '/')) forward = forward.slice(this.appPath.length + 1);
    else forward = forward.replace(/^\/+/, '');

    const parts: string[] = [];
    for (const part of forward.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') {
        if (!parts.length) throw new Error(`Path is outside the browser filesystem: ${path}`);
        parts.pop();
      } else {
        parts.push(part);
      }
    }
    return this.appPath + (parts.length ? '/' + parts.join('/') : '');
  }

  openInput(path: string, handle: number): void {
    this.assertHandle(handle);
    if (this.handles.has(handle)) throw new Error(`File handle #${handle} is already open`);
    const normalized = this.normalizePath(path);
    this.handles.set(handle, { path: normalized, text: this.readText(normalized), cursor: 0 });
  }

  eof(handle: number): boolean {
    const file = this.openFile(handle);
    return file.cursor >= file.text.length;
  }

  lineInput(handle: number): string {
    const file = this.openFile(handle);
    if (file.cursor >= file.text.length) throw new Error(`Input past end of file #${handle} (${file.path})`);
    const start = file.cursor;
    while (file.cursor < file.text.length && file.text[file.cursor] !== '\r' && file.text[file.cursor] !== '\n') {
      file.cursor++;
    }
    const line = file.text.slice(start, file.cursor);
    if (file.text[file.cursor] === '\r') file.cursor++;
    if (file.text[file.cursor] === '\n') file.cursor++;
    return line;
  }

  /** Returns the next comma-delimited Input # field as source text. */
  input(handle: number): string {
    const file = this.openFile(handle);
    const text = file.text;
    while (file.cursor < text.length && /[\s,]/.test(text[file.cursor])) file.cursor++;
    if (file.cursor >= text.length) throw new Error(`Input past end of file #${handle} (${file.path})`);

    if (text[file.cursor] === '"') {
      file.cursor++;
      let value = '';
      while (file.cursor < text.length) {
        const ch = text[file.cursor++];
        if (ch === '"') {
          if (text[file.cursor] === '"') {
            value += '"';
            file.cursor++;
          } else {
            break;
          }
        } else {
          value += ch;
        }
      }
      return value;
    }
    const start = file.cursor;
    while (file.cursor < text.length && !/[,\r\n]/.test(text[file.cursor])) file.cursor++;
    return text.slice(start, file.cursor).trim();
  }

  close(handle?: number): void {
    if (handle === undefined) this.handles.clear();
    else this.handles.delete(handle);
  }

  private openFile(handle: number): OpenInputFile {
    this.assertHandle(handle);
    const file = this.handles.get(handle);
    if (!file) throw new Error(`File handle #${handle} is not open`);
    return file;
  }

  private assertHandle(handle: number): void {
    if (!Number.isInteger(handle) || handle < 1) throw new Error(`Invalid file handle #${handle}`);
  }
}
