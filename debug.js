// Debug script to test HFT conversion
const { convertJsonToToon } = require('./src/utils/jsonToToonConverter.ts');
const { convertToonToHFT } = require('./src/utils/hftConverter.ts');

const jsonInput = '{\n  "name": "example",\n  "age": 30,\n  "active": true\n}';

console.log('JSON Input:', jsonInput);

const toonResult = convertJsonToToon(jsonInput);
console.log('TOON Result:', toonResult);

if (toonResult.success) {
  console.log('TOON Data:');
  console.log(toonResult.data);

  const hftResult = convertToonToHFT(toonResult.data);
  console.log('HFT Result:', hftResult);
} else {
  console.log('TOON conversion failed:', toonResult.error);
}
