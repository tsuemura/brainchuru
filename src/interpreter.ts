export interface Program {
  ops: string[];
  jumps: number[];
}

export interface RunOptions {
  memorySize?: number;
  input?: Uint8Array;
}

export function compile(code: string): Program {
  const ops = [...code].filter((ch) => "+-<>.,[]".includes(ch));
  const jumps = new Array<number>(ops.length).fill(-1);
  const stack: number[] = [];
  ops.forEach((op, i) => {
    if (op === "[") {
      stack.push(i);
    } else if (op === "]") {
      const open = stack.pop();
      if (open === undefined) throw new SyntaxError(`unmatched 止まらニャい at instruction ${i}`);
      jumps[open] = i;
      jumps[i] = open;
    }
  });
  if (stack.length > 0) {
    throw new SyntaxError(`unmatched 一度なめたら at instruction ${stack[stack.length - 1]}`);
  }
  return { ops, jumps };
}

export function run(code: string | Program, options: RunOptions = {}): Uint8Array {
  const { ops, jumps } = typeof code === "string" ? compile(code) : code;
  const memorySize = options.memorySize ?? 30000;
  const input = options.input ?? new Uint8Array(0);
  const memory = new Uint8Array(memorySize);
  const output: number[] = [];
  let ptr = 0;
  let ip = 0;
  let inputPos = 0;
  while (ip < ops.length) {
    switch (ops[ip]) {
      case "+":
        memory[ptr] += 1;
        break;
      case "-":
        memory[ptr] -= 1;
        break;
      case ">":
        ptr += 1;
        if (ptr >= memorySize) throw new RangeError("pointer moved past the right end of memory");
        break;
      case "<":
        ptr -= 1;
        if (ptr < 0) throw new RangeError("pointer moved past the left end of memory");
        break;
      case ".":
        output.push(memory[ptr]);
        break;
      case ",":
        memory[ptr] = inputPos < input.length ? input[inputPos++] : 0;
        break;
      case "[":
        if (memory[ptr] === 0) ip = jumps[ip];
        break;
      case "]":
        if (memory[ptr] !== 0) ip = jumps[ip];
        break;
    }
    ip += 1;
  }
  return Uint8Array.from(output);
}
