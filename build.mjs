#!/usr/bin/env node
// ============================================================
// build.mjs —— 把 questions/*.json 题库回灌进 photo-eye-quiz.html
//
//   题库的唯一数据源是 questions/ 下的独立 JSON 文件。
//   本脚本读取它们,重新生成 HTML 里 <<<QUESTIONS:BEGIN>>> 与
//   <<<QUESTIONS:END>>> 之间的 const RAW = [...] 数组。
//
//   用法:  node build.mjs
//   产物:  就地改写 photo-eye-quiz.html
// ============================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const QDIR = path.join(here, 'questions');
const HTML = path.join(here, 'photo-eye-quiz.html');

// —— 1. 读取并按 order 排序所有题目 ——
const files = fs.readdirSync(QDIR).filter(f => /^\d+-.*\.json$/.test(f));
const questions = files
  .map(f => JSON.parse(fs.readFileSync(path.join(QDIR, f), 'utf8')))
  .sort((a, b) => a.order - b.order);

if (!questions.length) throw new Error('questions/ 下没有题目 JSON');

// —— 2. 把一题序列化成 HTML 内 RAW 数组的一个对象(合法 JS)——
//    · 普通文本字段用 JSON.stringify → 双引号 JS 字符串
//    · good / bad 用反引号包裹(内含 ${grain}/${person(...)} 等 helper 调用,
//      运行时由 HTML 中的 helper 求值)——注意 verbatim 不含反引号
//    · soft 还原成带前缀的字符串,交给 HTML 的智能标签解析
function softToString(soft) {
  if (!soft) return null;
  return soft.label === '补充' ? soft.text : `${soft.label}：${soft.text}`;
}

function emit(q) {
  const eyebrow = `${q.category} · ${q.subcategory}`;
  const soft = softToString(q.soft);
  const lines = [
    `  { id: ${JSON.stringify(q.id)}, eyebrow: ${JSON.stringify(eyebrow)}, en: ${JSON.stringify(q.en)}, title: ${JSON.stringify(q.title)},`,
    `    hint: ${JSON.stringify(q.hint)},`,
    `    good: \`${q.svg.good}\`,`,
    `    bad: \`${q.svg.bad}\`,`,
    `    verdict: ${JSON.stringify(q.verdict)},`,
    `    points: ${JSON.stringify(q.points)}` + (soft !== null ? ',' : ' }'),
  ];
  if (soft !== null) lines.push(`    soft: ${JSON.stringify(soft)} }`);
  return lines.join('\n');
}

const body = questions.map(emit).join(',\n\n');
const block =
  '// <<<QUESTIONS:BEGIN>>> 此区块由 build.mjs 从 questions/*.json 自动生成,请勿手改\n' +
  'const RAW = [\n' + body + '\n];\n' +
  '// <<<QUESTIONS:END>>>';

// —— 3. 替换 HTML 中的标记区块 ——
//    用替换函数(而非字符串)避免 SVG 里的 $ 被当成 $& 等特殊记号
const html = fs.readFileSync(HTML, 'utf8');
const re = /\/\/ <<<QUESTIONS:BEGIN>>>[\s\S]*?\/\/ <<<QUESTIONS:END>>>/;
if (!re.test(html)) throw new Error('HTML 中找不到 QUESTIONS 标记区块');
const out = html.replace(re, () => block);
fs.writeFileSync(HTML, out, 'utf8');

console.log(`✓ 已回灌 ${questions.length} 题 → ${path.basename(HTML)}`);
