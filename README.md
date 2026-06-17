# 摄影眼 · 审美对比测验（photo-eye-quiz）

一个纯前端的中文小测验：每题给出 **一对取景器画面**（A 和 B），让你选「构图 / 用光 / 色彩更好的那一张」。选完即时判对错、弹出解析卡，答完一卷可逐题回看。

画面 **不是真实照片，而是 SVG 矢量示意图** —— 这是刻意的设计：

- **可控**：好图与坏图之间只差「一个审美变量」，其余全相同，能干净地看出差别。
- **无版权**：全部矢量手绘，不依赖任何照片素材。
- **轻量**：单 HTML 文件，零外部依赖，双击即开。

目前共 **58 题**，覆盖构图、取景、用光、色彩、影调、镜头、视角、时机 8 个方向，难度从入门到高阶递进。

## 快速开始

直接在浏览器里打开 `index.html` 即可游玩，无需服务器、无需安装任何依赖。

```bash
# macOS
open index.html
# Linux
xdg-open index.html
```

## 项目结构

```
photo-eye-quiz/
├── index.html              成品：可直接打开游玩的单文件测验
├── build.mjs               构建脚本：把题库 JSON 回灌进 index.html
├── questions/              题库（唯一数据源）
│   ├── NN-<id>.json        每题一个文件，NN 为两位序号决定出场顺序
│   └── index.json          题库清单（自动生成，勿手改）
└── SKILL.md                出题 / 改题 / 扩题完整指南
```

## 数据流

题库的 **唯一数据源** 是 `questions/` 下的独立 JSON 文件。`index.html` 里的题目数组是构建产物，由脚本从 JSON 回灌而来。

```
questions/<order>-<id>.json   ←  题库唯一数据源（每题一个文件）
        │
   node build.mjs             ←  把所有 JSON 回灌进 HTML
        │
        ▼
index.html                    ←  成品（RAW 数组在两个标记注释之间被整体替换）
```

**改题流程永远是：改 JSON → 跑 `node build.mjs` → 完成。**
不要直接手改 HTML 里的 `const RAW = [...]`，它会被下次构建覆盖。

## 构建

需要 Node.js（仅用其内置 `fs`/`path`，无第三方依赖）。

```bash
node build.mjs
```

脚本会读取 `questions/*.json`，按 `order` 排序，重新生成 `index.html` 中 `<<<QUESTIONS:BEGIN>>>` 与 `<<<QUESTIONS:END>>>` 之间的 `const RAW = [...]` 数组。

## 出题 / 扩题

新增或修改题目前，请先阅读 [`SKILL.md`](./SKILL.md)，它详细说明了：

- 每道题的 JSON schema 与各字段含义；
- 难度 / 方向 / 标签三个维度的判定标准；
- SVG 示意图的画法（600×400 坐标系、helper 速查、可用渐变与滤镜）；
- 「成对只改一个变量」的出题命门；
- verdict / points / soft 的文案写作语气与出题 checklist。

新增一题的大致流程：

1. 在 `questions/` 下新建 `NN-<id>.json`（`NN` = 两位序号，决定出场顺序）。
2. 把它登记进 `questions/index.json`。
3. 运行 `node build.mjs` 回灌。
4. 在浏览器打开 `index.html` 自测：good/bad 两张确实只差目标变量，渲染无误，文案无歧义。
