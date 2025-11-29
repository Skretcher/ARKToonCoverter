//src/utils/hftConverter.ts
import { ToonToken, ASTNode, HFTNode, HFTChildNode, HFTConversionResult } from './types';
import { unescapeString } from './stringUtils';

/**
 * Parse TOON tokens into an AST (Abstract Syntax Tree)
 * - Fixed root handling and pop logic to make root a proper node.
 */
export function parseToonTokensToAST(tokens: ToonToken[]): ASTNode {
  const stack: ASTNode[] = [];
  let currentKey: string | null = null;
  let root: ASTNode | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'OBJ_START': {
        const newObj: ASTNode = { type: 'object', value: {} };
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          if (parent.type === 'object') {
            if (!currentKey) throw new Error('KEY expected before OBJ_START');
            (parent.value as Record<string, any>)[currentKey] = newObj;
            currentKey = null;
          } else if (parent.type === 'array') {
            (parent.value as any[]).push(newObj);
          }
        } else {
          // first node becomes candidate root
          root = newObj;
        }
        stack.push(newObj);
        break;
      }

      case 'OBJ_END': {
        if (stack.length === 0) throw new Error('Unexpected OBJ_END token');
        const popped = stack.pop()!;
        if (stack.length === 0) {
          // finished root object
          root = root || popped;
        }
        // ensure no dangling currentKey
        currentKey = null;
        break;
      }

      case 'ARR_START': {
        const newArr: ASTNode = { type: 'array', value: [] };
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          if (parent.type === 'object') {
            if (!currentKey) throw new Error('KEY expected before ARR_START');
            (parent.value as Record<string, any>)[currentKey] = newArr;
            currentKey = null;
          } else if (parent.type === 'array') {
            (parent.value as any[]).push(newArr);
          }
        } else {
          // first node becomes candidate root
          root = newArr;
        }
        stack.push(newArr);
        break;
      }

      case 'ARR_END': {
        if (stack.length === 0) throw new Error('Unexpected ARR_END token');
        const popped = stack.pop()!;
        if (stack.length === 0) {
          root = root || popped;
        }
        currentKey = null;
        break;
      }

      case 'KEY': {
        // KEY must appear when current top is an object
        currentKey = unescapeString(token.value || '');
        if (currentKey === '') throw new Error('Empty KEY token is not allowed');
        break;
      }

      case 'STR':
      case 'NUM':
      case 'BOOL':
      case 'NULL': {
        const value = parseValue(token);
        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          if (parent.type === 'object') {
            if (!currentKey) throw new Error('KEY expected before value token');
            (parent.value as Record<string, any>)[currentKey] = value;
            currentKey = null;
          } else if (parent.type === 'array') {
            (parent.value as any[]).push(value);
          }
        } else {
          // Root single primitive
          const primitiveNode: ASTNode = { type: 'value', value };
          root = primitiveNode;
        }
        break;
      }

      default:
        throw new Error(`Unhandled token type: ${(token as any).type}`);
    }
  }

  if (!root) throw new Error('No root found in TOON tokens');
  if (stack.length !== 0) throw new Error('Invalid TOON structure - unbalanced tokens');

  return root;
}

/**
 * Parse individual value tokens into JS primitives
 */
function parseValue(token: ToonToken): any {
  switch (token.type) {
    case 'STR':
      return unescapeString(token.value || '');
    case 'NUM': {
      const raw = token.value || '';
      // accept scientific format
      if (!/^[+-]?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(raw)) {
        throw new Error(`Invalid NUM token: ${raw}`);
      }
      // parse as number (note: big integers may lose precision - decide if you want to preserve as string)
      const num = Number(raw);
      return num;
    }
    case 'BOOL': {
      if (token.value === 'true') return true;
      if (token.value === 'false') return false;
      throw new Error(`Invalid BOOL token: ${token.value}`);
    }
    case 'NULL':
      return null;
    default:
      throw new Error(`Unexpected token type for value: ${token.type}`);
  }
}

/**
 * AST -> HFT conversion
 *
 * Produces a human-friendly HFT tree where:
 *  - object nodes are turned into arrays of keyValue nodes
 *  - array nodes are turned into numbered items
 *  - primitive nodes are single line values
 *
 * HFTNode kinds used here:
 *  - root: { kind:'root', icon:'📦', children: HFTChild[] }
 *  - keyValue: { kind:'keyValue', key, child: HFTNode }
 *  - array: { kind:'array', items: HFTChild[] }
 *  - arrayItem: { kind:'arrayItem', index, child: HFTNode }
 *  - primitive: { kind:'primitive', icon, label }
 */

