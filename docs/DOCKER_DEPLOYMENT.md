# Docker 部署文档

本文档详细说明如何使用 Docker 部署 AI 旅行规划师应用。

## 📋 目录

- [部署概述](#部署概述)
- [前置要求](#前置要求)
- [本地部署](#本地部署)
- [生产部署](#生产部署)
- [环境变量配置](#环境变量配置)
- [Docker 命令参考](#docker-命令参考)
- [故障排查指南](#故障排查指南)
- [最佳实践](#最佳实践)
- [安全注意事项](#安全注意事项)

---

## 部署概述

本项目使用 Docker 容器化部署，采用多阶段构建优化镜像大小，使用 Nginx 作为生产服务器。

### 架构说明

```
┌─────────────────────────────────────┐
│         Docker Container          │
│  ┌───────────────────────────┐  │
│  │   Nginx (alpine)       │  │
│  │   - Port 8080           │  │
│  │   - Static Files         │  │
│  │   - SPA Routing         │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │   React App (Built)     │  │
│  │   - Optimized Assets     │  │
│  │   - Minified JS/CSS     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────────┘
```

### 特性

- ✅ **多阶段构建**：优化镜像大小（~50MB）
- ✅ **非 root 用户**：提升安全性
- ✅ **健康检查**：自动监控容器状态
- ✅ **Gzip 压缩**：优化传输性能
- ✅ **安全头**：CSP、XSS 保护等
- ✅ **缓存策略**：静态资源长期缓存
- ✅ **SPA 路由**：支持 React Router

---

## 前置要求

### 必需软件

- **Docker**：20.10 或更高版本
- **Docker Compose**：2.0 或更高版本

### 验证安装

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker Compose 版本
docker-compose --version
```

### 安装 Docker

#### Windows

1. 下载 Docker Desktop：https://www.docker.com/products/docker-desktop
2. 运行安装程序
3. 重启计算机
4. 启动 Docker Desktop

#### macOS

1. 下载 Docker Desktop for Mac：https://www.docker.com/products/docker-desktop
2. 安装并启动 Docker Desktop

#### Linux (Ubuntu/Debian)

```bash
# 更新包索引
sudo apt-get update

# 安装依赖
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker 官方 GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组（避免使用 sudo）
sudo usermod -aG docker $USER
```

---

## 本地部署

### 1. 克隆仓库

```bash
git clone https://github.com/araragi-koyomin/AiTravelPlanner.git
cd AiTravelPlanner
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入实际的配置
nano .env  # 或使用其他编辑器
```

### 3. 构建并启动容器

```bash
# 使用 Docker Compose
docker-compose up -d

# 或使用 Docker 命令
docker build -t ai-travel-planner .
docker run -d -p 3000:8080 --env-file .env ai-travel-planner
```

### 4. 验证部署

```bash
# 检查容器状态
docker-compose ps

# 查看容器日志
docker-compose logs -f web

# 访问应用
# 打开浏览器访问 http://localhost:3000
```

### 5. 停止容器

```bash
# 停止并删除容器
docker-compose down

# 停止并删除容器、网络和卷
docker-compose down -v
```

---

## 生产部署

### 方案 1：使用 Docker Compose（推荐）

#### 1. 准备生产环境变量

创建 `.env.production` 文件：

```bash
cp .env.example .env.production
nano .env.production
```

**重要配置项**：

```env
NODE_ENV=production
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
```

#### 2. 构建生产镜像

```bash
# 构建镜像
docker-compose build

# 或指定构建参数
docker build \
  --build-arg NODE_ENV=production \
  -t ai-travel-planner:latest \
  .
```

#### 3. 启动生产容器

```bash
# 使用生产环境变量
docker-compose --env-file .env.production up -d

# 或使用 Docker 命令
docker run -d \
  --name ai-travel-planner \
  -p 80:8080 \
  --env-file .env.production \
  --restart unless-stopped \
  ai-travel-planner:latest
```

#### 4. 配置反向代理（可选）

如果你有域名，可以使用 Nginx 或 Caddy 作为反向代理：

**Nginx 配置示例**：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 5. 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 方案 2：使用云服务

#### 阿里云容器镜像服务

1. **推送镜像到阿里云**

```bash
# 登录阿里云镜像仓库
docker login --username=your-aliyun-username registry.cn-hangzhou.aliyuncs.com

# 标记镜像
docker tag ai-travel-planner:latest registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:latest

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:latest
```

2. **在阿里云容器服务中部署**

- 登录阿里云容器镜像服务控制台
- 创建容器服务实例
- 选择镜像：`registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner:latest`
- 配置端口映射：80 → 8080
- 配置环境变量
- 启动容器

#### Docker Hub

```bash
# 登录 Docker Hub
docker login

# 标记镜像
docker tag ai-travel-planner:latest your-username/ai-travel-planner:latest

# 推送镜像
docker push your-username/ai-travel-planner:latest
```

---

## 环境变量配置

### 必需变量

| 变量名                   | 说明                   | 示例                                           | 必需 |
| ------------------------ | ---------------------- | ---------------------------------------------- | ---- |
| `VITE_SUPABASE_URL`      | Supabase 项目 URL      | `https://xxx.supabase.co`                      | ✅    |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥      | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`      | ✅    |
| `VITE_ENCRYPTION_KEY`    | 加密密钥（至少32字符） | `your-secret-encryption-key-at-least-32-chars` | ✅    |

### AI 服务变量

| 变量名                   | 说明                | 示例                       |
| ------------------------ | ------------------- | -------------------------- |
| `VITE_ZHIPU_API_KEY`     | 智谱AI API Key      | `sk-xxxxxxxxxxxxxxxxxxxxx` |
| `VITE_XUNFEI_APP_ID`     | 科大讯飞 App ID     | `xxxxxxxx`                 |
| `VITE_XUNFEI_API_KEY`    | 科大讯飞 API Key    | `xxxxxxxxxxxxxxxxxxxxx`    |
| `VITE_XUNFEI_API_SECRET` | 科大讯飞 API Secret | `xxxxxxxxxxxxxxxxxxxxx`    |

### 地图服务变量

| 变量名                       | 说明           | 示例                    |
| ---------------------------- | -------------- | ----------------------- |
| `VITE_AMAP_KEY`              | 高德地图 Key   | `xxxxxxxxxxxxxxxxxxxxx` |
| `VITE_AMAP_SECURITY_JS_CODE` | 高德地图安全码 | `xxxxxxxxxxxxxxxxxxxxx` |

### 应用配置变量

| 变量名                           | 说明         | 默认值                                          |
| -------------------------------- | ------------ | ----------------------------------------------- |
| `VITE_APP_NAME`                  | 应用名称     | `AI Travel Planner`                             |
| `VITE_APP_VERSION`               | 应用版本     | `1.0.0`                                         |
| `VITE_API_BASE_URL`              | API 基础 URL | `https://your-project.supabase.co/functions/v1` |
| `VITE_ENABLE_SPEECH_RECOGNITION` | 启用语音识别 | `true`                                          |
| `VITE_ENABLE_DARK_MODE`          | 启用深色模式 | `true`                                          |
| `VITE_ENABLE_MULTI_LANGUAGE`     | 启用多语言   | `true`                                          |
| `VITE_DEV_MODE`                  | 开发模式     | `false`                                         |
| `VITE_DEBUG_MODE`                | 调试模式     | `false`                                         |

---

## Docker 命令参考

### 镜像构建

```bash
# 构建镜像
docker build -t ai-travel-planner .

# 构建并指定标签
docker build -t ai-travel-planner:v1.0.0 .

# 构建时使用缓存
docker build --cache-from ai-travel-planner:latest -t ai-travel-planner .

# 构建时不使用缓存
docker build --no-cache -t ai-travel-planner .

# 查看构建历史
docker history ai-travel-planner:latest

# 查看镜像信息
docker inspect ai-travel-planner:latest
```

### 容器管理

```bash
# 运行容器
docker run -d -p 3000:8080 --name ai-travel-planner ai-travel-planner

# 运行容器并指定环境变量
docker run -d \
  -p 3000:8080 \
  --name ai-travel-planner \
  -e VITE_SUPABASE_URL=https://xxx.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=xxx \
  ai-travel-planner

# 运行容器并挂载卷
docker run -d \
  -p 3000:8080 \
  -v $(pwd)/nginx-logs:/var/log/nginx \
  --name ai-travel-planner \
  ai-travel-planner

# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看容器日志
docker logs ai-travel-planner

# 实时查看容器日志
docker logs -f ai-travel-planner

# 停止容器
docker stop ai-travel-planner

# 启动已停止的容器
docker start ai-travel-planner

# 重启容器
docker restart ai-travel-planner

# 删除容器
docker rm ai-travel-planner

# 强制删除运行中的容器
docker rm -f ai-travel-planner
```

### Docker Compose 命令

```bash
# 构建并启动容器
docker-compose up -d

# 仅构建镜像
docker-compose build

# 重新构建并启动
docker-compose up -d --build

# 查看容器状态
docker-compose ps

# 查看容器日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs -f web

# 停止容器
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络和卷
docker-compose down -v

# 重新创建容器
docker-compose up -d --force-recreate

# 执行容器内的命令
docker-compose exec web sh

# 进入容器
docker-compose exec web sh
```

### 镜像管理

```bash
# 查看本地镜像
docker images

# 删除镜像
docker rmi ai-travel-planner:latest

# 强制删除镜像
docker rmi -f ai-travel-planner:latest

# 删除所有未使用的镜像
docker image prune

# 删除所有悬空镜像
docker image prune -a

# 导出镜像
docker save -o ai-travel-planner.tar ai-travel-planner:latest

# 导入镜像
docker load -i ai-travel-planner.tar
```

### 清理命令

```bash
# 清理停止的容器
docker container prune

# 清理未使用的网络
docker network prune

# 清理未使用的卷
docker volume prune

# 清理所有未使用的资源
docker system prune

# 清理所有未使用的资源（包括未使用的镜像）
docker system prune -a
```

---

## 故障排查指南

### 容器无法启动

#### 问题：容器启动后立即退出

**可能原因**：
- 环境变量配置错误
- 端口冲突
- 健康检查失败

**解决方案**：

```bash
# 查看容器日志
docker logs ai-travel-planner

# 查看容器退出代码
docker ps -a | grep ai-travel-planner

# 交互式运行容器进行调试
docker run -it --rm -p 3000:8080 ai-travel-planner sh
```

#### 问题：端口已被占用

**错误信息**：
```
Bind for 0.0.0.0:3000 failed: port is already allocated
```

**解决方案**：

```bash
# 查看端口占用情况
netstat -ano | findstr :3000

# Windows: 终止占用端口的进程
taskkill /PID <PID> /F

# Linux: 终止占用端口的进程
sudo lsof -ti:3000 | xargs kill -9

# 或使用其他端口
docker run -d -p 8080:8080 ai-travel-planner
```

### 应用无法访问

#### 问题：浏览器显示 502 Bad Gateway

**可能原因**：
- Nginx 配置错误
- 容器未正常启动

**解决方案**：

```bash
# 检查容器状态
docker-compose ps

# 查看 Nginx 错误日志
docker-compose exec web cat /var/log/nginx/error.log

# 检查 Nginx 配置
docker-compose exec web nginx -t

# 重新加载 Nginx 配置
docker-compose exec web nginx -s reload
```

#### 问题：静态资源 404

**可能原因**：
- 构建时文件未正确复制
- Nginx 路径配置错误

**解决方案**：

```bash
# 检查容器内的文件
docker-compose exec web ls -la /usr/share/nginx/html

# 检查 Nginx 配置中的 root 路径
docker-compose exec web cat /etc/nginx/conf.d/default.conf

# 重新构建镜像
docker-compose up -d --build
```

#### 问题：React Router 刷新后 404

**可能原因**：
- Nginx 未配置 SPA 路由

**解决方案**：

检查 `docker/nginx.conf` 中的 `try_files` 配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 健康检查失败

#### 问题：健康检查一直失败

**可能原因**：
- 健康检查端点未配置
- 端口配置错误

**解决方案**：

```bash
# 手动测试健康检查端点
curl http://localhost:3000/health

# 查看容器健康状态
docker inspect --format='{{.State.Health.Status}}' ai-travel-planner

# 查看健康检查日志
docker inspect --format='{{json .State.Health}}' ai-travel-planner
```

### 性能问题

#### 问题：容器占用内存过高

**解决方案**：

```bash
# 限制容器内存使用
docker run -d \
  -m 512m \
  --memory-swap 1g \
  -p 3000:8080 \
  ai-travel-planner

# 或在 docker-compose.yml 中配置
services:
  web:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

#### 问题：容器启动慢

**解决方案**：

```bash
# 使用 BuildKit 加速构建
export DOCKER_BUILDKIT=1
docker build -t ai-travel-planner .

# 使用多阶段构建缓存
docker build \
  --cache-from ai-travel-planner:latest \
  -t ai-travel-planner \
  .
```

### 环境变量问题

#### 问题：环境变量未生效

**解决方案**：

```bash
# 检查容器内的环境变量
docker-compose exec web env | grep VITE

# 确认 .env 文件格式正确（无引号、无空格）
cat .env

# 重新启动容器
docker-compose down
docker-compose up -d
```

### 网络问题

#### 问题：容器无法访问外部 API

**可能原因**：
- DNS 配置问题
- 防火墙阻止

**解决方案**：

```bash
# 测试容器网络连接
docker-compose exec web ping -c 3 google.com

# 测试 API 连接
docker-compose exec web curl -I https://open.bigmodel.cn

# 检查 DNS 配置
docker-compose exec web cat /etc/resolv.conf

# 使用自定义 DNS
docker run -d \
  --dns 8.8.8.8 \
  --dns 8.8.4.4 \
  ai-travel-planner
```

---

## 最佳实践

### 1. 使用多阶段构建

本项目已配置多阶段构建，优势：

- ✅ 减小镜像大小（~50MB vs ~500MB）
- ✅ 减少攻击面（不包含构建工具）
- ✅ 加快部署速度

### 2. 使用非 root 用户

容器以 `nginx` 用户运行，提升安全性：

```dockerfile
USER nginx
```

### 3. 健康检查

配置健康检查，自动监控容器状态：

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1
```

### 4. 资源限制

限制容器资源使用，防止资源耗尽：

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### 5. 日志管理

配置日志轮转，防止磁盘空间耗尽：

```yaml
services:
  web:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 6. 使用 .dockerignore

使用 `.dockerignore` 优化构建上下文：

- 减少构建时间
- 减小镜像大小
- 避免敏感文件进入镜像

### 7. 镜像标签管理

使用语义化版本标签：

```bash
docker build -t ai-travel-planner:1.0.0 .
docker build -t ai-travel-planner:latest .
docker build -t ai-travel-planner:1.0.0-alpine .
```

### 8. 定期更新基础镜像

保持基础镜像最新，获得安全更新：

```bash
# 拉取最新基础镜像
docker pull node:18-alpine
docker pull nginx:alpine

# 重新构建应用镜像
docker-compose build
```

### 9. 使用 Docker Compose 环境文件

为不同环境创建不同的环境文件：

```bash
docker-compose --env-file .env.development up -d
docker-compose --env-file .env.staging up -d
docker-compose --env-file .env.production up -d
```

### 10. 监控和日志

使用日志收集和监控工具：

- **日志**：ELK Stack、Loki、Grafana
- **监控**：Prometheus、Grafana、Datadog
- **告警**：Alertmanager、PagerDuty

---

## 安全注意事项

### 1. 不要在镜像中包含敏感信息

❌ **错误做法**：

```dockerfile
ENV API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

✅ **正确做法**：

```bash
docker run -e API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx ai-travel-planner
```

### 2. 使用最小化基础镜像

使用 Alpine Linux 减小攻击面：

```dockerfile
FROM nginx:alpine
```

### 3. 定期扫描镜像漏洞

使用 Trivy 扫描镜像漏洞：

```bash
# 安装 Trivy
brew install trivy  # macOS
apt-get install trivy  # Ubuntu

# 扫描镜像
trivy image ai-travel-planner:latest
```

### 4. 使用只读文件系统

限制容器写入权限：

```yaml
services:
  web:
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache/nginx
      - /var/run
```

### 5. 限制容器能力

使用最小权限原则：

```yaml
services:
  web:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### 6. 使用用户命名空间

隔离容器进程：

```yaml
services:
  web:
    security_opt:
      - no-new-privileges:true
```

### 7. 网络隔离

使用自定义网络：

```yaml
networks:
  ai-travel-planner-network:
    driver: bridge
    internal: false
```

### 8. 定期更新

- 定期更新 Docker
- 定期更新基础镜像
- 定期扫描漏洞
- 及时应用安全补丁

---

## CI/CD 集成

### GitHub Actions 示例

创建 `.github/workflows/docker.yml`：

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: your-username/ai-travel-planner:latest
        cache-from: type=registry,ref=your-username/ai-travel-planner:buildcache
        cache-to: type=registry,ref=your-username/ai-travel-planner:buildcache,mode=max
```

---

## 参考资料

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nginx 配置指南](https://nginx.org/en/docs/)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [Docker 安全最佳实践](https://docs.docker.com/engine/security/)

---

**文档版本**：v1.0
**最后更新**：2026-03-12
**维护者**：项目开发者
