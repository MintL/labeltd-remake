import * as THREE from 'three';

/** A VB form/control as maintained by the interpreter. All positions are twips. */
export interface HostControl {
  type: string;
  name: string;
  index?: number;
  properties: Record<string, unknown>;
  children?: HostControl[];
  /** Optional front-to-back order for a runtime implementation of ZOrder. */
  zOrder?: number;
}

export interface HostEvent {
  control: HostControl;
  name: string;
  index?: number;
  event: 'Click' | 'MouseMove' | 'KeyDown';
  button?: number;
  shift?: number;
  x?: number;
  y?: number;
  keyCode?: number;
}

interface PaintEntry {
  control: HostControl;
  kind: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  enabled: boolean;
  order: number;
}

interface RenderRecord {
  object: THREE.Object3D;
  signature: string;
  kind: string;
  ownedTexture?: THREE.Texture;
}

const UNIT_PLANE = new THREE.PlaneGeometry(1, 1);
const TWIPS_PER_PIXEL = 15;
const SYSTEM_COLORS: Record<number, string> = {
  0: '#c8c8c8', 1: '#004e98', 2: '#0a246a', 3: '#808080',
  4: '#f0f0f0', 5: '#ffffff', 6: '#646464', 7: '#000000',
  8: '#000000', 9: '#ffffff', 10: '#b4b4b4', 11: '#f4f4f4',
  12: '#ababab', 13: '#3399ff', 14: '#ffffff', 15: '#f0f0f0',
  16: '#a0a0a0', 17: '#6d6d6d', 18: '#000000', 19: '#434e54',
  20: '#ffffff', 21: '#696969', 22: '#e3e3e3', 23: '#000000',
  24: '#ffffe1',
};

function property(control: HostControl, key: string): unknown {
  const props = control.properties;
  if (Object.prototype.hasOwnProperty.call(props, key)) return props[key];
  const wanted = key.toLowerCase();
  const found = Object.keys(props).find((candidate) => candidate.toLowerCase() === wanted);
  return found === undefined ? undefined : props[found];
}

function numeric(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'boolean') return value ? -1 : 0;
  if (typeof value !== 'string') return fallback;
  const source = value.trim();
  const hex = /^&H([\da-f]+)&?$/i.exec(source);
  if (hex) return Number.parseInt(hex[1], 16);
  const parsed = Number(source);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function truthy(value: unknown, fallback = true): boolean {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const source = value.trim().toLowerCase();
    if (source === 'false' || source === '0' || source === '') return false;
    if (source === 'true') return true;
    return numeric(source, 1) !== 0;
  }
  return Boolean(value);
}

function label(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  return String(value);
}

/** Converts a VB/OLE BGR color (including system colors) to a CSS color. */
export function vbColor(value: unknown, fallback = '#ffffff'): string {
  if (typeof value === 'string' && /^#[\da-f]{3,8}$/i.test(value)) return value;
  const raw = numeric(value, Number.NaN);
  if (!Number.isFinite(raw)) return fallback;
  const unsigned = raw >>> 0;
  if ((unsigned >>> 24) === 0x80) {
    return SYSTEM_COLORS[unsigned & 0xff] ?? fallback;
  }
  const red = unsigned & 0xff;
  const green = (unsigned >>> 8) & 0xff;
  const blue = (unsigned >>> 16) & 0xff;
  return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
}

function fontProperty(control: HostControl, key: string): unknown {
  const font = property(control, 'Font');
  if (font && typeof font === 'object') {
    const record = font as Record<string, unknown>;
    const found = Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase());
    if (found !== undefined) return record[found];
  }
  return property(control, `Font.${key}`);
}

function controlKind(control: HostControl): string {
  return control.type.split('.').at(-1)?.toLowerCase() ?? '';
}

