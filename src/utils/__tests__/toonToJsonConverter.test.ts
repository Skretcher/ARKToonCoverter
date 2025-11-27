// src/utils/__tests__/toonToJsonConverter.test.ts
import { describe, it, expect, vi } from 'vitest';
import { convertToonToJson } from '../toonToJsonConverter';
import { convertJsonToToon } from '../jsonToToonConverter';

// Increase timeout for large tests
vi.setConfig({ testTimeout: 60000 });

// --- Helper: Generate accurate large JSON payload ---
function generateLargeJson(sizeInMB: number): string {
  const target = sizeInMB * 1024 * 1024; // MB → bytes
  const obj: Record<string, any> = {};

  // Use large values for faster generation
  const chunk = 'x'.repeat(5000); // 5KB per entry
  let i = 0;

  while (JSON.stringify(obj).length < target) {
    obj[`key_${i}`] = chunk;
    i++;
  }

  return JSON.stringify(obj);
}

describe('convertToonToJson', () => {
  it('should convert simple TOON object', () => {
    const toon = `OBJ_START
KEY=name
STR=test
KEY=value
NUM=123
OBJ_END`;

    const result = convertToonToJson(toon);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.data);
    expect(parsed).toEqual({ name: "test", value: 123 });
  });

  it('should convert TOON with arrays', () => {
    const toon = `OBJ_START
KEY=items
ARR_START
NUM=1
STR=two
BOOL=true
NULL
ARR_END
OBJ_END`;

    const result = convertToonToJson(toon);
    expect(result.success).toBe(true);

    const parsed = JSON.parse(result.data);
    expect(parsed.items).toEqual([1, "two", true, null]);
  });

  it('should handle empty TOON', () => {
    const result = convertToonToJson('');

    expect(result.success).toBe(true);
    expect(result.data).toBe('{}');
  });

  it('should handle invalid TOON tokens', () => {
    const invalidToon = `OBJ_START
INVALID_TOKEN
OBJ_END`;

    const result = convertToonToJson(invalidToon);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should detect unbalanced structure', () => {
    const unbalanced = `OBJ_START
KEY=test
STR=value`;

    const result = convertToonToJson(unbalanced);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  // --- Performance tests ---
  describe('Large TOON input tests', () => {
    const sizes = [1, 5, 10, 15, 20];

    for (const size of sizes) {
      it(`should handle TOON equivalent to ${size}MB JSON`, () => {
        const largeJson = generateLargeJson(size);

        // Convert JSON → TOON
        const toonResult = convertJsonToToon(largeJson);
        expect(toonResult.success).toBe(true);

        const toonString = toonResult.data;

        // Convert TOON → JSON
        const start = performance.now();
        const result = convertToonToJson(toonString);
        const duration = performance.now() - start;

        // Structural checks
        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);

        // JSON must be parseable
        const parsed = JSON.parse(result.data);
        expect(typeof parsed).toBe("object");

        // Duration should stay reasonable
        expect(duration).toBeLessThan(15000); // 15 seconds
      });
    }
  });
});
