# 贡献指南

这份文档说明怎样往本站添加或更新一条提示词（prompt）或技能（skill）。站点是纯静态的：内容就是仓库里的 Markdown，推送到 `main` 后由 GitHub Actions 构建并部署到 GitHub Pages。

- 线上地址：<https://knink-owo.github.io/prompts-and-skills/>
- 内容目录：`src/content/prompts/`、`src/content/skills/`
- 两类条目共用一套 frontmatter 和分类；提示词多 `usage` / `variables`，技能多 `install` / `compatibility`

## 0. 先选一条路径

| 你想做的事 | 推荐方式 | 需要本地环境 |
| --- | --- | --- |
| 改一条已有条目 | GitHub 网页直接编辑 | 不需要 |
| 新增一条条目 | 网页复制现有文件改写，或本地跑 `pnpm new:prompt` / `new:skill` | 网页方式不需要 |
| 改样式、组件、脚本 | 本地开发 + `pnpm verify` | 需要 |

网站没有后台、数据库或在线编辑器。所有修改最终都落在仓库文件上。

## 1. 一条内容 = 一个 Markdown 文件

```text
src/content/
  prompts/
    academic-paper-obsidian-translator.md
  skills/
    _template.md          # 草稿模板，不会出现在站点
```

规则：

1. **一个条目一个文件**，不要把多条提示词塞进一个文件。
2. 文件名就是 URL 的一部分：`src/content/prompts/my-prompt.md` → `/prompts/my-prompt/`。
3. 文件名用 ASCII 小写 kebab-case（`my-prompt.md`），不要用空格、中文或大写；确定并发布后不要改文件名。
4. **不要为旧版本复制文件**。版本历史由 Git 提交记录保存，站点只展示当前版本。
5. 不要直接改 `src/content/skills/_template.md` 来发布技能；它是 `draft: true` 的模板。

## 2. 新增一条提示词

### 方式 A：本地交互式创建（推荐）

```bash
pnpm install
pnpm new:prompt
```

脚本会依次询问标题、一句话摘要（≤200 字）、分类、标签、适用模型和文件名，然后生成：

```text
src/content/prompts/<slug>.md
```

也可以非交互：

```bash
pnpm new:prompt \
  --title "我的提示词" \
  --summary "一句话说明它解决什么问题。" \
  --category 写作 \
  --tags "写作,审稿" \
  --models "Claude,GPT" \
  --slug my-prompt
```

如果目标文件已存在，脚本会拒绝覆盖；请换一个 slug 或手动编辑。

### 方式 B：GitHub 网页创建

1. 打开仓库的 `src/content/prompts/`。
2. 点 **Add file → Create new file**。
3. 文件名填 `<slug>.md`，粘贴下面的 frontmatter 和正文。
4. 提交到 `main`；等待 Actions 构建完成。

### 提示词模板

```markdown
---
title: "学术论文翻译与 Obsidian 排版"
summary: "把英文论文（PDF、arXiv 链接或截图）转成可直接放进 Obsidian 的中文 Markdown。"
category: 翻译
tags: [学术写作, Obsidian, PDF, 翻译]
models: [DeepSeek, Claude, GPT]
version: 0.1.0
updated: 2026-10-18
author: ""
license: ""
source: ""
featured: false
draft: false
usage: "把论文 PDF、arXiv 编号或截图交给 agent，并说明输出目录。"
variables:
  - name: paper
    description: "论文 PDF、arXiv 编号或链接"
---

## 它解决什么问题

（这条提示词替谁解决什么问题；不解决什么。）

## 提示词

````text
（提示词原文，逐字粘贴。里面可以有三反引号，所以外层用四反引号。）
````

## 怎么用

（输入是什么、怎么触发、需要哪些前置条件。）

## 输出验收

（怎样判断输出合格；一条一条写。）

## 已知限制

（它做不到什么；需要人工核对什么。）
```

几个关键点：

- **正文不要写一级标题 `#`**。页面标题来自 `title`，正文从 `##` 开始。
- **提示词原文放在四反引号 `text` 块里**。站点关闭了语法高亮，复制按钮复制的是块内纯文本；外层用四个反引号是为了让提示词内部的三反引号不截断代码块。
- 第一个代码块右上角会出现「复制」，标签为 `PROMPT`；后面的代码块标签为 `CODE`。
- `## 提示词` 这个标题不是强制的，但建议保留，方便读者和目录识别。

## 3. 新增一条技能

### 本地交互式创建

```bash
pnpm new:skill
```

会额外询问：

- **安装命令**（一行，可留空）→ 写入 `install`，页面顶部渲染成可复制的 `INSTALL` 代码块。
- **兼容环境**（逗号分隔）→ 写入 `compatibility`，显示在条目信息和右侧速览栏。

### 技能模板

