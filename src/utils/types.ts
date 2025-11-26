export interface ConversionResult {
  success: boolean;
  data: string;
  error?: string;
}

export interface ToonToken {
  type: 'OBJ_START' | 'OBJ_END' | 'ARR_START' | 'ARR_END' | 'KEY' | 'STR' | 'NUM' | 'BOOL' | 'NULL';
  value?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonValue[] 
  | { [key: string]: JsonValue };
