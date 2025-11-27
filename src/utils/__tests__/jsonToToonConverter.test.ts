// src/utils/__tests__/jsonToToonConverter.test.ts
import { describe, it, expect, vi } from 'vitest';
import { convertJsonToToon } from '../jsonToToonConverter';

// Increase test timeout for large file tests
vi.setConfig({ testTimeout: 60000 });

// --- Helper: Generate more accurate large JSON payload ---
function generateLargeJson(sizeInMB: number): string {
  const targetSize = sizeInMB * 1024 * 1024; // bytes
  const obj: Record<string, any> = {};

  // Use fewer keys, bigger strings (faster)
  let value = 'x'.repeat(5000); // 5KB string
  let i = 0;

  // Keep expanding until JSON reaches desired size
  while (JSON.stringify(obj).length < targetSize) {
    obj[`key_${i}`] = value;
    i++;
  }

  return JSON.stringify(obj);
}

describe('convertJsonToToon', () => {
  it('should convert simple JSON object', () => {
    const json = '{"name": "test", "value": 123}';

    const result = convertJsonToToon(json);

    expect(result.success).toBe(true);
    expect(result.data).toContain('OBJ_START');
    expect(result.data).toContain('KEY=name');
    expect(result.data).toContain('STR=test');
    expect(result.data).toContain('KEY=value');
    expect(result.data).toContain('NUM=123');
    expect(result.data).toContain('OBJ_END');
  });

  it('should convert JSON with arrays', () => {
    const json = '{"items": [1, "two", true, null]}';

    const result = convertJsonToToon(json);

    expect(result.success).toBe(true);
    expect(result.data).toContain('ARR_START');
    expect(result.data).toContain('NUM=1');
    expect(result.data).toContain('STR=two');
    expect(result.data).toContain('BOOL=true');
    expect(result.data).toContain('NULL');
    expect(result.data).toContain('ARR_END');
  });

  it('should handle invalid JSON', () => {
    const invalidJson = '{"name": "test", "value": }';

    const result = convertJsonToToon(invalidJson);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  // --- Performance & stress tests ---
  describe('Large JSON file tests', () => {
    const sizes = [1, 5, 10, 15, 20]; // MB

    for (const size of sizes) {
      it(`should handle ${size}MB JSON file`, () => {
        const largeJson = generateLargeJson(size);

        // Measure speed
        const start = performance.now();
        const result = convertJsonToToon(largeJson);
        const duration = performance.now() - start;

        // --- Assertions ---
        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);

        // Check structural integrity
        const lines = result.data.trim().split('\n');
        expect(lines[0]).toBe('OBJ_START');
        expect(lines[lines.length - 1]).toBe('OBJ_END');

        // Conversion should finish within reasonable time
        expect(duration).toBeLessThan(15000); // 15 seconds max for 20MB
      });
    }
  });
});