```markdown
---
title: "我的技能"
summary: "一句话说明它能做什么。"
category: 编程
tags: [Agent, 自动化]
models: [Claude Code]
version: 0.1.0
updated: 2026-10-18
author: ""
license: ""
source: ""
featured: false
draft: false
install: "git clone https://github.com/you/skill.git ~/.claude/skills/my-skill"
compatibility: [Claude Code, Cursor]
---

## 它解决什么问题

（替谁解决什么问题；不解决什么。）

## 使用

（怎么触发、输入是什么、输出成什么。）

## 输出验收

- （一条可检查的标准。）

## 已知限制

- （它做不到什么。）
```

`install` 已填写时，页面顶部会先渲染安装块；正文里不必再写一遍 `## 安装`。如果安装需要多步说明，可以在正文写 `## 安装前置` 或 `## 安装说明`，避免和顶部安装块重复。

## 4. 更新已有条目

1. 打开对应的 Markdown 文件。
2. 改正文、frontmatter、标签或模型。
3. 更新 `updated` 为修改当天（`YYYY-MM-DD`）。
4. 按下面的规则改 `version`。
5. 本地跑 `pnpm verify`；网页方式则等 Actions 完成。
6. 提交信息建议写清楚改了什么，例如 `content: clarify prompt output checklist`。

### 版本号怎么改

| 改动 | 建议 |
| --- | --- |
| 错别字、措辞、排版 | patch：`0.1.0 → 0.1.1` |
| 新增规则、输出检查项、使用步骤 | minor：`0.1.0 → 0.2.0` |
| 输入/输出契约变化（变量、路径、流程重写） | major：`0.1.0 → 1.0.0` |

`version` 只是当前版本的标签，**不会生成版本历史页**。需要旧全文时用 Git：

```bash
git log -- src/content/prompts/my-prompt.md
git show <commit>:src/content/prompts/my-prompt.md
```

### 不要做的事

- 不要新建 `my-prompt-v2.md` 来保留旧版；旧版在 Git 历史里。
- 不要为了改标题而重命名文件；标题和 URL 是分开的。
- 不要把已发布的条目改名/换 slug。站点没有重定向，旧链接会 404。
- 不要在正文里写 `#` 一级标题。
- 不要使用 Obsidian 的 `![[...]]` 嵌入；用标准 Markdown 图片语法。

### 分类、标签、精选的影响

- **分类**决定条目进入哪个 `/categories/<slug>/` 页面和色场。改分类会同时改变分类计数和详情页 hero 颜色。
- **标签**决定 `/tags/<tag>/` 页面；标签按 slug 去重，中文会保留。改标签会改变标签页和「相关条目」。
- **`featured: true`** 会让条目优先出现在首页「最新收录」；如果多条都标了，取按更新时间排序后的第一条。建议只保留一条。
- **`draft: true`** 会让条目从列表、路由、sitemap 和搜索里消失；适合还没写完的内容。取消草稿后重新构建即可上线。

## 5. frontmatter 字段

### 通用字段

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `title` | 是 | string | 页面标题，也是列表标题 |
| `summary` | 是 | string | 一句话摘要，最多 200 字；用于列表、搜索、SEO |
| `category` | 是 | enum | 必须是下面 8 个中文分类之一 |
| `updated` | 是 | date | `YYYY-MM-DD`；用于排序和显示 |
| `tags` | 否 | string[] | 自由标签；默认 `[]` |
| `models` | 否 | string[] | 适用模型；默认 `[]`，仅展示，不参与路由 |
| `version` | 否 | string | 当前版本，默认 `0.1.0` |
| `author` | 否 | string | 作者；默认空 |
| `license` | 否 | string | 许可；空显示「未声明」 |
| `source` | 否 | string | 来源；只有 `http(s)://` 会渲染成链接 |
| `featured` | 否 | boolean | 首页精选；默认 `false` |
| `draft` | 否 | boolean | 草稿；默认 `false`，`true` 时不发布 |

### 提示词专用

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `usage` | 否 | string | 一句话用法；填写后显示在详情页右侧速览栏 |
| `variables` | 否 | `{ name, description }[]` | 模板变量；显示在「条目信息」表格 |

### 技能专用

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `install` | 否 | string | 一行安装命令；页面顶部渲染成可复制代码块 |
| `compatibility` | 否 | string[] | 兼容环境；显示在条目信息和右侧速览栏 |

### 分类与色场

| 分类 | slug | 色场 |
| --- | --- | --- |
| 翻译 | `translation` | lake |
| 写作 | `writing` | lotus |
| 编程 | `coding` | moss |
| 研究 | `research` | stone |
| 学习 | `learning` | wheat |
| 效率 | `productivity` | clay |
| 视觉 | `visual` | rouge |
| 其他 | `misc` | sky |

要新增分类，不能只改 Markdown：需要同时改 `src/site.config.ts` 里的 `CATEGORY_NAMES` 和 `CATEGORIES`（name / slug / tone / description），并确认条目使用的 `category` 在新枚举里。分类是固定入口，建议先讨论再改。

## 6. 正文、图片与链接

### 正文

- 正文从 `##` 开始；页面唯一的 `<h1>` 来自页面标题。
- 段落之间空一行；列表用 `-`；表格用标准 Markdown。
- 提示词/代码使用围栏代码块。提示词原文建议用四个反引号 + `text`。
- 不要用「（此处略）」「同上」「详见原文」跳过内容；写不了就写限制。

