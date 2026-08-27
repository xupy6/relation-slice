# 消失的TA / Relation Slice

消失的TA是一个聊天记录关系分析与赛博克隆 Web 应用。用户上传微信聊天记录数据库、WeChatMsg 导出文件、普通 JSON/CSV/TXT，或聊天截图后，后端会统一解析为标准消息，再通过 DeepSeek + LangGraph 多 Agent 流水线生成关系报告；前端使用 React + Tailwind + Recharts 呈现苹果极简液态玻璃风格的可视化界面。

当前仓库面向本地开发和后续上线准备，Docker 部署暂列为未来工作。

## 当前能力

- 关系切片：上传聊天记录后生成亲密值、依赖指数、默契程度、性格光谱、情绪波动、关系类型、趣味建议和摘要。
- 多文件导入：支持一次选择多个文件，也支持分次添加文件。
- 解析兜底：直接解析 JSON/CSV/TXT；数据库文件可通过 WeChatMsg CLI；截图可走 OCR 解析并在缺失时间时兜底补时间。
- 结果增强：关系报告包含聊天热力图、双方 MBTI、MBTI 四组特质滑块，以及可选的智能分析面板。
- 赛博克隆：从聊天记录蒸馏目标人物的角色卡、语气、短语、回复规则，并提供可继续历史对话的聊天室。
- RAG 增强：克隆聊天默认关闭 RAG；开启后使用本地快速召回 + 二次重排的记忆片段增强回复。
- 声音接口：预留声音克隆 API，前端当前使用浏览器朗读作为兜底。
- 用户与历史：前端本地注册/登录，按用户保存关系切片历史和克隆聊天历史，支持清空。
- 合规入口：首次使用需要同意详细免责声明和使用协议。

## 界面截图

以下截图来自当前版本的主要功能流程，便于维护者快速理解页面结构和交互路径。

### 账号与首页

![账号注册](截图/账号注册.png)

账号注册功能。

![账号登录](截图/账号登录.png)

账号登录功能，用于保证每个用户的历史记录相互独立。

![首页](截图/首页.png)

首页和关系切片上传入口。

![关系图谱展示](截图/关系图谱展示.png)

上传页右侧的关系图谱预览区域。

![在线音乐播放器](截图/在线音乐播放器.png)

顶部导航栏左侧的在线音乐播放器。

### 关系切片上传与分析

![选择聊天记录文件](截图/选择聊天记录文件.png)

点击选择文件按钮，支持选择多个聊天记录文件，包含导出文件和截图。

![文件选择完成](截图/文件选择完成.png)

聊天记录文件选择完成后的状态。

![聊天记录解析中](截图/聊天记录解析中.png)

点击开始分析后，系统先进入聊天记录文件解析阶段。

![开始AI分析](截图/开始AI分析.png)

聊天记录文件解析完成后，进入 AI 分析阶段。

### 关系切片结果

![分析结果总览](截图/分析结果总览.png)

关系切片分析完成后的结果总览。

![聊天热力图-一天](截图/聊天热力图-一天.png)

聊天频率热力图的一天视图。

![聊天热力图-一周](截图/聊天热力图-一周.png)

聊天频率热力图的一周视图。

![聊天热力图-一月](截图/聊天热力图-一月.png)

聊天频率热力图的一月视图。

![聊天热力图-一年](截图/聊天热力图-一年.png)

聊天频率热力图的一年视图。

![亲密情绪依赖对比](截图/亲密情绪依赖对比.png)

根据聊天记录分析亲密度、情绪波动、双方依赖度对比等指标。

![MBTI人格分析](截图/MBTI人格分析.png)

根据聊天记录智能分析双方 MBTI 人格倾向。

![智能趣味人格分析](截图/智能趣味人格分析.png)

智能趣味分析双方人格和互动特征。

![分析结果详情](截图/分析结果详情.png)

基于用户上传聊天记录生成的分析结果详情。

![关系摘要与聊天建议](截图/关系摘要与聊天建议.png)

关系摘要与聊天建议展示。

![历史分析记录](截图/历史分析记录.png)

历史分析记录存储，便于用户随时回看。

### 赛博克隆

![赛博克隆入口](截图/赛博克隆入口.png)

点击导航栏切换到赛博克隆功能。

![克隆历史记录](截图/克隆历史记录.png)

赛博克隆历史记录存储，方便继续对话。

![克隆选择文件](截图/克隆选择文件.png)

