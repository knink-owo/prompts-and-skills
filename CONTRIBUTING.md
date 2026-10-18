# 贡献指南

这份文档说明如何新增、更新和发布一条提示词或技能。站点是纯静态的 Astro 项目，内容全部是 Markdown；标签、计数、标签页和首页索引都在构建时从 frontmatter 自动生成。

> 站点地址：<https://knink-owo.github.io/prompts-and-skills/>  
> 内容目录：`src/content/prompts/` 与 `src/content/skills/`

## 先记住四条

1. **一条内容 = 一个 Markdown 文件**。不要为同一内容的旧版本复制文件；Git 历史就是版本历史。
2. **文件名就是 URL slug**。用 ASCII 小写字母、数字和连字符；发布后不要改名，否则旧链接会 404。
3. **分类不再由代码预设**。所有归类都来自条目的 `tags`；新增标签不需要改代码，重新部署就会生成标签页。
4. **正文不写一级标题**。页面标题来自 frontmatter 的 `title`，正文从 `##` 开始。

## 两种编辑方式

### A. 直接在 GitHub 网页编辑（不需要本地环境）

1. 打开 <https://github.com/knink-owo/prompts-and-skills>。
2. 新增：进入 `src/content/prompts/` 或 `src/content/skills/`，点 **Add file → Create new file**，文件名写成 `my-entry.md`。
3. 更新：打开已有 `.md` 文件，点铅笔图标编辑。
4. 把下面的模板粘进去，改 frontmatter 和正文。
5. 提交到 `main` 分支。GitHub Actions 会自动构建并部署；等 Actions 变绿后刷新站点。

网页编辑器适合改文字和 frontmatter；如果要在本地预览、跑校验，用方式 B。

### B. 本地编辑（推荐）

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm new:prompt   # 交互式新建提示词
pnpm new:skill    # 交互式新建技能
pnpm verify       # 构建 + 结构审查 + 内部链接检查
```

`pnpm new:prompt` / `pnpm new:skill` 会问标题、摘要、标签、模型、slug，并生成合法的 frontmatter 与正文骨架；同名文件已存在时会拒绝覆盖。也可以直接复制已有 Markdown 手写。

## 新增一条提示词

### 1. 建文件

文件名示例：`academic-paper-obsidian-translator.md`。放在 `src/content/prompts/`。

### 2. frontmatter

```yaml
---
title: 学术论文翻译与 Obsidian 排版
summary: 把英文论文转成可直接放进 Obsidian 的中文 Markdown；先自检环境，再按结构保序翻译。
tags:
  - Obsidian
  - "#翻译"
  - "#论文"
models: [DeepSeek, Claude, GPT]
version: 0.1.0
updated: 2026-10-18
author: your-name
license: MIT
source: ""
featured: false
draft: false
usage: 适合需要保留公式、图表和参考文献的论文。
variables: []
---
```

### 3. 正文结构

`````markdown
## 它解决什么问题

写清楚它替谁解决什么问题，以及不解决什么。

## 提示词

````text
把提示词原文贴在这里，保留空行、顺序和标点。
````

## 怎么用

1. 输入是什么，怎么给。
2. 输出是什么，怎么验收。

## 输出验收

- 一条可检查的标准。

## 已知限制

- 它做不到什么。
`````

提示词必须放在**四个反引号**的 `text` 块里。这样提示词内部即使有三反引号也不会截断，复制按钮复制的也是原文。

## 新增一个技能

技能同样放在 `src/content/skills/`，多两个 frontmatter 字段：

```yaml
---
title: Obsidian 插件开发
summary: 从脚手架到发布的 Obsidian 社区插件开发流程，含自动校验与分层验证。
tags: [Obsidian, 插件开发, Agent Skill]
models: []
version: 1.0.0
updated: 2026-10-18
author: knink-owo
license: MIT
source: https://github.com/knink-owo/dsh-obsidian-plugin-devkit
install: 把 obsidian-plugin-dev 文件夹复制到 skills 目录。
compatibility: [Claude Code, Codex, Cursor, DSH]
featured: false
draft: false
---
```

- `install` 会显示在详情页顶部的 **INSTALL** 代码块，可直接复制；没有就写空字符串或省略。
- `compatibility` 会显示在右侧速览栏与条目信息里。
- 正文建议用 `## 它解决什么问题`、`## 怎么用`、`## 输出验收`、`## 已知限制`；如果 `install` 已经给了安装命令，正文不要再重复一个安装段。

