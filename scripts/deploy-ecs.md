# Dreamweaver 阿里云 ECS 裸机部署指南

本文档说明如何在阿里云 ECS（Ubuntu 22.04/24.04）上部署 Dreamweaver MVP。

**示例服务器（可按你的环境替换）：**

| 项目 | 值 |
|------|-----|
| 公网 IP | `118.178.240.139` |
| 域名 | `tmxk.fun` |
| 代码仓库 | `https://github.com/ThomasWan123/TMXK.git` |

## 0. 部署前准备

### 0.1 域名 DNS

在域名控制台添加：

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| A | `@` | `118.178.240.139` |
| A | `www` | `118.178.240.139` |

验证：`ping tmxk.fun` 应解析到 `118.178.240.139`。

### 0.2 安全组

放行入方向端口：`22`、`80`、`443`。

### 0.3 准备密钥

- PostgreSQL 数据库密码（自行设定）
- AI API Key（**智谱** 或 阿里云百炼，见下文第 4.1 节）

## 1. 安装基础环境

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# 安装 Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

## 2. 配置 PostgreSQL

```bash
sudo -u postgres psql
```

在 psql 中执行：

```sql
CREATE USER dreamweaver WITH PASSWORD 'your_strong_password';
CREATE DATABASE dreamweaver OWNER dreamweaver;
GRANT ALL PRIVILEGES ON DATABASE dreamweaver TO dreamweaver;
\q
```

## 3. 拉取代码

```bash
cd /var/www
sudo git clone https://github.com/ThomasWan123/TMXK.git dreamweaver
cd dreamweaver
sudo chown -R $USER:$USER .

cp .env.example .env
```

## 4. 配置环境变量

生成 `NEXTAUTH_SECRET`：

```bash
openssl rand -base64 32
```

编辑 `/var/www/dreamweaver/.env`，**完整示例（智谱 AI + tmxk.fun）**：

```env
DATABASE_URL="postgresql://dreamweaver:your_strong_password@localhost:5432/dreamweaver?schema=public"
NEXTAUTH_URL="https://tmxk.fun"
NEXTAUTH_SECRET="粘贴 openssl 生成的随机字符串"
AI_API_KEY="你的智谱 API Key"
AI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
AI_MODEL="glm-4-flash"
AI_RATE_LIMIT_PER_HOUR=10
```

### 4.1 AI 服务商配置（智谱 / 阿里云 二选一）

Dreamweaver 使用 **OpenAI 兼容** 的 Chat Completions 接口，只需修改 `.env` 中 `AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL` 三行，**无需改代码**。

#### 方案 A：智谱 AI（推荐）

1. 打开 [智谱开放平台](https://open.bigmodel.cn/) 注册并登录
2. 进入 **API Keys** 创建密钥
3. `.env` 配置：

```env
AI_API_KEY="你的智谱 API Key"
AI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
AI_MODEL="glm-4-flash"
```

| 模型 | 说明 |
|------|------|
| `glm-4-flash` | 性价比高，适合 MVP 默认 |
| `glm-4-air` | 速度与质量均衡 |
| `glm-4-plus` | 质量更好，成本更高 |

#### 方案 B：阿里云百炼 / 通义千问

1. 打开 [阿里云百炼](https://bailian.console.aliyun.com/) 获取 API Key
2. `.env` 配置：

```env
AI_API_KEY="你的 DashScope API Key"
AI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
AI_MODEL="qwen-plus"
```

#### 切换 AI 服务商后

```bash
cd /var/www/dreamweaver
pm2 restart dreamweaver
```

## 5. 安装依赖、迁移数据库并构建

```bash
cd /var/www/dreamweaver
npm ci
npx prisma migrate deploy
npm run build
```

## 6. 使用 PM2 启动

```bash
pm2 start npm --name dreamweaver -- start
pm2 save
pm2 startup
# 若提示 sudo 命令，复制执行一次
```

检查状态：

```bash
pm2 status
pm2 logs dreamweaver
```

## 7. 配置 Nginx 反向代理

创建 `/etc/nginx/sites-available/dreamweaver`：

```nginx
server {
    listen 80;
    server_name tmxk.fun www.tmxk.fun;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用站点：

```bash
sudo ln -sf /etc/nginx/sites-available/dreamweaver /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 8. 配置 HTTPS

```bash
sudo certbot --nginx -d tmxk.fun -d www.tmxk.fun
```

证书申请成功后，确认 `.env` 中：

```env
NEXTAUTH_URL="https://tmxk.fun"
```

然后重启应用：

```bash
pm2 restart dreamweaver
```

## 9. 验收清单

### 本地开发验收（代码质量）

```bash
npm run typecheck   # TypeScript 类型检查
npm run lint        # ESLint 检查
```

生产构建建议在 Linux 环境（ECS）执行：

```bash
npm run build
```

### 线上功能验收

- [ ] 访问 `https://tmxk.fun` 可打开首页
- [ ] 注册、登录功能正常
- [ ] 可创建梦境记录
- [ ] AI 解读可正常生成（需有效 `AI_API_KEY`）
- [ ] 梦境历史与详情页可访问
- [ ] `pm2 status` 显示 `online`
- [ ] `sudo systemctl status nginx` 正常

## 10. 更新部署

```bash
cd /var/www/dreamweaver
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart dreamweaver
```

## 11. 重置用户密码（psql）

```bash
cd /var/www/dreamweaver
node -e "const { hashSync } = require('bcryptjs'); console.log(hashSync('新密码12345678', 12))"
```

```bash
sudo -u postgres psql -d dreamweaver
```

```sql
UPDATE "User"
SET "passwordHash" = '粘贴上一步的 bcrypt 哈希',
    "updatedAt" = NOW()
WHERE email = 'user@example.com';
\q
```

## 12. 常见问题

### AI 解读失败

**智谱 AI：**

- 检查 `AI_API_KEY` 是否在 [open.bigmodel.cn](https://open.bigmodel.cn/) 有效
- 确认 `AI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"`（不要多余斜杠）
- 确认账户有余额 / 免费额度
- 测试连通：`curl -I https://open.bigmodel.cn`
- 查看日志：`pm2 logs dreamweaver`

**阿里云百炼：**

- 检查 `AI_API_KEY` 是否有效
- 测试连通：`curl -I https://dashscope.aliyuncs.com`
- 查看日志：`pm2 logs dreamweaver`

**通用：**

- 修改 `.env` 后必须 `pm2 restart dreamweaver`
- 若返回 JSON 解析错误，可尝试换用 `glm-4-plus` 或 `qwen-plus`

### 登录后跳转异常

- 确认 `NEXTAUTH_URL` 与真实访问域名一致（含 `https://`）
- 示例：`NEXTAUTH_URL="https://tmxk.fun"`

### 数据库连接失败

- 检查 `DATABASE_URL` 用户名、密码、数据库名
- 确认 PostgreSQL 服务已启动：`sudo systemctl status postgresql`

## 13. 后续扩展建议

- 数据库迁移到阿里云 RDS PostgreSQL
- 使用阿里云 SLB 做负载均衡
- 增加对象存储保存导出内容
- 增加邮件通知与订阅支付
