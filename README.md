# PROMPT INDEX

一个用来收藏、展示、检索自己提示词（prompts）与技能（skills）的静态站点。中文优先，纯静态部署到 GitHub Pages，没有后端、没有数据库、没有运行时框架。

## 技术栈

- **Astro 7**：构建期把 Markdown 内容集合渲染成 HTML。
- **INK 设计语言**：`public/design/tokens.css` + `site.css` + `site.js`；0 圆角、1px 描边、八色场、系统字体。
- **运行时零依赖**：页面只引 `tokens.css`、`site.css`、`site.js`、`favicon.svg`；没有客户端框架、CDN、外链字体或图标库。
- **搜索**：构建期把标题、摘要、标签、模型、分类写进每个条目的 `data-search-text`，运行时由 `site.js` 就地过滤；没有搜索服务。

## 快速开始

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:4321/`。构建与完整验证：

```bash
pnpm build       # astro check + astro build
pnpm verify      # build + 结构审查 + 链接检查
pnpm preview     # 预览 dist
```

## 内容

内容全部是仓库里的 Markdown：

```text
src/content/
  prompts/
    academic-paper-obsidian-translator.md
  skills/            # _template.md 是草稿模板；正式技能用 pnpm new:skill
```

新增条目：

```bash
pnpm new:prompt
pnpm new:skill
```

脚本会问标题、摘要、分类、标签、模型和文件名 slug，生成合法 frontmatter 与正文骨架；同名文件已存在时拒绝覆盖。也可以直接复制已有 Markdown 手写。

### Frontmatter

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 条目标题，页面唯一 `<h1>` 的来源之一 |
| `summary` | 是 | 一句话摘要，≤200 字；列表与搜索用 |
| `category` | 是 | 必须是 8 个分类之一（见下表） |
| `tags` | 否 | 字符串数组；标签页按 slug 去重 |
| `models` | 否 | 适用模型，字符串数组 |
| `version` | 否 | 默认 `0.1.0` |
| `updated` | 否 | `YYYY-MM-DD`；列表按它倒序 |
| `author` / `license` / `source` | 否 | 空字符串表示未填 |
| `featured` | 否 | 首页精选候选 |
| `draft` | 否 | `true` 时不进入构建 |
| `usage` | prompts 可选 | 使用说明 |
| `variables` | prompts 可选 | 变量名数组 |
| `install` | skills 可选 | 一行安装命令 |
| `compatibility` | skills 可选 | 兼容平台数组 |

### 分类与色场

| 分类 | slug | INK tone |
| --- | --- | --- |
| 翻译 | `translation` | lake |
| 写作 | `writing` | lotus |
| 编程 | `coding` | moss |
| 研究 | `research` | stone |
| 学习 | `learning` | wheat |
| 效率 | `productivity` | clay |
| 视觉 | `visual` | rouge |
| 其他 | `misc` | sky |

分类只取 INK 已有的 8 个色场；不新增色相，不做暗色模式。

## 路由

| 路径 | 内容 |
| --- | --- |
| `/` | 首页：大标题、色墙、最新条目、引导 |
| `/prompts/` | 提示词列表，带搜索与分类 chip |
| `/prompts/<slug>/` | 提示词详情：正文、复制按钮、元信息、相关条目 |
| `/skills/` | 技能列表；无条目时显示有意留白 |
| `/skills/<slug>/` | 技能详情：安装块、正文、元信息 |
| `/catalog/` | 8 个分类 + 全部标签，带计数 |
| `/categories/<slug>/` | 分类列表 |
| `/tags/<tag>/` | 标签列表 |
| `/search/` | 跨 prompts/skills 搜索 |
| `/about/` | 站点说明、收录方式、字段表 |
| `/404.html` | 未找到 |
| `/sitemap.xml`、`/robots.txt`、`/llms.txt` | 构建期生成 |

## GitHub Pages 部署

仓库已带 `.github/workflows/deploy.yml`：推 `main` 或手动触发，安装、`pnpm verify`、上传 `dist`、部署 Pages。

1. 在仓库 **Settings → Pages → Build and deployment** 选择 **GitHub Actions**。
2. 推送到 `main`。
3. 首次部署后，站点地址通常是：
   - 用户/组织页仓库 `<user>.github.io`：`https://<user>.github.io/`
   - 项目页仓库：`https://<user>.github.io/<repo>/`

工作流用 `actions/configure-pages` 的 `origin` 与 `base_path` 注入 `SITE_URL` / `BASE_PATH`，不需要手改仓库地址。

本地模拟项目页子路径：

```bash
BASE_PATH=prompts-and-skills SITE_URL=https://example.github.io pnpm build
BASE_PATH=prompts-and-skills pnpm preview
```

> Windows Git Bash / MSYS 会把以 `/` 开头的环境变量值当成路径转换（`/prompts-and-skills` 可能变成 `C:/.../prompts-and-skills`），所以这里特意不写前导斜杠。若必须保留 `/`，加 `MSYS_NO_PATHCONV=1`。GitHub Actions 在 Linux 上直接使用 `base_path`，不受影响。

PowerShell：

```powershell
$env:BASE_PATH='prompts-and-skills'; $env:SITE_URL='https://example.github.io'; pnpm build
```

`SITE_URL` 只影响 canonical、sitemap、robots、llms.txt 的绝对地址；`BASE_PATH` 影响所有站内链接与静态资源前缀。站点名称、副标题与仓库地址在 `src/site.config.ts` 的 `SITE` 中；`repo` 留空时关于页不显示 GitHub 链接。

## 设计约束

- 只用 `public/design/` 里的 INK token 与 class；页面不写 `<style>`、不写 `style=`。
- 不引入新色相、圆角、渐变、玻璃拟态、阴影、暗色模式。
- 每页一个 `<h1>`；图片必须有 `alt`；键盘可操作；`prefers-reduced-motion` 降级。
- 项目级扩展集中在 `site.css` 末尾的「项目扩展」段：`.prose`、`.filter-bar`、`.chapter-row__meta`、`.wall-band__count`、`.chip[aria-pressed]`、`[hidden]`，以及补全的 `.chapter-row--sky/--wheat/--rouge`。
- 代码块由 `site.js` 在运行时包成 `.code-block` 并加复制按钮；`syntaxHighlight: false` 保证复制出来是原文，不带高亮 span。

## 脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm new:prompt` | 交互式创建 prompt Markdown |
| `pnpm new:skill` | 交互式创建 skill Markdown |
| `node scripts/audit-build.mjs` | 检查每页一个 h1、无内联样式/脚本、无外链资源、0 圆角 |
| `node scripts/check-links.mjs` | 检查 dist 内所有站内链接可解析（含 base 前缀） |

## 验证清单

- `pnpm verify` 通过。
- 1440 / 1024 / 768 / 390 四个宽度无横向溢出；首屏不塌。
- Tab 能走完导航 → 搜索 → 列表 → 复制；复制按钮显示「已复制」。
- 搜索输入即时过滤；清空恢复全部；无结果显示空状态。
- 直接访问 `/prompts/<slug>/`、`/tags/<tag>/`、`/search/` 不 404。
- GitHub Pages 子路径下刷新详情页不 404（`trailingSlash: 'always'` + 目录格式）。

## 内容与许可

站点代码用于展示你自己的提示词与技能。每条内容的许可由 frontmatter 的 `license` 字段声明；未填写的条目默认保留所有权利。
