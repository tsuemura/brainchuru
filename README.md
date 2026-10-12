# brainchuru

A Brainfuck substitution language based on the CIAO Churu jingle.

| brainchuru | Brainfuck |
| --- | --- |
| ちゅ～る | `+` |
| CIAOちゅ～る | `-` |
| ちゅっちゅるちゅー | `>` |
| ちゅっちゅるちゅっちゅ | `<` |
| はい | `.` |
| もう一本 | `,` |
| 一度なめたら | `[` |
| 止まらニャい | `]` |

Everything else is a comment.

## Usage

Requires Node.js 22.18 or later.

```
node src/cli.ts run examples/hello.churu
node src/cli.ts to-bf examples/hello.churu
node src/cli.ts from-bf examples/hello.bf
```
