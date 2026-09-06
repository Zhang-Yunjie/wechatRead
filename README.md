# 阅读此刻

一个本地运行的桌面阅读伴侣：手机继续用微信读书，电脑负责快速记录、恢复上下文、每日回顾和安排下一本书。

## 本地启动

要求 Node.js 20 或更新版本。

```bash
npm install
cp .env.example .env.local
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 配置微信读书

从微信读书获取个人 Skill API Key，在 `.env.local` 中设置：

```dotenv
WEREAD_API_KEY=wrk-你的密钥
WEREAD_SKILL_VERSION=1.0.4
```

应用不会自动同步。只有点击页面右上角的“同步微信读书”时才会请求微信读书。API Key 只在本地服务端读取，不会写入数据库或返回浏览器。

## 配置 AI 阅读体感

AI 功能可选。兼容 OpenAI Chat Completions 接口：

```dotenv
OPENAI_API_KEY=你的密钥
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=你要使用的模型
```

没有配置时，同步、队列、记录和回顾仍然可用。AI 只生成预计时长、阅读强度、连续性、最多两个风格标签，以及本地想法的分类建议；不会改写原始想法。

## 本地数据

默认数据库为 `data/reading.db`，已从 Git 排除。备份时停止本地服务并复制该文件即可。微信读书同步只更新导入字段，不覆盖本地阅读角色、队列、想法或复盘。

## 常用命令

```bash
npm test -- --run
npm run lint
npm run build
```
