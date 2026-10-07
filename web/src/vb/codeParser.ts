import type {
  CaseArm, Diagnostic, Expression, ProcedureDefinition, Program,
  Statement, TypeDefinition, VariableDeclaration,
} from './ast';

interface Token {
  type: 'id' | 'number' | 'string' | 'op' | 'eof';
  text: string;
  value?: string | number;
  at: number;
}

interface SourceLine { text: string; line: number }

function withoutComment(source: string): string {
  let quoted = false;
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '"') {
      if (quoted && source[i + 1] === '"') { i++; continue; }
      quoted = !quoted;
    } else if (source[i] === "'" && !quoted) {
      return source.slice(0, i).trim();
    }
  }
  return source.trim();
}

function lex(source: string): Token[] {
  const result: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '"') {
      const at = i++;
      let value = '';
      let closed = false;
      while (i < source.length) {
        if (source[i] === '"') {
          if (source[i + 1] === '"') { value += '"'; i += 2; continue; }
          i++; closed = true; break;
        }
        value += source[i++];
      }
      if (!closed) throw Error('Unclosed string literal');
      result.push({ type: 'string', text: source.slice(at, i), value, at });
      continue;
    }
    if (c === '&' && /[Hh]/.test(source[i + 1] ?? '') && /[0-9a-fA-F]/.test(source[i + 2] ?? '')) {
      const at = i;
      i += 2;
      while (/[0-9a-fA-F]/.test(source[i] ?? '')) i++;
      const value = parseInt(source.slice(at + 2, i), 16);
      if (source[i] === '&') i++;
      result.push({ type: 'number', text: source.slice(at, i), value, at });
      continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(source[i + 1] ?? ''))) {
      const at = i;
      while (/[0-9]/.test(source[i] ?? '')) i++;
      if (source[i] === '.') {
        i++;
        while (/[0-9]/.test(source[i] ?? '')) i++;
      }
      const raw = source.slice(at, i);
      result.push({ type: 'number', text: raw, value: Number(raw), at });
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const at = i;
      i++;
      while (/[A-Za-z_0-9]/.test(source[i] ?? '')) i++;
      result.push({ type: 'id', text: source.slice(at, i), at });
      continue;
    }
    const at = i;
    const pair = source.slice(i, i + 2);
    if (['<=', '>=', '<>'].includes(pair)) i += 2;
    else if ('+-*/^&=<>.,()#'.includes(c)) i++;
    else throw Error(`Unexpected character ${JSON.stringify(c)}`);
    result.push({ type: 'op', text: source.slice(at, i), at });
  }
  result.push({ type: 'eof', text: '', at: source.length });
  return result;
}

const precedence: Record<string, number> = {
  or: 1, and: 2,
  '=': 3, '<>': 3, '<': 3, '<=': 3, '>': 3, '>=': 3,
  '&': 4, '+': 5, '-': 5, '*': 6, '/': 6, mod: 6, '^': 8,
};

