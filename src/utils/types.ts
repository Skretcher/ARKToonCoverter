// ========================
// Conversion result types
// ========================
export interface ConversionResult {
  success: boolean;
  data: string;
  error?: string;
}

export interface ToonToken {
  type: 'OBJ_START' | 'OBJ_END' | 'ARR_START' | 'ARR_END' |
        'KEY' | 'STR' | 'NUM' | 'BOOL' | 'NULL';
  value?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ========================
// JSON Value Type
// ========================
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// ========================
// AST Node (TOON → AST)
// ========================
export interface ASTNode {
  type: 'object' | 'array' | 'value';
  value: any;  // non-optional
}

// ========================
// HFT Node Types (Strict)
// ========================

export type HFTNode =
  | HFTRootNode
  | HFTObjectNode
  | HFTArrayNode
  | HFTKeyValueNode
  | HFTArrayItemNode
  | HFTPrimitiveNode;

// Root node
export interface HFTRootNode {
  kind: 'root';
  icon: string;         // 📦 usually
  label?: string; 
  children: HFTChildNode[];
}

// Object node
export interface HFTObjectNode {
  kind: 'object';
  icon: string;         // 📦
  label: string;        // "Object (4 keys)"
  children: HFTChildNode[];
}

// Array node
export interface HFTArrayNode {
  kind: 'array';
  icon: string;         // 📚
  label: string;        // "Array (5 items)"
  children: HFTChildNode[]; // unified
}

// Pair: key → child
export interface HFTKeyValueNode {
  kind: 'keyValue';
  icon: string;      // 🔑
  key: string;
  child: HFTNode;
}

// Array index → child
export interface HFTArrayItemNode {
  kind: 'arrayItem';
  icon: string;       // 1️⃣ 2️⃣
  index: number;
  child: HFTNode;
}

// Primitive value
export interface HFTPrimitiveNode {
  kind: 'primitive';
  icon: string;       // 🔢, 🔤, 🟢, ⚫ etc.
  label: string;      // "123", "true", "hello"
}

// Child always = keyValue OR arrayItem
export type HFTChildNode = HFTKeyValueNode | HFTArrayItemNode;

// ========================
// Result type
// ========================
export interface HFTConversionResult {
  success: boolean;
  data?: HFTNode;
  error?: string;
}
