/** The syntax tree deliberately preserves VB names and source locations. */
export interface Diagnostic {
  line: number;
  message: string;
  source?: string;
}

export interface PropertyGroup { [key: string]: PropertyValue }
export type PropertyValue = string | number | boolean | ResourceReference | PropertyGroup;

export interface ResourceReference {
  kind: 'resource';
  file: string;
  offset: number;
}

export interface ControlDefinition {
  type: string;
  name: string;
  line: number;
  index?: number;
  properties: Record<string, PropertyValue>;
  children: ControlDefinition[];
}

export interface ParsedForm {
  root: ControlDefinition;
  program: Program;
  diagnostics: Diagnostic[];
}

export interface Program {
  variables: VariableDeclaration[];
  types: TypeDefinition[];
  procedures: ProcedureDefinition[];
}

export interface VariableDeclaration {
  name: string;
  vbType: string;
  upperBound?: Expression;
  line: number;
}

export interface TypeDefinition {
  name: string;
  fields: VariableDeclaration[];
  line: number;
}

export interface ProcedureDefinition {
  name: string;
  params: VariableDeclaration[];
  body: Statement[];
  line: number;
}

export type Expression =
  | { kind: 'literal'; value: string | number | boolean; line: number }
  | { kind: 'identifier'; name: string; line: number }
  | { kind: 'member'; object: Expression; name: string; line: number }
  | { kind: 'apply'; callee: Expression; args: Expression[]; line: number }
  | { kind: 'unary'; op: string; operand: Expression; line: number }
  | { kind: 'binary'; op: string; left: Expression; right: Expression; line: number };

export interface CaseArm {
  tests: Expression[];
  body: Statement[];
  line: number;
  isElse?: boolean;
}

export type Statement =
  | { kind: 'dim'; variables: VariableDeclaration[]; line: number }
  | { kind: 'assign'; target: Expression; value: Expression; line: number }
  | { kind: 'call'; callee: Expression; args: Expression[]; line: number }
  | { kind: 'if'; branches: { condition: Expression; body: Statement[]; line: number }[]; elseBody: Statement[]; line: number }
  | { kind: 'for'; variable: string; start: Expression; end: Expression; step?: Expression; body: Statement[]; line: number }
  | { kind: 'do'; preCondition?: Expression; preUntil?: boolean; postCondition?: Expression; postUntil?: boolean; body: Statement[]; line: number }
  | { kind: 'select'; expression: Expression; cases: CaseArm[]; line: number }
  | { kind: 'open'; path: Expression; mode: string; channel: Expression; line: number }
  | { kind: 'lineInput'; channel: Expression; target: Expression; line: number }
  | { kind: 'close'; channel: Expression; line: number }
  | { kind: 'load'; target: Expression; line: number }
  | { kind: 'end'; line: number };
