export function escapeString(str: string): string {
  // Escape special characters that might interfere with TOON format
  return str.replace(/\n/g, '\\n')
           .replace(/\r/g, '\\r')
           .replace(/\t/g, '\\t');
}

export function unescapeString(str: string): string {
  return str.replace(/\\n/g, '\n')
           .replace(/\\r/g, '\r')
           .replace(/\\t/g, '\t');
}
