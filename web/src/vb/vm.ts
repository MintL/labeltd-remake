import type {
  ControlDefinition,
  Expression,
  ProcedureDefinition,
  Program,
  ResourceReference,
  Statement,
  TypeDefinition,
  VariableDeclaration,
} from './ast';
import {
  ControlArray,
  ControlRegistry,
  getControlDefault,
  getControlProperty,
  setControlDefault,
  setControlProperty,
  type ControlInstance,
} from './controls';
import { EMPTY, VbArray, VbRecord, binary, coerce, unary, vbBool, vbNumber, vbString, type VbCell, type VbValue } from './values';

export interface VbFileSystem {
  appPath: string;
  openInput(path: string, handle: number): void;
  eof(handle: number): boolean;
  lineInput(handle: number): string;
  close(handle: number): void;
}

export interface VmOptions {
  program: Program;
  form: ControlDefinition;
  files: VbFileSystem;
  resolveResource?: (reference: ResourceReference) => unknown;
  inputBox?: (message: string, title: string, defaultValue: string) => string;
  screen?: { width: number; height: number };
  randomSeed?: number;
}

type Scope = Map<string, VbCell>;
type VbFunction = (...args: VbValue[]) => VbValue;

export class VbRuntimeError extends Error {
  constructor(message: string, readonly line: number, readonly procedure: string, cause?: unknown) {
    super(`${message} (${procedure}, line ${line})`, { cause });
    this.name = 'VbRuntimeError';
  }
}

function lower(name: string): string { return name.toLowerCase(); }

function propertyKey(object: Record<string, unknown>, name: string): string {
  return Object.keys(object).find(key => lower(key) === lower(name)) ?? name;
}

function isControl(value: unknown): value is ControlInstance {
  return !!value && typeof value === 'object' && 'properties' in value && 'children' in value && 'name' in value;
}

function isVbFunction(value: unknown): value is VbFunction { return typeof value === 'function'; }

export class VbVM {
  readonly controls: ControlRegistry;
  readonly globals: Scope = new Map();
  readonly procedures = new Map<string, ProcedureDefinition>();
  readonly types = new Map<string, TypeDefinition>();
  private readonly files: VbFileSystem;
  private readonly inputBox: NonNullable<VmOptions['inputBox']>;
  private readonly screen: { width: number; height: number };
  private readonly timerElapsed = new Map<ControlInstance, number>();
  private readonly stack: string[] = [];
  private currentLine = 0;
  private randomState: number;
  private clockRemainder = 0;
  private halted = false;

  constructor(options: VmOptions) {
    this.controls = new ControlRegistry(options.form, options.resolveResource ?? (ref => ref));
    this.files = options.files;
    this.inputBox = options.inputBox ?? ((message, title, defaultValue) =>
      typeof window === 'undefined' ? defaultValue : (window.prompt(`${title}\n${message}`, defaultValue) ?? defaultValue));
    this.screen = options.screen ?? {
      width: typeof window === 'undefined' ? 10020 : window.innerWidth * 15,
      height: typeof window === 'undefined' ? 7380 : window.innerHeight * 15,
    };
    this.randomState = (options.randomSeed ?? 0x50000) & 0xffffff;
    for (const type of options.program.types) this.types.set(lower(type.name), type);
    for (const procedure of options.program.procedures) this.procedures.set(lower(procedure.name), procedure);
    for (const variable of options.program.variables) this.declare(this.globals, variable, this.globals);
    for (const control of this.controls.all()) {
      if (lower(control.type).endsWith('.timer')) this.timerElapsed.set(control, 0);
    }
  }

  get isHalted(): boolean { return this.halted; }

  getGlobal(name: string): VbValue {
    const cell = this.globals.get(lower(name));
    if (!cell) throw new Error(`Unknown global ${name}`);
    return cell.value;
  }

  start(): void { this.invoke('Form_Load'); }