class ExpressionParser {
  private index = 0;
  constructor(private readonly tokens: Token[], private readonly line: number) {}
  get current(): Token { return this.tokens[this.index]; }
  get offset(): number { return this.current.at; }
  private take(): Token { return this.tokens[this.index++]; }
  private match(text: string): boolean {
    if (this.current.text.toLowerCase() !== text.toLowerCase()) return false;
    this.take(); return true;
  }
  parse(minPrecedence = 0): Expression {
    let left: Expression;
    const token = this.take();
    if (token.type === 'number' || token.type === 'string') {
      left = { kind: 'literal', value: token.value!, line: this.line };
    } else if (token.type === 'id') {
      const word = token.text.toLowerCase();
      if (word === 'true' || word === 'false') left = { kind: 'literal', value: word === 'true', line: this.line };
      else if (word === 'not') left = { kind: 'unary', op: 'Not', operand: this.parse(7), line: this.line };
      else left = { kind: 'identifier', name: token.text, line: this.line };
    } else if (token.text === '(') {
      left = this.parse();
      if (!this.match(')')) throw Error('Expected closing parenthesis');
    } else if (token.text === '-' || token.text === '+') {
      left = { kind: 'unary', op: token.text, operand: this.parse(7), line: this.line };
    } else {
      throw Error(`Expected expression, got ${token.text || 'end of line'}`);
    }

    while (true) {
      if (this.current.text === '.' && minPrecedence <= 10) {
        this.take();
        const name = this.take();
        if (name.type !== 'id') throw Error('Expected member name after dot');
        left = { kind: 'member', object: left, name: name.text, line: this.line };
        continue;
      }
      if (this.current.text === '(' && minPrecedence <= 10) {
        this.take();
        const args: Expression[] = [];
        if (!this.match(')')) {
          do { args.push(this.parse()); } while (this.match(','));
          if (!this.match(')')) throw Error('Expected closing parenthesis after arguments');
        }
        left = { kind: 'apply', callee: left, args, line: this.line };
        continue;
      }
      const op = this.current.text.toLowerCase();
      const power = precedence[op];
      if (power === undefined || power < minPrecedence) break;
      this.take();
      const right = this.parse(power + (op === '^' ? 0 : 1));
      left = { kind: 'binary', op, left, right, line: this.line };
    }
    return left;
  }
  expectEnd(): void {
    if (this.current.type !== 'eof') throw Error(`Unexpected token ${this.current.text}`);
  }
  parseArguments(): Expression[] {
    const args: Expression[] = [];
    if (this.current.type !== 'eof') {
      do { args.push(this.parse()); } while (this.match(','));
    }
    this.expectEnd();
    return args;
  }
}

export function parseExpression(source: string, line = 0): Expression {
  const parser = new ExpressionParser(lex(source), line);
  const result = parser.parse();
  parser.expectEnd();
  return result;
}

