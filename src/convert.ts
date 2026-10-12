import { TABLE, DECORATED } from "./table.ts";

const PHRASES = new Map(TABLE.map(([phrase, op]) => [op, DECORATED[op] ?? phrase]));

export function fromBrainfuck(code: string, width = 8): string {
  const lines: string[] = [];
  let line: string[] = [];
  let depth = 0;
  const indent = () => "  ".repeat(Math.max(depth, 0));
  const flush = () => {
    if (line.length > 0) lines.push(indent() + line.join(" "));
    line = [];
  };
  for (const ch of code) {
    const phrase = PHRASES.get(ch);
    if (phrase === undefined) continue;
    if (ch === "[") {
      flush();
      lines.push(indent() + phrase);
      depth += 1;
    } else if (ch === "]") {
      flush();
      depth -= 1;
      lines.push(indent() + phrase);
    } else {
      line.push(phrase);
      if (ch === "." || ch === "," || line.length >= width) flush();
    }
  }
  flush();
  return lines.join("\n") + "\n";
}