/** Convert an AST node to an HFT node (recursive) */
export function convertASTtoHFT(ast: ASTNode): HFTNode {
  switch (ast.type) {
    case 'object':
      return {
        kind: 'root',
        icon: '📦',
        children: Object.entries(ast.value as Record<string, any>).map(([key, jsonValue]) => ({
          kind: 'keyValue',
          icon: '🔑',
          key,
          child: jsonValueToHFT(jsonValue)
        }))
      };

    case 'array':
      return {
        kind: 'root',
        icon: '📚',
        children: (ast.value as any[]).map((jsonValue: any, index: number) => ({
          kind: 'arrayItem',
          icon: `${index + 1}️⃣`,
          index,
          child: jsonValueToHFT(jsonValue)
        }))
      };

    case 'value':
      return {
        kind: 'root',
        icon: '📦',
        children: [{ kind: 'keyValue', icon: '🔑', key: 'value', child: primitiveToHft(ast.value) }]
      };
  }
}

/** Unwrap meta objects {type, value} to get pure structure */
function unwrapIfMeta(value: any): any {
  if (
    value &&
    typeof value === "object" &&
    value.type === "object" &&
    "value" in value
  ) {
    return value.value; // unwrap object
  }

  if (
    value &&
    typeof value === "object" &&
    value.type === "array" &&
    "value" in value
  ) {
    return value.value; // unwrap array
  }

  return value;
}

/** Converts arbitrary JS value to HFTNode recursively */
function jsonValueToHFT(value: any): HFTNode {
  const unwrapped = unwrapIfMeta(value);

  if (Array.isArray(unwrapped)) {
    return {
      kind: 'array',
      icon: '📚',
      label: `Array (${unwrapped.length} items)`,
      children: unwrapped.map((v, i) => ({
        kind: 'arrayItem',
        icon: `${i + 1}️⃣`,
        index: i,
        child: jsonValueToHFT(v)
      }))
    };
  }

  if (unwrapped !== null && typeof unwrapped === 'object') {
    return {
      kind: 'object',
      icon: '📦',
      label: `Object (${Object.keys(unwrapped).length} keys)`,
      children: Object.entries(unwrapped).map(([k, v]) => ({
        kind: 'keyValue',
        icon: '🔑',
        key: k,
        child: jsonValueToHFT(v)
      }))
    };
  }

  return primitiveToHft(unwrapped);
}

/** Turn primitive into a single-line HFT node */
function primitiveToHft(value: any): HFTNode {
  let icon = '❓';
  let label = String(value);

  if (typeof value === 'string') {
    icon = '🔤';
    label = `"${value}"`;
  } else if (typeof value === 'number') {
    icon = '🔢';
    label = value.toString();
  } else if (typeof value === 'boolean') {
    icon = value ? '🟢' : '🔴';
    label = value.toString();
  } else if (value === null) {
    icon = '⚫';
    label = 'null';
  }

  return {
    kind: 'primitive',
    icon,
    label
  } as HFTNode;
}

/**
 * Main function to convert TOON text to HFT tree
 */
export function convertToonToHFT(toonInput: string): HFTConversionResult {
  try {
    const lines = toonInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      return { success: true, data: undefined };
    }

    const tokens: ToonToken[] = lines.map(line => {
      if (line === 'OBJ_START') return { type: 'OBJ_START' };
      if (line === 'OBJ_END') return { type: 'OBJ_END' };
      if (line === 'ARR_START') return { type: 'ARR_START' };
      if (line === 'ARR_END') return { type: 'ARR_END' };
      if (line === 'NULL') return { type: 'NULL' };

      if (line.startsWith('KEY=')) return { type: 'KEY', value: line.substring(4) };
      if (line.startsWith('STR=')) return { type: 'STR', value: line.substring(4) };
      if (line.startsWith('NUM=')) return { type: 'NUM', value: line.substring(4) };
      if (line.startsWith('BOOL=')) return { type: 'BOOL', value: line.substring(5) };

      throw new Error(`Invalid TOON token: ${line}`);
    });

    const ast = parseToonTokensToAST(tokens);
    const hftTree = convertASTtoHFT(ast);

    return { success: true, data: hftTree };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'HFT conversion failed' };
  }
}
