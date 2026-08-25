# 关系切片（Relation Slice）

关系切片是一个微信聊天记录趣味关系分析 Web 应用。用户上传聊天记录文件后，后端会解析消息并通过 LangGraph 多 Agent 流水线分析语言风格、情绪波动、互动模式和关系类型，前端以苹果极简液态玻璃风格展示亲密值、依赖指数、默契程度、性格光谱和情绪曲线。

## 功能

- 上传微信聊天数据库文件，或已导出的 JSON/CSV/TXT 文件
- 标准化解析聊天消息
- DeepSeek 多 Agent 分析：语言风格、情绪、互动、关系预测、最终汇总
- 统一 API 响应、全局异常处理、日志和简单限流
- React 可视化报告：仪表盘、折线图、条形图、雷达图
- 苹果极简圆角液态玻璃界面，支持深色模式和移动端

## 技术栈

- 前端：React、TypeScript、Vite、Tailwind CSS、Framer Motion、Recharts、Axios
- 后端：Python 3.11+、FastAPI、LangChain、LangGraph、langchain-deepseek
- 模型：DeepSeek `deepseek-chat`
- 解析：JSON/CSV/TXT 直接解析；WeChatMsg CLI 可选接入

## 目录结构

```text
relation-slice/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   ├── graph.py
│   │   ├── logging_config.py
│   │   ├── main.py
│   │   ├── parser.py
│   │   ├── rate_limit.py
│   │   └── responses.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## 环境变量

后端：

```text
DEEPSEEK_API_KEY=your_deepseek_api_key
WECHATMSG_EXPORT_COMMAND=
WECHATMSG_EXPORT_FORMAT=json
WECHATMSG_EXPORT_TIMEOUT=120
```

前端：

```text
VITE_API_BASE_URL=
VITE_PROXY_TARGET=http://127.0.0.1:8000
```

开发模式推荐让前端默认请求同源 `/api`，再由 Vite proxy 转发到后端；如果需要直连后端，可设置 `VITE_API_BASE_URL`。

## 后端运行

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
copy .env.example .env
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

健康检查：

```bash
curl http://127.0.0.1:8000/health
```

## 前端运行

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev -- --host 127.0.0.1
```

默认访问：

```text
http://127.0.0.1:5173/
```

## API

成功响应：

```json
{"code":0,"data":{}}
```

失败响应：

```json
{"code":400,"message":"error message"}
```

上传聊天文件：

```text
POST /api/upload
multipart/form-data file=<chat file>
```

分析聊天消息：

```text
POST /api/analyze
{"chat_messages":[{"sender":"Alice","content":"hello","timestamp":"2026-08-25T12:00:00","msg_type":"text"}]}
```

## 导出文件兜底

如果本机没有安装或无法调用 WeChatMsg，用户仍可直接上传已经导出的聊天文件：

- `.json`：消息列表，或包含 `chat_messages`、`messages`、`data`、`records` 字段的对象
- `.csv`：包含发送者、内容、时间等列的表格
- `.txt`：常见格式如 `2026-08-25 12:00:00 Alice: hello`

数据库文件（`.db`、`.sqlite`、`.sqlite3`）会优先走 `WECHATMSG_EXPORT_COMMAND` 配置的 WeChatMsg CLI；如果 CLI 不可用，接口会提示改用已导出的 JSON/CSV/TXT 文件。

## 测试

后端：

```bash
cd backend
.\.venv\Scripts\python -m unittest discover -s tests
.\.venv\Scripts\python -m compileall app tests
```

前端：

```bash
cd frontend
npm run build
```

## 部署

Docker 部署暂列为未来工作。当前项目已完成本地开发与端到端联调；后续可补充：

- `backend/Dockerfile`
- `frontend/Dockerfile`
- Nginx `/api` 反向代理配置
- `docker-compose.yml`
- Compose 启动验证
