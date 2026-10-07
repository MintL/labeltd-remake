/** Reads the binary resources addressed by VB6 form designer properties. */
export class FrxResources {
  private readonly urls = new Map<number, string>();

  constructor(
    private readonly buffer: ArrayBuffer,
    readonly fileName = 'spel.frx',
  ) {}

  /** A VB6 reference looks like `"spel.frx":08CA` (the offset is hexadecimal). */
  getBytes(reference: string | number): Uint8Array {
    const { start, end } = this.bounds(this.offsetOf(reference));
    return new Uint8Array(this.buffer.slice(start, end));
  }

  getBlob(reference: string | number): Blob {
    const { start, end } = this.bounds(this.offsetOf(reference));
    const bytes = new Uint8Array(this.buffer, start, Math.min(12, end - start));
    return new Blob([this.buffer.slice(start, end)], { type: imageMimeType(bytes) });
  }

  /** Use this URL in an HTML image or a Three.js texture loader. */
  resolve(reference: string | number): string {
    const offset = this.offsetOf(reference);
    let url = this.urls.get(offset);
    if (!url) {
      url = URL.createObjectURL(this.getBlob(offset));
      this.urls.set(offset, url);
    }
    return url;
  }

  dispose(): void {
    for (const url of this.urls.values()) URL.revokeObjectURL(url);
    this.urls.clear();
  }

  private offsetOf(reference: string | number): number {
    if (typeof reference === 'number') {
      if (!Number.isSafeInteger(reference) || reference < 0) {
        throw new Error(`Invalid FRX offset: ${reference}`);
      }
      return reference;
    }
    const match = /^\s*"?([^":]+\.frx)"?\s*:\s*([\da-f]+)\s*$/i.exec(reference);
    if (!match) throw new Error(`Invalid VB6 FRX reference: ${reference}`);
    if (match[1].replace(/\\/g, '/').split('/').pop()?.toLowerCase() !== this.fileName.toLowerCase()) {
      throw new Error(`FRX reference ${reference} does not belong to ${this.fileName}`);
    }
    return Number.parseInt(match[2], 16);
  }

  private bounds(offset: number): { start: number; end: number } {
    // VB6's image records have: u32 record length, "lt\0\0", u32 payload
    // length, then the original ICO/GIF bytes. The designer offset points to
    // the start of the record, not the image bytes.
    if (offset + 12 > this.buffer.byteLength) throw new Error(`FRX offset out of range: ${offset}`);
    const view = new DataView(this.buffer);
    const recordLength = view.getUint32(offset, true);
    const payloadLength = view.getUint32(offset + 8, true);
    const marker = view.getUint32(offset + 4, true);
    if (marker !== 0x0000746c || recordLength !== payloadLength + 8) {
      throw new Error(`Unsupported FRX resource record at 0x${offset.toString(16)}`);
    }
    const start = offset + 12;
    const end = start + payloadLength;
    if (end > this.buffer.byteLength) throw new Error(`Truncated FRX resource at 0x${offset.toString(16)}`);
    return { start, end };
  }
}

function imageMimeType(bytes: Uint8Array): string {
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif';
  if (bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) return 'image/x-icon';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) return 'image/bmp';
  return 'application/octet-stream';
}
