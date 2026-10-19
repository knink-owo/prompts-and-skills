---
title: INK 设计语言
summary: 面向中文界面的纯静态设计语言：八色场分区、0 圆角、1px 描边、token 驱动、零运行时依赖；含 class 清单、页面骨架、关键数值与交付前验收清单。
tags: [INK, 设计语言, CSS, Agent Skill]
models: [Claude, GPT, DeepSeek]
version: 1.1.3
updated: 2026-10-19
author: knink-owo
license: ""
source: https://github.com/knink-owo/INK-DesignLanguage
featured: false
draft: false
install: |
  # 技能目录结构（DSH 默认在 ~/.dsh/skills/）
  cp -r ink-design-language ~/.dsh/skills/

  # 或复制到目标项目的 skills 目录，按目标 agent 的约定放置
compatibility:
  - DSH / Claude Code / Codex / Cursor 等可读取 SKILL.md 的 agent
  - 面向纯静态 HTML / CSS / JS 页面
  - 不依赖 CDN、外链字体、图标库或 CSS 框架
---

## 它解决什么问题

中文界面的问题通常不在“组件不够多”，而在缺少稳定的约束：颜色越加越多、圆角随处出现、间距凭手感、每个页面都在重新发明一套样式。结果是页面看起来热闹，却没有统一的语气。

INK 把这些决定收成一套可执行的规则：

- 八个色场负责分区，一个屏幕只出现一块主色场。
- 0 圆角、1px 实线描边负责结构，不靠阴影和渐变制造层级。
- 所有颜色、字号、间距和时长都来自 `--ink-*` token，页面里不写裸值。
- 只用系统字体，不引外链字体、图标库和 CSS 框架。
- 每页唯一 `h1`，标题不跳级；skip link、`:focus-visible`、44px 触控目标和 `prefers-reduced-motion` 都是硬要求。

## 这个技能包含什么

- `references/design.md`：定位、色彩语义、字号、间距、文案规则。
- `references/conventions.md`：可用 class 清单、章节页骨架、验收清单。
- `assets/tokens.css`：唯一数值源，85 条 `--ink-*` 变量。
- `assets/tokens.json`：同一份数值的机器副本。
- `assets/site.css`：全部样式，约 202 条 class。
- `assets/site.js`：浮层开关与复制按钮，可选用。
- `templates/chapter.html`：页面骨架模板。

## 核心规则

1. 零依赖：页面只引 `tokens.css`、`site.css`、`site.js` 和 favicon；不引框架、构建产物、CDN、外链字体或图标库。
2. 只用 token：颜色、字号、间距、时长写 `var(--ink-*)`，不写裸 `#hex`、`rgb()`、裸 px 间距。
3. 不新增设计语言：不加色相、圆角、渐变、玻璃拟态、暗色模式。
4. 圆角恒 0，描边恒 1px 实线，阴影只给浮层。
5. 一屏一块色场，色场里只放 `--ink-text-on-color`；反白只放在 `--ink-ink-deep` 底上。
6. 每页唯一 `h1`，标题不跳级；图片必须有 alt。
7. 页面不写 `<style>`，不加第二套样式表；缺 class 时先补 `site.css`，并说明理由。

## 关键数值

| 项目 | 数值 |
| --- | --- |
| 内容宽 | 1280px |
| 左右留白 | `clamp(20px, 4vw, 56px)` |
| 顶栏 | 64px |
| 正文列宽 | 34em |
| 正文 | 16px / 行高 1.75 |
| 间距刻度 | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 |
| 断点 | 980px / 680px |
| 动效 | 悬停 200ms、按下 140ms、展开 380ms、收起 240ms |

## 怎么用

开工顺序是固定的：

1. 读 `references/design.md` 的定位、色彩、文字、空间和文案几节。
2. 查 `assets/tokens.css`，确认要用的变量存在。
3. 只用 `assets/site.css` 里已有的 class。
4. 照 `templates/chapter.html` 起页面，换标题、换导航，删掉不需要的区块。

移植到目标项目时，拷贝规范文件和样式资产，在页面 `<head>` 引 `tokens.css` 与 `site.css`，在 `<body>` 末尾引 `site.js`。如果目标项目有 `AGENTS.md` 或 `CLAUDE.md`，写清“UI 遵循 INK，颜色/字号/间距只用 `--ink-*`，class 只用 `site.css` 里已有的”。

## 交付前自检

在浏览器里检查 375 / 768 / 1440 三档没有横向滚动（`scrollWidth === innerWidth`）；Tab 一圈焦点环可见，skip link 排第一，触控目标不小于 44px；`prefers-reduced-motion: reduce` 下动画时长为 0；浮层打开后焦点在面板内，Esc、遮罩、关闭都能关，关闭后焦点回到触发按钮。

静态检查包括：裸色值、外链资源、内联 `<style>`、每页 `h1` 数量、破折号数量。具体 grep 命令在 `SKILL.md` 的「交付前自检」一节。

## 已知限制

- INK 的目标是纯静态页面；如果目标项目本身有框架或构建步骤，只复用 token 和 class，不要把构建产物混进规范文件。
- `references/conventions.md` 里的 `site/`、`tools/` 是 INK 仓库自己的路径，移植时要换成目标项目路径。
- 没有暗色模式、没有组件库、没有图标集；需要新组件时只能按现有 token 和 class 扩展，不能另起一套。
- 字体只用系统栈，跨平台字形会有差异；这是刻意的取舍，不是遗漏。
- 本站用 Astro 做内容构建，但页面运行时仍然只加载 `tokens.css`、`site.css`、`site.js`；这是对“零构建”的刻意例外，不改变 INK 的产物约束。

## 原文

- [INK 设计语言线上站](https://knink-owo.github.io/INK-DesignLanguage/)
- [GitHub 仓库](https://github.com/knink-owo/INK-DesignLanguage)
- [AGENTS.md](https://github.com/knink-owo/INK-DesignLanguage/blob/main/AGENTS.md)
