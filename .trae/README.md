# .trae 目录说明

此目录包含项目开发过程中使用的配置文件、模板和规则文档。

## 📁 目录结构

```
.trae/
├── rules/                    # 项目规则文档
│   └── project_rules.md     # 项目开发规范
└── templates/               # 模板文件
    ├── commit_message.txt    # Git 提交信息模板
    ├── pr_template.md       # Pull Request 模板
    ├── issue_bug_template.md    # Bug 报告模板
    └── issue_feature_template.md # 功能请求模板
```

## 📋 文件说明

### rules/project_rules.md

项目开发规范文档，包含：

- **命令行工具使用规范**：优先使用 cmd 而非 PowerShell
- **Git 提交规范**：提交信息格式、类型、范围
- **代码规范**：TypeScript、React、样式、命名规范
- **代码审查清单**：提交前检查、功能检查、安全检查
- **分支策略**：分支命名、工作流
- **项目命令**：开发、代码质量、测试、Git 命令
- **文档规范**：代码注释、文档更新
- **环境变量管理**：安全的环境变量使用方式
- **依赖管理**：依赖包更新和检查
- **性能优化**：代码分割、懒加载、缓存策略
- **错误处理**：统一的错误处理机制
- **安全规范**：API Key 管理、输入验证、HTTPS
- **开发工具推荐**：VS Code 扩展、浏览器扩展
- **常见问题**：开发过程中的常见问题和解决方案

### templates/commit_message.txt

Git 提交信息模板，包含：

- Type 类型说明（feat、fix、docs 等）
- Scope 范围说明（auth、itinerary、expense 等）
- Subject 主题说明（格式要求）
- Body 正文说明（可选）
- Footer 脚注说明（可选）
- 完整的示例

**使用方法**：

```bash
# 方法 1：使用模板文件
git commit -F .trae/templates/commit_message.txt

# 方法 2：复制模板内容到编辑器
# 编辑模板文件，然后使用：
git commit -F .trae/templates/commit_message.txt

# 方法 3：配置 Git 模板（推荐）
git config commit.template .trae/templates/commit_message.txt
# 之后每次 git commit 都会自动打开模板
```

### templates/pr_template.md

Pull Request 模板，包含：

- 变更说明
- 变更类型选择
- 相关 Issue 链接
- 变更内容列表
- 测试说明
- 截图/录屏
- 检查清单
- 文档更新
- 相关链接
- 其他说明
- 审查者指南

**使用方法**：

1. 在 GitHub 仓库设置中配置 PR 模板
2. 或者在创建 PR 时手动复制模板内容

### templates/issue_bug_template.md

Bug 报告模板，包含：

- Bug 描述
- 复现步骤
- 期望行为
- 实际行为
- 截图/录屏
- 环境信息
- 额外信息
- 可能的解决方案
- 相关 Issue

**使用方法**：

在 GitHub 上创建 Issue 时，选择 "Bug Report" 模板。

### templates/issue_feature_template.md

功能请求模板，包含：

- 功能描述
- 动机
- 详细描述
- 用户场景
- 功能需求
- UI/UX 设计
- 替代方案
- 相关 Issue
- 参考资料
- 贡献意愿

**使用方法**：

在 GitHub 仓库设置中配置 Issue 模板，创建 Issue 时选择 "Feature Request" 模板。

## 🚀 快速开始

### 1. 配置 Git 提交模板

```bash
# 配置全局 Git 提交模板
git config --global commit.template .trae/templates/commit_message.txt

# 或配置当前仓库的 Git 提交模板
git config commit.template .trae/templates/commit_message.txt
```

### 2. 阅读项目规则

在开始开发前，请仔细阅读 [project_rules.md](rules/project_rules.md)。

### 3. 使用模板创建 Issue 或 PR

- 创建 Issue 时选择合适的模板
- 创建 PR 时使用 PR 模板

## 📝 注意事项

- 所有模板文件都是纯文本，可以直接编辑
- 模板中的注释以 `#` 开头，不会被 Git 提交
- 使用模板可以提高代码质量和团队协作效率
- 定期更新模板以适应项目需求变化

## 🔧 自定义模板

你可以根据项目需求自定义模板文件：

1. 编辑相应的模板文件
2. 保持模板的结构和格式
3. 更新此 README 文件中的说明

## 📚 相关文档

- [项目规则](rules/project_rules.md)
- [安全规范](../docs/SECURITY.md)
- [开发计划](../docs/DEVELOPMENT_PLAN.md)
- [技术架构](../docs/TECHNICAL_ARCHITECTURE.md)

---

**最后更新**：2026-03-12