  invoke(name: string, args: VbValue[] = []): VbValue {
    if (this.halted) return EMPTY;
    const procedure = this.procedures.get(lower(name));
    if (!procedure) throw new Error(`Unknown procedure ${name}`);
    if (this.stack.length > 100) throw new Error('VB call stack limit exceeded');
    const scope: Scope = new Map();
    for (let i = 0; i < procedure.params.length; i++) {
      const declaration = procedure.params[i];
      scope.set(lower(declaration.name), {
        type: declaration.vbType,
        value: coerce(args[i] ?? this.defaultValue(declaration.vbType), declaration.vbType),
      });
    }
    this.stack.push(procedure.name);
    try {
      // VB6 Dim variables belong to the procedure even when their declaration
      // appears inside a loop or conditional block.
      this.declareLocals(procedure.body, scope);
      this.execute(procedure.body, scope);
      return EMPTY;
    } catch (error) {
      if (error instanceof VbRuntimeError) throw error;
      throw new VbRuntimeError(error instanceof Error ? error.message : String(error), this.currentLine || procedure.line, procedure.name, error);
    } finally {
      this.stack.pop();
    }
  }

  dispatch(name: string, event: string, index: number | undefined, args: VbValue[] = []): void {
    const procedure = `${name}_${event}`;
    if (!this.procedures.has(lower(procedure))) return;
    this.invoke(procedure, index === undefined ? args : [index, ...args]);
  }

  /** Runs source Timer procedures on a logical millisecond clock; rendering stays on RAF. */
  advance(milliseconds: number): void {
    if (this.halted) return;
    this.clockRemainder += Math.min(Math.max(milliseconds, 0), 250);
    const whole = Math.floor(this.clockRemainder);
    this.clockRemainder -= whole;
    for (let tick = 0; tick < whole && !this.halted; tick++) {
      for (const timer of this.timerElapsed.keys()) {
        if (!vbBool(getControlProperty(timer, 'Enabled'))) {
          this.timerElapsed.set(timer, 0);
          continue;
        }
        const interval = Math.max(1, vbNumber(getControlProperty(timer, 'Interval')));
        const elapsed = (this.timerElapsed.get(timer) ?? 0) + 1;
        if (elapsed >= interval) {
          this.timerElapsed.set(timer, 0);
          this.dispatch(timer.name, 'Timer', timer.index);
        } else {
          this.timerElapsed.set(timer, elapsed);
        }
      }
    }
  }

  private defaultValue(type: string): VbValue {
    switch (lower(type)) {
      case '': case 'variant': return EMPTY;
      case 'integer': case 'long': case 'single': case 'double': return 0;
      case 'boolean': return false;
      case 'string': return '';
    }
    const definition = this.types.get(lower(type));
    if (!definition) throw new Error(`Unknown VB type ${type}`);
    const fields = new Map<string, VbCell>();
    for (const field of definition.fields) {
      fields.set(lower(field.name), { type: field.vbType, value: this.defaultValue(field.vbType) });
    }
    return new VbRecord(fields);
  }

  private declare(scope: Scope, variable: VariableDeclaration, evalScope: Scope): void {
    if (scope.has(lower(variable.name))) throw new Error(`Duplicate declaration ${variable.name}`);
    let value: VbValue;
    if (variable.upperBound) {
      const upper = vbNumber(this.eval(variable.upperBound, evalScope));
      value = new VbArray(upper, () => this.defaultValue(variable.vbType), variable.vbType);
    } else {
      value = this.defaultValue(variable.vbType);
    }
    scope.set(lower(variable.name), { type: variable.vbType, value });
  }

  private declareLocals(statements: Statement[], scope: Scope): void {
    for (const statement of statements) {
      switch (statement.kind) {
        case 'dim':
          for (const variable of statement.variables) {
            this.currentLine = variable.line;
            this.declare(scope, variable, scope);
          }
          break;
        case 'if':
          for (const branch of statement.branches) this.declareLocals(branch.body, scope);
          this.declareLocals(statement.elseBody, scope);
          break;
        case 'select':
          for (const arm of statement.cases) this.declareLocals(arm.body, scope);
          break;
        case 'for':
        case 'do':
          this.declareLocals(statement.body, scope);
          break;
      }
    }
  }

  private cell(name: string, scope: Scope): VbCell | undefined {
    return scope.get(lower(name)) ?? this.globals.get(lower(name));
  }