赛博克隆页面选择聊天记录文件。

![开始克隆蒸馏](截图/开始克隆蒸馏.png)

点击开始克隆蒸馏后，系统进入画像蒸馏阶段。

![克隆蒸馏完成](截图/克隆蒸馏完成.png)

蒸馏完成后进入聊天页面。

![仿真人物对话](截图/仿真人物对话.png)

开始与蒸馏完成后的仿真人物进行对话。

![RAG增强开关](截图/RAG增强开关.png)

右上角 RAG 增强开关。

![声音克隆开关](截图/声音克隆开关.png)

右上角声音克隆播放开关。

![聊天热力图入口](截图/聊天热力图入口.png)

右上角聊天热力图入口。

![右上角功能区](截图/右上角功能区.png)

右上角功能区，支持开启 RAG、声音克隆播放和聊天热力图。

![在线交流](截图/在线交流.png)

赛博克隆在线交流页面。

## 技术栈

前端：

- React 19 + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- lucide-react

后端：

- Python 3.11+
- FastAPI
- LangChain + LangGraph
- langchain-deepseek，模型名 `deepseek-chat`
- Pydantic
- python-multipart
- Pillow + pytesseract

本地持久化：

- 账号、免责声明状态、分析历史、克隆历史目前存储在浏览器 `localStorage`。
- 后端暂未接入正式数据库。

## 目录结构

```text
relation-slice/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── clone.py
│   │   │   ├── common.py
│   │   │   ├── emotion.py
│   │   │   ├── interaction.py
│   │   │   ├── language_style.py
│   │   │   ├── relation_predict.py
│   │   │   └── summarize.py
│   │   ├── graph.py
│   │   ├── logging_config.py
│   │   ├── main.py
│   │   ├── parser.py
│   │   ├── rate_limit.py
│   │   └── responses.py
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── music/
│   │   └── picture/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── storage.ts
│   │   └── types.ts
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── samples/
├── scripts/
│   └── publish.ps1
├── .gitignore
└── README.md
```

## 环境变量

后端复制 `backend/.env.example` 为 `backend/.env`：

```text
DEEPSEEK_API_KEY=your_deepseek_api_key
WECHATMSG_EXPORT_COMMAND=
WECHATMSG_EXPORT_FORMAT=json
WECHATMSG_EXPORT_TIMEOUT=120
```

说明：

- `DEEPSEEK_API_KEY`：DeepSeek API Key，必填，否则真实 LLM 分析会失败。
- `WECHATMSG_EXPORT_COMMAND`：可选，配置 WeChatMsg CLI 命令模板，用于解析 `.db/.sqlite/.sqlite3`。
- `WECHATMSG_EXPORT_FORMAT`：WeChatMsg 导出格式，默认 `json`。
- `WECHATMSG_EXPORT_TIMEOUT`：WeChatMsg 子进程超时时间，单位秒。

前端复制 `frontend/.env.example` 为 `frontend/.env.local`：

```text
VITE_API_BASE_URL=
VITE_PROXY_TARGET=http://127.0.0.1:8000
```

开发阶段推荐保持 `VITE_API_BASE_URL` 为空，让前端请求同源 `/api`，再由 Vite proxy 转发到 `VITE_PROXY_TARGET`。

## 本地启动

后端：

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
copy .env.example .env
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

健康检查：

```powershell
curl http://127.0.0.1:8000/health
```

前端：

```powershell
cd frontend
npm install
copy .env.example .env.local
npm run dev -- --host 127.0.0.1 --port 5173
```

访问：

```text
http://127.0.0.1:5173/
```

## OCR 依赖

截图解析依赖 `pytesseract` 和系统级 Tesseract OCR。Python 依赖已在 `requirements.txt` 中声明，但 Windows 还需要单独安装 Tesseract 程序，并确保 `tesseract.exe` 在 PATH 中。

如果系统没有 Tesseract，截图 OCR 会失败，但 JSON/CSV/TXT 解析和 WeChatMsg 导出文件解析不受影响。

## 聊天记录导入格式

推荐优先上传 WeChatMsg 已导出的 JSON/CSV/TXT。

JSON 支持：

- 顶层数组
- `{ "chat_messages": [...] }`
- `{ "messages": [...] }`
- `{ "data": [...] }`
- `{ "records": [...] }`

单条消息建议字段：