function splitCommas(text: string): string[] {
  let level = 0;
  let quoted = false;
  let start = 0;
  const parts: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') quoted = !quoted;
    if (quoted) continue;
    if (c === '(') level++;
    if (c === ')') level--;
    if (c === ',' && level === 0) { parts.push(text.slice(start, i).trim()); start = i + 1; }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

function parseVariables(source: string, line: number): VariableDeclaration[] {
  return splitCommas(source).map(part => {
    const match = /^([A-Za-z_][A-Za-z_0-9]*)(?:\s*\((.+)\))?(?:\s+As\s+([A-Za-z_][A-Za-z_0-9]*))?$/i.exec(part);
    if (!match) throw Error(`Invalid variable declaration: ${part}`);
    return { name: match[1], vbType: match[3] ?? 'Variant',
      ...(match[2] ? { upperBound: parseExpression(match[2], line) } : {}), line };
  });
}

function parseCall(text: string, line: number): Statement {
  const parser = new ExpressionParser(lex(text), line);
  const head = parser.parse(9);
  if (parser.current.type === 'eof') {
    if (head.kind === 'apply') return { kind: 'call', callee: head.callee, args: head.args, line };
    return { kind: 'call', callee: head, args: [], line };
  }
  const args = parser.parseArguments();
  return { kind: 'call', callee: head, args, line };
}

class CodeParser {
  private at = 0;
  readonly diagnostics: Diagnostic[] = [];
  constructor(private readonly lines: SourceLine[]) {}
  private get current(): SourceLine | undefined { return this.lines[this.at]; }
  private match(regex: RegExp): boolean { return !!this.current && regex.test(this.current.text); }
  private error(line: SourceLine, err: unknown): void {
    this.diagnostics.push({ line: line.line, message: err instanceof Error ? err.message : String(err), source: line.text });
  }
  parse(): Program {
    const program: Program = { variables: [], types: [], procedures: [] };
    while (this.current) {
      const line = this.current;
      try {
        if (/^(?:Private\s+|Public\s+)?Type\s+/i.test(line.text)) {
          program.types.push(this.parseType());
        } else if (/^(?:Private\s+|Public\s+)?(?:Sub|Function)\s+/i.test(line.text)) {
          program.procedures.push(this.parseProcedure());
        } else if (/^(?:Dim|Private|Public)\s+/i.test(line.text)) {
          const match = /^(?:Dim|Private|Public)\s+(.+)$/i.exec(line.text)!;
          program.variables.push(...parseVariables(match[1], line.line));
          this.at++;
        } else {
          // Attributes and Option Explicit are metadata, not executable statements.
          if (!/^(?:Option|Attribute)\b/i.test(line.text)) this.error(line, 'Unsupported module declaration');
          this.at++;
        }
      } catch (err) { this.error(line, err); this.at++; }
    }
    return program;
  }
  private parseType(): TypeDefinition {
    const first = this.current!;
    const name = /^(?:Private\s+|Public\s+)?Type\s+([A-Za-z_][A-Za-z_0-9]*)$/i.exec(first.text)?.[1];
    if (!name) throw Error('Invalid Type declaration');
    this.at++;
    const fields: VariableDeclaration[] = [];
    while (this.current && !this.match(/^End\s+Type$/i)) {
      const line = this.current;
      try { fields.push(...parseVariables(line.text, line.line)); }
      catch (err) { this.error(line, err); }
      this.at++;
    }
    if (!this.current) this.error(first, 'Missing End Type');
    else this.at++;
    return { name, fields, line: first.line };
  }
  private parseProcedure(): ProcedureDefinition {
    const first = this.current!;
    const match = /^(?:(?:Private|Public)\s+)?(?:Sub|Function)\s+([A-Za-z_][A-Za-z_0-9]*)\s*\((.*)\)$/i.exec(first.text);
    if (!match) throw Error('Invalid procedure declaration');
    const params = match[2].trim() ? parseVariables(match[2], first.line) : [];
    this.at++;
    const body = this.parseBlock(/^(?:End\s+Sub|End\s+Function)$/i);
    if (!this.current) this.error(first, 'Missing End Sub');
    else this.at++;
    return { name: match[1], params, body, line: first.line };
  }
  private parseBlock(stop: RegExp): Statement[] {
    const result: Statement[] = [];
    while (this.current && !stop.test(this.current.text)) {
      const line = this.current;
      try { result.push(this.parseStatement()); }
      catch (err) { this.error(line, err); this.at++; }
    }
    return result;
  }
  private parseStatement(): Statement {
    const line = this.current!;
    const text = line.text;
    if (/^If\s+/i.test(text)) return this.parseIf();
    if (/^For\s+/i.test(text)) return this.parseFor();
    if (/^Do(?:\s|$)/i.test(text)) return this.parseDo();
    if (/^Select\s+Case\s+/i.test(text)) return this.parseSelect();
    let match = /^Dim\s+(.+)$/i.exec(text);
    if (match) { this.at++; return { kind: 'dim', variables: parseVariables(match[1], line.line), line: line.line }; }
    match = /^Open\s+(.+)\s+For\s+(Input|Output|Append)\s+As\s+#?([0-9]+)$/i.exec(text);
    if (match) { this.at++; return { kind: 'open', path: parseExpression(match[1], line.line), mode: match[2], channel: parseExpression(match[3], line.line), line: line.line }; }
    match = /^Line\s+Input\s+#?([0-9]+)\s*,\s*(.+)$/i.exec(text);
    if (match) { this.at++; return { kind: 'lineInput', channel: parseExpression(match[1], line.line), target: parseExpression(match[2], line.line), line: line.line }; }
    match = /^Close\s+#?([0-9]+)$/i.exec(text);
    if (match) { this.at++; return { kind: 'close', channel: parseExpression(match[1], line.line), line: line.line }; }
    match = /^Load\s+(.+)$/i.exec(text);
    if (match) { this.at++; return { kind: 'load', target: parseExpression(match[1], line.line), line: line.line }; }
    if (/^End$/i.test(text)) { this.at++; return { kind: 'end', line: line.line }; }
    if (/^Call\s+/i.test(text)) { this.at++; return parseCall(text.replace(/^Call\s+/i, ''), line.line); }

    const tokens = lex(text);
    let nesting = 0;
    for (const token of tokens) {
      if (token.text === '(') nesting++;
      if (token.text === ')') nesting--;
      if (token.text === '=' && nesting === 0) {
        const left = text.slice(0, token.at).trim();
        const right = text.slice(token.at + 1).trim();
        this.at++;
        return { kind: 'assign', target: parseExpression(left, line.line), value: parseExpression(right, line.line), line: line.line };
      }
    }
    this.at++;
    return parseCall(text, line.line);
  }
  private parseIf(): Statement {
    const first = this.current!;
    const branches: { condition: Expression; body: Statement[]; line: number }[] = [];
    let head: SourceLine | undefined = first;
    while (head && /^(?:If|ElseIf)\s+/i.test(head.text)) {
      const match = /^(?:If|ElseIf)\s+(.+)\s+Then$/i.exec(head.text);
      if (!match) throw Error('Expected multiline If ... Then');
      const line = head.line;
      const condition = parseExpression(match[1], line);
      this.at++;
      const body = this.parseBlock(/^(?:ElseIf\b|Else$|End\s+If$)/i);
      branches.push({ condition, body, line });
      head = this.current;
    }
    let elseBody: Statement[] = [];
    if (this.match(/^Else$/i)) { this.at++; elseBody = this.parseBlock(/^End\s+If$/i); }
    if (!this.match(/^End\s+If$/i)) throw Error('Expected End If');
    this.at++;
    return { kind: 'if', branches, elseBody, line: first.line };
  }
  private parseFor(): Statement {
    const first = this.current!;
    const match = /^For\s+([A-Za-z_][A-Za-z_0-9]*)\s*=\s*(.+?)\s+To\s+(.+?)(?:\s+Step\s+(.+))?$/i.exec(first.text);
    if (!match) throw Error('Invalid For statement');
    const start = parseExpression(match[2], first.line);
    const end = parseExpression(match[3], first.line);
    const step = match[4] ? parseExpression(match[4], first.line) : undefined;
    this.at++;
    const body = this.parseBlock(/^Next(?:\s|$)/i);
    if (!this.match(/^Next(?:\s|$)/i)) throw Error('Expected Next');
    this.at++;
    return { kind: 'for', variable: match[1], start, end, ...(step ? { step } : {}), body, line: first.line };
  }
  private parseDo(): Statement {
    const first = this.current!;
    const match = /^Do(?:\s+(While|Until)\s+(.+))?$/i.exec(first.text);
    if (!match) throw Error('Invalid Do statement');
    const preCondition = match[2] ? parseExpression(match[2], first.line) : undefined;
    const preUntil = match[1]?.toLowerCase() === 'until';
    this.at++;
    const body = this.parseBlock(/^Loop(?:\s|$)/i);
    const tail = this.current;
    if (!tail) throw Error('Expected Loop');
    const endMatch = /^Loop(?:\s+(While|Until)\s+(.+))?$/i.exec(tail.text);
    if (!endMatch) throw Error('Invalid Loop statement');
    const postCondition = endMatch[2] ? parseExpression(endMatch[2], tail.line) : undefined;
    const postUntil = endMatch[1]?.toLowerCase() === 'until';
    this.at++;
    return { kind: 'do', ...(preCondition ? { preCondition, preUntil } : {}),
      ...(postCondition ? { postCondition, postUntil } : {}), body, line: first.line };
  }
  private parseSelect(): Statement {
    const first = this.current!;
    const expression = parseExpression(first.text.replace(/^Select\s+Case\s+/i, ''), first.line);
    this.at++;
    const cases: CaseArm[] = [];
    while (this.current && !this.match(/^End\s+Select$/i)) {
      const line = this.current;
      const match = /^Case\s+(.+)$/i.exec(line.text);
      if (!match) throw Error('Expected Case');
      const isElse = /^Else$/i.test(match[1]);
      const tests = isElse ? [] : splitCommas(match[1]).map(x => parseExpression(x, line.line));
      this.at++;
      const body = this.parseBlock(/^(?:Case\s+|End\s+Select$)/i);
      cases.push({ tests, body, line: line.line, ...(isElse ? { isElse: true } : {}) });
    }
    if (!this.match(/^End\s+Select$/i)) throw Error('Expected End Select');
    this.at++;
    return { kind: 'select', expression, cases, line: first.line };
  }
}

export function parseCodeSource(source: string, firstLine = 1): { program: Program; diagnostics: Diagnostic[] } {
  const lines: SourceLine[] = source.split(/\r?\n/).map((raw, index) => ({
    text: withoutComment(raw), line: firstLine + index,
  })).filter(line => line.text);
  const parser = new CodeParser(lines);
  const program = parser.parse();
  return { program, diagnostics: parser.diagnostics };
}
