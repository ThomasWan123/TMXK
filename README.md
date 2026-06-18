# Dreamweaver

AI Nighttime Dream Weaver — 记录梦境、获得温柔 AI 解读与睡前故事的 MVP 网站。

## 功能

- 营销首页与产品介绍
- 用户注册 / 登录（邮箱 + 密码）
- 梦境记录（标题、内容、情绪、标签、睡眠日期）
- AI 梦境解读（象征、情绪洞察、建议、睡前故事）
- 梦境历史与详情查看
- 阿里云 ECS 裸机部署支持

## 技术栈

- Next.js 15 + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- NextAuth（Credentials）
- 阿里云百炼 / 通义千问 OpenAI 兼容 API

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 DATABASE_URL、NEXTAUTH_SECRET、AI_API_KEY

# 3. 初始化数据库
npx prisma migrate deploy

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `NEXTAUTH_URL` | 站点 URL，如 `http://localhost:3000` |
| `NEXTAUTH_SECRET` | 认证密钥，使用 `openssl rand -base64 32` 生成 |
| `AI_API_KEY` | 阿里云百炼 / DashScope API Key |
| `AI_BASE_URL` | 默认 `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `AI_MODEL` | 默认 `qwen-plus` |
| `AI_RATE_LIMIT_PER_HOUR` | 每用户每小时 AI 解读次数上限，默认 10 |

## 部署

详见 [scripts/deploy-ecs.md](scripts/deploy-ecs.md) — 包含阿里云 ECS、Nginx、PM2、HTTPS 完整步骤。

## 脚本

```bash
npm run dev        # 开发模式
npm run build      # 生产构建（建议在 Linux 环境执行）
npm run start      # 生产启动
npm run lint       # ESLint 检查
npm run typecheck  # TypeScript 类型检查
```

## 免责声明

Dreamweaver 的 AI 内容仅供自我探索与娱乐参考，不构成医学或心理诊断建议。

## License

MIT — 见 [LICENSE](LICENSE)
