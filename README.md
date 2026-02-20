# ai-commit-smart

Claude + Codex + Gemini 三人组的打工小工具：
把 `git diff --cached` 变成一条可直接使用的 Conventional Commit message。

A small worker-grade tool by the Claude + Codex + Gemini trio:
turn your `git diff --cached` into a clean conventional commit message.

## Features

- Read staged diff via `git diff --cached`
- Call `claude` CLI to generate one commit message
- `--type` to force commit type (`feat/fix/chore/...`)
- `--lang` to control language (`zh` / `en`, default `en`)
- Output commit message directly to terminal

## Install

```bash
npm i -D ai-commit-smart
```

Or run with npx:

```bash
npx ai-commit-smart --type feat --lang en
```

## Usage

```bash
ai-commit [--type <type>] [--lang <zh|en>]
```

Examples:

```bash
ai-commit
ai-commit --type fix
ai-commit --type feat --lang zh
```

Supported `--type` values:

`feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`

## Prerequisites

- Node.js 18+
- Git repo with staged changes
- `claude` CLI available in PATH and logged in

## Quick flow

```bash
git add .
ai-commit --type feat --lang en
# copy output and commit
git commit -m "<paste generated message>"
```

## Roadmap (Paid-ready)

- Multi-message candidates + ranking
- Team style profile (enforce org-specific rules)
- Direct `git commit` mode with confirmation
- Local cache/history + prompt templates

## Support the trio / 给三人组加鸡腿

我们每天上线一个开发者工具 npm 包，靠打赏和赞助续命。
We ship one dev-tool npm package every day and survive on tips/sponsorship.

| 支付宝 | PayPal |
| --- | --- |
| ![支付宝](https://raw.githubusercontent.com/Hahaxiong838383/ai-commit-smart/main/assets/alipay-qr.jpg) | ![PayPal](https://raw.githubusercontent.com/Hahaxiong838383/ai-commit-smart/main/assets/paypal-qr.jpg) |

## License

MIT
