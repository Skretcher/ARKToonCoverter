// src/utils/validators.ts
import { ValidationResult } from './types';

export function validateJson(input: string): ValidationResult {
  try {
    if (!input.trim()) {
      return { isValid: false, error: 'Input cannot be empty' };
    }

    const parsed = JSON.parse(input);
    
    // Additional validation for JSON structure
    if (typeof parsed !== 'object' || parsed === null) {
      return { isValid: false, error: 'JSON must be an object or array' };
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON format' 
    };
  }
}

export function validateToon(input: string): ValidationResult {
  const lines = input.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return { isValid: false, error: 'TOON input cannot be empty' };
  }

  // Basic TOON structure validation
  let objectDepth = 0;
  let arrayDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed === 'OBJ_START') {
      objectDepth++;
    } else if (trimmed === 'OBJ_END') {
      objectDepth--;
      if (objectDepth < 0) {
        return { isValid: false, error: 'Unbalanced OBJ_END token' };
      }
    } else if (trimmed === 'ARR_START') {
      arrayDepth++;
    } else if (trimmed === 'ARR_END') {
      arrayDepth--;
      if (arrayDepth < 0) {
        return { isValid: false, error: 'Unbalanced ARR_END token' };
      }
    } else if (trimmed.startsWith('KEY=') || 
               trimmed.startsWith('STR=') || 
               trimmed.startsWith('NUM=') || 
               trimmed.startsWith('BOOL=') || 
               trimmed === 'NULL') {
      // Valid token formats
      continue;
    } else {
      return { isValid: false, error: `Invalid TOON token: ${trimmed}` };
    }
  }

  if (objectDepth !== 0) {
    return { isValid: false, error: 'Unbalanced object structure' };
  }

  if (arrayDepth !== 0) {
    return { isValid: false, error: 'Unbalanced array structure' };
  }

  return { isValid: true };
}
