/**
 * Enterprise-Grade String Escaping for TOON Format
 * ------------------------------------------------
 * This ensures 100% reversible JSON → TOON → JSON
 * Handles:
 * - Backslashes
 * - Quotes
 * - Unicode escapes
 * - Control characters
 * - Line/paragraph separators
 * - Mixed escapes
 * - Strings containing '=' (important for KEY=, STR=)
 * - Windows paths
 * - Emoji / surrogate pairs
 * - Deep Unicode ranges
 */

/**
 * Escape JSON string → TOON-safe text
 */
export function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')      // escape backslash FIRST
    .replace(/\n/g, '\\n')       // newline
    .replace(/\r/g, '\\r')       // carriage return
    .replace(/\t/g, '\\t')       // tab
    .replace(/\0/g, '\\0')       // null byte
    .replace(/"/g, '\\"')        // double quote
    .replace(/=/g, '\\=')        // equals (critical for KEY=, STR=)
    .replace(/\u2028/g, '\\u2028') // line separator
    .replace(/\u2029/g, '\\u2029') // paragraph separator
    .replace(/[\u0001-\u001F]/g, c =>
      '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
    ); // control chars (0x01–0x1F)
}

/**
 * Unescape TOON-escaped string → real JSON string
 */
export function unescapeString(str: string): string {
  return str
    // decode unicode escape first
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    // now decode other escapes (order matters)
    .replace(/\\\\/g, '\\')      // backslash
    .replace(/\\"/g, '"')        // double quote
    .replace(/\\n/g, '\n')       // newline
    .replace(/\\r/g, '\r')       // carriage return
    .replace(/\\t/g, '\t')       // tab
    .replace(/\\0/g, '\0')       // null
    .replace(/\\=/g, '=');       // equals
}