```json
{
  "sender": "Alice",
  "content": "hello",
  "timestamp": "2026-08-25T12:00:00",
  "msg_type": "text"
}
```

CSV 建议包含发送者、内容、时间列。TXT 支持常见格式：

```text
2026-08-25 12:00:00 Alice: hello
```

截图 OCR 在缺少时间时会自动补一个可排序的时间，并用兜底发送者名区分连续消息。

## 主要 API

统一响应：

```json
{"code":0,"data":{}}
```

错误响应：

```json
{"code":400,"message":"error message"}
```

端点：

- `GET /health`：健康检查。
- `POST /api/upload`：上传单个文件，字段名 `file`。
- `POST /api/upload/batch`：上传多个文件，字段名 `files`。
- `POST /api/analyze`：输入标准化 `chat_messages`，返回最终关系报告。
- `POST /api/clone/distill`：输入 `chat_messages`，返回克隆画像。
- `POST /api/clone/chat`：输入克隆画像、用户消息、历史对话，可选 `use_rag`。
- `POST /api/clone/voice`：声音克隆预留接口，当前返回 reserved 状态。

## 后端模块说明

- `parser.py`：文件解析入口，负责 JSON/CSV/TXT、WeChatMsg CLI、OCR 兜底和标准化 `ChatMessage`。
- `graph.py`：LangGraph 状态定义与多 Agent 编排入口。
- `agents/language_style.py`：语言风格、性格倾向、MBTI 粗判。
- `agents/emotion.py`：情绪比例和情绪曲线。
- `agents/interaction.py`：互动频率、主动性、依赖和默契。
- `agents/relation_predict.py`：关系类型和建议。
- `agents/summarize.py`：最终趣味报告汇总。
- `agents/clone.py`：赛博克隆画像、角色卡、记忆片段、RAG 召回和聊天回复。
- `responses.py`：统一 API 响应格式。
- `rate_limit.py`：简单内存限流。
- `logging_config.py`：控制台和文件日志。

## 前端模块说明

- `App.tsx`：顶层状态、路由切换、上传/分析/克隆流程、音乐盒、登录弹窗、免责声明。
- `pages/UploadPage.tsx`：关系切片上传页、导入教程、历史记录和关系图谱预览。
- `pages/ResultPage.tsx`：结果可视化，包括原有图表、热力图、MBTI 报告和智能分析。
- `pages/ClonePage.tsx`：克隆蒸馏、克隆画像、聊天室、RAG 开关、声音开关和聊天热力图。
- `storage.ts`：localStorage 用户、历史和免责声明状态。
- `api.ts`：前端 API 封装。
- `index.css`：液态玻璃、音乐盒、导航、聊天室、进度条、热力图等全局样式。

## 测试与质量检查

后端测试：

```powershell
cd backend
python -m pytest
```

前端构建：

```powershell
cd frontend
npm run build
```

建议每次提交前至少运行：

```powershell
cd backend
python -m pytest

cd ..\frontend
npm run build
```

## 发布到 GitHub

本仓库包含 `scripts/publish.ps1`，用于在 remote 配好后快速提交并推送：

```powershell
.\scripts\publish.ps1 "feat: describe your change"
```

脚本行为：

- 自动 `git add -A`
- 默认排除根目录 `picture/`
- 如果没有变更则退出
- 自动 `git commit`
- 自动 `git push -u origin <current-branch>`

首次配置 GitHub remote 后，以后可以直接使用这个脚本发布新版本。

## 安全与合规注意事项

- 不要提交真实 `.env`、API Key、聊天数据库、真实聊天记录或未授权截图。
- `.gitignore` 已排除 `.env`、日志、上传目录、数据库、构建目录和虚拟环境。
- 当前登录/注册仅为开发期本地功能，密码保存在浏览器 localStorage，不适合作为生产账号系统。
- 赛博克隆仅为 AI 模拟，不代表真人本人。请确保上传数据和声音素材已获得合法授权。
- `frontend/public/music` 和 `frontend/public/picture` 是静态资源目录，替换或公开分发前请确认版权和授权。

## 未来工作

- Dockerfile、Nginx 和 docker-compose 部署。
- 正式数据库和服务端用户体系。
- 后端持久化分析历史、克隆历史和上传记录。
- 真实声音克隆模型接入和授权校验。
- 更完整的 WeChatMsg 集成文档和自动导出流程。
- 生产级限流、鉴权、审计日志和数据删除机制。
