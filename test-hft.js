// Simple test to debug HFT conversion
const json = '{"name": "example", "age": 30, "active": true}';

console.log('Testing JSON:', json);

// Simulate the JSON to TOON conversion
function convertJsonToToonSimple(jsonStr) {
  const parsed = JSON.parse(jsonStr);
  const tokens = [];

  function convertValue(value) {
    if (value === null) {
      tokens.push('NULL');
    } else if (typeof value === 'boolean') {
      tokens.push(`BOOL=${value}`);
    } else if (typeof value === 'number') {
      tokens.push(`NUM=${value}`);
    } else if (typeof value === 'string') {
      tokens.push(`STR=${value}`);
    } else if (Array.isArray(value)) {
      tokens.push('ARR_START');
      value.forEach(item => convertValue(item));
      tokens.push('ARR_END');
    } else if (typeof value === 'object') {
      tokens.push('OBJ_START');
      Object.entries(value).forEach(([key, val]) => {
        tokens.push(`KEY=${key}`);
        convertValue(val);
      });
      tokens.push('OBJ_END');
    }
  }

  convertValue(parsed);
  return tokens.join('\n');
}

const toonOutput = convertJsonToToonSimple(json);
console.log('TOON Output:');
console.log(toonOutput);
console.log('');

// Now test HFT conversion
function parseToonTokensToAST(tokens) {
  const stack = [];
  let current = null;
  let currentKey = null;

  console.log('Processing tokens:', tokens);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    console.log(`Processing token ${i}:`, token);

    switch (token.type) {
      case 'OBJ_START':
        const newObj = { type: 'object', value: {} };
        if (current) {
          if (current.type === 'object' && currentKey) {
            current.value[currentKey] = newObj;
            currentKey = null;
          } else if (current.type === 'array') {
            current.value.push(newObj);
          }
        }
        stack.push(newObj);
        current = newObj;
        break;

      case 'OBJ_END':
        if (stack.length === 0) {
          throw new Error('Unexpected OBJ_END token');
        }
        if (stack.length > 1) {
          stack.pop();
          current = stack.length > 0 ? stack[stack.length - 1] : null;
        }
        // For root object, don't pop to keep it in stack
        break;

      case 'KEY':
        currentKey = token.value || '';
        break;

      case 'STR':
      case 'NUM':
      case 'BOOL':
      case 'NULL':
        const value = parseValue(token);
        if (current) {
          if (current.type === 'object' && currentKey) {
            current.value[currentKey] = value;
            currentKey = null;
          } else if (current.type === 'array') {
            current.value.push(value);
          }
        } else if (stack.length === 0) {
          // Root level value
          return { type: 'value', value };
        }
        break;
    }
  }

  if (stack.length === 0) {
    throw new Error('No root object or array found');
  }

  if (stack.length > 1) {
    throw new Error('Invalid TOON structure - unbalanced tokens');
  }

  return stack[0];
}

function parseValue(token) {
  switch (token.type) {
    case 'STR':
      return token.value || '';
    case 'NUM':
      const num = Number(token.value);
      if (isNaN(num)) throw new Error(`Invalid number: ${token.value}`);
      return num;
    case 'BOOL':
      if (token.value === 'true') return true;
      if (token.value === 'false') return false;
      throw new Error(`Invalid boolean value: ${token.value}`);
    case 'NULL':
      return null;
  }
}

// Parse TOON into tokens
const lines = toonOutput.split('\n').filter(line => line.length > 0);
const tokens = lines.map(line => {
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

console.log('Parsed tokens:', tokens);

try {
  const ast = parseToonTokensToAST(tokens);
  console.log('AST result:', JSON.stringify(ast, null, 2));
} catch (error) {
  console.log('Error:', error.message);
}
