import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { toBrainfuck } from "../src/lexer.ts";
import { fromBrainfuck } from "../src/convert.ts";
import { run } from "../src/interpreter.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HELLO = readFileSync(new URL("../examples/hello.bf", import.meta.url), "utf8").trim();

const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes);
const encode = (text: string) => new TextEncoder().encode(text);

test("every phrase maps to its brainfuck command", () => {
  const source = "ちゅ～る CIAOちゅ～る ちゅっちゅるちゅー ちゅっちゅるちゅっちゅ はい! もう一本♪ 一度なめたら 止まらニャい";
  assert.equal(toBrainfuck(source), "+-><.,[]");
});

test("text outside the table is a comment", () => {
  assert.equal(toBrainfuck("いなばCIAOちゅ～る ちゅー 止まらニャい 止まらニャい もう一本♪\n"), "-]],");
});

test("long vowel marks, width and case are normalized", () => {
  assert.equal(toBrainfuck("ちゅーる ちゅ〜る ちゅ~る ｃｉａｏちゅ～る ちゅっちゅるちゅ～"), "+++->");
});

test("longest phrase wins", () => {
  assert.equal(toBrainfuck("ちゅっちゅるちゅっちゅちゅっちゅるちゅーちゅ～る"), "<>+");
});

test("hello world runs", () => {
  assert.equal(decode(run(toBrainfuck(fromBrainfuck(HELLO)))), "Hello World!\n");
});

test("from-bf and to-bf round trip", () => {
  assert.equal(toBrainfuck(fromBrainfuck(HELLO)), HELLO);
});

test("echo copies input until EOF", () => {
  const code = toBrainfuck("もう一本♪ 一度なめたら はい! もう一本♪ 止まらニャい");
  assert.equal(decode(run(code, { input: encode("にゃ") })), "にゃ");
});

test("cells wrap at 8 bits", () => {
  assert.deepEqual([...run("-.")], [255]);
  assert.deepEqual([...run("+".repeat(256) + ".")], [0]);
});

test("unmatched loops are rejected", () => {
  assert.throws(() => run("]"), /止まらニャい/);
  assert.throws(() => run("["), /一度なめたら/);
});

test("pointer cannot leave memory", () => {
  assert.throws(() => run("<"), RangeError);
  assert.throws(() => run(">", { memorySize: 1 }), RangeError);
});

test("cli runs the hello example", () => {
  const output = execFileSync(process.execPath, ["src/cli.ts", "run", "examples/hello.churu"], { cwd: ROOT });
  assert.equal(output.toString(), "Hello World!\n");
});

test("cli echoes stdin", () => {
  const output = execFileSync(process.execPath, ["src/cli.ts", "run", "examples/echo.churu"], {
    cwd: ROOT,
    input: "ちゅ～る",
  });
  assert.equal(output.toString(), "ちゅ～る");
});

test("cli converts in both directions", () => {
  const churu = execFileSync(process.execPath, ["src/cli.ts", "from-bf", "-"], { cwd: ROOT, input: HELLO });
  const bf = execFileSync(process.execPath, ["src/cli.ts", "to-bf", "-"], { cwd: ROOT, input: churu });
  assert.equal(bf.toString().trim(), HELLO);
});
