import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import {
  entryPath,
  fallbackSlug,
  parseArgs,
  parseList,
  slugify,
  today,
  writeEntry,
  yamlList,
  yamlString,
} from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const needsPrompt = !args.title || !args.summary || !args.slug;
const rl = needsPrompt
  ? createInterface({ input: stdin, output: stdout })
  : null;

const ask = async (question, fallback = '') => {
  if (!rl) return fallback;
  const answer = (await rl.question(question)).trim();
  return answer || fallback;
};

try {
  const title = String(args.title || (await ask('标题：'))).trim();
  if (!title) throw new Error('标题不能为空。');

  const summary = String(args.summary || (await ask('一句话摘要（≤200 字）：'))).trim();
  if (!summary) throw new Error('摘要不能为空。');
  if ([...summary].length > 200) throw new Error('摘要超过 200 字。');

  const tags = args.tags
    ? parseList(args.tags)
    : parseList(await ask('标签（逗号分隔，可带 #，可留空）：'));
  const models = args.models
    ? parseList(args.models)
    : parseList(await ask('适用模型（逗号分隔，可留空）：'));

  const suggested = slugify(title) || fallbackSlug('prompt');
  const slugInput = String(
    args.slug ||
      (await ask(`文件名 slug（小写字母/数字/连字符，留空用 ${suggested}）：`, suggested)),
  ).trim();
  const slug = slugify(slugInput);
  if (!slug) throw new Error('slug 无效：只能包含小写字母、数字和连字符。');

  const body = `---
title: ${yamlString(title)}
summary: ${yamlString(summary)}
tags: ${yamlList(tags)}
models: ${yamlList(models)}
version: 0.1.0
updated: ${today()}
author: ""
license: ""
source: ""
featured: false
draft: false
---

## 它解决什么问题

（写清楚它替谁解决什么问题，以及不解决什么。）

## 提示词

\`\`\`\`text
（把提示词原文贴在这里，保留空行和顺序。）
\`\`\`\`

## 怎么用

1. （输入是什么，怎么给。）
2. （输出是什么，怎么验收。）

## 输出验收

- （一条可检查的标准。）

## 已知限制

- （它做不到什么。）
`;

  const filePath = entryPath('prompts', slug);
  await writeEntry(filePath, body);
  console.log(`已创建：${filePath}`);
} catch (error) {
  console.error(`创建失败：${error.message}`);
  process.exitCode = 1;
} finally {
  rl?.close();
}
