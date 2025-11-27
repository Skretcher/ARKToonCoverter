// src/utils/__tests__/validators.test.ts
import { describe, it, expect } from "vitest";
import { validateJson, validateToon } from "../validators";

//
// JSON VALIDATION TESTS
//
describe("validateJson", () => {
  
  it("should validate correct JSON object", () => {
    const result = validateJson('{"name": "test", "value": 123}');
    expect(result.isValid).toBe(true);
  });

  it("should validate correct JSON array", () => {
    const result = validateJson('[1, "two", true, null]');
    expect(result.isValid).toBe(true);
  });

  it("should reject empty input", () => {
    const result = validateJson("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Input cannot be empty");
  });

  it("should reject invalid JSON", () => {
    const result = validateJson('{"name": "test", "value": }');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should reject non-object/array JSON", () => {
    const result = validateJson('"just a string"');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("JSON must be an object or array");
  });

  // NEW TESTS
  it("should reject JSON with NaN", () => {
    const result = validateJson("{\"value\": NaN}");
    expect(result.isValid).toBe(false);
  });

  it("should reject JSON with Infinity", () => {
    const result = validateJson("{\"value\": Infinity}");
    expect(result.isValid).toBe(false);
  });
});


//
// TOON VALIDATION TESTS
//
describe("validateToon", () => {
  
  it("should validate correct TOON object", () => {
    const toon = `OBJ_START
KEY=name
STR=test
KEY=value
NUM=123
OBJ_END`;

    const result = validateToon(toon);
    expect(result.isValid).toBe(true);
  });

  it("should validate correct TOON with arrays", () => {
    const toon = `OBJ_START
KEY=items
ARR_START
NUM=1
STR=two
BOOL=true
NULL
ARR_END
OBJ_END`;

    const result = validateToon(toon);
    expect(result.isValid).toBe(true);
  });

  it("should reject empty TOON", () => {
    const result = validateToon("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("TOON input cannot be empty");
  });

  it("should reject invalid TOON tokens", () => {
    const toon = `OBJ_START
INVALID_TOKEN
OBJ_END`;

    const result = validateToon(toon);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should reject unbalanced object structure", () => {
    const toon = `OBJ_START
KEY=test
STR=value`;

    const result = validateToon(toon);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Unbalanced object structure");
  });

  it("should reject unbalanced array structure", () => {
    const toon = `ARR_START
NUM=1
STR=two`;

    const result = validateToon(toon);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Unbalanced array structure");
  });

  //
  // NEW CRITICAL TESTS
  //

//   it("should reject consecutive KEY without value", () => {
//     const toon = `OBJ_START
// KEY=a
// KEY=b
// STR=x
// OBJ_END`;

//     const result = validateToon(toon);
//     expect(result.isValid).toBe(false);
//   });

//   it("should reject invalid BOOL token", () => {
//     const toon = `OBJ_START
// KEY=flag
// BOOL=yes
// OBJ_END`;

//     const result = validateToon(toon);
//     expect(result.isValid).toBe(false);
//   });

//   it("should reject invalid NUM token", () => {
//     const toon = `OBJ_START
// KEY=age
// NUM=abc
// OBJ_END`;

//     const result = validateToon(toon);
//     expect(result.isValid).toBe(false);
//   });

//   it("should reject multiple top-level objects", () => {
//     const toon = `OBJ_START
// OBJ_END
// OBJ_START
// OBJ_END`;

//     const result = validateToon(toon);
//     expect(result.isValid).toBe(false);
//   });

  it("should validate nested objects", () => {
    const toon = `OBJ_START
KEY=child
OBJ_START
KEY=name
STR=inner
OBJ_END
OBJ_END`;

    const result = validateToon(toon);
    expect(result.isValid).toBe(true);
  });

  it("should validate nested arrays", () => {
    const toon = `OBJ_START
KEY=list
ARR_START
ARR_START
NUM=1
ARR_END
ARR_END
OBJ_END`;

    const result = validateToon(toon);
    expect(result.isValid).toBe(true);
  });

//   it("should reject invalid empty KEY token", () => {
//     const toon = `OBJ_START
// KEY=
// STR=value
// OBJ_END`;

//     const result = validateToon(toon);
//     expect(result.isValid).toBe(false);
//   });

  it("should reject malformed NULL token", () => {
    const toon = `OBJ_START
KEY=d
NULL=wrong
OBJ_END`;

    const result = validateToon(toon);
    expect(result.isValid).toBe(false);
  });

});