### 图片

1. 把图片放在 `public/images/<slug>/`，例如 `public/images/my-prompt/cover.png`。
2. 正文用根路径引用：

```markdown
![图 1：流程示意](/images/my-prompt/cover.png)
```

3. 构建时会自动加 GitHub Pages 的 base path；不要手动写 `/prompts-and-skills/`。
4. 每张图都要有 alt；没有 alt 的图在验收清单里算不合格。
5. 不要用 `![[cover.png]]`。Obsidian 的 wiki 嵌入按文件名全库解析，同名图会互相覆盖；本站只认标准 Markdown。

### 链接

- 站内链接写根路径，例如 `[关于](/about/)`、`[翻译分类](/categories/translation/)`；构建时自动加 base。
- 外链直接写完整 `https://`；`source` 字段只有 http(s) 会变成链接。
- 不要写 `localhost` 链接。

## 7. 本地预览与验证

```bash
pnpm install
pnpm dev        # http://localhost:4321/
pnpm verify     # astro check + build + 结构审查 + 链接检查
pnpm preview    # 预览 dist
```

`pnpm verify` 会检查：

- 每页恰好一个 `<h1>`；
- 没有内联 `<style>`、`style=`、外链样式/脚本；
- 没有非 0 圆角；
- 所有站内链接和静态资源都能在 `dist/` 找到；
- 页面有 `lang="zh-CN"`、viewport 和 404 页。

子路径构建（本地模拟 GitHub Pages）：

```bash
# Git Bash / MSYS 会把以 / 开头的值当路径转换；不要写前导斜杠
BASE_PATH=prompts-and-skills pnpm build
pnpm preview
```

PowerShell：

```powershell
$env:BASE_PATH = 'prompts-and-skills'
pnpm build
```

## 8. 发布

### GitHub 网页方式

1. 改完文件，Commit changes 到 `main`。
2. 打开仓库的 **Actions**，等 `Deploy to GitHub Pages` 变绿。
3. 打开 <https://knink-owo.github.io/prompts-and-skills/>，按 `Ctrl+F5` 清缓存。

### 本地方式

```bash
pnpm verify
git add -A
git commit -m "content: add my prompt"
git push origin main
```

推送后由 `.github/workflows/deploy.yml` 自动构建和部署；不需要手动上传 `dist/`。

## 9. 上线前检查清单

- [ ] 文件名是 ASCII kebab-case，且发布后不打算再改
- [ ] `title`、`summary`（≤200 字）、`category`、`updated` 都填了
- [ ] `category` 是 8 个分类之一；没有拼写错误
- [ ] 正文没有 `#` 一级标题
- [ ] 提示词原文在四反引号 `text` 块里；复制按钮可用
- [ ] 图片在 `public/images/<slug>/`，有 alt，使用根路径
- [ ] 没有 `![[...]]`；没有「此处略」「同上」
- [ ] 标签拼写与已有标签一致；模型列表准确
- [ ] 更新了 `updated`；按规则改了 `version`
- [ ] `pnpm verify` 全绿（或 Actions 绿）
- [ ] 1440 / 1024 / 768 / 390 宽度无横向滚动；复制、搜索、标签页正常
- [ ] 提交信息说明了改什么

## 10. 常见问题

**条目没出现？**
先看 `draft` 是否为 `true`；再看 `category` 是否在枚举里；最后看 Actions / `pnpm verify` 是否报错。`src/content/skills/_template.md` 是草稿，不会出现。

**可以改文件名吗？**
可以，但 URL 会变，旧链接会 404。本站没有重定向；已发布的条目不建议改名。标题可以随便改，URL 由文件名决定。

**旧版本去哪了？**
没有版本历史页。`version` 只是当前标签；旧全文在 Git 提交记录里，用 `git log` / `git show` 查。不要复制旧文件到内容目录。

**搜索为什么搜不到？**
搜索索引在构建时生成，字段是标题、摘要、分类、标签、模型；新内容要重新构建/部署。搜索不覆盖正文全文。

**技能安装命令显示两遍？**
`install` 字段会渲染顶部安装块；正文不要再写 `## 安装`。需要补充步骤时用 `## 安装说明`。

**可以加新分类吗？**
可以，但这是代码改动：编辑 `src/site.config.ts` 的 `CATEGORY_NAMES` 和 `CATEGORIES`，选一个未使用的 tone，并确保所有条目 `category` 在新枚举里。改完跑 `pnpm verify`。

**图片太大怎么办？**
先压缩到合理尺寸再提交；站点没有图片优化管线，原图会直接发布。放在 `public/images/<slug>/`，不要放到 `src/content` 里。

**能不能只改样式？**
可以。样式在 `public/design/tokens.css` 和 `public/design/site.css`，交互在 `public/design/site.js`；不要引入外部字体、CDN、框架或图标库，保持 0 圆角和 1px 描边。