## 更新已有条目

1. 打开对应的 `.md`，改 frontmatter 或正文。
2. 更新 `updated: YYYY-MM-DD`。
3. 如果行为或输出格式有变化，按语义化版本改 `version`：
   - patch：错别字、文案、说明补充；
   - minor：新增规则、输出格式、可选能力；
   - major：输入输出契约、变量、流程发生不兼容变化。
4. `version` 只是当前标签，不生成历史页。旧全文留在 Git 提交里；需要对比时用 GitHub 的 commit / compare。
5. 不要复制 `xxx-v2.md` 之类的旧版本文件，也不要为旧版本新建页面。
6. 发布前跑 `pnpm verify`。

## 标签：唯一的分组方式

`tags` 是自由数组，不需要提前注册：

```yaml
tags: [Obsidian, 插件开发, TypeScript]
```

- 可以带 `#`（`#翻译`），站点显示时会自动去掉前导 `#`，URL slug 也稳定。
- 同一个标签的不同大小写/空格会按 slug 合并，保留第一次出现的写法。
- 标签页 `/tags/<slug>/`、首页标签墙、目录页、筛选 chips 和计数全部在构建时自动生成。
- 首页标签墙只放出现次数最多的前 8 个；目录页列出全部。
- 标签颜色由标签 slug 稳定映射到 INK 八色之一，同一标签在不同页面颜色一致。
- 给一条内容加新标签后，只要重新构建/部署，首页、目录、标签页和计数都会更新，不需要改代码。

标签命名建议：优先用已有的 `Obsidian`、`翻译`、`论文`、`插件开发`、`Agent Skill`、`工具链`；新增标签尽量短、可复用。

## frontmatter 字段表

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `title` | 是 | string | 页面标题；不要与正文一级标题重复 |
| `summary` | 是 | string | 一句话摘要，≤200 字；用于列表、搜索、OG |
| `tags` | 否 | string[] | 标签数组；站点唯一的分组来源 |
| `models` | 否 | string[] | 适用模型；只展示，不做筛选 |
| `version` | 否 | string | 当前版本号，默认 `0.1.0` |
| `updated` | 是 | date | `YYYY-MM-DD`；用于排序和显示 |
| `author` | 否 | string | 作者；空字符串不显示 |
| `license` | 否 | string | 许可；空字符串显示「未声明」 |
| `source` | 否 | string | 原始链接；仅 `http(s)` 会渲染成链接 |
| `featured` | 否 | boolean | 首页「最新收录」优先展示 |
| `draft` | 否 | boolean | `true` 时不进入列表、搜索和构建 |
| `usage` | 否 | string | 提示词用法摘要；显示在右侧速览栏 |
| `variables` | 否 | array | 提示词变量：`{ name, description }` |
| `install` | 否 | string | 技能安装命令；显示在 INSTALL 代码块 |
| `compatibility` | 否 | string[] | 技能兼容平台 |

## 图片与附件

- 图片放在 `public/images/<slug>/`，例如 `public/images/my-entry/cover.png`。
- 正文用根路径引用：`![图注](/images/my-entry/cover.png)`；构建时会自动加 base 前缀。
- 不要用 Obsidian 的 wiki 嵌入 `![[cover.png]]`；用标准 Markdown 图片语法。
- 图片必须有 alt 文本；大图先压缩。
- 站点不处理 `src/content` 里的相对图片路径，统一放 `public/` 最稳。

## 正文约定

- 不写 `#` 一级标题；从 `##` 开始。
- 不写 `![[...]]` wiki 链接；用标准 Markdown。
- 提示词原文放在四反引号 `text` 块里。
- 站内链接写根路径，例如 `[关于](/about/)`、`[翻译标签](/tags/翻译/)`；构建时自动加 base。
- 外部链接、参考文献、模型名、数据集名可以保留原文。
- 不要为了排版把多段合并成一段，也不要把一段拆成多段。

