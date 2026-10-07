import type { ControlDefinition, PropertyValue, ResourceReference } from './ast';
import { vbIndex, vbString, type VbValue } from './values';

export interface ControlInstance {
  type: string;
  name: string;
  index?: number;
  properties: Record<string, unknown>;
  children: ControlInstance[];
  parent?: ControlInstance;
}

export class ControlArray {
  readonly items = new Map<number, ControlInstance>();
  constructor(readonly name: string) {}
  get(index: unknown): ControlInstance {
    const number = vbIndex(index);
    const item = this.items.get(number);
    if (!item) throw new Error(`Control ${this.name}(${number}) is not loaded`);
    return item;
  }
}

function keyFor(properties: Record<string, unknown>, wanted: string): string {
  return Object.keys(properties).find(key => key.toLowerCase() === wanted.toLowerCase()) ?? wanted;
}

export function getControlProperty(control: ControlInstance, name: string): VbValue {
  const key = keyFor(control.properties, name);
  if (key in control.properties) return control.properties[key];
  if (name.toLowerCase() === 'visible' || name.toLowerCase() === 'enabled') return true;
  if (name.toLowerCase() === 'caption') return '';
  return 0;
}

export function setControlProperty(control: ControlInstance, name: string, value: VbValue): void {
  const key = keyFor(control.properties, name);
  control.properties[key] = value;
}

export function defaultProperty(control: ControlInstance): string {
  const type = control.type.toLowerCase().replace(/^vb\./, '');
  if (type === 'label' || type === 'commandbutton' || type === 'frame' || type === 'form') return 'Caption';
  if (type === 'image') return 'Picture';
  throw new Error(`No default property for ${control.type} ${control.name}`);
}

export function getControlDefault(control: ControlInstance): VbValue {
  return getControlProperty(control, defaultProperty(control));
}

export function setControlDefault(control: ControlInstance, value: VbValue): void {
  const name = defaultProperty(control);
  setControlProperty(control, name, name === 'Caption' ? vbString(value) : value);
}

export class ControlRegistry {
  readonly root: ControlInstance;
  private readonly names = new Map<string, ControlInstance | ControlArray>();
  private zCounter = 0;

  constructor(definition: ControlDefinition, resolveResource: (ref: ResourceReference) => unknown) {
    const make = (def: ControlDefinition, parent?: ControlInstance): ControlInstance => {
      const properties: Record<string, unknown> = {};
      for (const [name, value] of Object.entries(def.properties)) {
        properties[name] = this.materialize(value, resolveResource);
      }
      const control: ControlInstance = {
        type: def.type,
        name: def.name,
        index: def.index,
        properties,
        children: [],
        parent,
      };
      this.register(control);
      control.children = def.children.map(child => make(child, control));
      return control;
    };
    this.root = make(definition);
  }

  private materialize(value: PropertyValue, resolve: (ref: ResourceReference) => unknown): unknown {
    if (value && typeof value === 'object') {
      if ('kind' in value && value.kind === 'resource') return resolve(value as ResourceReference);
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.materialize(item, resolve)]));
    }
    return value;
  }

  private register(control: ControlInstance): void {
    const key = control.name.toLowerCase();
    const existing = this.names.get(key);
    if (control.index !== undefined) {
      let array: ControlArray;
      if (existing instanceof ControlArray) array = existing;
      else {
        if (existing) throw new Error(`Mixed indexed and ordinary controls named ${control.name}`);
        array = new ControlArray(control.name);
        this.names.set(key, array);
      }
      array.items.set(control.index, control);
    } else {
      if (existing) throw new Error(`Duplicate control ${control.name}`);
      this.names.set(key, control);
    }
  }

  find(name: string): ControlInstance | ControlArray | undefined {
    return this.names.get(name.toLowerCase());
  }

  all(): ControlInstance[] {
    const result: ControlInstance[] = [];
    const walk = (control: ControlInstance): void => {
      result.push(control);
      control.children.forEach(walk);
    };
    walk(this.root);
    return result;
  }

  load(array: ControlArray, index: unknown): ControlInstance {
    const number = vbIndex(index);
    if (!Number.isInteger(number) || number < 0) throw new Error(`Invalid control index ${index}`);
    if (array.items.has(number)) throw new Error(`Control ${array.name}(${number}) already loaded`);
    const base = array.get(0);
    const clone: ControlInstance = {
      type: base.type,
      name: base.name,
      index: number,
      properties: { ...base.properties, Visible: false },
      children: [],
      parent: base.parent,
    };
    array.items.set(number, clone);
    base.parent?.children.push(clone);
    return clone;
  }

  bringToFront(control: ControlInstance, position: unknown): void {
    // VB ZOrder 0 moves to front, 1 to back. The renderer sorts by this field.
    setControlProperty(control, '__zOrder', Number(position) === 0 ? ++this.zCounter : --this.zCounter);
  }
}
