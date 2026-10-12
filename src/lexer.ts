import { TABLE } from "./table.ts";
import { normalize } from "./normalize.ts";

const ENTRIES = TABLE
  .map(([phrase, op]) => [normalize(phrase), op] as const)
  .sort((a, b) => b[0].length - a[0].length);

export function toBrainfuck(source: string): string {
  const text = normalize(source);
  let code = "";
  let i = 0;
  while (i < text.length) {
    const entry = ENTRIES.find(([phrase]) => text.startsWith(phrase, i));
    if (entry === undefined) {
      i += 1;
      continue;
    }
    code += entry[1];
    i += entry[0].length;
  }
  return code;
}