  private constant(name: string): VbValue | undefined {
    switch (lower(name)) {
      case 'true': return true;
      case 'false': return false;
      case 'vbcrlf': return '\r\n';
      case 'vbblack': return 0;
      case 'vbkeyc': return 67;
      case 'vbkeys': return 83;
      case 'vbkeyescape': return 27;
      case 'vbkeyf10': return 121;
      case 'vbkeypause': return 19;
      case 'me': case 'form1': return this.controls.root;
      case 'app': return { Path: this.files.appPath };
      case 'screen': return { Width: this.screen.width, Height: this.screen.height };
      case 'math': return { Sqr: (value: VbValue) => Math.sqrt(vbNumber(value)) };
      case 'rnd': return () => this.rnd();
      case 'randomize': return (seed?: VbValue) => { this.randomState = ((seed === undefined ? Date.now() : vbNumber(seed)) | 0) & 0xffffff; return EMPTY; };
      case 'int': return (value: VbValue) => Math.floor(vbNumber(value));
      case 'val': return (value: VbValue) => {
        const match = vbString(value).match(/^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
        return match ? Number(match[0]) : 0;
      };
      case 'eof': return (channel: VbValue) => this.files.eof(vbNumber(channel));
      case 'inputbox': return (message: VbValue, title: VbValue = '', defaultValue: VbValue = '') =>
        this.inputBox(vbString(message), vbString(title), vbString(defaultValue));
      default: return undefined;
    }
  }

  private rnd(): number {
    // A reproducible 24-bit generator with the VB Rnd result range [0, 1).
    this.randomState = (Math.imul(this.randomState, 0x43fd43fd) + 0xc39ec3) & 0xffffff;
    return this.randomState / 0x1000000;
  }

  private lookup(name: string, scope: Scope): VbValue {
    const variable = this.cell(name, scope);
    if (variable) return variable.value;
    const control = this.controls.find(name);
    if (control) return control;
    const constant = this.constant(name);
    if (constant !== undefined) return constant;
    if (this.procedures.has(lower(name))) return (...args: VbValue[]) => this.invoke(name, args);
    throw new Error(`Undefined VB identifier ${name}`);
  }

  private primitive(value: VbValue): VbValue {
    return isControl(value) ? getControlDefault(value) : value;
  }

  private member(object: VbValue, name: string): VbValue {
    if (isControl(object)) return getControlProperty(object, name);
    if (object instanceof VbRecord) return object.get(name);
    if (object && typeof object === 'object') {
      const record = object as Record<string, unknown>;
      const key = propertyKey(record, name);
      if (key in record) return record[key];
    }
    throw new Error(`Member ${name} not found`);
  }

  private eval(expression: Expression, scope: Scope): VbValue {
    this.currentLine = expression.line;
    switch (expression.kind) {
      case 'literal': return expression.value;
      case 'identifier': {
        const value = this.lookup(expression.name, scope);
        return lower(expression.name) === 'rnd' && isVbFunction(value) ? value() : value;
      }
      case 'member': return this.member(this.eval(expression.object, scope), expression.name);
      case 'apply': {
        const callee = this.eval(expression.callee, scope);
        const args = expression.args.map(arg => this.primitive(this.eval(arg, scope)));
        if (callee instanceof VbArray || callee instanceof ControlArray) return callee.get(args[0]);
        if (isVbFunction(callee)) return callee(...args);
        throw new Error(`Expression is not callable or indexed`);
      }
      case 'unary': return unary(expression.op, this.primitive(this.eval(expression.operand, scope)));
      case 'binary': {
        // VB And/Or evaluate both operands. JS short-circuit operators would change the program.
        const left = this.primitive(this.eval(expression.left, scope));
        const right = this.primitive(this.eval(expression.right, scope));
        return binary(expression.op, left, right);
      }
    }
  }

  private assign(target: Expression, value: VbValue, scope: Scope): void {
    this.currentLine = target.line;
    switch (target.kind) {
      case 'identifier': {
        const cell = this.cell(target.name, scope);
        if (cell) { cell.value = coerce(value, cell.type); return; }
        const control = this.controls.find(target.name);
        if (control && !(control instanceof ControlArray)) { setControlDefault(control, value); return; }
        throw new Error(`Cannot assign ${target.name}`);
      }
      case 'member': {
        const object = this.eval(target.object, scope);
        if (isControl(object)) { setControlProperty(object, target.name, value); return; }
        if (object instanceof VbRecord) { object.set(target.name, value); return; }
        if (object && typeof object === 'object') {
          const record = object as Record<string, unknown>;
          record[propertyKey(record, target.name)] = value;
          return;
        }
        throw new Error(`Cannot assign member ${target.name}`);
      }
      case 'apply': {
        const indexed = this.eval(target.callee, scope);
        const index = this.primitive(this.eval(target.args[0], scope));
        if (indexed instanceof VbArray) { indexed.set(index, value); return; }
        if (indexed instanceof ControlArray) { setControlDefault(indexed.get(index), value); return; }
        throw new Error('Cannot assign indexed expression');
      }
      default: throw new Error('Invalid assignment target');
    }
  }

  private call(callee: Expression, args: Expression[], scope: Scope): VbValue {
    if (callee.kind === 'member' && lower(callee.name) === 'zorder') {
      const object = this.eval(callee.object, scope);
      if (!isControl(object)) throw new Error('ZOrder requires a VB control');
      this.controls.bringToFront(object, args.length ? this.eval(args[0], scope) : 0);
      return EMPTY;
    }
    const callable = this.eval(callee, scope);
    const values = args.map(arg => this.primitive(this.eval(arg, scope)));
    if (isVbFunction(callable)) return callable(...values);
    throw new Error('VB call target is not a procedure or intrinsic');
  }

  private execute(statements: Statement[], scope: Scope): void {
    for (const statement of statements) {
      if (this.halted) return;
      this.currentLine = statement.line;
      switch (statement.kind) {
        case 'dim': break;
        case 'assign': this.assign(statement.target, this.primitive(this.eval(statement.value, scope)), scope); break;
        case 'call': this.call(statement.callee, statement.args, scope); break;
        case 'if': {
          const branch = statement.branches.find(item => vbBool(this.primitive(this.eval(item.condition, scope))));
          this.execute(branch?.body ?? statement.elseBody, scope);
          break;
        }
        case 'select': {
          const selected = this.primitive(this.eval(statement.expression, scope));
          let elseBody: Statement[] | undefined;
          for (const arm of statement.cases) {
            if (arm.isElse) { elseBody = arm.body; continue; }
            if (arm.tests.some(test => vbBool(binary('=', selected, this.primitive(this.eval(test, scope)))))) {
              this.execute(arm.body, scope);
              elseBody = undefined;
              break;
            }
          }
          if (elseBody) this.execute(elseBody, scope);
          break;
        }
        case 'for': {
          const start = vbNumber(this.eval(statement.start, scope));
          const end = vbNumber(this.eval(statement.end, scope));
          const step = statement.step ? vbNumber(this.eval(statement.step, scope)) : 1;
          if (step === 0) throw new Error('For Step cannot be zero');
          this.assign({ kind: 'identifier', name: statement.variable, line: statement.line }, start, scope);
          let iterations = 0;
          while ((step > 0 ? vbNumber(this.lookup(statement.variable, scope)) <= end : vbNumber(this.lookup(statement.variable, scope)) >= end) && !this.halted) {
            if (++iterations > 1_000_000) throw new Error('For loop limit exceeded');
            this.execute(statement.body, scope);
            this.assign({ kind: 'identifier', name: statement.variable, line: statement.line }, vbNumber(this.lookup(statement.variable, scope)) + step, scope);
          }
          break;
        }
        case 'do': {
          let iterations = 0;
          while (!this.halted) {
            if (statement.preCondition) {
              const condition = vbBool(this.primitive(this.eval(statement.preCondition, scope)));
              if (statement.preUntil ? condition : !condition) break;
            }
            if (++iterations > 1_000_000) throw new Error('Do loop limit exceeded');
            this.execute(statement.body, scope);
            if (statement.postCondition) {
              const condition = vbBool(this.primitive(this.eval(statement.postCondition, scope)));
              if (statement.postUntil ? condition : !condition) break;
            }
          }
          break;
        }
        case 'open': {
          const mode = lower(statement.mode);
          if (mode !== 'input') throw new Error(`File mode ${statement.mode} is unsupported by main game host`);
          this.files.openInput(vbString(this.primitive(this.eval(statement.path, scope))), vbNumber(this.eval(statement.channel, scope)));
          break;
        }
        case 'lineInput': {
          const channel = vbNumber(this.eval(statement.channel, scope));
          this.assign(statement.target, this.files.lineInput(channel), scope);
          break;
        }
        case 'close': this.files.close(vbNumber(this.eval(statement.channel, scope))); break;
        case 'load': {
          if (statement.target.kind !== 'apply') throw new Error('Load requires an indexed control');
          const array = this.eval(statement.target.callee, scope);
          const index = this.eval(statement.target.args[0], scope);
          if (!(array instanceof ControlArray)) throw new Error('Load requires a control array');
          this.controls.load(array, index);
          break;
        }
        case 'end': this.halted = true; break;
      }
    }
  }
}
