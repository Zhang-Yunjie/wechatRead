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

从微信读书获取个人 Skill API Key，然后打开应用的“设置”页面：

1. 将 Key 粘贴到“微信读书 API Key”输入框并保存。
2. 点击“测试连接”确认授权有效。
3. 回到“今日阅读”，手动点击“同步微信读书”。

页面保存的 Key 位于 `data/secrets.json`。文件权限为 `0600`，只允许当前系统用户读写；它已被 Git 忽略，不会写入 SQLite，也不会由页面或接口返回完整内容。保存后立即生效，无需重启应用。可以在设置页随时清除。

也可以继续通过 `.env.local` 配置：

```dotenv
WEREAD_API_KEY=wrk-你的密钥
WEREAD_SKILL_VERSION=1.0.4
```

页面配置优先于环境变量；清除页面配置后会自动回退到 `.env.local`。应用不会自动同步，只有点击“同步微信读书”时才会读取书架与笔记。

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
