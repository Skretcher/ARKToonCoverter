import { ConversionResult } from './types';
import { unescapeString } from './stringUtils';

function parseTokens(lines: string[]): Array<{ type: string; value?: string }> {
  return lines.map(line => {
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
}

function parseTokensToJson(tokens: Array<{ type: string; value?: string }>): any {
  let index = 0;

  const parseValue = (): any => {
    if (index >= tokens.length) {
      throw new Error('Unexpected end of TOON input');
    }

    const token = tokens[index++];

    switch (token.type) {
      case 'OBJ_START':
        return parseObject();
      case 'ARR_START':
        return parseArray();
      case 'NULL':
        return null;
      case 'BOOL':
        if (token.value === 'true') return true;
        if (token.value === 'false') return false;
        throw new Error(`Invalid boolean value: ${token.value}`);
      case 'NUM':
        const num = Number(token.value);
        if (isNaN(num)) throw new Error(`Invalid number: ${token.value}`);
        return num;
      case 'STR':
        return unescapeString(token.value || '');
      default:
        throw new Error(`Unexpected token type: ${token.type}`);
    }
  };

  const parseObject = (): Record<string, any> => {
    const obj: Record<string, any> = {};

    while (index < tokens.length) {
      const token = tokens[index];
      
      if (token.type === 'OBJ_END') {
        index++;
        return obj;
      }

      if (token.type !== 'KEY') {
        throw new Error(`Expected KEY token, got: ${token.type}`);
      }

      const key = unescapeString(token.value || '');
      index++;

      if (index >= tokens.length) {
        throw new Error('Unexpected end of TOON input after KEY');
      }

      obj[key] = parseValue();
    }

    throw new Error('Unterminated object');
  };

  const parseArray = (): any[] => {
    const arr: any[] = [];

    while (index < tokens.length) {
      const token = tokens[index];
      
      if (token.type === 'ARR_END') {
        index++;
        return arr;
      }

      arr.push(parseValue());
    }

    throw new Error('Unterminated array');
  };

  const result = parseValue();
  
  if (index !== tokens.length) {
    throw new Error('Extra tokens after complete parse');
  }

  return result;
}

export function convertToonToJson(toonInput: string): ConversionResult {
  try {
    const lines = toonInput.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      return { success: true, data: '{}' };
    }

    const tokens = parseTokens(lines);
    const result = parseTokensToJson(tokens);
    
    return {
      success: true,
      data: JSON.stringify(result, null, 2)
    };
  } catch (error) {
    return {
      success: false,
      data: '',
      error: error instanceof Error ? error.message : 'TOON to JSON conversion failed'
    };
  }
}
