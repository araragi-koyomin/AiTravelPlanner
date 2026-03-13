# Git 工作流文档

本文档详细说明 AI 旅行规划师项目的 Git 工作流，包括分支策略、提交规范、Code Review 流程和发布流程。

## 📋 目录

- [工作流概述](#工作流概述)
- [分支策略](#分支策略)
- [提交规范](#提交规范)
- [分支管理](#分支管理)
- [Code Review 流程](#code-review-流程)
- [发布流程](#发布流程)
- [冲突解决](#冲突解决)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 工作流概述

### 工作流类型

本项目采用 **Git Flow** 工作流，适合有明确发布周期的项目。

### 工作流特点

- ✅ 清晰的分支结构
- ✅ 明确的发布周期
- ✅ 支持紧急修复
- ✅ 易于追踪变更
- ✅ 支持并行开发

### 分支类型

| 分支类型 | 用途 | 生命周期 |
|---------|------|---------|
| `main` | 生产环境代码 | 永久 |
| `develop` | 开发分支 | 永久 |
| `feature/*` | 功能开发 | 临时 |
| `bugfix/*` | Bug 修复 | 临时 |
| `hotfix/*` | 紧急修复 | 临时 |
| `release/*` | 发布准备 | 临时 |

---

## 分支策略

### 分支结构图

```
main (生产)
  ↑
  │ merge
  │
release/* (发布)
  ↑
  │ merge
  │
develop (开发)
  ↑
  │ merge
  │
feature/* (功能)
bugfix/* (修复)
```

### 1. main 分支

**用途**：生产环境代码，始终保持稳定可发布状态。

**规则**：
- ✅ 只接受来自 `release/*` 或 `hotfix/*` 的合并
- ✅ 每次合并打 tag（如 `v1.0.0`）
- ✅ 禁止直接提交
- ✅ 禁止强制推送

**保护规则**：

```bash
# GitHub 设置
Settings → Branches → Add rule
- Branch name pattern: main
- Require pull request reviews before merging: 1 approval
- Require status checks to pass before merging
- Do not allow bypassing the above settings
```

### 2. develop 分支

**用途**：开发分支，集成了最新的功能开发。

**规则**：
- ✅ 只接受来自 `feature/*`、`bugfix/*` 的合并
- ✅ 禁止直接提交
- ✅ 禁止强制推送

**保护规则**：

```bash
# GitHub 设置
Settings → Branches → Add rule
- Branch name pattern: develop
- Require pull request reviews before merging: 1 approval
- Require status checks to pass before merging
```

### 3. feature/* 分支

**用途**：开发新功能，从 `develop` 分支创建。

**命名规范**：

```bash
feature/<feature-name>
```

**示例**：

```bash
feature/itinerary-generation
feature/expense-manager
feature/speech-recognition
```

**生命周期**：

1. 从 `develop` 创建
2. 开发功能
3. 提交 Pull Request 到 `develop`
4. 通过 Code Review
5. 合并到 `develop`
6. 删除分支

**创建示例**：

```bash
# 切换到 develop 分支
git checkout develop

# 拉取最新代码
git pull origin develop

# 创建功能分支
git checkout -b feature/itinerary-generation
```

### 4. bugfix/* 分支

**用途**：修复非紧急的 Bug，从 `develop` 分支创建。

**命名规范**：

```bash
bugfix/<bug-description>
```

**示例**：

```bash
bugfix/login-error
bugfix/budget-calculation
bugfix/map-display
```

**生命周期**：

1. 从 `develop` 创建
2. 修复 Bug
3. 提交 Pull Request 到 `develop`
4. 通过 Code Review
5. 合并到 `develop`
6. 删除分支

**创建示例**：

```bash
# 切换到 develop 分支
git checkout develop

# 拉取最新代码
git pull origin develop

# 创建修复分支
git checkout -b bugfix/login-error
```

### 5. hotfix/* 分支

**用途**：紧急修复生产环境的严重 Bug，从 `main` 分支创建。

**命名规范**：

```bash
hotfix/<bug-description>
```

**示例**：

```bash
hotfix/security-vulnerability
hotfix/critical-bug
```

**生命周期**：

1. 从 `main` 创建
2. 修复 Bug
3. 提交 Pull Request 到 `main`
4. 通过 Code Review
5. 合并到 `main`
6. 打 tag（如 `v1.0.1`）
7. 合并回 `develop`
8. 删除分支

**创建示例**：

```bash
# 切换到 main 分支
git checkout main

# 拉取最新代码
git pull origin main

# 创建紧急修复分支
git checkout -b hotfix/security-vulnerability
```

### 6. release/* 分支

**用途**：准备发布，从 `develop` 分支创建。

**命名规范**：

```bash
release/<version>
```

**示例**：

```bash
release/v1.0.0
release/v1.1.0
```

**生命周期**：

1. 从 `develop` 创建
2. 修复发布相关的 Bug
3. 更新版本号
4. 更新 CHANGELOG
5. 提交 Pull Request 到 `main`
6. 通过 Code Review
7. 合并到 `main`
8. 打 tag（如 `v1.0.0`）
9. 合并回 `develop`
10. 删除分支

**创建示例**：

```bash
# 切换到 develop 分支
git checkout develop

# 拉取最新代码
git pull origin develop

# 创建发布分支
git checkout -b release/v1.0.0
```

---

## 提交规范

### 提交信息格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(itinerary): add AI itinerary generation` |
| `fix` | 修复 bug | `fix(auth): resolve login failure` |
| `docs` | 文档更新 | `docs(readme): update installation instructions` |
| `style` | 代码格式调整 | `style(ui): fix indentation` |
| `refactor` | 重构 | `refactor(api): simplify API structure` |
| `perf` | 性能优化 | `perf(map): optimize map rendering` |
| `test` | 测试相关 | `test(auth): add login tests` |
| `chore` | 构建过程或辅助工具的变动 | `chore(deps): update dependencies` |
| `ci` | CI/CD 配置文件和脚本的变动 | `ci(github): add workflow` |
| `revert` | 回滚之前的 commit | `revert: feat(itinerary)` |

### Scope 范围

| Scope | 说明 | 示例 |
|-------|------|------|
| `auth` | 认证相关 | `feat(auth): add OAuth login` |
| `itinerary` | 行程相关 | `feat(itinerary): add itinerary generation` |
| `expense` | 费用相关 | `fix(expense): fix budget calculation` |
| `map` | 地图相关 | `feat(map): add route planning` |
| `speech` | 语音相关 | `feat(speech): add speech recognition` |
| `ui` | UI 组件 | `style(ui): fix button styles` |
| `api` | API 服务 | `fix(api): resolve API error` |
| `db` | 数据库 | `feat(db): add user_settings table` |
| `config` | 配置文件 | `chore(config): update env variables` |
| `docs` | 文档 | `docs(readme): update README` |
| `deploy` | 部署 | `feat(deploy): add Docker configuration` |

### Subject 主题

- ✅ 使用现在时态："add" 而不是 "added"
- ✅ 首字母小写
- ✅ 结尾不加句号
- ✅ 不超过 50 个字符

### Body 正文

- ✅ 每行不超过 72 个字符
- ✅ 说明"是什么"和"为什么"，而不是"怎么做"
- ✅ 使用现在时态和祈使语气

### Footer 脚注

- ✅ 列出相关的 Issue
- ✅ 列出 Breaking Changes

### 提交示例

#### 示例 1：新功能

```
feat(itinerary): add AI itinerary generation

Implement AI-powered itinerary generation using Zhipu AI GLM-4 model.
Users can now generate personalized travel plans by inputting
destination, dates, budget, and preferences.

Closes #123
```

#### 示例 2：修复 Bug

```
fix(auth): resolve login failure with special characters

Users with special characters in email addresses were unable to login.
This issue has been fixed by properly encoding email addresses
before sending to Supabase Auth.

Fixes #45
```

#### 示例 3：文档更新

```
docs(readme): update installation instructions

Add detailed steps for setting up environment variables and
configuring external API keys.
```

#### 示例 4：重构

```
refactor(api): simplify API structure

Refactor API layer to use a more modular architecture.
This improves code maintainability and makes it easier to
add new API endpoints in the future.

BREAKING CHANGE: API response format has changed.
```

### 提交模板

项目提供了提交模板，位于 `.trae/templates/commit_message.txt`：

```
<type>(<scope>): <subject>

<body>

<footer>

# Type: feat, fix, docs, style, refactor, perf, test, chore, ci, revert
# Scope: auth, itinerary, expense, map, speech, ui, api, db, config, docs, deploy
# Subject: 简短描述（不超过50个字符）
# Body: 详细说明（每行不超过72个字符）
# Footer: 相关 Issue 或 Breaking Changes
```

### 使用提交模板

```bash
# 配置 Git 使用提交模板
git config commit.template .trae/templates/commit_message.txt

# 提交时，Git 会自动加载模板
git commit
```

---

## 分支管理

### 创建分支

#### 创建功能分支

```bash
# 切换到 develop 分支
git checkout develop

# 拉取最新代码
git pull origin develop

# 创建功能分支
git checkout -b feature/itinerary-generation
```

#### 创建修复分支

```bash
# 切换到 develop 分支
git checkout develop

# 拉取最新代码
git pull origin develop

# 创建修复分支
git checkout -b bugfix/login-error
```

#### 创建紧急修复分支

```bash
# 切换到 main 分支
git checkout main

# 拉取最新代码
git pull origin main

# 创建紧急修复分支
git checkout -b hotfix/security-vulnerability
```

#### 创建发布分支

```bash
# 切换到 develop 分支
git checkout develop

# 拉取最新代码
git pull origin develop

# 创建发布分支
git checkout -b release/v1.0.0
```

### 切换分支

```bash
# 切换到已有分支
git checkout develop

# 切换并创建新分支
git checkout -b feature/new-feature

# 切换到上一个分支
git checkout -
```

### 查看分支

```bash
# 查看本地分支
git branch

# 查看远程分支
git branch -r

# 查看所有分支（本地和远程）
git branch -a

# 查看分支详情
git branch -vv
```

### 删除分支

```bash
# 删除本地分支（已合并）
git branch -d feature/itinerary-generation

# 强制删除本地分支（未合并）
git branch -D feature/itinerary-generation

# 删除远程分支
git push origin --delete feature/itinerary-generation
```

### 合并分支

#### 合并到 develop

```bash
# 切换到 develop 分支
git checkout develop

# 拉取最新代码
git pull origin develop

# 合并功能分支
git merge feature/itinerary-generation

# 推送到远程
git push origin develop
```

#### 合并到 main

```bash
# 切换到 main 分支
git checkout main

# 拉取最新代码
git pull origin main

# 合并发布分支
git merge release/v1.0.0

# 推送到远程
git push origin main
```

### 变基（Rebase）

```bash
# 变基到 develop
git checkout feature/itinerary-generation
git rebase develop

# 变基到 main
git checkout hotfix/security-vulnerability
git rebase main
```

**注意**：
- ✅ 只在本地分支上使用 rebase
- ✅ 不要在公共分支上使用 rebase
- ✅ rebase 前先备份分支

---

## Code Review 流程

### Pull Request 流程

#### 1. 创建 Pull Request

```bash
# 推送分支到远程
git push origin feature/itinerary-generation

# 在 GitHub 上创建 Pull Request
# 或使用 GitHub CLI
gh pr create --title "feat(itinerary): add AI itinerary generation" --body "..."
```

#### 2. Pull Request 模板

项目提供了 PR 模板，位于 `.trae/templates/pull_request_template.md`：

```markdown
## 变更说明
<!-- 简要描述本次变更的内容 -->

## 变更类型
<!-- 选择变更类型 -->
- [ ] 新功能 (feat)
- [ ] Bug 修复 (fix)
- [ ] 文档更新 (docs)
- [ ] 代码格式调整 (style)
- [ ] 重构 (refactor)
- [ ] 性能优化 (perf)
- [ ] 测试相关 (test)
- [ ] 构建过程或辅助工具的变动 (chore)
- [ ] CI/CD 配置文件和脚本的变动 (ci)

## 相关 Issue
<!-- 关联的 Issue 编号 -->
Closes #xxx

## 测试
<!-- 描述测试步骤 -->
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过

## 截图（可选）
<!-- 如果有 UI 变更，请提供截图 -->

## 检查清单
<!-- 确保以下检查项已完成 -->
- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 TypeScript 类型检查
- [ ] 代码通过 Prettier 格式化
- [ ] 添加必要的注释
- [ ] 更新相关文档
- [ ] 编写有意义的提交信息
- [ ] 确保没有敏感信息泄露
```

#### 3. Code Review 检查项

**代码质量**：
- [ ] 代码符合项目规范
- [ ] 代码可读性好
- [ ] 代码有必要的注释
- [ ] 没有明显的性能问题

**功能正确性**：
- [ ] 功能按需求实现
- [ ] 边界情况处理
- [ ] 错误处理完善

**测试**：
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 测试覆盖率足够

**文档**：
- [ ] 更新了相关文档
- [ ] API 文档更新
- [ ] README 更新

**安全性**：
- [ ] 没有 API Key 硬编码
- [ ] 用户输入验证
- [ ] 没有安全漏洞

#### 4. Review 反馈

**提供反馈**：
- ✅ 使用 GitHub 的 Review 功能
- ✅ 提供具体的改进建议
- ✅ 解释为什么需要修改
- ✅ 保持礼貌和建设性

**接受反馈**：
- ✅ 认真考虑所有反馈
- ✅ 及时回复问题
- ✅ 必要时修改代码
- ✅ 标记已解决的评论

#### 5. 合并 Pull Request

**合并前检查**：
- [ ] 所有 Reviewer 批准
- [ ] CI 检查通过
- [ ] 没有冲突
- [ ] 更新了 CHANGELOG

**合并方式**：
- **Squash and merge**：推荐，保持提交历史清晰
- **Merge commit**：保留完整历史
- **Rebase and merge**：不推荐，会改变历史

**合并步骤**：

```bash
# 在 GitHub 上点击 "Merge pull request"
# 或使用 GitHub CLI
gh pr merge --squash
```

#### 6. 删除分支

```bash
# 删除本地分支
git branch -d feature/itinerary-generation

# 删除远程分支
git push origin --delete feature/itinerary-generation

# 或在 GitHub 上点击 "Delete branch"
```

---

## 发布流程

### 版本号规范

遵循 [Semantic Versioning](https://semver.org/) 规范：

```
MAJOR.MINOR.PATCH

- MAJOR: 不兼容的 API 变更
- MINOR: 向后兼容的功能新增
- PATCH: 向后兼容的 Bug 修复
```

**示例**：
- `v1.0.0`：第一个稳定版本
- `v1.1.0`：新增功能
- `v1.1.1`：修复 Bug
- `v2.0.0`：不兼容的变更

### 发布流程

#### 1. 创建发布分支

```bash
# 从 develop 创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
```

#### 2. 更新版本号

更新 `package.json`：

```json
{
  "version": "1.0.0"
}
```

#### 3. 更新 CHANGELOG

更新 `CHANGELOG.md`：

```markdown
## [1.0.0] - 2024-03-12

### Added
- AI 行程规划功能
- 费用管理功能
- 语音输入功能
- 地图集成

### Fixed
- 修复登录问题
- 修复预算计算问题

### Changed
- 重构 API 层
```

#### 4. 提交变更

```bash
git add package.json CHANGELOG.md
git commit -m "chore(release): prepare for v1.0.0 release"
```

#### 5. 合并到 main

```bash
# 切换到 main 分支
git checkout main

# 合并发布分支
git merge release/v1.0.0

# 打 tag
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送到远程
git push origin main
git push origin v1.0.0
```

#### 6. 合并回 develop

```bash
# 切换到 develop 分支
git checkout develop

# 合并发布分支
git merge release/v1.0.0

# 推送到远程
git push origin develop
```

#### 7. 删除发布分支

```bash
# 删除本地分支
git branch -d release/v1.0.0

# 删除远程分支
git push origin --delete release/v1.0.0
```

### 紧急修复流程

#### 1. 创建紧急修复分支

```bash
# 从 main 创建紧急修复分支
git checkout main
git pull origin main
git checkout -b hotfix/security-vulnerability
```

#### 2. 修复 Bug

```bash
# 修复代码
git add .
git commit -m "fix(security): resolve security vulnerability"
```

#### 3. 合并到 main

```bash
# 切换到 main 分支
git checkout main

# 合并紧急修复分支
git merge hotfix/security-vulnerability

# 打 tag
git tag -a v1.0.1 -m "Release v1.0.1 (hotfix)"

# 推送到远程
git push origin main
git push origin v1.0.1
```

#### 4. 合并回 develop

```bash
# 切换到 develop 分支
git checkout develop

# 合并紧急修复分支
git merge hotfix/security-vulnerability

# 推送到远程
git push origin develop
```

#### 5. 删除紧急修复分支

```bash
# 删除本地分支
git branch -d hotfix/security-vulnerability

# 删除远程分支
git push origin --delete hotfix/security-vulnerability
```

---

## 冲突解决

### 冲突类型

1. **合并冲突**：合并分支时出现冲突
2. **变基冲突**：变基时出现冲突
3. **Pull Request 冲突**：PR 时出现冲突

### 解决合并冲突

#### 1. 查看冲突

```bash
# 尝试合并
git merge feature/itinerary-generation

# 查看冲突文件
git status
```

#### 2. 解决冲突

打开冲突文件，查找冲突标记：

```
<<<<<<< HEAD
当前分支的代码
=======
合并分支的代码
>>>>>>> feature/itinerary-generation
```

**解决方法**：
- 保留需要的代码
- 删除冲突标记
- 保存文件

#### 3. 标记冲突已解决

```bash
# 标记冲突已解决
git add <conflicted-file>

# 继续合并
git commit
```

#### 4. 推送到远程

```bash
# 推送到远程
git push origin develop
```

### 解决变基冲突

#### 1. 开始变基

```bash
# 开始变基
git rebase develop
```

#### 2. 解决冲突

```bash
# 查看冲突
git status

# 解决冲突
# 编辑冲突文件

# 标记冲突已解决
git add <conflicted-file>

# 继续变基
git rebase --continue
```

#### 3. 强制推送

```bash
# 强制推送（谨慎使用）
git push origin feature/itinerary-generation --force-with-lease
```

### 解决 Pull Request 冲突

#### 1. 更新分支

```bash
# 切换到功能分支
git checkout feature/itinerary-generation

# 拉取最新代码
git pull origin develop

# 或使用 rebase
git pull origin develop --rebase
```

#### 2. 解决冲突

```bash
# 解决冲突
git add <conflicted-file>
git commit

# 推送到远程
git push origin feature/itinerary-generation
```

---

## 最佳实践

### 提交最佳实践

1. **频繁提交**：小步快跑，频繁提交
2. **原子提交**：每次提交只做一件事
3. **清晰的提交信息**：遵循 Conventional Commits 规范
4. **提交前检查**：运行 lint、test、build

```bash
# 提交前检查
pnpm lint
pnpm test
pnpm build

# 提交
git add .
git commit -m "feat(itinerary): add AI itinerary generation"
```

### 分支最佳实践

1. **保持分支简洁**：不要在分支上停留太久
2. **及时同步**：定期从主分支拉取最新代码
3. **删除无用分支**：合并后及时删除分支

```bash
# 定期同步
git checkout feature/itinerary-generation
git pull origin develop

# 删除无用分支
git branch -d feature/itinerary-generation
git push origin --delete feature/itinerary-generation
```

### Code Review 最佳实践

1. **及时 Review**：收到 PR 后尽快 Review
2. **提供建设性反馈**：具体、礼貌、有帮助
3. **关注代码质量**：不仅仅是功能正确性
4. **学习他人代码**：通过 Review 学习

### 发布最佳实践

1. **版本号规范**：遵循 Semantic Versioning
2. **更新 CHANGELOG**：记录所有变更
3. **测试充分**：发布前充分测试
4. **回滚准备**：准备好回滚方案

---

## 常见问题

### Q1: 如何撤销提交？

**撤销最后一次提交（保留更改）**：

```bash
git reset --soft HEAD~1
```

**撤销最后一次提交（不保留更改）**：

```bash
git reset --hard HEAD~1
```

**撤销多次提交**：

```bash
git reset --hard HEAD~3
```

### Q2: 如何修改提交信息？

**修改最后一次提交**：

```bash
git commit --amend
```

**修改历史提交**：

```bash
# 使用 rebase 交互模式
git rebase -i HEAD~3

# 将 pick 改为 reword
# 保存并编辑提交信息
```

### Q3: 如何查看提交历史？

**查看提交历史**：

```bash
# 简洁查看
git log --oneline

# 查看图形化历史
git log --graph --oneline --all

# 查看特定文件的提交历史
git log --follow -- filename
```

### Q4: 如何查看文件变更？

**查看工作区变更**：

```bash
git diff
```

**查看已暂存的变更**：

```bash
git diff --staged
```

**查看某次提交的变更**：

```bash
git show <commit-hash>
```

### Q5: 如何暂存更改？

**暂存当前更改**：

```bash
git stash
```

**暂存并添加说明**：

```bash
git stash save "work in progress"
```

**恢复暂存的更改**：

```bash
git stash pop
```

**查看暂存列表**：

```bash
git stash list
```

### Q6: 如何回滚远程分支？

**回滚到指定提交**：

```bash
# 回滚本地分支
git reset --hard <commit-hash>

# 强制推送（谨慎使用）
git push origin main --force-with-lease
```

### Q7: 如何合并多个提交？

**使用 rebase 交互模式**：

```bash
# 合并最近 3 次提交
git rebase -i HEAD~3

# 将后两个提交的 pick 改为 squash
# 保存并编辑提交信息
```

### Q8: 如何查看分支差异？

**查看两个分支的差异**：

```bash
git diff develop main
```

**查看特定文件的差异**：

```bash
git diff develop main -- src/components/Button.tsx
```

---

## 参考资料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Git 官方文档](https://git-scm.com/doc)

---

**文档版本**：v1.0
**最后更新**：2026-03-12
**维护者**：项目开发者
