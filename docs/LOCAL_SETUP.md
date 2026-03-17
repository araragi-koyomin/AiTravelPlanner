# 本地开发环境搭建指南

本文档详细说明如何在本地搭建 AI 旅行规划师项目的开发环境。

## 📋 目录

- [环境要求](#环境要求)
- [安装步骤](#安装步骤)
- [项目初始化](#项目初始化)
- [开发工具配置](#开发工具配置)
- [验证环境](#验证环境)
- [常见问题](#常见问题)
- [下一步](#下一步)

---

## 环境要求

### 必需软件

| 软件    | 版本要求    | 用途               |
| ------- | ----------- | ------------------ |
| Node.js | 18.x 或更高 | JavaScript 运行时  |
| pnpm    | 8.x 或更高  | 包管理器（推荐）   |
| Git     | 2.x 或更高  | 版本控制           |
| VS Code | 最新版本    | 代码编辑器（推荐） |

### 可选软件

| 软件            | 用途       |
| --------------- | ---------- |
| Docker Desktop  | 容器化开发 |
| Postman         | API 测试   |
| Chrome DevTools | 浏览器调试 |

### 系统要求

- **操作系统**：Windows 10+、macOS 10.15+、Ubuntu 20.04+
- **内存**：至少 8GB RAM（推荐 16GB）
- **磁盘空间**：至少 10GB 可用空间
- **网络**：稳定的互联网连接

---

## 安装步骤

### 1. 安装 Node.js

#### Windows

**方法 1：使用官方安装程序（推荐）**

1. 访问 https://nodejs.org/
2. 下载 LTS 版本（推荐 18.x 或 20.x）
3. 运行安装程序
4. 重启命令提示符

**方法 2：使用 nvm（推荐用于多版本管理）**

```powershell
# 使用 PowerShell 安装 nvm-windows
Invoke-WebRequest https://raw.githubusercontent.com/nvm-sh/nvm-sh/v0.39.0/install.ps1 | Invoke-Expression

# 重启终端后，安装 Node.js 18
nvm install 18
nvm use 18
```

#### macOS

**方法 1：使用 Homebrew（推荐）**

```bash
# 安装 Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js 18
brew install node@18
```

**方法 2：使用 nvm（推荐用于多版本管理）**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm-sh/v0.39.0/install.sh | bash

# 重启终端后，安装 Node.js 18
nvm install 18
nvm use 18
```

#### Linux (Ubuntu/Debian)

```bash
# 使用 NodeSource 仓库安装
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm-sh/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 2. 安装 pnpm

**为什么选择 pnpm？**
- ⚡ 更快的安装速度
- 💾 节省磁盘空间（使用硬链接）
- 🔒 严格的依赖管理
- 📦 支持 monorepo

#### 全局安装

```bash
# 使用 npm 安装
npm install -g pnpm

# 或使用 Homebrew（macOS）
brew install pnpm

# 或使用 Chocolatey（Windows）
choco install pnpm
```

#### 验证安装

```bash
# 检查版本
pnpm --version

# 应该显示：8.x.x
```

### 3. 安装 Git

#### Windows

1. 下载 Git for Windows：https://git-scm.com/download/win
2. 运行安装程序
3. 使用 Git Bash 或 PowerShell

#### macOS

```bash
# 使用 Homebrew 安装
brew install git

# 或使用 Xcode Command Line Tools
xcode-select --install
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install -y git
```

### 4. 安装 VS Code（推荐）

#### Windows

1. 下载 VS Code：https://code.visualstudio.com/
2. 运行安装程序
3. 安装推荐扩展（见下文）

#### macOS

```bash
# 使用 Homebrew 安装
brew install --cask visual-studio-code
```

#### Linux (Ubuntu/Debian)

```bash
# 下载并安装
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/microsoft.asc] https://packages.microsoft.com/repos/code stable main"
sudo apt-get update
sudo apt-get install -y code
```

---

## 项目初始化

### 1. 克隆仓库

```bash
# 克隆项目仓库
git clone https://github.com/araragi-koyomin/AiTravelPlanner.git
cd AiTravelPlanner
```

### 2. 安装项目依赖

```bash
# 使用 pnpm 安装依赖（推荐）
pnpm install

# 或使用 npm
npm install
```

**安装过程说明**：
- pnpm 会读取 `pnpm-lock.yaml` 锁文件
- 依赖会被安装到 `node_modules/` 目录
- 首次安装可能需要几分钟

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
# Windows: notepad .env
# macOS/Linux: nano .env 或 vim .env
```

**必需的环境变量**：

```env
# Supabase 配置（必需）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 加密密钥（必需，至少32字符）
VITE_ENCRYPTION_KEY=your-secret-encryption-key-at-least-32-chars

# 其他配置（暂时可以使用测试值）
VITE_APP_NAME=AI Travel Planner
VITE_APP_VERSION=1.0.0
```

**注意**：
- Supabase 需要先在 https://supabase.com/ 创建项目
- 其他 API Key 可以在后续开发中逐步添加
- 永远不要提交 `.env` 文件到 Git

### 4. 验证项目结构

```bash
# 查看项目结构
ls -la

# 应该看到以下结构：
# AiTravelPlanner/
# ├── .env.example
# ├── .gitignore
# ├── docs/
# ├── .trae/
# ├── LICENSE
# ├── README.md
# ├── requirement.md
# ├── Dockerfile
# ├── docker-compose.yml
# ├── docker/
# └── .env (你创建的）
```

---

## 开发工具配置

### 1. VS Code 扩展

#### 必需扩展

**ESLint**
- 用途：代码质量检查
- 安装：在 VS Code 扩展市场搜索 "ESLint"
- 配置：项目已包含 `.eslintrc.cjs`

**Prettier**
- 用途：代码格式化
- 安装：在 VS Code 扩展市场搜索 "Prettier - Code formatter"
- 配置：项目已包含 `.prettierrc`

**TypeScript Vue Plugin (Volar)**
- 用途：TypeScript 语言支持
- 安装：在 VS Code 扩展市场搜索 "TypeScript Vue Plugin (Volar)"

#### 推荐扩展

**Tailwind CSS IntelliSense**
- 用途：TailwindCSS 类名智能提示
- 安装：在 VS Code 扩展市场搜索 "Tailwind CSS IntelliSense"

**GitLens**
- 用途：增强 Git 功能
- 安装：在 VS Code 扩展市场搜索 "GitLens"

**Auto Rename Tag**
- 用途：自动重配对 HTML/XML 标签
- 安装：在 VS Code 扩展市场搜索 "Auto Rename Tag"

**Path Intellisense**
- 用途：文件路径自动补全
- 安装：在 VS Code 扩展市场搜索 "Path Intellisense"

**Error Lens**
- 用途：在代码中显示错误信息
- 安装：在 VS Code 扩展市场搜索 "Error Lens"

### 2. VS Code 工作区设置

创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    "cva\\(([^:]*)\\:([^:]*)|(.*))",
    "^cn\\(([^:]*)\\:([^:]*)|(.*))"
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### 3. Git 配置

#### 配置用户信息

```bash
# 配置用户名
git config --global user.name "Your Name"

# 配置邮箱
git config --global user.email "your.email@example.com"
```

#### 配置 Git 提交模板

```bash
# 配置提交模板（使用项目中的模板）
git config commit.template .trae/templates/commit_message.txt
```

#### 配置 Git 别名

```bash
# 添加常用别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
```

### 4. 配置 pnpm

#### 创建 `.npmrc`

```ini
# .npmrc
shamefully-hoist=true
strict-peer-dependencies=false
```

---

## 验证环境

### 1. 验证 Node.js 和 pnpm

```bash
# 检查 Node.js 版本
node --version
# 应该显示：v18.x.x 或 v20.x.x

# 检查 pnpm 版本
pnpm --version
# 应该显示：8.x.x
```

### 2. 验证 Git

```bash
# 检查 Git 版本
git --version
# 应该显示：git version 2.x.x

# 检查 Git 配置
git config --global user.name
git config --global user.email
```

### 3. 启动开发服务器

```bash
# 启动开发服务器
pnpm dev

# 或使用 npm
npm run dev
```

**预期输出**：

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4. 访问应用

打开浏览器访问：http://localhost:3000

**预期结果**：
- 如果项目有代码，应该看到应用界面
- 如果项目没有代码，可能会看到 404 或空白页

### 5. 测试构建

```bash
# 构建生产版本
pnpm build

# 或使用 npm
npm run build
```

**预期输出**：

```
vite v5.x.x building for production...
✓ 1234 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-abc123.js       45.67 kB │ gzip: 15.23 kB
dist/assets/index-def456.css      12.34 kB │ gzip:  4.56 kB
```

---

## 常见问题

### 问题 1：pnpm install 失败

**错误信息**：
```
ERROR  No matching version found for pnpm
```

**解决方案**：

```bash
# 卸载旧版本
npm uninstall -g pnpm

# 重新安装
npm install -g pnpm@latest
```

### 问题 2：端口 3000 已被占用

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：

```bash
# Windows: 查找占用端口的进程
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux: 查找占用端口的进程
lsof -ti:3000 | xargs kill -9

# 或使用其他端口
pnpm dev -- --port 3000
```

### 问题 3：TypeScript 类型错误

**错误信息**：
```
error TS2307: Cannot find module 'xxx'
```

**解决方案**：

```bash
# 清理缓存并重新安装
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# 或使用 pnpm 的 store
pnpm store prune
```

### 问题 4：Vite 热更新不工作

**解决方案**：

1. 检查防火墙设置
2. 确保 `package.json` 中有 `"type": "module"`
3. 尝试禁用热更新：
   ```bash
   pnpm dev -- --force
   ```

### 问题 5：VS Code 无法识别 TypeScript

**解决方案**：

1. 重启 VS Code
2. 检查 TypeScript 扩展是否安装
3. 选择正确的 TypeScript 版本：
   - 按 `Ctrl+Shift+P`
   - 输入 "TypeScript: Select TypeScript Version"
   - 选择 "Use Workspace Version"

### 问题 6：Git 提交模板不生效

**解决方案**：

```bash
# 检查模板路径
git config --get commit.template

# 如果路径不正确，重新配置
git config --global commit.template .trae/templates/commit_message.txt
```

---

## 开发命令参考

### pnpm 命令

```bash
# 安装依赖
pnpm install

# 添加依赖
pnpm add <package-name>

# 添加开发依赖
pnpm add -D <package-name>

# 移除依赖
pnpm remove <package-name>

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 运行测试
pnpm test

# 运行测试覆盖率
pnpm test:coverage

# 运行 Lint
pnpm lint

# 运行 Prettier
pnpm format

# 运行类型检查
pnpm typecheck
```

### Vite 命令

```bash
# 启动开发服务器
pnpm dev

# 指定端口
pnpm dev -- --port 3000

# 指定主机
pnpm dev -- --host 0.0.0.0

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 优化依赖分析
pnpm build -- --mode development
```

---

## 性能优化建议

### 1. 使用 pnpm 的 Store

```bash
# 启用 pnpm store（全局）
pnpm store path <path-to-store>

# 使用 store 安装（更快）
pnpm install --store <path-to-store>
```

### 2. 配置 Node.js 内存限制

```bash
# 增加 Node.js 内存限制（macOS/Linux）
export NODE_OPTIONS="--max-old-space-size=4096"

# Windows: 在系统环境变量中设置
# 系统属性 → 高级系统设置 → 环境变量
```

### 3. 使用 Vite 的 HMR

Vite 默认启用热模块替换（HMR），无需额外配置。

---

## 安全建议

### 1. 定期更新依赖

```bash
# 检查过时的依赖
pnpm outdated

# 更新依赖
pnpm update

# 检查安全漏洞
pnpm audit
```

### 2. 使用 .env 文件

- ✅ 永远不要提交 `.env` 文件到 Git
- ✅ 使用 `.env.example` 作为模板
- ✅ 在 `.gitignore` 中包含 `.env`

### 3. 配置 ESLint 和 Prettier

项目已配置 ESLint 和 Prettier，确保：
- ✅ 保存时自动格式化
- ✅ 提交前自动检查
- ✅ 统一代码风格

---

## 下一步

环境搭建完成后，建议按以下顺序继续：

1. **阅读 Supabase 配置指南**
   - 创建 Supabase 项目
   - 配置数据库
   - 设置认证

2. **阅读 API 配置指南**
   - 申请智谱AI API Key
   - 申请科大讯飞 API Key
   - 申请高德地图 API Key

3. **阅读数据库设计文档**
   - 了解数据库结构
   - 理解表关系

4. **阅读 Git 工作流文档**
   - 了解分支策略
   - 学习提交规范

5. **开始项目开发**
   - 按照 [开发工作计划](DEVELOPMENT_PLAN.md) 第1周开始

---

## 参考资料

- [Node.js 官方文档](https://nodejs.org/docs/)
- [pnpm 官方文档](https://pnpm.io/)
- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [VS Code 官方文档](https://code.visualstudio.com/docs)
- [Git 官方文档](https://git-scm.com/doc)

---

**文档版本**：v1.0
**最后更新**：2026-03-12
**维护者**：项目开发者
