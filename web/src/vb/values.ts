/** The VB values used by the supplied program. Empty is deliberately distinct from 0. */
export const EMPTY = Symbol('VB Empty');
export type VbValue = unknown;

export class VbArray {
  readonly items: VbValue[];
  constructor(readonly upperBound: number, makeDefault: () => VbValue, readonly elementType = 'Variant') {
    if (!Number.isInteger(upperBound) || upperBound < 0 || upperBound > 100_000) {
      throw new Error(`Invalid VB array upper bound ${upperBound}`);
    }
    this.items = Array.from({ length: upperBound + 1 }, makeDefault);
  }

  get(index: unknown): VbValue {
    return this.items[this.check(index)];
  }

  set(index: unknown, value: VbValue): void {
    this.items[this.check(index)] = coerce(value, this.elementType);
  }

  private check(index: unknown): number {
    const number = vbIndex(index);
    if (!Number.isInteger(number) || number < 0 || number > this.upperBound) {
      throw new Error(`Subscript out of range: ${number} (0 to ${this.upperBound})`);
    }
    return number;
  }
}

/** VB coerces array/control subscripts to Integer before lookup. */
export function vbIndex(index: unknown): number {
  return coerce(index, 'Integer') as number;
}

export interface VbCell {
  type: string;
  value: VbValue;
}

export class VbRecord {
  constructor(readonly fields: Map<string, VbCell>) {}

  get(name: string): VbValue {
    const cell = this.fields.get(name.toLowerCase());
    if (!cell) throw new Error(`Unknown field ${name}`);
    return cell.value;
  }

  set(name: string, value: VbValue): void {
    const cell = this.fields.get(name.toLowerCase());
    if (!cell) throw new Error(`Unknown field ${name}`);
    cell.value = coerce(value, cell.type);
  }
}

export function vbNumber(value: VbValue): number {
  if (value === EMPTY || value == null) return 0;
  if (typeof value === 'boolean') return value ? -1 : 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const number = Number(trimmed);
    if (!Number.isNaN(number)) return number;
  }
  throw new Error(`Type mismatch: cannot convert ${String(value)} to number`);
}

export function vbString(value: VbValue): string {
  if (value === EMPTY || value == null) return '';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  return String(value);
}

export function vbBool(value: VbValue): boolean {
  if (value === EMPTY || value == null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const lowered = String(value).trim().toLowerCase();
  if (lowered === 'true') return true;
  if (lowered === 'false' || lowered === '') return false;
  return vbNumber(value) !== 0;
}

function roundToEven(value: number): number {
  const floor = Math.floor(value);
  const fraction = value - floor;
  if (fraction < 0.5) return floor;
  if (fraction > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}

export function coerce(value: VbValue, type: string): VbValue {
  switch (type.toLowerCase()) {
    case 'integer': {
      const number = roundToEven(vbNumber(value));
      if (!Number.isFinite(number) || number < -32768 || number > 32767) throw new Error('Overflow converting to Integer');
      return number;
    }
    case 'long': return roundToEven(vbNumber(value));
    case 'single': return Math.fround(vbNumber(value));
    case 'double': return vbNumber(value);
    case 'boolean': return vbBool(value);
    case 'string': return vbString(value);
    case 'variant':
    case '': return value;
    default: return value; // user-defined types are constructed at declaration time
  }
}

export function compare(left: VbValue, right: VbValue): number {
  if (typeof left === 'string' && typeof right === 'string') {
    return left < right ? -1 : left > right ? 1 : 0;
  }
  const a = vbNumber(left);
  const b = vbNumber(right);
  return a < b ? -1 : a > b ? 1 : 0;
}

export function binary(op: string, left: VbValue, right: VbValue): VbValue {
  switch (op.toLowerCase()) {
    case '+': return typeof left === 'string' && typeof right === 'string' ? left + right : vbNumber(left) + vbNumber(right);
    case '-': return vbNumber(left) - vbNumber(right);
    case '*': return vbNumber(left) * vbNumber(right);
    case '/': return vbNumber(left) / vbNumber(right);
    case '\\': return Math.trunc(vbNumber(left) / vbNumber(right));
    case '^': return vbNumber(left) ** vbNumber(right);
    case 'mod': return vbNumber(left) % vbNumber(right);
    case '&': return vbString(left) + vbString(right);
    case '=': return compare(left, right) === 0;
    case '<>': return compare(left, right) !== 0;
    case '<': return compare(left, right) < 0;
    case '<=': return compare(left, right) <= 0;
    case '>': return compare(left, right) > 0;
    case '>=': return compare(left, right) >= 0;
    case 'and': return typeof left === 'boolean' && typeof right === 'boolean'
      ? left && right : vbNumber(left) & vbNumber(right);
    case 'or': return typeof left === 'boolean' && typeof right === 'boolean'
      ? left || right : vbNumber(left) | vbNumber(right);
    default: throw new Error(`Unsupported VB operator ${op}`);
  }
}

export function unary(op: string, value: VbValue): VbValue {
  switch (op.toLowerCase()) {
    case '+': return vbNumber(value);
    case '-': return -vbNumber(value);
    case 'not': return typeof value === 'boolean' ? !value : ~vbNumber(value);
    default: throw new Error(`Unsupported VB unary operator ${op}`);
  }
}
