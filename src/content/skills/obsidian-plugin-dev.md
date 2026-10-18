---
title: Obsidian 插件开发
summary: 从脚手架到提交的 Obsidian 社区插件开发流程：官方命名与发布规则、随技能自带运行时的构建与校验、L1–L4 分层验证，以及不会冷启动 Obsidian 的安全边界。
category: 编程
tags: [Obsidian, 插件开发, Agent Skill, 工具链]
models: [Claude, GPT, DeepSeek]
version: 1.0.0
updated: 2026-10-18
author: knink-owo
license: MIT
source: https://github.com/knink-owo/dsh-obsidian-plugin-devkit
featured: false
draft: false
install: |
  # 把整个 obsidian-plugin-dev 文件夹复制到 skills 目录后：
  node <skills-dir>/obsidian-plugin-dev/scripts/devkit.mjs --version
compatibility:
  - Node.js >= 20
  - Obsidian >= 1.13.0（声明式设置）
  - Obsidian >= 1.12.4（官方 CLI 重载）
---

## 它解决什么问题

Obsidian 社区插件的失败点往往不在代码，而在流程：插件 id 和描述先被自动审核拒掉，`main.js` 被构建成 ESM，`manifest.json`、`package.json` 与 `versions.json` 版本不同步，发布 tag 多了 `v`，或者只验证了「能编译」就宣称插件可用。

这个技能把流程拆成可执行的检查：

- 用官方模板生成可构建的项目，并在写文件前拦截会被审核拒绝的 id、名称和描述。
- 构建后做静态检查：CommonJS 产物、manifest 一致性、设置 API 与 `minAppVersion` 的匹配。
- 把验证分成 L1 静态、L2 隔离 smoke、L3 真实 vault、L4 人工 UI 四层，明确每一层能证明什么。
- 在部署和重载时保持安全边界：不冷启动 Obsidian、不抢焦点、不擅自启用/停用用户的插件。

## 这个技能包含什么

- `scaffold`：从官方模板集生成项目，默认声明式设置、`minAppVersion` 1.13.0。
- `build`：一次性 `tsc` + esbuild 构建，不做 watcher。
- `validate`：交付前只读审计，覆盖命名、manifest、semver、版本同步、产物形状与发布清单。
- `version`：同步 `manifest.json`、`package.json`、`versions.json`。
- `deploy`：把三个发布文件写入 vault 的插件目录，合并启用列表，不覆盖其他条目。
- `status` / `reload`：只读环境审计与官方 CLI 重载；拿不到证据时报告 `unknown`，不猜测。
- `test`：在 Node VM 里用 stub 的 `obsidian` 模块做 L2 smoke，捕捉 ESM 产物、缺失导出和 import 期崩溃。
- `e2e`：生成沙箱化的 WebdriverIO  harness，但从不替用户运行（首次运行会下载 Obsidian）。

## 安装

技能是自包含的：运行时在 `scripts/` 里，随文件夹一起复制，不需要全局 CLI，也不需要给技能本身执行 `npm install`。

```bash
# 1. 复制整个文件夹到你的 skills 目录（DSH 默认是 ~/.dsh/skills/）
cp -r obsidian-plugin-dev ~/.dsh/skills/

# 2. 确认运行时可用
node ~/.dsh/skills/obsidian-plugin-dev/scripts/devkit.mjs --version

# 3. 从技能目录运行任意命令
cd ~/.dsh/skills/obsidian-plugin-dev
node scripts/devkit.mjs scaffold ./my-plugin --id my-plugin --name "My Plugin"
```

插件项目自己的依赖仍然要装；那是生成项目里的 `pnpm install`，和技能运行时无关。

## 典型流程

```bash
cd ~/.dsh/skills/obsidian-plugin-dev

# 生成项目（id 必须小写、永久、不能包含 obsidian、不能以 plugin 结尾）
node scripts/devkit.mjs scaffold ./my-plugin --id my-plugin --name "My Plugin" --author "Jane"

cd my-plugin
pnpm install
node ../scripts/devkit.mjs build .
node ../scripts/devkit.mjs test .          # L2，不需要 Obsidian
node ../scripts/devkit.mjs deploy .        # 写入 workspace dev-vault
node ../scripts/devkit.mjs reload .        # 需要 Obsidian 正在运行且启用官方 CLI
node ../scripts/devkit.mjs validate .      # 交付前审计
```

发布前用 `version` 同步三个文件，然后打一个与 `manifest.json` 完全一致的 tag（`1.2.0`，不是 `v1.2.0`），在 GitHub Release 附上 `main.js`、`manifest.json`，有样式时再加 `styles.css`。

## 分层验证

| 层 | 命令 | 能证明什么 |
| --- | --- | --- |
| L1 静态 | `build`、`validate` | 产物存在、CommonJS 形状、manifest 与版本同步、设置门禁 |
| L2 隔离 smoke | `test` | 包能在 stub 环境加载，默认导出与生命周期没有 import 期崩溃 |
| L3 真实 vault | `deploy`、`status`、`reload` | 文件就位、应用能看到插件、重载后的只读状态 |
| L4 人工 UI | 人看或截图 | 命令真的出现、弹窗真的打开、设置真的持久化 |

L2 通过不等于真实 API 兼容；`reload` 退出 0 也不等于成功，因为 Obsidian CLI 可能打印 `Error:` 却仍然返回 0。技能要求用只读查询复核，拿不到证据就写 `unknown`。

## 与官方规则对齐

- **id**：小写字母、数字、`_`、`-`，不能含 `obsidian`，不能以 `plugin` 结尾；它同时是安装文件夹名，首次发布后不能改。
- **name**：基本拉丁字符，不含 `Obsidian`，不以 `Plugin` 结尾，不覆盖核心插件名。
- **description**：不超过 250 字符，不以 emoji 结尾，必须以 `.`、`!` 或 `?` 结尾；不要用「This plugin」开头，也不要再提 Obsidian。
- **发布**：tag 必须等于 `manifest.json` 的版本；Release 只附 `main.js`、`manifest.json`，有样式时加 `styles.css`。
- **政策**：不混淆代码、不内置广告、不做客户端遥测、不自我更新、不下载并执行远程代码；网络只用于描述中声明的功能。

## 已知限制

- 运行时是 vendored 版本（v1.0.0），报告文本里仍可能写 `obsidian-devkit`；实际执行的是 `node scripts/devkit.mjs`。
- 需要 Node.js >= 20；没有全局命令，也没有 `install-skill` 子命令，安装方式就是复制技能文件夹。
- `reload` 依赖 Obsidian 官方 CLI（>= 1.12.4）且应用正在运行；没有它时只能走文件级 `deploy`。
- `e2e` 只生成/审计 harness，不运行测试；首次运行会下载数百 MB 的 Obsidian，这是人工或 CI 的决定。
- 技能不会替用户冷启动 Obsidian、抢焦点或修改未授权的 vault。

## 原文

- [dsh-obsidian-plugin-devkit](https://github.com/knink-owo/dsh-obsidian-plugin-devkit)
- [SKILL.md](https://github.com/knink-owo/dsh-obsidian-plugin-devkit/blob/main/skill/obsidian-plugin-dev/SKILL.md)
- [运行时说明](https://github.com/knink-owo/dsh-obsidian-plugin-devkit/blob/main/skill/obsidian-plugin-dev/scripts/README.md)
