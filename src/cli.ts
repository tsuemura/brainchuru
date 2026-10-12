#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { toBrainfuck } from "./lexer.ts";
import { fromBrainfuck } from "./convert.ts";
import { compile, run } from "./interpreter.ts";

const USAGE = `usage:
  brainchuru run <file.churu>
  brainchuru to-bf <file.churu>
  brainchuru from-bf <file.bf>

Use - as the file to read from stdin.
`;

function readSource(path: string | undefined): string {
  if (path === undefined || path === "-") return readFileSync(0, "utf8");
  return readFileSync(path, "utf8");
}

function readStdin(): Uint8Array {
  try {
    return new Uint8Array(readFileSync(0));
  } catch {
    return new Uint8Array(0);
  }
}

function main(argv: string[]): number {
  const [command, path] = argv;
  switch (command) {
    case "run": {
      const program = compile(toBrainfuck(readSource(path)));
      const sourceFromStdin = path === undefined || path === "-";
      const needsInput = program.ops.includes(",") && !sourceFromStdin;
      const input = needsInput ? readStdin() : new Uint8Array(0);
      process.stdout.write(run(program, { input }));
      return 0;
    }
    case "to-bf":
      process.stdout.write(toBrainfuck(readSource(path)) + "\n");
      return 0;
    case "from-bf":
      process.stdout.write(fromBrainfuck(readSource(path)));
      return 0;
    case "-h":
    case "--help":
      process.stdout.write(USAGE);
      return 0;
    default:
      process.stderr.write(USAGE);
      return 2;
  }
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`brainchuru: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