## 提交前检查

```bash
pnpm verify
```

它会做三件事：

1. `astro check && astro build`：类型、内容 schema、路由。
2. `scripts/audit-build.mjs`：每页恰好一个 `<h1>`、无内联 `<style>` / `style=`、无外链样式/脚本、圆角为 0。
3. `scripts/check-links.mjs`：检查站内 `a`、`link`、`script`、`img`、`form` 链接是否都能解析到 `dist` 文件。

手工再确认：

- [ ] `title`、`summary`（≤200 字）、`updated` 都填了
- [ ] `tags` 拼写一致；没有把标签写成 `#` 开头后又在正文里重复
- [ ] `draft: false`
- [ ] 提示词在四反引号 `text` 块里
- [ ] 正文没有 `#` 一级标题、没有 `![[...]]`
- [ ] 图片有 alt，路径以 `/images/...` 开头
- [ ] 详情页在 1440 / 768 / 390 宽度没有横向溢出
- [ ] 复制按钮能复制提示词/安装命令
- [ ] 右侧目录点击后，标题没有被 sticky 顶栏遮住

## 发布

```bash
git add src/content/prompts/your-entry.md
git commit -m "content: add your entry"
git push origin main
```

推送到 `main` 后，GitHub Actions 会自动构建并部署到 GitHub Pages。等 Actions 变绿，访问：

```text
https://knink-owo.github.io/prompts-and-skills/prompts/<slug>/
```

本地预览子路径构建：

```bash
BASE_PATH=prompts-and-skills pnpm build
pnpm preview
```

> Git Bash / MSYS 会把以 `/` 开头的环境变量值转成 Windows 路径，所以本地写 `BASE_PATH=prompts-and-skills`（无前导斜杠）。GitHub Actions 在 Linux 上不受影响。

## 常见问题

**新增后首页/标签页没更新？**  
先确认 Actions 已经跑完；再确认 `draft` 不是 `true`，文件在 `src/content/prompts` 或 `src/content/skills` 下，`pnpm verify` 通过。标签和计数是构建时快照，必须重新构建。

**搜索为什么搜不到正文？**  
搜索索引只包含标题、摘要、标签、模型；不包含正文全文。把关键词写进 `summary` 或 `tags`。

**可以加新标签吗？**  
可以，直接写进 `tags`；不需要改代码。标签页、计数、首页标签墙会在下次构建时自动生成。

**可以改名或移动文件吗？**  
尽量不要。文件名就是 URL；改名会让旧链接 404。必须改时，同时保留旧文件作为指向新页的说明，或接受旧链接失效。

**旧版本怎么保留？**  
不建历史页。`version` 只表示当前版本；旧全文在 Git 历史里。需要对比时用 GitHub 的 commit / compare，或给发布点打 tag。

**技能安装命令为什么只显示一次？**  
`install` 字段会渲染成顶部 INSTALL 代码块；正文不要再写 `## 安装`，否则会重复两次。

**为什么标签显示时少了 `#`？**  
写入时可以带 `#`（兼容 Obsidian），站点统一去掉前导 `#` 再显示；slug 不变。

**`src/prompts+skills/` 是什么？**  
那是 Obsidian 的本地工作目录残留，不是站点内容源；站点只读 `src/content/prompts` 与 `src/content/skills`。不要把 `.obsidian/` 提交进仓库。

## 设计约束（改代码时）

- 设计语言是 INK：0 圆角、1px 描边、只用 `--ink-*` token，不新增色相/渐变/阴影/暗色模式。
- 运行时零依赖：页面只引 `tokens.css`、`site.css`、`site.js`；不引 CDN、外链字体、图标库。
- 不写内联 `<style>` 或 `style=`；需要新组件时先复用现有 class。
- 每页唯一 `<h1>`；图片必须有 alt；键盘可操作；支持 `prefers-reduced-motion`。
- 标签颜色只能从 INK 八色中选，用 `tagTone()` 的稳定 hash。

有不确定的改动，先开 issue 或在提交说明里写清楚动机，再改模板/样式。
