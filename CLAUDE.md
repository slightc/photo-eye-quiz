# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在本仓库中工作提供指引。

## 项目概览

photo-eye-quiz 是一个 **纯前端的中文摄影审美对比测验**：每题给出一对 SVG 矢量示意图（good / bad），玩家二选一，即时判对错并弹出解析。无构建框架、无第三方运行时依赖，成品就是单个 `index.html`。

## 核心架构：JSON 是唯一数据源

```
questions/<NN>-<id>.json   →   node build.mjs   →   index.html
   （题库唯一数据源）            （回灌脚本）          （成品）
```

- 题库的 **唯一数据源** 是 `questions/` 下的独立 JSON 文件，每题一个，文件名 `NN-<id>.json`，`NN` 为两位序号决定出场顺序。
- `index.html` 中 `<<<QUESTIONS:BEGIN>>>` 与 `<<<QUESTIONS:END>>>` 之间的 `const RAW = [...]` 是 **构建产物**，由 `build.mjs` 整体替换生成。
- `questions/index.json` 是 **自动生成的清单**，勿手改。

## 常用命令

```bash
node build.mjs        # 把 questions/*.json 回灌进 index.html
open index.html       # 浏览器打开自测（Linux 用 xdg-open）
```

构建仅依赖 Node 内置模块（`fs`/`path`），无需 `npm install`。

## 改动题库时的铁律

1. **只改 JSON，不手改 HTML 的 `RAW` 数组** —— 手改会被下次 `node build.mjs` 覆盖。
2. 改完 JSON **必须跑 `node build.mjs`**，否则 `index.html` 不会更新。
3. 新增题目同时 **登记进 `questions/index.json`**。
4. SVG 模板串里 **用双引号** 作属性引号，不要用反引号（会和外层模板字符串冲突）。
5. `direction` 必须落进既有 8 类（构图 / 取景 / 用光 / 色彩 / 影调 / 镜头 / 视角 / 时机），不要自造。
6. good / bad **成对只改一个变量** —— 两张除「这道题考的那条原则」外尽量完全一致。

## 出题 / 改题前先读 SKILL.md

任何涉及 **新增、修改、扩充题目** 的任务，务必先阅读 [`SKILL.md`](./SKILL.md)。它是出题的权威指南，包含：

- 完整 JSON schema 与各字段语义；
- 难度（入门/进阶/高阶）、方向（8 类）、标签三维度的判定标准；
- SVG 渲染契约：固定 600×400 坐标系、宿主 `<defs>` 提供的渐变/滤镜、`grain`/`person`/`bust` 等 helper 速查；
- verdict / points / soft 的文案语气；
- 出题 checklist 与常见坑。

不要凭记忆猜测 schema 或 helper —— 以 SKILL.md 与现有 `questions/*.json` 为准。