function material(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/**
 * Browser implementation of VB6's visual controls. It never calculates game state:
 * the source interpreter owns controls, and this class only paints them and forwards input.
 */
export class ThreeHost {
  onEvent?: (event: HostEvent) => void | Promise<void>;
  /** Resolve an original Picture value, such as `"spel.frx":08CA`, to a browser URL. */
  pictureResolver?: (picture: unknown, control: HostControl) => string | undefined;

  private root?: HostControl;
  private readonly container: HTMLElement;
  private readonly stage: HTMLDivElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(0, 10020, 0, 7380, -100, 100);
  private readonly records = new Map<HostControl, RenderRecord>();
  private readonly imageTextures = new Map<string, THREE.Texture>();
  private readonly imageFailed = new Set<string>();
  private readonly textureLoader = new THREE.TextureLoader();
  private readonly textMeasure = document.createElement('canvas').getContext('2d');
  private readonly resizeObserver: ResizeObserver;
  private entries: PaintEntry[] = [];
  private width = 10020;
  private height = 7380;
  private screenWidth = 0;
  private screenHeight = 0;
  private renderPending = false;
  private disposed = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.stage = document.createElement('div');
    this.stage.className = 'labeltd-stage';
    this.stage.tabIndex = 0;
    this.stage.setAttribute('role', 'application');
    this.stage.setAttribute('aria-label', 'LabelTD Visual Basic game');
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'labeltd-canvas';
    this.stage.appendChild(this.renderer.domElement);
    this.container.appendChild(this.stage);
    this.scene.background = new THREE.Color('#404040');
    this.camera.position.z = 10;
    this.camera.updateProjectionMatrix();
    this.stage.addEventListener('pointermove', this.handlePointerMove);
    this.stage.addEventListener('pointerdown', this.handlePointerDown);
    this.stage.addEventListener('click', this.handleClick);
    this.stage.addEventListener('keydown', this.handleKeyDown);
    this.stage.addEventListener('contextmenu', this.preventContextMenu);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();
  }

  setRoot(root: HostControl): void {
    this.root = root;
    this.render();
  }

  /** Paint current source-controlled state. Safe to call after each interpreted event. */
  render(): void {
    if (this.disposed || !this.root) return;
    this.width = Math.max(1, numeric(property(this.root, 'ScaleWidth'), numeric(property(this.root, 'ClientWidth'), 10020)));
    this.height = Math.max(1, numeric(property(this.root, 'ScaleHeight'), numeric(property(this.root, 'ClientHeight'), 7380)));
    this.scene.background = new THREE.Color(vbColor(property(this.root, 'BackColor'), '#404040'));
    this.camera.right = this.width;
    this.camera.top = 0;
    this.camera.bottom = this.height;
    this.camera.updateProjectionMatrix();
    this.resize();

    const entries: PaintEntry[] = [];
    this.collect(this.root, 0, 0, true, true, entries);
    this.entries = entries;
    const present = new Set<HostControl>();
    entries.forEach((entry, order) => {
      if (entry.kind === 'form' || entry.kind === 'timer') return;
      present.add(entry.control);
      this.paint(entry, order);
    });
    for (const [control, record] of this.records) {
      if (present.has(control)) continue;
      this.release(record);
      this.records.delete(control);
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.resizeObserver.disconnect();
    this.stage.removeEventListener('pointermove', this.handlePointerMove);
    this.stage.removeEventListener('pointerdown', this.handlePointerDown);
    this.stage.removeEventListener('click', this.handleClick);
    this.stage.removeEventListener('keydown', this.handleKeyDown);
    this.stage.removeEventListener('contextmenu', this.preventContextMenu);
    for (const record of this.records.values()) this.release(record);
    this.records.clear();
    for (const texture of this.imageTextures.values()) texture.dispose();
    this.imageTextures.clear();
    this.renderer.dispose();
    this.stage.remove();
  }

  private collect(
    control: HostControl,
    parentX: number,
    parentY: number,
    parentVisible: boolean,
    parentEnabled: boolean,
    entries: PaintEntry[],
  ): void {
    const kind = controlKind(control);
    // The browser stage is the Form client area. Form.Left/Top position the
    // legacy desktop window and must not offset its children inside the stage.
    let x = kind === 'form' ? 0 : parentX + numeric(property(control, 'Left'));
    const y = kind === 'form' ? 0 : parentY + numeric(property(control, 'Top'));
    const visible = parentVisible && truthy(property(control, 'Visible'));
    const enabled = parentEnabled && truthy(property(control, 'Enabled'));
    let width = numeric(property(control, 'Width'), kind === 'form' ? this.width : 0);
    const height = numeric(property(control, 'Height'), kind === 'form' ? this.height : 0);
    if (kind === 'label' && truthy(property(control, 'AutoSize'), false) && this.textMeasure) {
      const size = Math.max(1, numeric(fontProperty(control, 'Size'), 8.25) * 4 / 3);
      const weight = numeric(fontProperty(control, 'Weight'), 400);
      const italic = truthy(fontProperty(control, 'Italic'), false);
      const family = label(fontProperty(control, 'Name') ?? 'Arial');
      this.textMeasure.font = `${italic ? 'italic ' : ''}${weight >= 600 ? 'bold ' : ''}${size}px ${JSON.stringify(family)}`;
      const lines = label(property(control, 'Caption')).replace(/\r\n?/g, '\n').split('\n');
      width = Math.max(width, Math.ceil((Math.max(...lines.map(line => this.textMeasure!.measureText(line).width)) + 4) * TWIPS_PER_PIXEL));
    }
    const cropLeft = kind === 'image' ? Math.min(0.99, Math.max(0, numeric(property(control, '__cropLeft')))) : 0;
    if (cropLeft) {
      x += width * cropLeft;
      width *= 1 - cropLeft;
    }
    entries.push({ control, kind, x, y, width, height, visible, enabled, order: entries.length });
    const children = control.children ?? [];
    // VB form files list topmost controls first. Painting in reverse gives that order.
    const ordered = [...children].sort((a, b) =>
      numeric(property(b, '__zOrder'), b.zOrder ?? 0) - numeric(property(a, '__zOrder'), a.zOrder ?? 0));
    for (let i = ordered.length - 1; i >= 0; i--) {
      this.collect(ordered[i], x, y, visible, enabled, entries);
    }
  }

  private paint(entry: PaintEntry, order: number): void {
    const { control, kind } = entry;
    let record = this.records.get(control);
    if (record && record.kind !== kind) {
      this.release(record);
      this.records.delete(control);
      record = undefined;
    }
    if (!record) {
      const object = kind === 'line'
        ? new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ depthTest: false, depthWrite: false, transparent: true }))
        : new THREE.Mesh(UNIT_PLANE, material());
      this.scene.add(object);
      record = { object, kind, signature: '\0' };
      this.records.set(control, record);
    }
    const object = record.object;
    object.visible = entry.visible && (kind === 'line' || (entry.width > 0 && entry.height > 0));
    object.renderOrder = order;
    if (!object.visible) return;

    if (kind === 'line') {
      this.paintLine(entry, record);
    } else {
      const mesh = object as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
      mesh.position.set(entry.x + entry.width / 2, entry.y + entry.height / 2, 0);
      // The VB coordinate system grows downward; PlaneGeometry's UVs grow up.
      mesh.scale.set(entry.width, -entry.height, 1);
      if (kind === 'image') this.paintImage(entry, record);
      else this.paintCanvas(entry, record);
    }
  }

  private paintLine(entry: PaintEntry, record: RenderRecord): void {
    const { control } = entry;
    const x1 = numeric(property(control, 'X1')) + entry.x;
    const y1 = numeric(property(control, 'Y1')) + entry.y;
    const x2 = numeric(property(control, 'X2')) + entry.x;
    const y2 = numeric(property(control, 'Y2')) + entry.y;
    const color = vbColor(property(control, 'BorderColor'), '#000000');
    const signature = `${x1},${y1},${x2},${y2},${color}`;
    if (signature === record.signature) return;
    record.signature = signature;
    const line = record.object as THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y1, 0),
      new THREE.Vector3(x2, y2, 0),
    ]);
    line.material.color.set(color);
  }

  private paintImage(entry: PaintEntry, record: RenderRecord): void {
    const mesh = record.object as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    const picture = property(entry.control, 'Picture');
    const url = this.pictureUrl(picture, entry.control);
    const cropLeft = Math.min(0.99, Math.max(0, numeric(property(entry.control, '__cropLeft'))));
    const signature = `${url ?? ''}|${cropLeft}`;
    if (signature === record.signature) return;
    record.signature = signature;
    const texture = url ? this.imageTexture(url) : undefined;
    if (texture && cropLeft) {
      texture.repeat.x = 1 - cropLeft;
      texture.offset.x = cropLeft;
      texture.needsUpdate = true;
    }
    mesh.material.map = texture ?? null;
    mesh.material.opacity = url ? 1 : 0;
    mesh.material.needsUpdate = true;
  }

  private pictureUrl(picture: unknown, control: HostControl): string | undefined {
    const resolved = this.pictureResolver?.(picture, control);
    if (resolved) return resolved;
    if (picture && typeof picture === 'object') {
      const url = (picture as { url?: unknown }).url;
      if (typeof url === 'string') return url;
    }
    if (typeof picture !== 'string') return undefined;
    if (/^\s*"[^"]+\.frx"\s*:\s*[\da-f]+\s*$/i.test(picture)) return undefined;
    return picture || undefined;
  }

  private imageTexture(url: string): THREE.Texture | undefined {
    const cached = this.imageTextures.get(url);
    if (cached) return cached;
    if (this.imageFailed.has(url)) return undefined;
    const texture = this.textureLoader.load(
      url,
      () => this.requestRender(),
      undefined,
      () => { this.imageFailed.add(url); this.requestRender(); },
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    this.imageTextures.set(url, texture);
    return texture;
  }

  private paintCanvas(entry: PaintEntry, record: RenderRecord): void {
    const { control, kind } = entry;
    const caption = label(property(control, 'Caption'));
    const backColor = vbColor(property(control, 'BackColor'), kind === 'commandbutton' || kind === 'frame' ? '#f0f0f0' : '#ffffff');
    const foreColor = vbColor(property(control, 'ForeColor'), '#000000');
    const borderColor = vbColor(property(control, 'BorderColor'), kind === 'shape' ? '#000000' : '#707070');
    const fillColor = vbColor(property(control, 'FillColor'), backColor);
    const fontName = label(fontProperty(control, 'Name') ?? 'Arial');
    const fontSize = numeric(fontProperty(control, 'Size'), 8.25);
    const fontWeight = numeric(fontProperty(control, 'Weight'), 400);
    const italic = truthy(fontProperty(control, 'Italic'), false);
    const alignment = numeric(property(control, 'Alignment'));
    const backStyle = numeric(property(control, 'BackStyle'), kind === 'shape' ? 0 : 1);
    const borderStyle = numeric(property(control, 'BorderStyle'), kind === 'frame' || kind === 'commandbutton' || kind === 'shape' ? 1 : 0);
    const shape = numeric(property(control, 'Shape'));
    const fillStyle = numeric(property(control, 'FillStyle'), 1);
    const wordWrap = truthy(property(control, 'WordWrap'), kind === 'label');
    const signature = JSON.stringify([
      entry.width, entry.height, caption, backColor, foreColor, borderColor,
      fillColor, fontName, fontSize, fontWeight, italic, alignment,
      backStyle, borderStyle, shape, fillStyle, wordWrap, entry.enabled, kind,
    ]);
    if (signature === record.signature) return;
    record.signature = signature;
    if (record.ownedTexture) record.ownedTexture.dispose();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = Math.max(1, entry.width / TWIPS_PER_PIXEL);
    const cssHeight = Math.max(1, entry.height / TWIPS_PER_PIXEL);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(cssWidth * pixelRatio));
    canvas.height = Math.max(1, Math.ceil(cssHeight * pixelRatio));
    const context = canvas.getContext('2d');
    if (!context) return;
    context.scale(pixelRatio, pixelRatio);
    this.drawControl(context, control, kind, cssWidth, cssHeight, {
      caption, backColor, foreColor, borderColor, fillColor,
      fontName, fontSize, fontWeight, italic, alignment, backStyle,
      borderStyle, shape, fillStyle, wordWrap, enabled: entry.enabled,
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const mesh = record.object as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
    mesh.material.map = texture;
    mesh.material.opacity = 1;
    mesh.material.needsUpdate = true;
    record.ownedTexture = texture;
  }

  private drawControl(
    ctx: CanvasRenderingContext2D,
    control: HostControl,
    kind: string,
    width: number,
    height: number,
    style: {
      caption: string; backColor: string; foreColor: string; borderColor: string;
      fillColor: string; fontName: string; fontSize: number; fontWeight: number;
      italic: boolean; alignment: number; backStyle: number; borderStyle: number;
      shape: number; fillStyle: number; wordWrap: boolean; enabled: boolean;
    },
  ): void {
    const { caption, backColor, foreColor, borderColor, fillColor } = style;
    ctx.clearRect(0, 0, width, height);
    if (kind === 'shape') {
      ctx.beginPath();
      if (style.shape === 3 || style.shape === 2) {
        ctx.ellipse(width / 2, height / 2, Math.max(1, width / 2 - 1), Math.max(1, height / 2 - 1), 0, 0, Math.PI * 2);
      } else {
        ctx.rect(0.5, 0.5, Math.max(0, width - 1), Math.max(0, height - 1));
      }
      if (style.backStyle !== 0 || style.fillStyle !== 1) {
        ctx.fillStyle = style.fillStyle !== 1 ? fillColor : backColor;
        ctx.fill();
      }
      if (style.borderStyle !== 0) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = Math.max(1, numeric(property(control, 'BorderWidth'), 1));
        ctx.stroke();
      }
      return;
    }
    if (kind === 'frame') {
      ctx.fillStyle = backColor;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#777777';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 8.5, Math.max(0, width - 1), Math.max(0, height - 9));
      if (caption) {
        ctx.fillStyle = backColor;
        const captionWidth = Math.min(width - 16, caption.length * style.fontSize * 0.8 + 12);
        ctx.fillRect(8, 0, Math.max(0, captionWidth), 17);
        this.drawText(ctx, caption, 10, 1, Math.max(0, width - 18), 17, style, 'left');
      }
      return;
    }
    if (style.backStyle !== 0 || kind === 'commandbutton') {
      ctx.fillStyle = backColor;
      ctx.fillRect(0, 0, width, height);
    }
    if (kind === 'commandbutton') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, Math.max(0, width - 1), Math.max(0, height - 1));
      ctx.strokeStyle = '#777777';
      ctx.strokeRect(1.5, 1.5, Math.max(0, width - 3), Math.max(0, height - 3));
      this.drawText(ctx, caption, 5, 2, Math.max(0, width - 10), Math.max(0, height - 4), style, 'center', true);
      return;
    }
    if (style.borderStyle !== 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, Math.max(0, width - 1), Math.max(0, height - 1));
    }
    this.drawText(ctx, caption, 2, 0, Math.max(0, width - 4), height, style);
  }

  private drawText(
    ctx: CanvasRenderingContext2D,
    caption: string,
    left: number,
    top: number,
    width: number,
    height: number,
    style: {
      foreColor: string; fontName: string; fontSize: number; fontWeight: number;
      italic: boolean; alignment: number; wordWrap: boolean; enabled: boolean;
    },
    overrideAlign?: 'left' | 'center' | 'right',
    verticalCenter = false,
  ): void {
    if (!caption || width <= 0 || height <= 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, width, height);
    ctx.clip();
    const size = Math.max(1, style.fontSize * 4 / 3);
    ctx.font = `${style.italic ? 'italic ' : ''}${style.fontWeight >= 600 ? 'bold ' : ''}${size}px ${JSON.stringify(style.fontName)}`;
    ctx.fillStyle = style.enabled ? style.foreColor : '#808080';
    ctx.textBaseline = 'top';
    const align = overrideAlign ?? (style.alignment === 1 ? 'right' : style.alignment === 2 ? 'center' : 'left');
    ctx.textAlign = align;
    const lineHeight = size;
    const lines = this.wrapLines(ctx, caption.replace(/\r\n?/g, '\n'), width, style.wordWrap);
    let y = top + (verticalCenter ? Math.max(0, (height - lines.length * lineHeight) / 2) : 0);
    const x = align === 'center' ? left + width / 2 : align === 'right' ? left + width : left;
    for (const line of lines) {
      if (y >= top + height) break;
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
    ctx.restore();
  }

  private wrapLines(ctx: CanvasRenderingContext2D, caption: string, width: number, wordWrap: boolean): string[] {
    if (!wordWrap) return caption.split('\n');
    const result: string[] = [];
    for (const paragraph of caption.split('\n')) {
      let line = '';
      for (const word of paragraph.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > width) {
          result.push(line);
          line = word;
        } else line = next;
      }
      result.push(line);
    }
    return result;
  }

  private resize(): void {
    if (this.disposed) return;
    const availableWidth = this.container.clientWidth || window.innerWidth;
    const availableHeight = this.container.clientHeight || window.innerHeight;
    const scale = Math.min(availableWidth / this.width, availableHeight / this.height);
    const width = Math.max(1, Math.floor(this.width * scale));
    const height = Math.max(1, Math.floor(this.height * scale));
    if (width === this.screenWidth && height === this.screenHeight) return;
    this.screenWidth = width;
    this.screenHeight = height;
    this.stage.style.width = `${width}px`;
    this.stage.style.height = `${height}px`;
    this.renderer.setSize(width, height, false);
    if (this.root) this.renderer.render(this.scene, this.camera);
  }

  private requestRender(): void {
    if (this.renderPending || this.disposed) return;
    this.renderPending = true;
    requestAnimationFrame(() => {
      this.renderPending = false;
      this.render();
    });
  }

  private release(record: RenderRecord): void {
    this.scene.remove(record.object);
    record.ownedTexture?.dispose();
    if (record.object instanceof THREE.Line) record.object.geometry.dispose();
    const material = (record.object as THREE.Mesh | THREE.Line).material;
    if (Array.isArray(material)) material.forEach((item) => item.dispose());
    else material.dispose();
  }

  private hit(event: PointerEvent | MouseEvent): { entry: PaintEntry; x: number; y: number } | undefined {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return undefined;
    const x = (event.clientX - rect.left) / rect.width * this.width;
    const y = (event.clientY - rect.top) / rect.height * this.height;
    if (x < 0 || y < 0 || x > this.width || y > this.height) return undefined;
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const entry = this.entries[i];
      // VB6 Shape and Line controls are drawing primitives with no mouse events.
      if (!entry.visible || !entry.enabled || entry.kind === 'line' || entry.kind === 'shape' || entry.kind === 'timer') continue;
      if (entry.kind === 'form') return { entry, x: x - entry.x, y: y - entry.y };
      if (x >= entry.x && y >= entry.y && x < entry.x + entry.width && y < entry.y + entry.height) {
        return { entry, x: x - entry.x, y: y - entry.y };
      }
    }
    return undefined;
  }

  private dispatch(event: HostEvent): void {
    try {
      const result = this.onEvent?.(event);
      if (result instanceof Promise) void result.finally(() => this.requestRender());
      else this.requestRender();
    } catch (error) {
      // Preserve an interpreter exception for the app's error boundary.
      queueMicrotask(() => { throw error; });
    }
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const hit = this.hit(event);
    if (!hit) return;
    this.dispatch({
      control: hit.entry.control,
      name: hit.entry.control.name,
      index: hit.entry.control.index,
      event: 'MouseMove',
      button: event.buttons,
      shift: (event.shiftKey ? 1 : 0) | (event.ctrlKey ? 2 : 0) | (event.altKey ? 4 : 0),
      x: hit.x,
      y: hit.y,
    });
  };

  private readonly handlePointerDown = (): void => { this.stage.focus(); };

  private readonly handleClick = (event: MouseEvent): void => {
    const hit = this.hit(event);
    if (!hit) return;
    this.dispatch({
      control: hit.entry.control,
      name: hit.entry.control.name,
      index: hit.entry.control.index,
      event: 'Click',
      button: event.button === 1 ? 4 : event.button === 2 ? 2 : 1,
      shift: (event.shiftKey ? 1 : 0) | (event.ctrlKey ? 2 : 0) | (event.altKey ? 4 : 0),
      x: hit.x,
      y: hit.y,
    });
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.root) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
    this.dispatch({
      control: this.root,
      name: this.root.name,
      event: 'KeyDown',
      keyCode: event.keyCode || event.key.toUpperCase().charCodeAt(0),
      shift: (event.shiftKey ? 1 : 0) | (event.ctrlKey ? 2 : 0) | (event.altKey ? 4 : 0),
    });
  };

  private readonly preventContextMenu = (event: Event): void => { event.preventDefault(); };
}
