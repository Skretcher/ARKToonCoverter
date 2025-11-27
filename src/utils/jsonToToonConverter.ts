// src/utils/jsonToToonConverter.ts
import { ConversionResult, JsonValue } from './types';
import { escapeString } from './stringUtils';

function convertValue(value: JsonValue, tokens: string[]): void {
  if (value === null) {
    tokens.push('NULL');
  } else if (typeof value === 'boolean') {
    tokens.push(`BOOL=${value}`);
  } else if (typeof value === 'number') {
    tokens.push(`NUM=${value}`);
  } else if (typeof value === 'string') {
    tokens.push(`STR=${escapeString(value)}`);
  } else if (Array.isArray(value)) {
    tokens.push('ARR_START');
    value.forEach(item => convertValue(item, tokens));
    tokens.push('ARR_END');
  } else if (typeof value === 'object') {
    tokens.push('OBJ_START');
    Object.entries(value).forEach(([key, val]) => {
      tokens.push(`KEY=${escapeString(key)}`);
      convertValue(val, tokens);
    });
    tokens.push('OBJ_END');
  }
}

export function convertJsonToToon(jsonInput: string): ConversionResult {
  try {
    const parsed = JSON.parse(jsonInput);
    const toonTokens: string[] = [];
    
    convertValue(parsed, toonTokens);
    
    return {
      success: true,
      data: toonTokens.join('\n')
    };
  } catch (error) {
    return {
      success: false,
      data: '',
      error: error instanceof Error ? error.message : 'Conversion failed'
    };
  }
}
