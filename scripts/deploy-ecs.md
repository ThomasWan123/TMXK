# Dreamweaver 阿里云 ECS 裸机部署指南

本文档说明如何在阿里云 ECS（Ubuntu 22.04/24.04）上部署 Dreamweaver MVP。

## 1. 准备 ECS

1. 创建 ECS 实例，建议配置：2 vCPU / 4 GB RAM / 40 GB 系统盘。
2. 绑定域名，并将域名 A 记录指向 ECS 公网 IP。
3. 在安全组中放行端口：`22`、`80`、`443`。

## 2. 安装基础环境

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# 安装 Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

## 3. 配置 PostgreSQL

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

## 4. 拉取代码并配置环境变量

```bash
cd /var/www
sudo git clone <your-repo-url> dreamweaver
cd dreamweaver
sudo chown -R $USER:$USER .

cp .env.example .env
```

编辑 `.env`：

```env
DATABASE_URL="postgresql://dreamweaver:your_strong_password@localhost:5432/dreamweaver?schema=public"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="生成一个足够长的随机字符串"
AI_API_KEY="你的阿里云百炼/通义千问 API Key"
AI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
AI_MODEL="qwen-plus"
AI_RATE_LIMIT_PER_HOUR=10
```

生成 `NEXTAUTH_SECRET`：

```bash
openssl rand -base64 32
```

## 5. 安装依赖、迁移数据库并构建

```bash
npm ci
npx prisma migrate deploy
npm run build
```

## 6. 使用 PM2 启动

```bash
pm2 start npm --name dreamweaver -- start
pm2 save
pm2 startup
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
    server_name your-domain.com;

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
sudo ln -s /etc/nginx/sites-available/dreamweaver /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 8. 配置 HTTPS

```bash
sudo certbot --nginx -d your-domain.com
```

Certbot 会自动续期证书。

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

- [ ] 访问 `https://your-domain.com` 可打开首页
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

## 11. 常见问题

### AI 解读失败

- 检查 `AI_API_KEY` 是否有效
- 检查 ECS 是否能访问 `dashscope.aliyuncs.com`
- 查看 `pm2 logs dreamweaver`

### 登录后跳转异常

- 确认 `NEXTAUTH_URL` 与真实访问域名一致（含 `https://`）

### 数据库连接失败

- 检查 `DATABASE_URL` 用户名、密码、数据库名
- 确认 PostgreSQL 服务已启动：`sudo systemctl status postgresql`

## 12. 后续扩展建议

- 数据库迁移到阿里云 RDS PostgreSQL
- 使用阿里云 SLB 做负载均衡
- 增加对象存储保存导出内容
- 增加邮件通知与订阅支付
