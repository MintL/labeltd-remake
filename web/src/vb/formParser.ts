import type { ControlDefinition, Diagnostic, ParsedForm, PropertyValue } from './ast';
import { parseCodeSource } from './codeParser';

interface PropertyBlock {
  kind: 'propertyBlock';
  name: string;
  properties: Record<string, PropertyValue>;
  line: number;
}

function parseDesignerValue(source: string): PropertyValue {
  const value = source.trim();
  const resource = /^"([^"]+)":([0-9a-fA-F]+)(?:\s|$)/.exec(value);
  if (resource) return { kind: 'resource', file: resource[1], offset: parseInt(resource[2], 16) };
  if (value.startsWith('"')) {
    let end = 1;
    let output = '';
    while (end < value.length) {
      if (value[end] === '"') {
        if (value[end + 1] === '"') { output += '"'; end += 2; continue; }
        break;
      }
      output += value[end++];
    }
    return output;
  }
  const hex = /^&H([0-9a-fA-F]+)&?/.exec(value);
  if (hex) return parseInt(hex[1], 16);
  const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)/.exec(value);
  if (decimal) return Number(decimal[0]);
  if (/^True\b/i.test(value)) return true;
  if (/^False\b/i.test(value)) return false;
  return value.replace(/\s+'.*$/, '').trim();
}

/** Parses a VB6 .frm designer and executable code, with line numbers in the original file. */
export function parseFormSource(source: string): ParsedForm {
  const lines = source.split(/\r?\n/);
  const diagnostics: Diagnostic[] = [];
  const stack: (ControlDefinition | PropertyBlock)[] = [];
  let root: ControlDefinition | undefined;
  let codeStart = lines.findIndex(line => /^Attribute\s+VB_Name\b/i.test(line.trim()));
  if (codeStart < 0) codeStart = lines.findIndex(line => /^(?:Option\s+|(?:Private|Public)\s+Sub\s+)/i.test(line.trim()));
  if (codeStart < 0) codeStart = lines.length;

  for (let at = 0; at < codeStart; at++) {
    const text = lines[at].trim();
    if (!text || /^VERSION\s+/i.test(text) || /^Object\s+/i.test(text)) continue;
    let match = /^Begin\s+([A-Za-z_][A-Za-z_0-9.]*)\s+([A-Za-z_][A-Za-z_0-9]*)\s*$/i.exec(text);
    if (match) {
      const control: ControlDefinition = { type: match[1], name: match[2], properties: {}, children: [], line: at + 1 };
      const parent = stack.at(-1);
      if (!parent) {
        if (root) diagnostics.push({ line: at + 1, message: 'Multiple form roots', source: text });
        root = control;
      } else if ('children' in parent) parent.children.push(control);
      else diagnostics.push({ line: at + 1, message: 'Control nested in a property block', source: text });
      stack.push(control);
      continue;
    }
    match = /^BeginProperty\s+([A-Za-z_][A-Za-z_0-9]*)\s*$/i.exec(text);
    if (match) { stack.push({ kind: 'propertyBlock', name: match[1], properties: {}, line: at + 1 }); continue; }
    if (/^EndProperty$/i.test(text)) {
      const property = stack.pop();
      const parent = stack.at(-1);
      if (!property || !('kind' in property) || property.kind !== 'propertyBlock' || !parent) {
        diagnostics.push({ line: at + 1, message: 'Unmatched EndProperty', source: text });
      } else parent.properties[property.name] = property.properties;
      continue;
    }
    if (/^End$/i.test(text)) {
      const node = stack.pop();
      if (!node || !('children' in node)) diagnostics.push({ line: at + 1, message: 'Unmatched designer End', source: text });
      continue;
    }
    match = /^([A-Za-z_][A-Za-z_0-9]*)\s*=\s*(.*)$/.exec(text);
    if (match) {
      const parent = stack.at(-1);
      if (!parent) diagnostics.push({ line: at + 1, message: 'Property outside a control', source: text });
      else {
        const value = parseDesignerValue(match[2]);
        parent.properties[match[1]] = value;
        if ('children' in parent && match[1].toLowerCase() === 'index' && typeof value === 'number') parent.index = value;
      }
      continue;
    }
    diagnostics.push({ line: at + 1, message: 'Unsupported designer syntax', source: text });
  }

  if (stack.length) diagnostics.push({ line: codeStart + 1, message: `Unclosed designer block (${stack.length})` });
  if (!root) {
    diagnostics.push({ line: 1, message: 'No VB.Form found' });
    root = { type: 'VB.Form', name: 'Form1', properties: {}, children: [], line: 1 };
  }
  const code = parseCodeSource(lines.slice(codeStart).join('\n'), codeStart + 1);
  diagnostics.push(...code.diagnostics);
  return { root, program: code.program, diagnostics };
}
